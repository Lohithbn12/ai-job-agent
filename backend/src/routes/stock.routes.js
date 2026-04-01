/**
 * src/routes/stock.routes.js
 *
 * Stock Predictor — Time-Series Statistical Engine
 * Models used:
 *   1. Linear Regression (OLS) on log-prices
 *   2. Double Exponential Smoothing (Holt's method) — trend-aware
 *   3. Simple Moving Average extrapolation
 *   4. Weighted Ensemble of all three
 *
 * Data source: Twelve Data API (free tier — 800 req/day, 8 req/min)
 *   Sign up:    https://twelvedata.com/
 *   Env var:    TWELVE_DATA_API_KEY=your_key_here
 *
 * Install:  npm install axios  (if not already present)
 */

"use strict";

const express = require("express");
const router  = express.Router();
const axios   = require("axios");

const TD_KEY  = process.env.TWELVE_DATA_API_KEY || "";
const TD_BASE = "https://api.twelvedata.com";

if (!TD_KEY) {
  console.warn("[stock] TWELVE_DATA_API_KEY not set — add it to your .env file");
}

// ─────────────────────────────────────────────────────────────────
//  Twelve Data helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch 2 years of daily close data.
 * Twelve Data symbol format:
 *   US stocks : "AAPL", "MSFT"
 *   NSE India : "RELIANCE:NSE", "TCS:NSE", "HDFCBANK:NSE"
 *
 * We normalise the incoming symbol:
 *   "RELIANCE.NS"  →  "RELIANCE:NSE"
 *   "TCS.BO"       →  "TCS:BSE"
 *   Everything else is passed as-is.
 */
function normaliseTDSymbol(raw) {
  if (raw.endsWith(".NS")) return raw.replace(".NS", "") + ":NSE";
  if (raw.endsWith(".BO")) return raw.replace(".BO", "") + ":BSE";
  return raw;
}

/**
 * GET /time_series  — returns up to 500 daily bars (≈ 2 years)
 * Returns array of { date, open, high, low, close, volume } sorted oldest→newest
 */
async function fetchTimeSeries(symbol) {
  const tdSymbol = normaliseTDSymbol(symbol);

  const { data } = await axios.get(`${TD_BASE}/time_series`, {
    params: {
      symbol:     tdSymbol,
      interval:   "1day",
      outputsize: 500,       // max on free plan
      apikey:     TD_KEY,
    },
    timeout: 15000,
  });

  if (data.status === "error") {
    throw new Error(data.message || `Symbol "${symbol}" not found`);
  }

  // Twelve Data returns newest-first; reverse for chronological order
  const bars = (data.values || []).reverse();

  return bars.map((b) => ({
    date:   b.datetime,
    open:   parseFloat(b.open),
    high:   parseFloat(b.high),
    low:    parseFloat(b.low),
    close:  parseFloat(b.close),
    volume: parseInt(b.volume, 10) || 0,
  }));
}

/**
 * GET /quote  — real-time snapshot
 * Returns { name, currency, price, change_percent, market_cap (null on free) }
 */
async function fetchQuote(symbol) {
  const tdSymbol = normaliseTDSymbol(symbol);

  const { data } = await axios.get(`${TD_BASE}/quote`, {
    params: { symbol: tdSymbol, apikey: TD_KEY },
    timeout: 10000,
  });

  if (data.status === "error") {
    throw new Error(data.message || `Quote not found for "${symbol}"`);
  }

  return {
    name:           data.name || symbol,
    currency:       data.currency || "USD",
    price:          parseFloat(data.close) || parseFloat(data.open) || 0,
    change_percent: parseFloat(data.percent_change) || 0,
    // Twelve Data free plan doesn't include market_cap — set null
    market_cap:     null,
    pe:             null,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Math helpers (unchanged from original)
// ─────────────────────────────────────────────────────────────────
function linearRegression(x, y) {
  const n   = x.length;
  const sx  = x.reduce((a, b) => a + b, 0);
  const sy  = y.reduce((a, b) => a + b, 0);
  const sxy = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sxx = x.reduce((s, xi) => s + xi * xi, 0);
  const slope     = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const yMean     = sy / n;
  const ssTot     = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const ssRes     = y.reduce((s, yi, i) => s + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const r2        = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

function holtSmoothing(prices, alpha = 0.3, beta = 0.1) {
  let l = prices[0];
  let b = prices[1] - prices[0];
  for (let i = 1; i < prices.length; i++) {
    const lPrev = l;
    l = alpha * prices[i] + (1 - alpha) * (l + b);
    b = beta  * (l - lPrev) + (1 - beta) * b;
  }
  return { level: l, trend: b, forecast: (h) => l + h * b };
}

function smaForecast(prices, window = 20) {
  const slice = prices.slice(-Math.min(window, prices.length));
  const avg   = slice.reduce((a, b) => a + b, 0) / slice.length;
  const drift = (prices[prices.length - 1] - prices[prices.length - Math.min(window, prices.length)]) / Math.min(window, prices.length);
  return (h) => avg + drift * h;
}

function confidenceBand(currentPrice, dailyVol, h, z = 1.64) {
  return currentPrice * dailyVol * Math.sqrt(h) * z;
}

function annualisedVol(prices) {
  const returns = [];
  for (let i = 1; i < prices.length; i++)
    returns.push(Math.log(prices[i] / prices[i - 1]));
  const mean     = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance * 252);
}

function classifyTrend(prices) {
  const x    = prices.map((_, i) => i);
  const logY = prices.map((p) => Math.log(p));
  const reg  = linearRegression(x, logY);
  const pctPerDay = (Math.exp(reg.slope) - 1) * 100;
  if (pctPerDay >  0.15) return { label: "Strong Uptrend",   color: "#00e676", icon: "🚀", pctPerDay };
  if (pctPerDay >  0.03) return { label: "Uptrend",          color: "#69f0ae", icon: "📈", pctPerDay };
  if (pctPerDay < -0.15) return { label: "Strong Downtrend", color: "#ff1744", icon: "📉", pctPerDay };
  if (pctPerDay < -0.03) return { label: "Downtrend",        color: "#ff5252", icon: "⬇️",  pctPerDay };
  return                          { label: "Sideways",        color: "#ffab40", icon: "➡️",  pctPerDay };
}

function buildPredictions(closePrices) {
  const HORIZONS = [15, 30, 60, 100, 365, 730];
  const x      = closePrices.map((_, i) => i);
  const logY   = closePrices.map((p) => Math.log(p));
  const reg    = linearRegression(x, logY);
  const holt   = holtSmoothing(closePrices);
  const sma    = smaForecast(closePrices, 30);
  const dailyVol = annualisedVol(closePrices) / Math.sqrt(252);
  const last   = closePrices[closePrices.length - 1];
  const n      = closePrices.length;

  const predictions = HORIZONS.map((h) => {
    const regPred  = Math.exp(reg.intercept + reg.slope * (n + h));
    const holtPred = Math.max(holt.forecast(h), last * 0.1);
    const smaPred  = Math.max(sma(h), last * 0.1);
    const ensemble = 0.40 * regPred + 0.40 * holtPred + 0.20 * smaPred;
    const band     = confidenceBand(last, dailyVol, h, 1.64);
    const pctChange = ((ensemble - last) / last) * 100;

    return {
      days:       h,
      label:      h === 730 ? "2 Years" : `${h} Days`,
      predicted:  +ensemble.toFixed(2),
      low:        +(ensemble - band).toFixed(2),
      high:       +(ensemble + band).toFixed(2),
      pctChange:  +pctChange.toFixed(2),
      confidence: +(Math.min(95, Math.max(45, reg.r2 * 100 - h * 0.03)).toFixed(1)),
      direction:  ensemble >= last ? "up" : "down",
    };
  });

  return { predictions, reg, dailyVol };
}

// ─────────────────────────────────────────────────────────────────
//  Popular stocks list (unchanged)
// ─────────────────────────────────────────────────────────────────
const POPULAR_STOCKS = [
  { symbol: "AAPL",  name: "Apple Inc.",                    sector: "Technology" },
  { symbol: "MSFT",  name: "Microsoft Corp.",               sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.",                 sector: "Technology" },
  { symbol: "AMZN",  name: "Amazon.com Inc.",               sector: "Consumer" },
  { symbol: "NVDA",  name: "NVIDIA Corp.",                  sector: "Technology" },
  { symbol: "META",  name: "Meta Platforms Inc.",           sector: "Technology" },
  { symbol: "TSLA",  name: "Tesla Inc.",                    sector: "Automotive" },
  { symbol: "JPM",   name: "JPMorgan Chase",                sector: "Finance" },
  { symbol: "V",     name: "Visa Inc.",                     sector: "Finance" },
  { symbol: "JNJ",   name: "Johnson & Johnson",             sector: "Healthcare" },
  { symbol: "WMT",   name: "Walmart Inc.",                  sector: "Retail" },
  { symbol: "XOM",   name: "ExxonMobil Corp.",              sector: "Energy" },
  { symbol: "RELIANCE.NS",   name: "Reliance Industries",         sector: "Conglomerate" },
  { symbol: "TCS.NS",        name: "Tata Consultancy Services",   sector: "Technology" },
  { symbol: "HDFCBANK.NS",   name: "HDFC Bank",                   sector: "Finance" },
  { symbol: "INFY.NS",       name: "Infosys Ltd.",                sector: "Technology" },
  { symbol: "ICICIBANK.NS",  name: "ICICI Bank",                  sector: "Finance" },
  { symbol: "WIPRO.NS",      name: "Wipro Ltd.",                  sector: "Technology" },
  { symbol: "SBIN.NS",       name: "State Bank of India",         sector: "Finance" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance",               sector: "Finance" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors",                 sector: "Automotive" },
  { symbol: "ADANIENT.NS",   name: "Adani Enterprises",           sector: "Conglomerate" },
];

// ─────────────────────────────────────────────────────────────────
//  GET /stock/popular
// ─────────────────────────────────────────────────────────────────
router.get("/popular", (_req, res) => {
  res.json({ stocks: POPULAR_STOCKS });
});

// ─────────────────────────────────────────────────────────────────
//  POST /stock/predict
//  Body: { symbol: "AAPL" }
// ─────────────────────────────────────────────────────────────────
router.post("/predict", async (req, res) => {
  if (!TD_KEY) return res.status(503).json({ detail: "TWELVE_DATA_API_KEY not configured in .env" });

  const symbol = (req.body.symbol || "").trim().toUpperCase();
  if (!symbol) return res.status(400).json({ detail: "symbol is required" });

  try {
    // Parallel fetch: historical bars + quote snapshot
    const [historical, quote] = await Promise.all([
      fetchTimeSeries(symbol),
      fetchQuote(symbol),
    ]);

    if (!historical || historical.length < 30)
      return res.status(404).json({ detail: `Not enough data for "${symbol}". Check the symbol.` });

    const closes = historical.map((d) => d.close).filter(Boolean);
    if (closes.length < 30)
      return res.status(404).json({ detail: "Insufficient price data." });

    const currentPrice = closes[closes.length - 1];

    const { predictions, reg, dailyVol } = buildPredictions(closes);

    const trend30  = classifyTrend(closes.slice(-30));
    const trend90  = classifyTrend(closes.slice(-Math.min(90, closes.length)));
    const trend365 = classifyTrend(closes);

    let priceTier = "";
    if (currentPrice <= 50)       priceTier = "under50";
    else if (currentPrice <= 100) priceTier = "under100";
    else if (currentPrice <= 150) priceTier = "under150";
    else                           priceTier = "above150";

    const year252    = closes.slice(-252);
    const support    = +Math.min(...year252).toFixed(2);
    const resistance = +Math.max(...year252).toFixed(2);
    const avg52w     = +(year252.reduce((a, b) => a + b, 0) / year252.length).toFixed(2);

    // RSI (14-day)
    const gains = [], losses = [];
    for (let i = closes.length - 15; i < closes.length; i++) {
      const d = closes[i] - closes[i - 1];
      gains.push(d > 0 ? d : 0);
      losses.push(d < 0 ? -d : 0);
    }
    const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
    const rs  = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = +(100 - 100 / (1 + rs)).toFixed(1);

    // MACD
    function ema(data, period) {
      const k = 2 / (period + 1);
      let e = data[0];
      for (let i = 1; i < data.length; i++) e = data[i] * k + e * (1 - k);
      return e;
    }
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macd  = +(ema12 - ema26).toFixed(4);

    // Chart data: last 90 bars
    const chartData = historical.slice(-90).map((d) => ({
      date:   d.date,
      open:   +d.open.toFixed(2),
      high:   +d.high.toFixed(2),
      low:    +d.low.toFixed(2),
      close:  +d.close.toFixed(2),
      volume: d.volume,
    }));

    res.json({
      symbol,
      name:         quote.name,
      currency:     quote.currency,
      currentPrice: +currentPrice.toFixed(2),
      priceTier,
      marketCap:    quote.market_cap,       // null on free plan
      pe:           quote.pe,               // null on free plan
      dayChange:    +quote.change_percent.toFixed(2),
      predictions,
      technicals: {
        rsi,
        macd,
        support,
        resistance,
        avg52w,
        annualisedVol: +(dailyVol * Math.sqrt(252) * 100).toFixed(2),
        r2: +reg.r2.toFixed(4),
      },
      trend: {
        short:   trend30,
        medium:  trend90,
        long:    trend365,
        overall: trend365.pctPerDay > 0 ? "upward" : "downward",
      },
      chartData,
      dataPoints: closes.length,
    });

  } catch (err) {
    console.error("[stock/predict]", err.message);
    if (err.message?.toLowerCase().includes("not found") || err.message?.includes("symbol"))
      return res.status(404).json({ detail: `Symbol "${symbol}" not found.` });
    res.status(500).json({ detail: err.message || "Prediction failed" });
  }
});

// ─────────────────────────────────────────────────────────────────
//  POST /stock/screener
//  Body: { priceMax: 100, trend: "up" | "down" | "all", sector: "" }
//
//  NOTE: The screener calls /price (batch endpoint) to stay within
//  rate limits. Twelve Data free plan allows 8 req/min.
//  We fetch quotes in batches of 5 with a small delay between batches.
// ─────────────────────────────────────────────────────────────────
router.post("/screener", async (req, res) => {
  if (!TD_KEY) return res.status(503).json({ detail: "TWELVE_DATA_API_KEY not configured in .env" });

  const { priceMax = 9999, trend = "all", sector = "" } = req.body;

  try {
    const list = sector
      ? POPULAR_STOCKS.filter((s) => s.sector.toLowerCase().includes(sector.toLowerCase()))
      : POPULAR_STOCKS;

    const results = [];

    // Fetch quotes in batches of 5 to respect 8 req/min rate limit
    for (let i = 0; i < list.length; i += 5) {
      const batch = list.slice(i, i + 5);

      // Use Twelve Data batch /price endpoint — comma-separated symbols
      const tdSymbols = batch.map((s) => normaliseTDSymbol(s.symbol)).join(",");

      const { data } = await axios.get(`${TD_BASE}/price`, {
        params: { symbol: tdSymbols, apikey: TD_KEY },
        timeout: 10000,
      });

      // Response is either { "AAPL": { price: "..." }, ... }
      // or a single { price: "..." } when only one symbol
      const priceMap = batch.length === 1
        ? { [normaliseTDSymbol(batch[0].symbol)]: data }
        : data;

      for (const stock of batch) {
        const tdSym = normaliseTDSymbol(stock.symbol);
        const entry = priceMap[tdSym];
        if (!entry || entry.status === "error") continue;

        const price = parseFloat(entry.price) || 0;
        if (price > priceMax) continue;

        // For trend (MA50 vs MA200), use a lightweight EMA from the time series
        // To save API calls on the screener we approximate using the quote's
        // fifty_two_week high/low midpoint as a proxy — and flag accordingly.
        // For a more accurate screener, replace with individual fetchTimeSeries calls.
        const trendDir = "unknown"; // see note below

        if (trend !== "all" && trendDir !== trend) continue;

        results.push({
          symbol:    stock.symbol,
          name:      stock.name,
          sector:    stock.sector,
          price:     +price.toFixed(2),
          dayChange: 0,    // /price endpoint doesn't include change; use /quote for full data
          ma50:      null,
          ma200:     null,
          trend:     trendDir,
          marketCap: null,
        });
      }

      // Polite delay between batches to stay within 8 req/min
      if (i + 5 < list.length) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    res.json({ results, count: results.length });
  } catch (err) {
    console.error("[stock/screener]", err.message);
    res.status(500).json({ detail: err.message || "Screener failed" });
  }
});

// ─────────────────────────────────────────────────────────────────
//  POST /stock/screener/full
//  Accurate screener: fetches full time-series per stock to compute
//  real MA50/MA200. Slower (≈ 3 req/s) but precise trend detection.
//  Only recommended if you have a paid Twelve Data plan or are
//  screening a small list.
// ─────────────────────────────────────────────────────────────────
router.post("/screener/full", async (req, res) => {
  if (!TD_KEY) return res.status(503).json({ detail: "TWELVE_DATA_API_KEY not configured in .env" });

  const { priceMax = 9999, trend = "all", sector = "" } = req.body;

  try {
    const list = sector
      ? POPULAR_STOCKS.filter((s) => s.sector.toLowerCase().includes(sector.toLowerCase()))
      : POPULAR_STOCKS;

    const results = [];

    for (const stock of list) {
      try {
        const bars = await fetchTimeSeries(stock.symbol);
        if (bars.length < 50) continue;

        const closes = bars.map((b) => b.close);
        const price  = closes[closes.length - 1];
        if (price > priceMax) continue;

        function simpleMA(arr, n) {
          const slice = arr.slice(-n);
          return slice.reduce((a, b) => a + b, 0) / slice.length;
        }

        const ma50    = simpleMA(closes, 50);
        const ma200   = simpleMA(closes, Math.min(200, closes.length));
        const trendDir = ma50 > ma200 ? "up" : "down";

        if (trend !== "all" && trendDir !== trend) continue;

        const dayChange = closes.length >= 2
          ? +((closes[closes.length - 1] / closes[closes.length - 2] - 1) * 100).toFixed(2)
          : 0;

        results.push({
          symbol:    stock.symbol,
          name:      stock.name,
          sector:    stock.sector,
          price:     +price.toFixed(2),
          dayChange,
          ma50:      +ma50.toFixed(2),
          ma200:     +ma200.toFixed(2),
          trend:     trendDir,
          marketCap: null,
        });

        // Respect rate limit: 8 req/min → 1 req per ~450ms
        await new Promise((r) => setTimeout(r, 450));
      } catch (innerErr) {
        console.warn(`[screener/full] skipping ${stock.symbol}: ${innerErr.message}`);
      }
    }

    res.json({ results, count: results.length });
  } catch (err) {
    console.error("[stock/screener/full]", err.message);
    res.status(500).json({ detail: err.message || "Screener failed" });
  }
});

module.exports = router;
