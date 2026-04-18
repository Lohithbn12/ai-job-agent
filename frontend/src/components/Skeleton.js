// ─── Skeleton.js ──────────────────────────────────────────────────────────────
// Reusable animated skeleton loading components.
// Replaces all raw <Spinner /> usages with contextual, shape-accurate placeholders.
//
// Exports:
//   SkeletonPulse       — base animated block (used internally)
//   JobCardSkeleton     — mimics a job result card (step 3)
//   CourseCardSkeleton  — mimics a free-course card
//   StatCardSkeleton    — mimics a home dashboard stat tile
//   AlertItemSkeleton   — mimics a job-alert row
//   NotifItemSkeleton   — mimics a notification inbox row
//   ResumeUploadSkeleton— mimics the parsing state on step 1→2 transition
//   TableRowSkeleton    — generic multi-row table placeholder

import React from "react";

// ── Keyframe injection (once) ──────────────────────────────────────────────────
const SKELETON_CSS = `
@keyframes sk-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
.sk-pulse {
  background: linear-gradient(90deg,
    #e8eef7 25%,
    #d0ddf0 50%,
    #e8eef7 75%
  );
  background-size: 1200px 100%;
  animation: sk-shimmer 1.4s ease-in-out infinite;
  border-radius: 8px;
}
`;

let _injected = false;
function injectCSS() {
  if (_injected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = SKELETON_CSS;
  document.head.appendChild(style);
  _injected = true;
}

// ── Base pulse block ──────────────────────────────────────────────────────────
export function SkeletonPulse({ width = "100%", height = 16, radius = 8, style = {} }) {
  injectCSS();
  return (
    <div
      className="sk-pulse"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

// ── Job card skeleton ─────────────────────────────────────────────────────────
export function JobCardSkeleton() {
  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(30,111,212,0.10)",
      borderRadius: 18,
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      boxShadow: "0 6px 18px rgba(30,111,212,0.06)",
    }}>
      {/* source badge + date */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <SkeletonPulse width={80} height={22} radius={20} />
        <SkeletonPulse width={60} height={14} radius={6} />
      </div>
      {/* title */}
      <SkeletonPulse height={22} radius={8} />
      <SkeletonPulse width="65%" height={22} radius={8} />
      {/* meta rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        <SkeletonPulse width="80%" height={13} radius={6} />
        <SkeletonPulse width="55%" height={13} radius={6} />
        <SkeletonPulse width="45%" height={13} radius={6} />
      </div>
      {/* match bar */}
      <div style={{ padding: 14, background: "rgba(30,111,212,0.03)", border: "1px solid rgba(30,111,212,0.08)", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <SkeletonPulse width={70} height={12} radius={4} />
          <SkeletonPulse width={44} height={20} radius={6} />
        </div>
        <SkeletonPulse height={5} radius={4} />
      </div>
      {/* buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <SkeletonPulse width={44} height={42} radius={12} />
        <SkeletonPulse height={42} radius={12} />
      </div>
    </div>
  );
}

// ── Course card skeleton ──────────────────────────────────────────────────────
export function CourseCardSkeleton() {
  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(30,111,212,0.10)",
      borderRadius: 14,
      padding: 22,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxShadow: "0 1px 3px rgba(30,111,212,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <SkeletonPulse width={90} height={22} radius={20} />
        <SkeletonPulse width={50} height={20} radius={6} />
      </div>
      <SkeletonPulse height={18} radius={6} />
      <SkeletonPulse width="75%" height={18} radius={6} />
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
        <SkeletonPulse width="60%" height={12} radius={4} />
        <SkeletonPulse width="45%" height={12} radius={4} />
        <SkeletonPulse width="35%" height={12} radius={4} />
      </div>
      <SkeletonPulse height={38} radius={10} style={{ marginTop: 6 }} />
    </div>
  );
}

// ── Stat card skeleton (home dashboard) ───────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(30,111,212,0.08)",
      borderRadius: 18,
      padding: "20px 22px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 6px 18px rgba(30,111,212,0.06)",
    }}>
      <SkeletonPulse width={52} height={52} radius={14} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <SkeletonPulse width={60} height={26} radius={6} />
        <SkeletonPulse width={90} height={12} radius={4} />
      </div>
    </div>
  );
}

// ── Alert row skeleton ────────────────────────────────────────────────────────
export function AlertItemSkeleton() {
  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(30,111,212,0.10)",
      padding: "16px 20px",
      borderRadius: 12,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <SkeletonPulse width="55%" height={16} radius={6} />
        <SkeletonPulse width="75%" height={12} radius={4} />
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <SkeletonPulse width={70} height={32} radius={8} />
        <SkeletonPulse width={34} height={32} radius={8} />
      </div>
    </div>
  );
}

// ── Notification row skeleton ─────────────────────────────────────────────────
export function NotifItemSkeleton() {
  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(30,111,212,0.10)",
      borderRadius: 12,
      marginBottom: 10,
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <SkeletonPulse width="60%" height={14} radius={6} />
        <SkeletonPulse width="40%" height={11} radius={4} />
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <SkeletonPulse width={34} height={30} radius={8} />
        <SkeletonPulse width={34} height={30} radius={8} />
        <SkeletonPulse width={20} height={20} radius={4} />
      </div>
    </div>
  );
}

// ── Resume parsing skeleton (shown while upload + parse is in progress) ────────
export function ResumeUploadSkeleton() {
  return (
    <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* drop zone ghost */}
      <div style={{ border: "2px dashed rgba(30,111,212,0.25)", borderRadius: 16, padding: "52px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <SkeletonPulse width={60} height={60} radius={16} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", width: "100%" }}>
          <SkeletonPulse width="50%" height={15} radius={6} />
          <SkeletonPulse width="30%" height={11} radius={4} />
        </div>
      </div>
      {/* button ghost */}
      <SkeletonPulse height={50} radius={12} />
      {/* feature pills */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[0,1,2,3].map(i => <SkeletonPulse key={i} height={44} radius={10} />)}
      </div>
    </div>
  );
}

// ── Generic table-row skeleton ─────────────────────────────────────────────────
// Use count prop to control how many rows render (default 5).
export function TableRowSkeleton({ count = 5 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: "white",
          border: "1px solid rgba(30,111,212,0.08)",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}>
          <SkeletonPulse width={36} height={36} radius={10} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            <SkeletonPulse width="50%" height={13} radius={4} />
            <SkeletonPulse width="30%" height={11} radius={4} />
          </div>
          <SkeletonPulse width={80} height={30} radius={8} />
        </div>
      ))}
    </div>
  );
}

// ── Card grid skeleton helper ──────────────────────────────────────────────────
// Renders n skeleton cards in the standard card-grid layout.
export function JobGridSkeleton({ count = 6 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }).map((_, i) => <JobCardSkeleton key={i} />)}
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }).map((_, i) => <CourseCardSkeleton key={i} />)}
    </div>
  );
}
