"use strict";
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },

    password_hash: {
      type: String,
      required: true,
      select: false
    },

    // ── Role Management fields ──────────────────────────────────────────────
    level: {
      type: Number,
      default: 1,
    },

    department: {
      type: String,
      enum: ["admin", "member", "user"],
      default: "member",
    },

    page_permissions: {
      type: [String],
      default: ["jobs", "courses", "ats", "interview"],
    },

    // ── User activity tracking ──────────────────────────────────────────────
    last_login: {
      type: Date,
      default: null
    },

    last_active: {
      type: Date,
      default: null
    },

    is_online: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    },
  }
);

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    level: this.level,
    department: this.department,
    page_permissions: this.page_permissions,
    is_online: this.is_online,
    last_login: this.last_login,
    last_active: this.last_active,
    created_at: this.created_at,
  };
};

module.exports = mongoose.model("User", userSchema);