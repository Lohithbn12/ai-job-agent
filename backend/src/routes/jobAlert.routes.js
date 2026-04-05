const express = require("express");
const router = express.Router();

const JobAlert = require("../models/jobAlert.model");
const { requireAuth } = require("../auth/auth.middleware");

/**
 * Create new job alert
 * POST /job-alert/create
 */
router.post("/job-alert/create", requireAuth, async (req, res) => {
  try {
    const {
      role,
      location,
      experience_level,
      sources,
      frequency
    } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({
        detail: "Role is required"
      });
    }

    const alert = await JobAlert.create({
      user_id: req.user.id,
      role: role.trim(),
      location: location || "",
      experience_level: experience_level || "0-1",
      sources: sources || ["linkedin", "naukri", "indeed"],
      frequency: frequency || "daily"
    });

    return res.status(201).json({
      message: "Job alert created successfully",
      alert
    });

  } catch (err) {
    console.error("Create alert error:", err.message);
    return res.status(500).json({
      detail: "Failed to create alert"
    });
  }
});

/**
 * Get all alerts for logged-in user
 * GET /job-alert/my-alerts
 */
router.get("/job-alert/my-alerts", requireAuth, async (req, res) => {
  try {
    const alerts = await JobAlert.find({
      user_id: req.user.id
    }).sort({ createdAt: -1 });

    return res.json({
      total: alerts.length,
      alerts
    });

  } catch (err) {
    console.error("Fetch alerts error:", err.message);
    return res.status(500).json({
      detail: "Failed to fetch alerts"
    });
  }
});

/**
 * Delete alert
 * DELETE /job-alert/:id
 */
router.delete("/job-alert/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await JobAlert.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({
        detail: "Alert not found"
      });
    }

    return res.json({
      message: "Alert deleted successfully"
    });

  } catch (err) {
    console.error("Delete alert error:", err.message);
    return res.status(500).json({
      detail: "Failed to delete alert"
    });
  }
});

/**
 * Toggle active/inactive
 * PATCH /job-alert/:id/toggle
 */
router.patch("/job-alert/:id/toggle", requireAuth, async (req, res) => {
  try {
    const alert = await JobAlert.findOne({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        detail: "Alert not found"
      });
    }

    alert.is_active = !alert.is_active;
    await alert.save();

    return res.json({
      message: `Alert ${alert.is_active ? "enabled" : "disabled"}`,
      alert
    });

  } catch (err) {
    console.error("Toggle alert error:", err.message);
    return res.status(500).json({
      detail: "Failed to update alert"
    });
  }
});

module.exports = router;