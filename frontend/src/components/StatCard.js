// ─── StatCard.js ─────────────────────────────────────────────────────────────
// Obsidian Night stat card — dark luxury editorial

import React, { useState } from "react";

export default function StatCard({
  label, value, icon,
  color = "#f59e0b",
  trend, trendType = "up",
  onClick,
}) {
  const [hovered, setHovered] = useState(false);

  const trendColor = trendType === "up" ? "#34d399"
                   : trendType === "down" ? "#fb7185"
                   : "#8888a8";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1c1c28" : "#16161f",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14,
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.3)",
        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
        cursor: onClick ? "pointer" : "default",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow on hover */}
      {hovered && (
        <div style={{
          position: "absolute",
          top: -30, left: -30,
          width: 100, height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `${color}12`,
          border: `1px solid ${color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
          transition: "all 0.2s",
          boxShadow: hovered ? `0 4px 16px ${color}30` : "none",
        }}>
          {icon}
        </div>

        <div>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "#f1f1f5",
            lineHeight: 1,
            letterSpacing: "-1px",
          }}>
            {value}
          </div>
          <div style={{
            fontSize: 12,
            color: "#8888a8",
            marginTop: 5,
            fontWeight: 500,
            fontFamily: "'DM Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {label}
          </div>
        </div>
      </div>

      {trend && (
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: trendColor,
          background: `${trendColor}12`,
          border: `1px solid ${trendColor}25`,
          padding: "5px 10px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          fontFamily: "'DM Mono', monospace",
          position: "relative",
        }}>
          {trendType === "up" ? "▲" : trendType === "down" ? "▼" : "●"} {trend}
        </div>
      )}
    </div>
  );
}
