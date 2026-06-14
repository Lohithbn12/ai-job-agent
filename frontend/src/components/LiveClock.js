// ─── LiveClock.js ─────────────────────────────────────────────────────────────
// Obsidian Night live clock

import React, { useState, useEffect } from "react";

export default function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.5px", color: "#f59e0b" }}>
      {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
    </span>
  );
}
