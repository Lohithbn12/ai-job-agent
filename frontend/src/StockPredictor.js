/**
 * StockPredictor.js
 *
 * Full-featured Stock Predictor dashboard.
 * APIs: Finnhub (US) + Alpha Vantage (Indian)
 * Charts: Price line, Candlestick, Volume bar, RSI, Prediction bars
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { API } from "./constants";

// ─── Colors ──────────────────────────────────────────────────────
const UP        = "#34d399";
const DOWN      = "#fb7185";
const FLAT      = "#f59e0b";
const teal      = "#f59e0b";
const cardBg    = "#1c1c28";
const border    = "rgba(255,255,255,0.08)";
const textMuted = "#8888a8";
const textMain  = "#f1f1f5";
const bg        = "#0d0d14";

// ─── All stocks — same list as backend POPULAR_STOCKS ────────────
const ALL_STOCKS = [
  // 🇺🇸 US
  { symbol: "AAPL",          name: "Apple Inc.",                region: "US", sector: "Technology"     },
  { symbol: "MSFT",          name: "Microsoft Corp.",           region: "US", sector: "Technology"     },
  { symbol: "GOOGL",         name: "Alphabet Inc.",             region: "US", sector: "Technology"     },
  { symbol: "AMZN",          name: "Amazon.com Inc.",           region: "US", sector: "Consumer"       },
  { symbol: "NVDA",          name: "NVIDIA Corp.",              region: "US", sector: "Technology"     },
  { symbol: "META",          name: "Meta Platforms Inc.",       region: "US", sector: "Technology"     },
  { symbol: "TSLA",          name: "Tesla Inc.",                region: "US", sector: "Automotive"     },
  { symbol: "JPM",           name: "JPMorgan Chase",            region: "US", sector: "Finance"        },
  { symbol: "V",             name: "Visa Inc.",                 region: "US", sector: "Finance"        },
  { symbol: "JNJ",           name: "Johnson & Johnson",         region: "US", sector: "Healthcare"     },
  { symbol: "WMT",           name: "Walmart Inc.",              region: "US", sector: "Retail"         },
  { symbol: "XOM",           name: "ExxonMobil Corp.",          region: "US", sector: "Energy"         },
  // 🇮🇳 India
  { symbol: "RELIANCE.NS",   name: "Reliance Industries",       region: "IN", sector: "Conglomerate"   },
  { symbol: "TCS.NS",        name: "Tata Consultancy Services", region: "IN", sector: "Technology"     },
  { symbol: "HDFCBANK.NS",   name: "HDFC Bank",                 region: "IN", sector: "Finance"        },
  { symbol: "INFY.NS",       name: "Infosys Ltd.",              region: "IN", sector: "Technology"     },
  { symbol: "ICICIBANK.NS",  name: "ICICI Bank",                region: "IN", sector: "Finance"        },
  { symbol: "WIPRO.NS",      name: "Wipro Ltd.",                region: "IN", sector: "Technology"     },
  { symbol: "SBIN.NS",       name: "State Bank of India",       region: "IN", sector: "Finance"        },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance",             region: "IN", sector: "Finance"        },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors",               region: "IN", sector: "Automotive"     },
  { symbol: "ADANIENT.NS",   name: "Adani Enterprises",         region: "IN", sector: "Conglomerate"   },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever",        region: "IN", sector: "FMCG"           },
  { symbol: "KOTAKBANK.NS",  name: "Kotak Mahindra Bank",       region: "IN", sector: "Finance"        },
  { symbol: "AXISBANK.NS",   name: "Axis Bank",                 region: "IN", sector: "Finance"        },
  { symbol: "LT.NS",         name: "Larsen & Toubro",           region: "IN", sector: "Infrastructure" },
  { symbol: "ZOMATO.NS",     name: "Zomato Ltd.",               region: "IN", sector: "Technology"     },
  { symbol: "MARUTI.NS",     name: "Maruti Suzuki",             region: "IN", sector: "Automotive"     },
  { symbol: "SUNPHARMA.NS",  name: "Sun Pharmaceutical",        region: "IN", sector: "Healthcare"     },
  { symbol: "TITAN.NS",      name: "Titan Company",             region: "IN", sector: "Consumer"       },
  { symbol: "HCLTECH.NS",    name: "HCL Technologies",          region: "IN", sector: "Technology"     },
];

// ─── Helpers ─────────────────────────────────────────────────────
const fmt = (v, currency) =>
  v == null ? "N/A" : `${currency === "INR" ? "₹" : "$"}${Number(v).toLocaleString()}`;

const pctColor = (v) => (v > 0 ? UP : v < 0 ? DOWN : FLAT);

// ─── Stock Dropdown ───────────────────────────────────────────────
/**
 * Behaviour:
 *  • Shows the text input + a "▼" chevron button.
 *  • Clicking the chevron (or the input when empty) opens the panel.
 *  • When closed  → first batch of 8 stocks (unsorted, original order).
 *  • When open    → full list sorted A-Z by company name,
 *                   further filtered by whatever the user types.
 *  • Clicking a row selects it, closes the panel, and triggers predict.
 */
function StockDropdown({ onSelect, selectedSymbol }) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [sorted,  setSorted]  = useState(false);   // true when chevron was clicked
  const wrapRef               = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSorted(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Which stocks to show in the panel
  const visibleStocks = (() => {
    const q = query.trim().toLowerCase();

    // Always filter by query if user typed something
    let list = q
      ? ALL_STOCKS.filter(
          (s) =>
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.sector.toLowerCase().includes(q)
        )
      : [...ALL_STOCKS];

    // Sort A-Z when opened via chevron; otherwise keep original order (first 8 preview)
    if (sorted || q) {
      list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list = list.slice(0, 8);   // initial preview batch
    }

    return list;
  })();

  function openSorted() {
    setSorted(true);
    setOpen(true);
  }

  function openPreview() {
    setSorted(false);
    setOpen(true);
  }

  function select(stock) {
    setOpen(false);
    setSorted(false);
    setQuery("");
    onSelect(stock.symbol);
  }

  const selected = ALL_STOCKS.find((s) => s.symbol === selectedSymbol);

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1, minWidth: 220 }}>

      {/* ── Trigger row ── */}
      <div style={{ display: "flex", gap: 0, borderRadius: 12, overflow: "hidden",
                    border: `1.5px solid ${open ? teal : border}`,
                    background: "rgba(255,255,255,0.05)", transition: "border-color .2s" }}>

        {/* Text input */}
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setSorted(true); }}
          onFocus={openPreview}
          placeholder={
            selected
              ? `${selected.symbol}  —  ${selected.name}`
              : "Search stock by name or symbol…"
          }
          style={{
            flex: 1, padding: "12px 16px", background: "transparent",
            border: "none", outline: "none", color: textMain, fontSize: 14,
            fontFamily: "'Space Grotesk', monospace",
            caretColor: "#f59e0b",
          }}
        />

        {/* Chevron — click to open sorted full list */}
        <button
          onClick={() => (open && sorted) ? setOpen(false) : openSorted()}
          title="Browse all stocks A–Z"
          style={{
            padding: "0 16px", background: "transparent", border: "none",
            borderLeft: `1.5px solid ${border}`, cursor: "pointer",
            color: open ? teal : textMuted, fontSize: 16,
            transition: "color .2s, transform .2s",
            transform: open && sorted ? "scaleY(-1)" : "none",
            display: "flex", alignItems: "center",
          }}
        >
          ▾
        </button>
      </div>

      {/* ── Dropdown panel ── */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#16161f", border: `1.5px solid rgba(245,158,11,0.25)`,
          borderRadius: 14, zIndex: 999, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          animation: "fadeUp .15s ease both",
        }}>

          {/* Header */}
          <div style={{
            padding: "10px 14px 8px", borderBottom: `1px solid ${border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 10, color: textMuted, fontWeight: 700,
                           textTransform: "uppercase", letterSpacing: ".8px" }}>
              {sorted || query
                ? `${visibleStocks.length} stocks · sorted A–Z`
                : `Top ${visibleStocks.length} stocks · click ▾ to see all`}
            </span>
            {/* Region legend */}
            <div style={{ display: "flex", gap: 10, fontSize: 10, color: textMuted }}>
              <span>🇺🇸 US</span>
              <span>🇮🇳 India</span>
            </div>
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {visibleStocks.length === 0 && (
              <div style={{ padding: "24px 16px", textAlign: "center",
                            color: textMuted, fontSize: 13 }}>
                No stocks match "{query}"
              </div>
            )}
            {visibleStocks.map((s) => {
              const isSelected = s.symbol === selectedSymbol;
              const isIN       = s.region === "IN";
              return (
                <div
                  key={s.symbol}
                  onClick={() => select(s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", cursor: "pointer",
                    background: isSelected ? teal + "18" : "transparent",
                    borderBottom: `1px solid ${border}`,
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? teal + "18" : "transparent"; }}
                >
                  {/* Flag */}
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{isIN ? "🇮🇳" : "🇺🇸"}</span>

                  {/* Symbol + name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13,
                                  color: isIN ? "#fb923c" : teal,
                                  fontFamily: "monospace" }}>
                      {s.symbol}
                    </div>
                    <div style={{ fontSize: 11, color: textMuted,
                                  overflow: "hidden", textOverflow: "ellipsis",
                                  whiteSpace: "nowrap" }}>
                      {s.name}
                    </div>
                  </div>

                  {/* Sector badge */}
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 99,
                    background: "rgba(255,255,255,0.06)",
                    color: textMuted, whiteSpace: "nowrap", flexShrink: 0,
                  }}>{s.sector}</span>

                  {/* Selected tick */}
                  {isSelected && (
                    <span style={{ color: teal, fontSize: 14, flexShrink: 0 }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          {!sorted && !query && (
            <div style={{
              padding: "8px 14px", borderTop: `1px solid ${border}`,
              fontSize: 10, color: textMuted, textAlign: "center",
            }}>
              Click <strong style={{ color: teal }}>▾</strong> or type to browse all {ALL_STOCKS.length} stocks A–Z
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: pad.t + iH * (1 - f),
    v: (minP + f * range).toFixed(0),
  }));

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
      {yTicks.map((t, i) => (
        <line key={i} x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}
      <polygon points={fill} fill="url(#priceFill)" />
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />
      {yTicks.map((t, i) => (
        <text key={i} x={pad.l - 6} y={t.y + 4} textAnchor="end"
          style={{ fontSize: 9, fill: textMuted, fontFamily: "monospace" }}>
          {currency === "INR" ? "₹" : "$"}{Number(t.v).toLocaleString()}
        </text>
      ))}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 6} textAnchor="middle"
          style={{ fontSize: 9, fill: textMuted, fontFamily: "monospace" }}>{l.label}</text>
      ))}
      <line x1={pad.l} y1={scaleY(last)} x2={W - pad.r} y2={scaleY(last)}
        stroke={lineColor} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
    </svg>
  );
}

// ─── Chart: Candlestick ──────────────────────────────────────────
function CandlestickChart({ chartData, currency }) {
  if (!chartData?.length) return null;
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
            <line x1={cx} y1={scaleY(d.high)} x2={cx} y2={scaleY(d.low)}
              stroke={col} strokeWidth={1} />
            <rect x={x} y={top} width={candleW} height={bodyH}
              fill={col} opacity={isUp ? 0.85 : 0.75} rx={1} />
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
  const [tab,          setTab]          = useState("predict");
  const [chartTab,     setChartTab]     = useState("price");
  const [currency,     setCurrency]     = useState("USD");

  // Screener state
  const [priceFilter,  setPriceFilter]  = useState("all");
  const [trendFilter,  setTrendFilter]  = useState("all");
  const [screenerData, setScreenerData] = useState(null);
  const [scrLoading,   setScrLoading]   = useState(false);

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

  // Called when user picks from dropdown
  function handleDropdownSelect(sym) {
    setSymbol(sym);
    handlePredict(sym);
  }

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

  const btn = (color = teal, disabled = false) => ({
    padding: "12px 28px", background: color, border: "none", borderRadius: 12,
    fontSize: 14, fontWeight: 800, color: "#0a0a0f", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1, fontFamily: "'Syne', 'Space Grotesk', sans-serif", fontWeight: 800, whiteSpace: "nowrap",
  });

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "24px 20px",
                  fontFamily: "'Bricolage Grotesque', 'Space Grotesk', sans-serif", color: textMain }}>

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
          {/* ── Stock Dropdown + Predict button ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <StockDropdown
              onSelect={handleDropdownSelect}
              selectedSymbol={symbol}
            />
            <button style={btn(teal, loading)} onClick={() => handlePredict()} disabled={loading}>
              {loading ? "Loading…" : "Predict →"}
            </button>
          </div>

          {/* ── Or type a custom symbol hint ── */}
          <div style={{ fontSize: 11, color: textMuted, marginBottom: 24,
                        padding: "8px 14px", background: "rgba(245,158,11,0.04)",
                        borderRadius: 8, border: "1px solid rgba(245,158,11,0.15)" }}>
            💡 Pick from the dropdown above, or type any symbol directly (e.g.{" "}
            <span style={{ color: teal, fontFamily: "monospace" }}>NVDA</span>,{" "}
            <span style={{ color: "#fb923c", fontFamily: "monospace" }}>WIPRO.NS</span>)
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
                            border: "1.5px solid rgba(245,158,11,0.15)", borderRadius: 16, marginBottom: 16, boxShadow: "0 0 0 1px rgba(245,158,11,0.05), 0 8px 32px rgba(0,0,0,0.4)" }}>
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
                <Tile icon="🌊" label="Ann. Vol" value={`${data.technicals.annualisedVol}%`} color={FLAT} />
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;600;700;800;900&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp .4s ease both; }
      `}</style>
    </div>
  );
}
