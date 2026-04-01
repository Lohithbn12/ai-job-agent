/**
 * StockPredictor.js
 *
 * Full-featured Stock Predictor dashboard.
 * Uses your existing dark theme (--teal, --bg2 etc.) from App.js / constants.js
 * Communicates with:
 *   GET  /stock/popular
 *   POST /stock/predict  { symbol }
 *   POST /stock/screener { priceMax, trend, sector }
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API } from "./constants";          // reuse your existing API base

// ─── colour helpers ──────────────────────────────────────────────
const UP   = "#00e676";
const DOWN = "#ff5252";
const FLAT = "#ffab40";
const teal = "#22d3ee";
const cardBg = "#0a1628";
const border = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.45)";
const textMain  = "rgba(255,255,255,0.92)";

// ─── tiny Sparkline SVG ──────────────────────────────────────────
function Sparkline({ data, color = teal, height = 48, width = 160 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  );
}

// ─── Bar for price prediction ────────────────────────────────────
function PredBar({ label, current, predicted, low, high, pct, confidence, currency }) {
  const isUp = pct >= 0;
  const color = isUp ? UP : DOWN;
  const barPct = Math.min(Math.abs(pct), 100);

  return (
    <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 14,
                  border: `1.5px solid ${color}22`, marginBottom: 10,
                  transition: "border-color .2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: textMuted, fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: ".5px", textTransform: "uppercase" }}>{label}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: textMuted }}>Confidence {confidence}%</span>
          <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: "'Space Grotesk', monospace" }}>
            {isUp ? "▲" : "▼"} {Math.abs(pct)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, marginBottom: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${barPct}%`, background: color, borderRadius: 99,
                      transition: "width 1s cubic-bezier(.22,1,.36,1)", boxShadow: `0 0 8px ${color}80` }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <span style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Space Grotesk', monospace" }}>
            {currency === "INR" ? "₹" : "$"}{predicted.toLocaleString()}
          </span>
          <span style={{ fontSize: 11, color: textMuted, marginLeft: 8 }}>
            ({currency === "INR" ? "₹" : "$"}{low.toLocaleString()} – {currency === "INR" ? "₹" : "$"}{high.toLocaleString()})
          </span>
        </div>
        <span style={{ fontSize: 12, color: textMuted }}>
          from {currency === "INR" ? "₹" : "$"}{current.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ─── Stat tile ───────────────────────────────────────────────────
function StatTile({ label, value, sub, color = teal, icon }) {
  return (
    <div style={{ padding: "18px 16px", background: cardBg, border: `1.5px solid ${border}`,
                  borderRadius: 14, minWidth: 0 }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".8px",
                    marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'Space Grotesk', monospace",
                    lineHeight: 1.2, wordBreak: "break-all" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: textMuted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── Mini candlestick / line chart ──────────────────────────────
function PriceChart({ chartData, symbol }) {
  if (!chartData || chartData.length === 0) return null;
  const W = 600, H = 180, pad = { t: 12, b: 28, l: 8, r: 8 };
  const closes  = chartData.map(d => d.close);
  const minP    = Math.min(...closes);
  const maxP    = Math.max(...closes);
  const range   = maxP - minP || 1;
  const scaleY  = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - minP) / range);
  const innerW  = W - pad.l - pad.r;
  const scaleX  = (i) => pad.l + (i / (chartData.length - 1)) * innerW;

  const pts = closes.map((c, i) => `${scaleX(i)},${scaleY(c)}`).join(" ");
  const fill = `${scaleX(0)},${H - pad.b} ` + pts + ` ${scaleX(closes.length - 1)},${H - pad.b}`;

  const last  = closes[closes.length - 1];
  const first = closes[0];
  const lineColor = last >= first ? UP : DOWN;

  // x-axis labels: every ~15 days
  const xLabels = chartData.filter((_, i) => i % 15 === 0).map((d, j) => ({
    x: scaleX(chartData.indexOf(d)),
    label: d.date.slice(5),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#chartFill)" />
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 6} textAnchor="middle"
          style={{ fontSize: 9, fill: textMuted, fontFamily: "monospace" }}>{l.label}</text>
      ))}
      {/* current price line */}
      <line x1={pad.l} y1={scaleY(last)} x2={W - pad.r} y2={scaleY(last)}
        stroke={lineColor} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
      <text x={W - pad.r - 2} y={scaleY(last) - 4} textAnchor="end"
        style={{ fontSize: 10, fill: lineColor, fontWeight: 700, fontFamily: "monospace" }}>${last}</text>
    </svg>
  );
}

// ─── RSI gauge ───────────────────────────────────────────────────
function RsiGauge({ rsi }) {
  const angle  = (rsi / 100) * 180 - 90; // -90 (0) to +90 (100)
  const color  = rsi < 30 ? DOWN : rsi > 70 ? UP : FLAT;
  const label  = rsi < 30 ? "Oversold" : rsi > 70 ? "Overbought" : "Neutral";

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 100 55" width="100" style={{ display: "block", margin: "0 auto" }}>
        {/* arc */}
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} strokeLinecap="round" />
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round" strokeDasharray={`${(rsi / 100) * 125.6} 125.6`} />
        {/* needle */}
        <line x1={50} y1={50}
          x2={50 + 32 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={50 + 32 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke={color} strokeWidth={2} strokeLinecap="round" />
        <circle cx={50} cy={50} r={3} fill={color} />
        <text x={50} y={44} textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: color, fontFamily: "'Space Grotesk', monospace" }}>{rsi}</text>
      </svg>
      <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: -4 }}>{label}</div>
    </div>
  );
}

// ─── Screener row ────────────────────────────────────────────────
function ScreenerRow({ s, currency, onSelect }) {
  const isUp = s.trend === "up";
  return (
    <div onClick={() => onSelect(s.symbol)} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
        gap: 10, padding: "12px 16px", background: cardBg, border: `1.5px solid ${border}`,
        borderRadius: 12, marginBottom: 8, cursor: "pointer", transition: "border-color .15s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = teal + "55"}
      onMouseLeave={e => e.currentTarget.style.borderColor = border}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: teal, fontFamily: "'Space Grotesk', sans-serif" }}>{s.symbol}</div>
        <div style={{ fontSize: 11, color: textMuted }}>{s.name}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: textMain, fontFamily: "monospace", alignSelf: "center" }}>
        {currency === "INR" ? "₹" : "$"}{s.price.toLocaleString()}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: s.dayChange >= 0 ? UP : DOWN, alignSelf: "center" }}>
        {s.dayChange >= 0 ? "+" : ""}{s.dayChange}%
      </div>
      <div style={{ alignSelf: "center" }}>
        <span style={{ padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: isUp ? UP + "22" : DOWN + "22", color: isUp ? UP : DOWN }}>
          {isUp ? "📈 Up" : "📉 Down"}
        </span>
      </div>
      <div style={{ fontSize: 11, color: textMuted, alignSelf: "center" }}>{s.sector}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════════════════════
export default function StockPredictor() {
  const [tab, setTab]             = useState("predict");    // predict | screener
  const [symbol, setSymbol]       = useState("");
  const [query, setQuery]         = useState("");
  const [popular, setPopular]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // screener
  const [priceFilter, setPriceFilter] = useState("all");
  const [trendFilter, setTrendFilter] = useState("all");
  const [screenerData, setScreenerData] = useState(null);
  const [screenerLoading, setScreenerLoading] = useState(false);

  const inputRef = useRef(null);

  // fetch popular on mount
  useEffect(() => {
    axios.get(`${API}/stock/popular`).then(r => {
      setPopular(r.data.stocks || []);
    }).catch(() => {});
  }, []);

  // filter dropdown
  useEffect(() => {
    if (!query) { setFiltered(popular.slice(0, 10)); return; }
    const q = query.toLowerCase();
    setFiltered(popular.filter(s =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 8));
  }, [query, popular]);

  const handlePredict = async (sym) => {
    const s = (sym || symbol).trim().toUpperCase();
    if (!s) return;
    setSymbol(s);
    setShowDropdown(false);
    setQuery("");
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await axios.post(`${API}/stock/predict`, { symbol: s });
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleScreener = async () => {
    setScreenerLoading(true);
    const priceMax = priceFilter === "under50"  ? 50
                   : priceFilter === "under100" ? 100
                   : priceFilter === "under150" ? 150 : 9999;
    try {
      const res = await axios.post(`${API}/stock/screener`, {
        priceMax, trend: trendFilter === "all" ? "all" : trendFilter
      });
      setScreenerData(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Screener failed");
    } finally {
      setScreenerLoading(false);
    }
  };

  const currency = data?.currency || "USD";
  const sym = data?.symbol || "";

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
                     fontSize: 36, fontWeight: 800, color: textMain,
                     lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 10 }}>
          Stock{" "}
          <span style={{ background: `linear-gradient(90deg, ${teal}, #818cf8)`,
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Predictor
          </span>
        </h1>
        <p style={{ color: textMuted, fontSize: 14, lineHeight: 1.7 }}>
          AI-powered forecasts using Linear Regression · Holt's Double Smoothing · SMA Drift Ensemble
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[["predict","🔮 Predict"], ["screener","🔍 Screener"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "9px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer",
            background: tab === k ? teal : "rgba(255,255,255,0.05)",
            border: `1.5px solid ${tab === k ? teal : border}`,
            color: tab === k ? "#000" : textMuted,
            transition: "all .15s"
          }}>{l}</button>
        ))}
      </div>

      {/* ══════════════ PREDICT TAB ════════════════════════════ */}
      {tab === "predict" && (
        <>
          {/* Search box */}
          <div style={{ position: "relative", marginBottom: 28 }}>
            <div style={{ display: "flex", gap: 0, background: "#0c1a3d",
                          border: `1.5px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", paddingLeft: 16,
                            color: textMuted, fontSize: 18 }}>📊</div>
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={e => { if (e.key === "Enter") handlePredict(query); if (e.key === "Escape") setShowDropdown(false); }}
                placeholder="Enter symbol or company name (e.g. AAPL, RELIANCE.NS)…"
                style={{ flex: 1, padding: "15px 14px", background: "none", border: "none",
                          fontSize: 14, color: textMain, outline: "none" }}
              />
              <button onClick={() => handlePredict(query)} disabled={loading} style={{
                padding: "15px 28px", background: teal, border: "none", fontSize: 14,
                fontWeight: 700, color: "#000", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", gap: 8,
                fontFamily: "'Space Grotesk', sans-serif", whiteSpace: "nowrap", flexShrink: 0
              }}>
                {loading ? "Analysing…" : "Predict →"}
              </button>
            </div>

            {/* Dropdown */}
            {showDropdown && filtered.length > 0 && (
              <div onMouseDown={e => e.preventDefault()} style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                background: "#0c1a3d", border: `1.5px solid ${border}`, borderRadius: 12,
                zIndex: 999, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.5)"
              }}>
                {filtered.map(s => (
                  <div key={s.symbol} onClick={() => handlePredict(s.symbol)} style={{
                    padding: "11px 16px", cursor: "pointer", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                    transition: "background .1s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(34,211,238,.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div>
                      <span style={{ fontWeight: 700, color: teal, fontFamily: "monospace", fontSize: 13 }}>{s.symbol}</span>
                      <span style={{ color: textMuted, fontSize: 12, marginLeft: 10 }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 11, color: textMuted, padding: "2px 8px",
                                    background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>{s.sector}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick picks */}
          {!data && !loading && (
            <div>
              <p style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "1px",
                          fontWeight: 600, marginBottom: 12 }}>Quick picks</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["AAPL","MSFT","NVDA","TSLA","RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS"].map(s => (
                  <button key={s} onClick={() => handlePredict(s)} style={{
                    padding: "7px 14px", background: "rgba(34,211,238,.07)",
                    border: `1px solid rgba(34,211,238,.2)`, borderRadius: 8,
                    fontSize: 12, fontWeight: 700, color: teal, cursor: "pointer",
                    fontFamily: "monospace"
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: "16px 20px", background: DOWN + "18", border: `1.5px solid ${DOWN}33`,
                          borderRadius: 12, color: DOWN, fontSize: 14, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 16, animation: "spin 1s linear infinite",
                            display: "inline-block" }}>📊</div>
              <div style={{ color: textMuted, fontSize: 15 }}>Running time-series models…</div>
              <div style={{ color: textMuted, fontSize: 13, marginTop: 6 }}>
                Linear Regression · Holt Smoothing · SMA Ensemble
              </div>
            </div>
          )}

          {/* ── Results ──────────────────────────────────────── */}
          {data && !loading && (
            <div>
              {/* Stock header */}
              <div style={{ padding: "20px 24px", background: cardBg, border: `1.5px solid ${border}`,
                            borderRadius: 16, marginBottom: 20, display: "flex",
                            justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 900, color: teal,
                                  fontFamily: "'Space Grotesk', monospace", margin: 0 }}>{data.symbol}</h2>
                    <span style={{ fontSize: 15, color: textMuted }}>{data.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: textMain,
                                    fontFamily: "'Space Grotesk', monospace" }}>
                      {currency === "INR" ? "₹" : "$"}{data.currentPrice.toLocaleString()}
                    </span>
                    {data.dayChange !== null && (
                      <span style={{ fontSize: 14, fontWeight: 700,
                                      color: data.dayChange >= 0 ? UP : DOWN }}>
                        {data.dayChange >= 0 ? "▲" : "▼"} {Math.abs(data.dayChange)}% today
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                  background: data.trend.overall === "upward" ? UP + "22" : DOWN + "22",
                                  color: data.trend.overall === "upward" ? UP : DOWN,
                                  border: `1px solid ${data.trend.overall === "upward" ? UP : DOWN}44` }}>
                    {data.trend.long.icon} {data.trend.long.label}
                  </span>
                  {data.priceTier !== "above150" && (
                    <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                    background: "rgba(251,191,36,.12)", color: "#fbbf24",
                                    border: "1px solid rgba(251,191,36,.25)" }}>
                      {data.priceTier === "under50"  ? "💰 Under $50"
                       : data.priceTier === "under100" ? "💵 Under $100"
                       : "💸 Under $150"}
                    </span>
                  )}
                </div>
              </div>

              {/* Price chart */}
              <div style={{ padding: "16px 20px", background: cardBg, border: `1.5px solid ${border}`,
                            borderRadius: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: textMuted, fontWeight: 600, textTransform: "uppercase",
                              letterSpacing: ".8px", marginBottom: 12 }}>90-Day Price Chart</div>
                <PriceChart chartData={data.chartData} symbol={data.symbol} />
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                            gap: 12, marginBottom: 20 }}>
                <StatTile label="RSI (14)" icon="⚡"
                  value={<RsiGauge rsi={data.technicals.rsi} />}
                  color={data.technicals.rsi < 30 ? DOWN : data.technicals.rsi > 70 ? UP : FLAT} />
                <StatTile label="Volatility" icon="🌊"
                  value={`${data.technicals.annualisedVol}%`}
                  sub="Annualised" color={teal} />
                <StatTile label="52W Support" icon="🛡️"
                  value={`${currency === "INR" ? "₹" : "$"}${data.technicals.support.toLocaleString()}`}
                  color={UP} />
                <StatTile label="52W Resistance" icon="🔒"
                  value={`${currency === "INR" ? "₹" : "$"}${data.technicals.resistance.toLocaleString()}`}
                  color={DOWN} />
                <StatTile label="52W Average" icon="📊"
                  value={`${currency === "INR" ? "₹" : "$"}${data.technicals.avg52w.toLocaleString()}`}
                  color={FLAT} />
                <StatTile label="Model R²" icon="🎯"
                  value={`${(data.technicals.r2 * 100).toFixed(1)}%`}
                  sub="Fit quality" color="#a78bfa" />
              </div>

              {/* Trend signals */}
              <div style={{ padding: "16px 20px", background: cardBg, border: `1.5px solid ${border}`,
                            borderRadius: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: textMuted, fontWeight: 600, textTransform: "uppercase",
                              letterSpacing: ".8px", marginBottom: 14 }}>Trend Signals</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "30-Day", t: data.trend.short },
                    { label: "90-Day", t: data.trend.medium },
                    { label: "2-Year", t: data.trend.long },
                  ].map(({ label, t }) => (
                    <div key={label} style={{ padding: "14px 16px", borderRadius: 12,
                                              background: t.color + "12",
                                              border: `1.5px solid ${t.color}33`, textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
                      <div style={{ fontSize: 11, color: textMuted, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: t.color }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>
                        {t.pctPerDay >= 0 ? "+" : ""}{t.pctPerDay.toFixed(3)}%/day
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predictions */}
              <div style={{ padding: "20px 24px", background: cardBg, border: `1.5px solid ${border}`,
                            borderRadius: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                              marginBottom: 18 }}>
                  <div style={{ fontSize: 12, color: textMuted, fontWeight: 600, textTransform: "uppercase",
                                letterSpacing: ".8px" }}>Price Predictions</div>
                  <div style={{ fontSize: 11, color: textMuted }}>
                    Ensemble · {data.dataPoints} data points
                  </div>
                </div>
                {data.predictions.map(p => (
                  <PredBar key={p.days}
                    label={p.label}
                    current={data.currentPrice}
                    predicted={p.predicted}
                    low={p.low}
                    high={p.high}
                    pct={p.pctChange}
                    confidence={p.confidence}
                    currency={currency}
                  />
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ padding: "14px 16px", background: "rgba(251,191,36,.06)",
                            border: "1.5px solid rgba(251,191,36,.2)", borderRadius: 12,
                            fontSize: 12, color: "rgba(251,191,36,.7)", lineHeight: 1.6 }}>
                ⚠️ <strong>Disclaimer:</strong> These are statistical model outputs for educational purposes only.
                They are NOT financial advice. Past performance does not guarantee future results.
                Always consult a qualified financial advisor before investing.
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════ SCREENER TAB ═══════════════════════════ */}
      {tab === "screener" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {/* Price filter */}
            <div>
              <div style={{ fontSize: 11, color: textMuted, fontWeight: 600, textTransform: "uppercase",
                            letterSpacing: ".8px", marginBottom: 8 }}>Price Range</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["all","All Prices"],["under50","Under $50"],["under100","Under $100"],["under150","Under $150"]].map(([k, l]) => (
                  <button key={k} onClick={() => setPriceFilter(k)} style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                    background: priceFilter === k ? teal + "22" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${priceFilter === k ? teal : border}`,
                    color: priceFilter === k ? teal : textMuted,
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Trend filter */}
            <div>
              <div style={{ fontSize: 11, color: textMuted, fontWeight: 600, textTransform: "uppercase",
                            letterSpacing: ".8px", marginBottom: 8 }}>Trend</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["all","All"],["up","📈 Upward"],["down","📉 Downward"]].map(([k, l]) => (
                  <button key={k} onClick={() => setTrendFilter(k)} style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: trendFilter === k
                      ? (k === "up" ? UP + "22" : k === "down" ? DOWN + "22" : teal + "22")
                      : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${trendFilter === k
                      ? (k === "up" ? UP : k === "down" ? DOWN : teal)
                      : border}`,
                    color: trendFilter === k
                      ? (k === "up" ? UP : k === "down" ? DOWN : teal)
                      : textMuted,
                  }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button onClick={handleScreener} disabled={screenerLoading} style={{
                padding: "9px 24px", background: teal, border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 700, color: "#000", cursor: screenerLoading ? "not-allowed" : "pointer",
                opacity: screenerLoading ? 0.6 : 1, fontFamily: "'Space Grotesk', sans-serif"
              }}>
                {screenerLoading ? "Scanning…" : "Run Screener →"}
              </button>
            </div>
          </div>

          {screenerData && (
            <>
              <div style={{ fontSize: 12, color: textMuted, marginBottom: 16 }}>
                Found <strong style={{ color: textMain }}>{screenerData.count}</strong> stocks matching your criteria
              </div>
              {/* Header row */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                            gap: 10, padding: "8px 16px", marginBottom: 6 }}>
                {["Stock","Price","Today","Trend","Sector"].map(h => (
                  <div key={h} style={{ fontSize: 10, color: textMuted, fontWeight: 700,
                                        textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</div>
                ))}
              </div>
              {screenerData.results.map(s => (
                <ScreenerRow key={s.symbol} s={s} currency={currency}
                  onSelect={(sym) => { setTab("predict"); handlePredict(sym); }} />
              ))}
              {screenerData.results.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: textMuted }}>
                  No stocks match your filters. Try widening the criteria.
                </div>
              )}
            </>
          )}

          {!screenerData && !screenerLoading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ color: textMuted, fontSize: 15, fontWeight: 600 }}>Set your filters and run the screener</div>
              <div style={{ color: textMuted, fontSize: 13, marginTop: 6 }}>
                Filter by price range and trend direction · Click any result to predict
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
      `}</style>
    </div>
  );
}
