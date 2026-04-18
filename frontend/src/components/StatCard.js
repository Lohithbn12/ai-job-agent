// ─── StatCard.js ─────────────────────────────────────────────────────────────
// Reusable premium dashboard stat card for JobSpark
// Supports icon, value, label, trend, hover animation, click action

import React, { useState } from "react";

export default function StatCard({
  label,
  value,
  icon,
  color = "#1e6fd4",
  trend,
  trendType = "up", // up | down | neutral
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const trendColor =
    trendType === "up"
      ? "#22c55e"
      : trendType === "down"
      ? "#ef4444"
      : "#94a3b8";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "white",
        border: "1px solid rgba(30,111,212,0.08)",
        borderRadius: 20,
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: isHovered
          ? "0 10px 24px rgba(30,111,212,0.14)"
          : "0 6px 18px rgba(30,111,212,0.08)",
        transition: "all 0.25s ease",
        cursor: onClick ? "pointer" : "default",
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Left Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            {value}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            {label}
          </div>
        </div>
      </div>

      {/* Right Section - Trend */}
      {trend && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: trendColor,
            background: `${trendColor}15`,
            padding: "6px 10px",
            borderRadius: 10,
            whiteSpace: "nowrap",
          }}
        >
          {trendType === "up"
            ? "▲"
            : trendType === "down"
            ? "▼"
            : "●"}{" "}
          {trend}
        </div>
      )}
    </div>
  );
}