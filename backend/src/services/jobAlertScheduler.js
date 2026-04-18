/**
 * services/jobAlertScheduler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs every 30 minutes.
 * For each active alert → searches job portals → saves new jobs as notifications
 * → sends email digest if user has email configured.
 *
 * Fixed:
 *   - Concurrency lock: if a run is still active when the next tick fires,
 *     the new tick is skipped — prevents overlapping Puppeteer sessions that
 *     compete for RAM and can OOM on Render free tier.
 *   - Default location set to "India" when alert.location is empty, so
 *     LinkedIn (and other scrapers) don't fall back to US results.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use strict";

const axios = require("axios");
const nodemailer = require("nodemailer");
const JobAlert = require("../models/jobAlert.model");
const Notification = require("../models/notification.model");
const mongoose = require("mongoose");

// ── Concurrency lock ─────────────────────────────────────────────────────────
// FIX #6: prevents a second scheduler tick from launching a full scrape run
// while the previous one is still in-flight (which can happen on slow servers
// where scraping takes longer than the 30-minute interval).
let isRunning = false;

// ── Email transporter (optional — only if SMTP env vars set) ─────────────────
function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Search jobs for an alert ─────────────────────────────────────────────────
async function searchJobsForAlert(alert) {
  try {
    const API_BASE = process.env.INTERNAL_API || `http://localhost:${process.env.PORT || 8000}`;

    // FIX #5: default to "India" when no location is set so LinkedIn doesn't
    // return US jobs. Users can always override by setting alert.location.
    const effectiveLocation = alert.location && alert.location.trim()
      ? alert.location.trim()
      : "India";

    const res = await axios.post(
      `${API_BASE}/search-jobs/`,
      {
        roles:            [alert.role],
        keywords:         [alert.role],
        experience_level: alert.experience_level || "0-1",
        location:         effectiveLocation,
        sources:          alert.sources || ["linkedin", "naukri", "indeed"],
        weighted_skills:  [],
        top_skills:       [],
      },
      { timeout: 60000 }
    );
    return res.data.jobs || [];
  } catch (err) {
    console.error(`[Scheduler] Job search failed for "${alert.role}":`, err.message);
    return [];
  }
}

// ── Deduplicate: filter out jobs already notified ────────────────────────────
async function filterNewJobs(userId, alertId, jobs) {
  // Get all apply_links already stored in notifications for this alert
  const existing = await Notification.find(
    { user_id: userId, alert_id: alertId },
    { "jobs.apply_link": 1 }
  );
  const seenLinks = new Set();
  for (const notif of existing) {
    for (const j of notif.jobs || []) {
      if (j.apply_link) seenLinks.add(j.apply_link);
    }
  }
  return jobs.filter((j) => j.apply_link && !seenLinks.has(j.apply_link));
}

// ── Send email notification ──────────────────────────────────────────────────
async function sendEmailNotification(userEmail, userName, alert, newJobs) {
  const transporter = getTransporter();
  if (!transporter || !userEmail) return;

  const jobRows = newJobs
    .slice(0, 10)
    .map(
      (j) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 8px;">
          <strong style="color:#0f172a;">${j.title || "Job Opening"}</strong><br/>
          <span style="color:#64748b;font-size:13px;">🏢 ${j.company || "?"} &nbsp;·&nbsp; 📍 ${j.location || "?"}</span>
          ${j.salary ? `<br/><span style="color:#0d9488;font-size:12px;">💰 ${j.salary}</span>` : ""}
        </td>
        <td style="padding:12px 8px;text-align:right;white-space:nowrap;">
          <span style="padding:3px 10px;background:#dbeafe;color:#1e40af;border-radius:12px;font-size:11px;font-weight:700;">${j.source}</span>
          <br/><br/>
          <a href="${j.apply_link}" style="padding:7px 16px;background:#1e6fd4;color:white;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">Apply →</a>
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a6e,#1e6fd4);padding:32px 36px;">
      <div style="font-size:28px;margin-bottom:8px;">⚡ JobSpark</div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">
        🔔 ${newJobs.length} New Job${newJobs.length > 1 ? "s" : ""} for "${alert.role}"
      </h1>
      <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">
        Hi ${userName || "there"} — we found new matches for your job alert!
      </p>
    </div>

    <!-- Body -->
    <div style="padding:28px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e2e8f0;">
            <th style="text-align:left;padding:8px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Position</th>
            <th style="text-align:right;padding:8px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Action</th>
          </tr>
        </thead>
        <tbody>${jobRows}</tbody>
      </table>

      ${
        newJobs.length > 10
          ? `<p style="color:#94a3b8;font-size:13px;text-align:center;margin-top:16px;">+ ${newJobs.length - 10} more jobs in your dashboard</p>`
          : ""
      }
    </div>

    <!-- Footer -->
    <div style="padding:20px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        © 2025 JobSpark AI Career Suite · You're receiving this because you set up a job alert.
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from:    `"JobSpark Alerts" <${process.env.SMTP_USER}>`,
      to:      userEmail,
      subject: `🔔 ${newJobs.length} new "${alert.role}" jobs found — JobSpark`,
      html,
    });
    console.log(`[Scheduler] Email sent to ${userEmail} for "${alert.role}"`);
  } catch (err) {
    console.error(`[Scheduler] Email failed:`, err.message);
  }
}

// ── Process a single alert ───────────────────────────────────────────────────
async function processAlert(alert) {
  console.log(`[Scheduler] Processing alert: "${alert.role}" (user: ${alert.user_id})`);

  // Search jobs
  const allJobs = await searchJobsForAlert(alert);
  if (!allJobs.length) {
    console.log(`[Scheduler] No jobs found for "${alert.role}"`);
    return;
  }

  // Filter to only new jobs not yet notified
  const newJobs = await filterNewJobs(alert.user_id, alert._id, allJobs);
  if (!newJobs.length) {
    console.log(`[Scheduler] No NEW jobs for "${alert.role}" (${allJobs.length} found but already notified)`);
    return;
  }

  console.log(`[Scheduler] ${newJobs.length} new jobs for "${alert.role}"`);

  // Save in-app notification
  await Notification.create({
    user_id:  alert.user_id,
    alert_id: alert._id,
    type:     "new_jobs",
    title:    `${newJobs.length} new "${alert.role}" jobs found`,
    message:  `We found ${newJobs.length} new job${newJobs.length > 1 ? "s" : ""} matching your alert for "${alert.role}"${alert.location ? ` in ${alert.location}` : ""}.`,
    jobs: newJobs.slice(0, 20).map((j) => ({
      title:      j.title,
      company:    j.company,
      location:   j.location,
      apply_link: j.apply_link,
      source:     j.source,
      salary:     j.salary || "",
    })),
    is_read:    false,
    email_sent: false,
  });

  // Update alert stats
  await JobAlert.updateOne(
    { _id: alert._id },
    {
      $set: {
        last_checked:        new Date(),
        last_notified_count: newJobs.length,
      },
      $inc: { total_jobs_found: newJobs.length },
    }
  );

  // Send email if user has email (fetch from users collection)
  try {
    const userDoc = await mongoose.connection.db
      .collection("users")
      .findOne({ _id: new mongoose.Types.ObjectId(alert.user_id) });
    if (userDoc?.email) {
      const notif = await Notification.findOne(
        { user_id: alert.user_id, alert_id: alert._id }
      ).sort({ created_at: -1 });
      if (notif) {
        await sendEmailNotification(userDoc.email, userDoc.name, alert, newJobs);
        await Notification.updateOne({ _id: notif._id }, { $set: { email_sent: true } });
      }
    }
  } catch (err) {
    console.error("[Scheduler] Failed to send email:", err.message);
  }
}

// ── Main scheduler tick ──────────────────────────────────────────────────────
async function runScheduler() {
  // FIX #6: skip this tick if a previous run is still in-flight
  if (isRunning) {
    console.log("[Scheduler] Previous run still active — skipping tick to avoid overlap");
    return;
  }

  isRunning = true;
  console.log(`[Scheduler] Tick — ${new Date().toISOString()}`);

  try {
    const alerts = await JobAlert.find({ is_active: true });
    console.log(`[Scheduler] ${alerts.length} active alert(s) to process`);
    for (const alert of alerts) {
      await processAlert(alert);
      // Small delay between alerts to avoid hammering scrapers
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (err) {
    console.error("[Scheduler] Tick failed:", err.message);
  } finally {
    // Always release the lock, even if an error occurred
    isRunning = false;
    console.log(`[Scheduler] Tick complete — ${new Date().toISOString()}`);
  }
}

// ── Start ────────────────────────────────────────────────────────────────────
function startJobAlertScheduler() {
  const INTERVAL_MS = parseInt(process.env.ALERT_INTERVAL_MS || "1800000"); // 30 min default
  console.log(`✅ Job Alert Scheduler started — interval: ${INTERVAL_MS / 60000} min`);

  // Run once after 2 min on startup (give server time to boot), then every interval
  setTimeout(() => {
    runScheduler();
    setInterval(runScheduler, INTERVAL_MS);
  }, 2 * 60 * 1000);
}

module.exports = startJobAlertScheduler;
