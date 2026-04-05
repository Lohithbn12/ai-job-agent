"use strict";
const mongoose = require("mongoose");

const jobAlertSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    experience_level: {
      type: String,
      default: "0-1",
    },
    sources: {
      type: [String],
      default: ["linkedin", "naukri", "indeed"],
    },
    frequency: {
      type: String,
      enum: ["realtime", "daily", "weekly"],
      default: "realtime",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    // Tracking fields
    last_checked: {
      type: Date,
      default: null,
    },
    last_notified_count: {
      type: Number,
      default: 0,
    },
    total_jobs_found: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobAlert", jobAlertSchema);
