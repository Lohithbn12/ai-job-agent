/**
 * routes/notification.routes.js
 * Full notification system — count, list, read, clear
 */

"use strict";

const express = require("express");
const router = express.Router();
const Notification = require("../models/notification.model");
const { requireAuth } = require("../auth/auth.middleware");

/**
 * GET /notifications/count
 * Unread notification count for bell badge
 */
router.get("/notifications/count", requireAuth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user_id: req.user.id,
      is_read: false,
    });
    return res.json({ count });
  } catch (err) {
    console.error("Notification count error:", err.message);
    return res.status(500).json({ detail: "Failed to fetch count" });
  }
});

/**
 * GET /notifications/list
 * Get all notifications for current user (latest first)
 */
router.get("/notifications/list", requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(50);
    return res.json({
      total: notifications.length,
      unread: notifications.filter((n) => !n.is_read).length,
      notifications,
    });
  } catch (err) {
    console.error("Notification list error:", err.message);
    return res.status(500).json({ detail: "Failed to fetch notifications" });
  }
});

/**
 * PATCH /notifications/read/:id
 * Mark a single notification as read
 */
router.patch("/notifications/read/:id", requireAuth, async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, user_id: req.user.id },
      { $set: { is_read: true } }
    );
    return res.json({ message: "Marked as read" });
  } catch (err) {
    return res.status(500).json({ detail: "Failed to mark read" });
  }
});

/**
 * PATCH /notifications/clear
 * Mark all notifications as read
 */
router.patch("/notifications/clear", requireAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { $set: { is_read: true } }
    );
    return res.json({ message: "All notifications cleared" });
  } catch (err) {
    console.error("Notification clear error:", err.message);
    return res.status(500).json({ detail: "Failed to clear notifications" });
  }
});

/**
 * DELETE /notifications/delete/:id
 * Delete a single notification
 */
router.delete("/notifications/delete/:id", requireAuth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id,
    });
    return res.json({ message: "Notification deleted" });
  } catch (err) {
    return res.status(500).json({ detail: "Failed to delete" });
  }
});

module.exports = router;
