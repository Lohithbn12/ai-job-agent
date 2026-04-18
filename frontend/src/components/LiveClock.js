// ─── LiveClock.js ─────────────────────────────────────────────────────────────
// Displays a live updating clock in the top bar (HH:MM AM/PM).

import React, { useState, useEffect } from "react";

export default function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.5px" }}>
      {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
    </span>
  );
}
