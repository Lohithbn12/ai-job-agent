/**
 * StockPredictor.js
 *
 * Full-featured Stock Predictor dashboard.
 * APIs: Finnhub (US) + Alpha Vantage (Indian)
 * Charts: Price line, Candlestick, Volume bar, RSI, Prediction bars
 */

import React, { useState, useCallback } from "react";
import axios from "axios";
import { API } from "./constants";

// ─── Colors ──────────────────────────────────────────────────────
const UP      = "#00e676";
const DOWN    = "#ff5252";
const FLAT    = "#ffab40";
const teal    = "#22d3ee";
const cardBg  = "#0a1628";
const border  = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.45)";
const textMain  = "rgba(255,255,255,0.92)";
const bg        = "#060e1e";

// ─── Helpers ─────────────────────────────────────────────────────
const fmt = (v, currency) =>
  v == null ? "N/A" : `${currency === "INR" ? "₹" : "$"}${Number(v).toLocaleString()}`;

const pctColor = (v) => (v > 0 ? UP : v < 0 ? DOWN : FLAT);

// ─── Chart: Price Line ───────────────────────────────────────────
function PriceLineChart({ chartData, currency }) {
  if (!chartData?.length) return null;
  const W = 700, H = 200, pad = { t: 16, b: 32, l: 56, r: 16 };

  const closes  = chartData.map((d) => d.close);
  const minP    = Math.min(...closes);
  const maxP    = Math.max(...closes);
  const range   = maxP - minP || 1;
  const iW      = W - pad.l - pad.r;
  const iH      = H - pad.t - pad.b;

  const scaleX = (i) => pad.l + (i / (chartData.length - 1)) * iW;
  const scaleY = (v) => pad.t + iH * (1 - (v - minP) / range);

  const pts  = closes.map((c, i) => `${scaleX(i)},${scaleY(c)}`).join(" ");
  const fill = `${scaleX(0)},${H - pad.b} ` + pts + ` ${scaleX(closes.length - 1)},${H - pad.b}`;

  const last      = closes[closes.length - 1];
  const lineColor = last >= closes[0] ? UP : DOWN;

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: pad.t + iH * (1 - f),
    v: (minP + f * range).toFixed(0),
  }));

  // X axis labels every ~15 days
  const xLabels = chartData
    .filter((_, i) => i % Math.ceil(chartData.length / 6) === 0)
    .map((d) => ({ x: scaleX(chartData.indexOf(d)), label: d.date.slice(5) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <line key={i} x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}
      {/* Fill */}
      <polygon points={fill} fill="url(#priceFill)" />
      {/* Line */}
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />
      {/* Y axis labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={pad.l - 6} y={t.y + 4} textAnchor="end"
          style={{ fontSize: 9, fill: textMuted, fontFamily: "monospace" }}>
          {currency === "INR" ? "₹" : "$"}{Number(t.v).toLocaleString()}
        </text>
      ))}
      {/* X axis labels */}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 6} textAnchor="middle"
          style={{ fontSize: 9, fill: textMuted, fontFamily: "monospace" }}>{l.label}</text>
      ))}
      {/* Current price dashed line */}
      <line x1={pad.l} y1={scaleY(last)} x2={W - pad.r} y2={scaleY(last)}
        stroke={lineColor} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
    </svg>
  );
}

// ─── Chart: Candlestick ──────────────────────────────────────────
function CandlestickChart({ chartData, currency }) {
  if (!chartData?.length) return null;
  // Show last 60 candles max for readability
  const data    = chartData.slice(-60);
  const W = 700, H = 220, pad = { t: 16, b: 32, l: 56, r: 16 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const allH = data.map((d) => d.high);
  const allL = data.map((d) => d.low);
  const minP = Math.min(...allL);
  const maxP = Math.max(...allH);
  const range = maxP - minP || 1;

  const scaleX = (i) => pad.l + (i / data.length) * iW;
  const scaleY = (v) => pad.t + iH * (1 - (v - minP) / range);
  const candleW = Math.max(2, (iW / data.length) * 0.7);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: pad.t + iH * (1 - f),
    v: (minP + f * range).toFixed(0),
  }));

  const xLabels = data
    .filter((_, i) => i % Math.ceil(data.length / 5) === 0)
    .map((d) => ({ x: scaleX(data.indexOf(d)) + candleW / 2, label: d.date.slice(5) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {yTicks.map((t, i) => (
        <line key={i} x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}
      {yTicks.map((t, i) => (
        <text key={i} x={pad.l - 6} y={t.y + 4} textAnchor="end"
          style={{ fontSize: 9, fill: textMuted, fontFamily: "monospace" }}>
          {currency === "INR" ? "₹" : "$"}{Number(t.v).toLocaleString()}
        </text>
      ))}
      {data.map((d, i) => {
        const x    = scaleX(i) + (iW / data.length - candleW) / 2;
        const isUp = d.close >= d.open;
        const col  = isUp ? UP : DOWN;
        const top  = scaleY(Math.max(d.open, d.close));
        const bot  = scaleY(Math.min(d.open, d.close));
        const bodyH = Math.max(1, bot - top);
        const cx   = x + candleW / 2;
        return (
          <g key={i}>
            {/* Wick */}
            <line x1={cx} y1={scaleY(d.high)} x2={cx} y2={scaleY(d.low)}
              stroke={col} strokeWidth={1} />
            {/* Body */}
            <rect x={x} y={top} width={candleW} height={bodyH}
              fill={isUp ? col : col} opacity={isUp ? 0.85 : 0.75}
              rx={1} />
          </g>
        );
      })}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 6} textAnchor="middle"
          style={{ fontSize: 9, fill: textMuted, fontFamily: "monospace" }}>{l.label}</text>
      ))}
    </svg>
  );
}

// ─── Chart: Volume Bar ───────────────────────────────────────────
function VolumeChart({ volumeData }) {
  if (!volumeData?.length) return null;
  const data   = volumeData.slice(-90);
  const W = 700, H = 100, pad = { t: 8, b: 24, l: 56, r: 16 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const maxV = Math.max(...data.map((d) => d.volume));
  const barW = Math.max(1, (iW / data.length) * 0.8);

  const xLabels = data
    .filter((_, i) => i % Math.ceil(data.length / 5) === 0)
    .map((d) => ({ x: pad.l + (data.indexOf(d) / data.length) * iW, label: d.date.slice(5) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {data.map((d, i) => {
        const x  = pad.l + (i / data.length) * iW;
        const bH = maxV > 0 ? (d.volume / maxV) * iH : 0;
        const isUp = i === 0 || d.close >= data[i - 1]?.close;
        return (
          <rect key={i} x={x} y={H - pad.b - bH} width={barW} height={bH}
            fill={isUp ? UP : DOWN} opacity={0.55} />
        );
      })}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 4} textAnchor="middle"
          style={{ fontSize: 9, fill: textMuted, fontFamily: "monospace" }}>{l.label}</text>
      ))}
      <text x={pad.l - 6} y={pad.t + 10} textAnchor="end"
        style={{ fontSize: 8, fill: textMuted }}>Vol</text>
    </svg>
  );
}

// ─── Chart: RSI Gauge ────────────────────────────────────────────
function RsiGauge({ rsi }) {
  if (rsi === "N/A" || rsi == null) return null;
  const angle = (rsi / 100) * 180 - 90;
  const color = rsi < 30 ? DOWN : rsi > 70 ? UP : FLAT;
  const label = rsi < 30 ? "Oversold 🔴" : rsi > 70 ? "Overbought 🟢" : "Neutral ⚪";

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 120 70" width="120" style={{ display: "block", margin: "0 auto" }}>
        <path d="M 15 60 A 45 45 0 0 1 105 60" fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={10} strokeLinecap="round" />
        <path d="M 15 60 A 45 45 0 0 1 105 60" fill="none"
          stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={`${(rsi / 100) * 141} 141`} />
        {/* Needle */}
        <line
          x1="60" y1="60"
          x2={60 + 32 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={60 + 32 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={color} strokeWidth={2} strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="4" fill={color} />
        <text x="60" y="50" textAnchor="middle"
          style={{ fontSize: 14, fontWeight: 800, fill: color, fontFamily: "monospace" }}>{rsi}</text>
      </svg>
      <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ─── Prediction Bar ──────────────────────────────────────────────
function PredBar({ label, current, predicted, low, high, pct, confidence, currency }) {
  const isUp  = pct >= 0;
  const color = isUp ? UP : DOWN;
  const barPct = Math.min(Math.abs(pct), 100);

  return (
    <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.03)", borderRadius: 12,
                  border: `1.5px solid ${color}22`, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: textMuted, textTransform: "uppercase",
                        letterSpacing: ".5px" }}>{label}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: textMuted }}>Confidence {confidence}%</span>
          <span style={{ fontSize: 14, fontWeight: 800, color }}>
            {isUp ? "▲" : "▼"} {Math.abs(pct)}%
          </span>
        </div>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 99, marginBottom: 8, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${barPct}%`, background: color, borderRadius: 99,
                      boxShadow: `0 0 8px ${color}80` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "monospace" }}>
          {fmt(predicted, currency)}
          <span style={{ fontSize: 11, color: textMuted, fontWeight: 400, marginLeft: 8 }}>
            ({fmt(low, currency)} – {fmt(high, currency)})
          </span>
        </span>
        <span style={{ fontSize: 11, color: textMuted }}>from {fmt(current, currency)}</span>
      </div>
    </div>
  );
}

// ─── Stat Tile ───────────────────────────────────────────────────
function Tile({ label, value, icon, color = teal, sub }) {
  return (
    <div style={{ padding: "16px 14px", background: cardBg, border: `1.5px solid ${border}`,
                  borderRadius: 14 }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 10, color: textMuted, textTransform: "uppercase", letterSpacing: ".8px",
                    fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "monospace",
                    wordBreak: "break-all" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Chart Tab Button ────────────────────────────────────────────
function ChartTab({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
      cursor: "pointer", border: `1.5px solid ${active ? teal : border}`,
      background: active ? teal + "22" : "rgba(255,255,255,0.03)",
      color: active ? teal : textMuted,
    }}>{children}</button>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function StockPredictor() {
  const [symbol,       setSymbol]       = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [data,         setData]         = useState(null);
  const [tab,          setTab]          = useState("predict");       // predict | screener
  const [chartTab,     setChartTab]     = useState("price");         // price | candle | volume
  const [currency,     setCurrency]     = useState("USD");

  // Screener state
  const [priceFilter,  setPriceFilter]  = useState("all");
  const [trendFilter,  setTrendFilter]  = useState("all");
  const [screenerData, setScreenerData] = useState(null);
  const [scrLoading,   setScrLoading]   = useState(false);

  const POPULAR_US = ["AAPL","MSFT","GOOGL","NVDA","TSLA","META","AMZN"];
  const POPULAR_IN = ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ZOMATO.NS"];

  const handlePredict = useCallback(async (sym) => {
    const s = (sym || symbol).trim().toUpperCase();
    if (!s) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await axios.post(`${API}/stock/predict`, { symbol: s });
      setData(res.data);
      setCurrency(res.data.currency || "USD");
      setChartTab("price");
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Failed to fetch stock data");
    } finally { setLoading(false); }
  }, [symbol]);

  const handleScreener = useCallback(async () => {
    setScrLoading(true); setScreenerData(null);
    const priceMax = priceFilter === "all" ? 99999
      : priceFilter === "under50"  ? 50
      : priceFilter === "under100" ? 100 : 150;
    try {
      const res = await axios.post(`${API}/stock/screener`, {
        priceMax, trend: trendFilter,
      });
      setScreenerData(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally { setScrLoading(false); }
  }, [priceFilter, trendFilter]);

  const inp = {
    padding: "12px 16px", background: "rgba(255,255,255,0.05)",
    border: `1.5px solid ${border}`, borderRadius: 12, color: textMain,
    fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box",
    fontFamily: "'Space Grotesk', monospace",
  };

  const btn = (color = teal, disabled = false) => ({
    padding: "12px 28px", background: color, border: "none", borderRadius: 12,
    fontSize: 14, fontWeight: 800, color: "#000", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: "nowrap",
  });

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "24px 20px",
                  fontFamily: "'Space Grotesk', sans-serif", color: textMain }}>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[["predict","📈 Predict"],["screener","🔍 Screener"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: "pointer", border: `1.5px solid ${tab === k ? teal : border}`,
            background: tab === k ? teal + "22" : "rgba(255,255,255,0.03)",
            color: tab === k ? teal : textMuted,
          }}>{l}</button>
        ))}
      </div>

      {/* ══════════════ PREDICT TAB ═══════════════════════════════ */}
      {tab === "predict" && (
        <>
          {/* Search bar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <input
              style={{ ...inp, flex: 1, minWidth: 200 }}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handlePredict()}
              placeholder="US: AAPL, TSLA  •  India: RELIANCE.NS, TCS.NS"
            />
            <button style={btn(teal, loading)} onClick={() => handlePredict()} disabled={loading}>
              {loading ? "Loading…" : "Predict →"}
            </button>
          </div>

          {/* Quick pick chips */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: textMuted, marginBottom: 8, textTransform: "uppercase",
                          letterSpacing: ".7px", fontWeight: 600 }}>🇺🇸 US Quick Pick</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {POPULAR_US.map((s) => (
                <button key={s} onClick={() => { setSymbol(s); handlePredict(s); }} style={{
                  padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", background: "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${border}`, color: teal,
                }}>{s}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: textMuted, marginBottom: 8, textTransform: "uppercase",
                          letterSpacing: ".7px", fontWeight: 600 }}>🇮🇳 Indian Quick Pick</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {POPULAR_IN.map((s) => (
                <button key={s} onClick={() => { setSymbol(s); handlePredict(s); }} style={{
                  padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", background: "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${border}`, color: "#fb923c",
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "14px 18px", background: "rgba(255,82,82,.1)",
                          border: "1.5px solid rgba(255,82,82,.3)", borderRadius: 12,
                          color: DOWN, marginBottom: 20 }}>⚠️ {error}</div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 48, height: 48, border: `3px solid ${teal}33`,
                            borderTop: `3px solid ${teal}`, borderRadius: "50%",
                            animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <div style={{ color: textMuted, fontSize: 14 }}>Fetching real-time data…</div>
            </div>
          )}

          {/* ── Results ── */}
          {data && !loading && (
            <div style={{ animation: "fadeUp .4s ease both" }}>

              {/* Header */}
              <div style={{ padding: "20px 24px", background: cardBg,
                            border: `1.5px solid ${border}`, borderRadius: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                              alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: textMuted, marginBottom: 4 }}>
                      {data.symbol} · {data.dataSource}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>{data.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "monospace", color: teal }}>
                      {fmt(data.currentPrice, data.currency)}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700,
                                  color: pctColor(data.dayChange) }}>
                      {data.dayChange >= 0 ? "▲" : "▼"} {Math.abs(data.dayChange)}% today
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                            gap: 10, marginBottom: 16 }}>
                <Tile icon="📊" label="RSI (14)" value={data.technicals.rsi}
                  color={data.technicals.rsi < 30 ? DOWN : data.technicals.rsi > 70 ? UP : FLAT} />
                <Tile icon="📉" label="MACD" value={data.technicals.macd}
                  color={data.technicals.macd >= 0 ? UP : DOWN} />
                <Tile icon="🛡️" label="Support" value={fmt(data.technicals.support, data.currency)} />
                <Tile icon="⚡" label="Resistance" value={fmt(data.technicals.resistance, data.currency)} />
                <Tile icon="📅" label="52W Avg" value={fmt(data.technicals.avg52w, data.currency)} />
                <Tile icon="🌊" label="Ann. Vol" value={`${data.technicals.annualisedVol}%`}
                  color={FLAT} />
                {data.technicals.ma50 && (
                  <Tile icon="〽️" label="MA50"
                    value={fmt(data.technicals.ma50, data.currency)}
                    color={data.currentPrice >= data.technicals.ma50 ? UP : DOWN} />
                )}
                {data.technicals.ma200 && (
                  <Tile icon="📐" label="MA200"
                    value={fmt(data.technicals.ma200, data.currency)}
                    color={data.currentPrice >= data.technicals.ma200 ? UP : DOWN} />
                )}
              </div>

              {/* ── Charts ── */}
              <div style={{ padding: "20px 24px", background: cardBg,
                            border: `1.5px solid ${border}`, borderRadius: 16, marginBottom: 16 }}>
                {/* Chart tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap",
                              alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, color: textMuted, fontWeight: 700,
                                textTransform: "uppercase", letterSpacing: ".8px" }}>
                    Price Charts — last 90 days
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <ChartTab active={chartTab === "price"}  onClick={() => setChartTab("price")}>📈 Line</ChartTab>
                    <ChartTab active={chartTab === "candle"} onClick={() => setChartTab("candle")}>🕯️ Candle</ChartTab>
                    <ChartTab active={chartTab === "volume"} onClick={() => setChartTab("volume")}>📊 Volume</ChartTab>
                  </div>
                </div>

                {chartTab === "price" && (
                  <PriceLineChart chartData={data.chartData} currency={data.currency} />
                )}
                {chartTab === "candle" && (
                  <CandlestickChart chartData={data.chartData} currency={data.currency} />
                )}
                {chartTab === "volume" && (
                  <>
                    <PriceLineChart chartData={data.chartData} currency={data.currency} />
                    <div style={{ marginTop: 8 }}>
                      <VolumeChart volumeData={data.volumeData || data.chartData} />
                    </div>
                  </>
                )}
              </div>

              {/* RSI gauge + Trend signals */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr",
                            gap: 16, marginBottom: 16, alignItems: "start" }}>
                <div style={{ padding: "20px 20px", background: cardBg,
                              border: `1.5px solid ${border}`, borderRadius: 16 }}>
                  <div style={{ fontSize: 11, color: textMuted, fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>
                    RSI Gauge
                  </div>
                  <RsiGauge rsi={data.technicals.rsi} />
                </div>

                <div style={{ padding: "20px 24px", background: cardBg,
                              border: `1.5px solid ${border}`, borderRadius: 16 }}>
                  <div style={{ fontSize: 11, color: textMuted, fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 14 }}>
                    Trend Signals
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {[
                      { label: "30-Day",  t: data.trend.short  },
                      { label: "90-Day",  t: data.trend.medium },
                      { label: "2-Year",  t: data.trend.long   },
                    ].map(({ label, t }) => (
                      <div key={label} style={{ padding: "12px 14px", borderRadius: 12,
                                                background: t.color + "12",
                                                border: `1.5px solid ${t.color}33`, textAlign: "center" }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                        <div style={{ fontSize: 11, color: textMuted, marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: t.color }}>{t.label}</div>
                        <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>
                          {t.pctPerDay >= 0 ? "+" : ""}{t.pctPerDay.toFixed(3)}%/day
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div style={{ padding: "20px 24px", background: cardBg,
                            border: `1.5px solid ${border}`, borderRadius: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                              alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: textMuted, fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: ".8px" }}>Price Predictions</div>
                  <div style={{ fontSize: 11, color: textMuted }}>
                    Ensemble model · {data.dataPoints} data points
                  </div>
                </div>
                {data.predictions.map((p) => (
                  <PredBar key={p.days} label={p.label}
                    current={data.currentPrice} predicted={p.predicted}
                    low={p.low} high={p.high} pct={p.pctChange}
                    confidence={p.confidence} currency={data.currency} />
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ padding: "14px 16px", background: "rgba(251,191,36,.06)",
                            border: "1.5px solid rgba(251,191,36,.2)", borderRadius: 12,
                            fontSize: 12, color: "rgba(251,191,36,.7)", lineHeight: 1.6 }}>
                ⚠️ <strong>Disclaimer:</strong> Statistical model outputs for educational purposes only.
                NOT financial advice. Past performance does not guarantee future results.
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════ SCREENER TAB ═══════════════════════════════ */}
      {tab === "screener" && (
        <div>
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            {/* Price filter */}
            <div>
              <div style={{ fontSize: 11, color: textMuted, fontWeight: 600,
                            textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>
                Price Range
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["all","All"],["under50","<$50"],["under100","<$100"],["under150","<$150"]].map(([k, l]) => (
                  <button key={k} onClick={() => setPriceFilter(k)} style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", border: `1.5px solid ${priceFilter === k ? teal : border}`,
                    background: priceFilter === k ? teal + "22" : "rgba(255,255,255,0.04)",
                    color: priceFilter === k ? teal : textMuted,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            {/* Trend filter */}
            <div>
              <div style={{ fontSize: 11, color: textMuted, fontWeight: 600,
                            textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>
                Trend
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["all","All"],["up","📈 Up"],["down","📉 Down"]].map(([k, l]) => (
                  <button key={k} onClick={() => setTrendFilter(k)} style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: "pointer",
                    background: trendFilter === k
                      ? (k === "up" ? UP : k === "down" ? DOWN : teal) + "22"
                      : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${trendFilter === k
                      ? (k === "up" ? UP : k === "down" ? DOWN : teal) : border}`,
                    color: trendFilter === k
                      ? (k === "up" ? UP : k === "down" ? DOWN : teal) : textMuted,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button onClick={handleScreener} disabled={scrLoading} style={btn(teal, scrLoading)}>
                {scrLoading ? "Scanning…" : "Run Screener →"}
              </button>
            </div>
          </div>

          {scrLoading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${teal}33`,
                            borderTop: `3px solid ${teal}`, borderRadius: "50%",
                            animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <div style={{ color: textMuted }}>Scanning US stocks via Finnhub…</div>
            </div>
          )}

          {screenerData && (
            <>
              <div style={{ fontSize: 12, color: textMuted, marginBottom: 14 }}>
                Found <strong style={{ color: textMain }}>{screenerData.count}</strong> stocks
              </div>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                            gap: 10, padding: "8px 16px", marginBottom: 4 }}>
                {["Stock","Price","Today","Trend","Sector"].map((h) => (
                  <div key={h} style={{ fontSize: 10, color: textMuted, fontWeight: 700,
                                        textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</div>
                ))}
              </div>
              {screenerData.results.map((s) => (
                <div key={s.symbol}
                  onClick={() => { setTab("predict"); setSymbol(s.symbol); handlePredict(s.symbol); }}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                            gap: 10, padding: "14px 16px", background: cardBg,
                            border: `1.5px solid ${border}`, borderRadius: 12, marginBottom: 6,
                            cursor: "pointer" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: teal }}>{s.symbol}</div>
                    <div style={{ fontSize: 11, color: textMuted }}>{s.name}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontFamily: "monospace" }}>${s.price}</div>
                  <div style={{ color: pctColor(s.dayChange), fontWeight: 700 }}>
                    {s.dayChange >= 0 ? "+" : ""}{s.dayChange}%
                  </div>
                  <div style={{ color: s.trend === "up" ? UP : s.trend === "down" ? DOWN : textMuted,
                                fontWeight: 700 }}>
                    {s.trend === "up" ? "📈 Up" : s.trend === "down" ? "📉 Down" : "—"}
                  </div>
                  <div style={{ fontSize: 11, color: textMuted }}>{s.sector}</div>
                </div>
              ))}
              {screenerData.results.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: textMuted }}>
                  No stocks matched. Try widening filters.
                </div>
              )}
            </>
          )}

          {!screenerData && !scrLoading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ color: textMuted, fontSize: 15, fontWeight: 600 }}>
                Set filters and run the screener
              </div>
              <div style={{ color: textMuted, fontSize: 12, marginTop: 6 }}>
                Click any result to instantly predict that stock
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp .4s ease both; }
      `}</style>
    </div>
  );
}
