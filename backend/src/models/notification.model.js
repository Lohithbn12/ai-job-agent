"use strict";
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    alert_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobAlert",
      default: null,
    },
    type: {
      type: String,
      enum: ["new_jobs", "alert_summary", "system"],
      default: "new_jobs",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    jobs: [
      {
        title: String,
        company: String,
        location: String,
        apply_link: String,
        source: String,
        salary: String,
      },
    ],
    is_read: { type: Boolean, default: false },
    email_sent: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
