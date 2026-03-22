"use strict";
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: [true, "Name is required"],
      trim: true, minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String, required: [true, "Email is required"],
      unique: true, trim: true, lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password_hash: { type: String, required: true, select: false },

    // ── Role Management fields ──────────────────────────────────────────────
    level: {
      type: Number,
      default: 1,
      // 0 = Admin  (full access, can create/manage users)
      // 1 = Member (standard access, cannot create users)
      // 2 = User   (restricted access based on page_permissions)
    },
    department: {
      type: String,
      enum: ["admin", "member", "user"],
      default: "member",
    },
    // Array of page keys the user is allowed to see
    // e.g. ["jobs", "courses", "ats", "interview"]
    // Empty array = all pages allowed (used for level 0 and 1)
    page_permissions: {
      type: [String],
      default: ["jobs", "courses", "ats", "interview"],
    },

    last_login: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.methods.toSafeObject = function () {
  return {
    id:               this._id.toString(),
    name:             this.name,
    email:            this.email,
    level:            this.level,
    department:       this.department,
    page_permissions: this.page_permissions,
    created_at:       this.created_at,
  };
};

module.exports = mongoose.model("User", userSchema);
