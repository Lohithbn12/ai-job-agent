/**
 * src/routes/stock.routes.js
 *
 * Stock Predictor — Multi-source data + 8-Model Ensemble + 3 Accuracy Layers
 * ─────────────────────────────────────────────────────────────────────────────
 *  Primary:  Yahoo Finance v8 JSON endpoint
 *  Fallback: Stooq CSV
 *  Supports: US stocks (AAPL, TSLA) + Indian stocks (RELIANCE.NS, TCS.NS)
 *
 * ══ PREDICTION MODELS (8 total) ══════════════════════════════════════════════
 *  1. Log-Linear Regression      — Long-term exponential growth trend via OLS
 *  2. Holt Double Smoothing      — Level + trend via exponential weights
 *  3. SMA Drift                  — Moving average + linear drift
 *  4. AR(5) Autoregression       — Price depends on own 5 lagged values
 *  5. ARIMA(1,1,1)               — Differenced AR(1) + MA(1) on returns
 *  6. ARCH(1) Vol-Adjusted       — Volatility clustering; adapts bands
 *  7. GARCH(1,1)                 — Persistent conditional variance
 *  8. Momentum + RSI + Bollinger — Trend + mean-reversion + band signals
 *
 * ══ ACCURACY ENHANCEMENT LAYERS (3 new, target: +10–15% hit-rate) ══════════
 *
 *  LAYER 1 — Market Regime Detection
 *  ────────────────────────────────────────────────────────────────────────────
 *  Fetches the index benchmark (^NSEI for Indian stocks, ^GSPC for US).
 *  Computes the index's 30-day and 90-day trend via log-linear regression.
 *  If stock and index trends AGREE  → regime ALIGNED   → reinforce direction
 *  If stock and index trends OPPOSE → regime DIVERGENT → dampen prediction
 *  Also detects HIGH VOLATILITY regime from index daily vol > 1.5% avg.
 *  Result: a directional bias multiplier applied to the ensemble forecast.
 *
 *  LAYER 2 — News Sentiment Scoring (Finnhub free API)
 *  ────────────────────────────────────────────────────────────────────────────
 *  Fetches last 7 days of news headlines from Finnhub's free /news endpoint.
 *  Scores each headline using a keyword-based sentiment lexicon (no API key
 *  needed for the scoring — only the fetch needs FINNHUB_API_KEY in .env).
 *  Positive keywords: beat, surges, record, growth, upgrades, raised, profit…
 *  Negative keywords: miss, falls, cuts, loss, downgrade, recall, fraud, debt…
 *  Computes a net sentiment score in [-1, +1] → mapped to a price bias %.
 *  Applied as: ensemble × (1 + sentiment × sentimentStrength × horizonDecay)
 *  Falls back to neutral (0) gracefully if API key missing or fetch fails.
 *
 *  LAYER 3 — Earnings Window Detection
 *  ────────────────────────────────────────────────────────────────────────────
 *  Estimates next earnings date from Finnhub's /earnings/calendar endpoint.
 *  If today falls within ±3 days of a known earnings date:
 *    → Sets earningsWarning = true in the response
 *    → Widens confidence bands by 40% (high uncertainty period)
 *    → Lowers confidence score by 20 points
 *    → Adds a warning message shown in the UI
 *  If no earnings data available, safely skips (no impact on prediction).
 *
 * ══ DYNAMIC WEIGHTING ════════════════════════════════════════════════════════
 *  Walk-forward back-test on last 30 days. weight_i = softmax(-log(MSE_i))
 *
 * ══ SCREENER FIX ════════════════════════════════════════════════════════════
 *  Old: Yahoo /v7/finance/quote batch → now returns HTTP 401 (auth required)
 *  New: Uses same /v8/finance/chart endpoint as /predict (no auth needed)
 *       Runs 6 fetches in parallel via pooledFetch() for speed
 */

"use strict";

const express = require("express");
const router  = express.Router();
const https   = require("https");

// ─────────────────────────────────────────────────────────────────
//  In-Memory Cache  (1 hour TTL per symbol)
// ─────────────────────────────────────────────────────────────────
const cache     = new Map();
const CACHE_TTL = 60 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key, data) { cache.set(key, { data, ts: Date.now() }); }

// ─────────────────────────────────────────────────────────────────
//  Retry with Exponential Backoff
// ─────────────────────────────────────────────────────────────────
async function withRetry(fn, retries = 3, delayMs = 3000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try { return await fn(); }
    catch (err) {
      if (attempt < retries - 1) {
        const wait = delayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 1000);
        console.warn(`[retry] Attempt ${attempt + 1} failed: ${err.message}. Retrying in ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
      } else throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────
//  HTTP fetch helper
// ─────────────────────────────────────────────────────────────────
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept":          "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer":         "https://finance.yahoo.com/",
        "Origin":          "https://finance.yahoo.com",
        ...headers,
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 429) return reject(new Error("Too Many Requests"));
        if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        resolve(data);
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Request timeout")); });
  });
}

// ─────────────────────────────────────────────────────────────────
//  Symbol Helpers
// ─────────────────────────────────────────────────────────────────
function isIndian(symbol) {
  const s = symbol.toUpperCase();
  return s.endsWith(".NS") || s.endsWith(".BO");
}

const INDIAN_STOCK_BASES = new Set([
  "RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","WIPRO","SBIN",
  "BAJFINANCE","TATAMOTORS","ADANIENT","HINDUNILVR","KOTAKBANK",
  "AXISBANK","LT","ZOMATO","MARUTI","SUNPHARMA","TITAN","HCLTECH",
  "BHARTIARTL","NESTLEIND","ULTRACEMCO","POWERGRID","NTPC","ONGC",
  "COALINDIA","DIVISLAB","CIPLA","DRREDDY","HEROMOTOCO","BRITANNIA",
  "EICHERMOT","GRASIM","HINDALCO","INDUSINDBK","JSWSTEEL","M&M",
  "TATASTEEL","TECHM","BAJAJFINSV","BPCL","IOC","SHREECEM",
]);

function normalizeSymbol(symbol) {
  const s = symbol.toUpperCase().trim();
  if (!s.includes(".") && INDIAN_STOCK_BASES.has(s)) {
    console.log(`[symbol] Auto-appended .NS: "${s}" → "${s}.NS"`);
    return s + ".NS";
  }
  return s;
}

function toStooqSymbol(symbol) {
  const s = symbol.toUpperCase();
  if (s.endsWith(".NS")) return s.slice(0, -3).toLowerCase() + ".ns";
  if (s.endsWith(".BO")) return s.slice(0, -3).toLowerCase() + ".bo";
  return s.toLowerCase() + ".us";
}

// ─────────────────────────────────────────────────────────────────
//  Data source 1: Yahoo Finance v8 Chart
// ─────────────────────────────────────────────────────────────────
async function fetchFromYahooChart(symbol) {
  const end   = Math.floor(Date.now() / 1000);
  const start = end - 2 * 365 * 24 * 3600;
  const url   = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&period1=${start}&period2=${end}&events=history`;
  const raw   = await httpGet(url);
  const json  = JSON.parse(raw);
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for "${symbol}"`);

  const timestamps = result.timestamp || [];
  const ohlcv      = result.indicators?.quote?.[0] || {};
  const adjClose   = result.indicators?.adjclose?.[0]?.adjclose || [];

  if (timestamps.length === 0) throw new Error(`Empty chart data for "${symbol}"`);

  return timestamps.map((ts, i) => ({
    date:   new Date(ts * 1000).toISOString().split("T")[0],
    open:   +(ohlcv.open?.[i]   || 0).toFixed(2),
    high:   +(ohlcv.high?.[i]   || 0).toFixed(2),
    low:    +(ohlcv.low?.[i]    || 0).toFixed(2),
    close:  +(adjClose[i] || ohlcv.close?.[i] || 0).toFixed(2),
    volume:  ohlcv.volume?.[i]  || 0,
  })).filter((d) => d.close > 0);
}

// ─────────────────────────────────────────────────────────────────
//  Data source 2: Stooq CSV fallback
// ─────────────────────────────────────────────────────────────────
async function fetchFromStooq(symbol) {
  const stooqSym = toStooqSymbol(symbol);
  const url = `https://stooq.com/q/d/l/?s=${stooqSym}&i=d`;
  console.log(`[stooq] Fetching: ${url}`);
  const csv = await httpGet(url, { "Referer": "https://stooq.com/" });

  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) throw new Error(`No Stooq data for "${symbol}"`);

  const header    = lines[0].toLowerCase().split(",");
  const dateIdx   = header.indexOf("date");
  const openIdx   = header.indexOf("open");
  const highIdx   = header.indexOf("high");
  const lowIdx    = header.indexOf("low");
  const closeIdx  = header.indexOf("close");
  const volumeIdx = header.indexOf("volume");

  if (dateIdx === -1 || closeIdx === -1) throw new Error("Unexpected Stooq CSV format");

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    return {
      date:   cols[dateIdx]?.trim() || "",
      open:   +(cols[openIdx]   || 0),
      high:   +(cols[highIdx]   || 0),
      low:    +(cols[lowIdx]    || 0),
      close:  +(cols[closeIdx]  || 0),
      volume: +(cols[volumeIdx] || 0),
    };
  }).filter((d) => d.close > 0 && d.date).sort((a, b) => a.date.localeCompare(b.date));
}

// ─────────────────────────────────────────────────────────────────
//  Data source 3: Yahoo quote (current price / meta)
// ─────────────────────────────────────────────────────────────────
async function fetchQuoteFromYahoo(symbol) {
  const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
  let lastErr;
  for (const host of hosts) {
    try {
      const url    = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      const raw    = await httpGet(url);
      const json   = JSON.parse(raw);
      const result = json?.chart?.result?.[0];
      const meta   = result?.meta;
      if (!meta) throw new Error(`Quote not found for "${symbol}"`);
      const prev = meta.previousClose || meta.regularMarketPrice || 1;
      return {
        name:           meta.longName || meta.shortName || symbol,
        currency:       meta.currency || (isIndian(symbol) ? "INR" : "USD"),
        price:          meta.regularMarketPrice || meta.previousClose,
        change_percent: +(((meta.regularMarketPrice - prev) / prev) * 100).toFixed(2),
        market_cap:     null,
        pe:             null,
      };
    } catch (err) { lastErr = err; }
  }
  throw lastErr;
}

// ─────────────────────────────────────────────────────────────────
//  Public fetchers (cache + retry + fallback)
// ─────────────────────────────────────────────────────────────────
async function yf_fetchTimeSeries(symbol) {
  const cacheKey = `ts:${symbol}`;
  const cached   = getCached(cacheKey);
  if (cached) return cached;

  let data;
  try {
    data = await withRetry(() => fetchFromYahooChart(symbol));
    console.log(`[ts] Yahoo chart OK for ${symbol} (${data.length} bars)`);
  } catch (err) {
    console.warn(`[ts] Yahoo failed for ${symbol}: ${err.message} — trying Stooq...`);
    data = await withRetry(() => fetchFromStooq(symbol));
    console.log(`[ts] Stooq OK for ${symbol} (${data.length} bars)`);
  }

  if (!data || data.length === 0)
    throw new Error(`No data found for "${symbol}". US: AAPL | India: RELIANCE.NS`);

  setCache(cacheKey, data);
  return data;
}

async function yf_fetchQuote(symbol) {
  const cacheKey = `quote:${symbol}`;
  const cached   = getCached(cacheKey);
  if (cached) return cached;
  const data = await withRetry(() => fetchQuoteFromYahoo(symbol));
  setCache(cacheKey, data);
  return data;
}

// ══════════════════════════════════════════════════════════════════
//
//   ACCURACY LAYER 1 — Market Regime Detection
//
//   Fetches the benchmark index for the stock's region, computes
//   its 30-day and 90-day trend, and returns a regime object that
//   tells the prediction engine whether to reinforce or dampen its
//   directional forecast.
//
//   Regime states:
//     BULL_ALIGNED    stock trend UP + index trend UP   → +bias
//     BEAR_ALIGNED    stock trend DOWN + index trend DN → confirm down
//     DIVERGENT       stock vs index disagree           → dampen
//     HIGH_VOL        index daily vol > 1.8× long-avg  → widen bands
//     NEUTRAL         index data unavailable            → no change
//
// ══════════════════════════════════════════════════════════════════

// Index benchmarks: US → S&P 500, India → Nifty 50
const INDEX_MAP = {
  US: "^GSPC",
  IN: "^NSEI",
};

/**
 * Fetch 90 days of daily closes for a benchmark index symbol.
 * Uses the same v8/chart endpoint — no auth needed.
 * Returns array of close prices or [] on failure.
 */
async function fetchIndexPrices(indexSymbol) {
  const cacheKey = `index:${indexSymbol}`;
  const cached   = getCached(cacheKey);
  if (cached) return cached;

  try {
    const end   = Math.floor(Date.now() / 1000);
    const start = end - 120 * 24 * 3600;   // 120 days
    const url   = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(indexSymbol)}?interval=1d&period1=${start}&period2=${end}`;
    const raw   = await httpGet(url);
    const json  = JSON.parse(raw);
    const result = json?.chart?.result?.[0];
    const closes = result?.indicators?.quote?.[0]?.close || [];
    const prices = closes.filter((c) => c != null && c > 0);
    setCache(cacheKey, prices);
    console.log(`[regime] Index ${indexSymbol}: ${prices.length} bars`);
    return prices;
  } catch (err) {
    console.warn(`[regime] Could not fetch index ${indexSymbol}: ${err.message}`);
    return [];
  }
}

/**
 * Compute log-linear slope (% per day) over a price series.
 * Positive = uptrend, negative = downtrend.
 */
function trendSlope(prices) {
  if (prices.length < 5) return 0;
  const x   = prices.map((_, i) => i);
  const logY = prices.map((p) => Math.log(p));
  const n   = x.length;
  const sx  = x.reduce((a, b) => a + b, 0);
  const sy  = logY.reduce((a, b) => a + b, 0);
  const sxy = x.reduce((s, xi, i) => s + xi * logY[i], 0);
  const sxx = x.reduce((s, xi) => s + xi * xi, 0);
  const denom = n * sxx - sx * sx;
  if (denom === 0) return 0;
  return (n * sxy - sx * sy) / denom;   // log-slope ≈ daily % / 100
}

/**
 * Analyse market regime for a stock.
 * @param {number[]} stockPrices  - Stock close prices (full history)
 * @param {string}   region       - "US" or "IN"
 * @returns {object} regime info
 */
async function detectMarketRegime(stockPrices, region) {
  const indexSym = INDEX_MAP[region] || "^GSPC";
  const indexPrices = await fetchIndexPrices(indexSym);

  if (indexPrices.length < 20) {
    return { state: "NEUTRAL", biasMult: 1.0, bandMult: 1.0,
             indexSymbol: indexSym, description: "Index data unavailable" };
  }

  // Stock slopes
  const stockSlope30  = trendSlope(stockPrices.slice(-30));
  const stockSlope90  = trendSlope(stockPrices.slice(-90));

  // Index slopes
  const idxSlope30  = trendSlope(indexPrices.slice(-30));
  const idxSlope90  = trendSlope(indexPrices.slice(-90));

  // Index volatility regime
  const idxReturns = [];
  for (let i = 1; i < indexPrices.length; i++)
    idxReturns.push(Math.abs(Math.log(indexPrices[i] / indexPrices[i - 1])));
  const recentVol  = idxReturns.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const longVol    = idxReturns.reduce((a, b) => a + b, 0) / idxReturns.length;
  const isHighVol  = recentVol > longVol * 1.8;

  // Alignment: do stock and index agree on direction?
  const stockUp = stockSlope30 > 0;
  const idxUp   = idxSlope30 > 0;
  const aligned = stockUp === idxUp;

  // Strength of index trend
  const idxTrendStrength = Math.abs(idxSlope30) / Math.max(Math.abs(idxSlope90), 1e-6);

  let state, biasMult, bandMult, description;

  if (isHighVol) {
    state       = "HIGH_VOL";
    biasMult    = 1.0;      // don't amplify in panic markets
    bandMult    = 1.45;     // widen confidence bands significantly
    description = `High volatility regime (index vol ${(recentVol * 100).toFixed(2)}%/day vs avg ${(longVol * 100).toFixed(2)}%/day)`;
  } else if (aligned && stockUp && idxSlope30 > 0.0003) {
    state       = "BULL_ALIGNED";
    biasMult    = 1.0 + Math.min(idxTrendStrength * 0.04, 0.08);  // up to +8% boost
    bandMult    = 0.92;     // slightly tighter bands in confirmed bull
    description = `Bull regime — stock and ${indexSym} both trending up`;
  } else if (aligned && !stockUp && idxSlope30 < -0.0003) {
    state       = "BEAR_ALIGNED";
    biasMult    = 1.0 - Math.min(idxTrendStrength * 0.04, 0.08);  // up to -8% dampener
    bandMult    = 1.15;     // wider bands in bear
    description = `Bear regime — stock and ${indexSym} both trending down`;
  } else if (!aligned) {
    state       = "DIVERGENT";
    biasMult    = 1.0;      // no amplification — signal conflicts
    bandMult    = 1.20;     // widen bands to reflect disagreement
    description = `Divergent — stock and ${indexSym} trend in opposite directions`;
  } else {
    state       = "NEUTRAL";
    biasMult    = 1.0;
    bandMult    = 1.0;
    description = `Neutral market regime`;
  }

  return {
    state, biasMult, bandMult, description,
    indexSymbol:   indexSym,
    indexSlope30:  +(idxSlope30 * 10000).toFixed(3),   // basis points per day
    stockSlope30:  +(stockSlope30 * 10000).toFixed(3),
    isHighVol,
    recentVolPct:  +(recentVol * 100).toFixed(3),
    longVolPct:    +(longVol * 100).toFixed(3),
  };
}


// ══════════════════════════════════════════════════════════════════
//
//   ACCURACY LAYER 2 — News Sentiment Scoring
//
//   Uses Finnhub's free /company-news endpoint (no paid plan needed).
//   Scores headlines using a curated financial keyword lexicon.
//   Returns sentiment in [-1, +1] and a list of scored headlines.
//
//   Set FINNHUB_API_KEY in your .env to enable. Falls back to
//   neutral (score=0) if key missing or fetch fails — zero impact
//   on predictions when unavailable.
//
// ══════════════════════════════════════════════════════════════════

// Positive financial keywords → bullish signal
const POSITIVE_WORDS = new Set([
  "beat","beats","beats expectations","record","surge","surges","surged",
  "profit","profits","growth","upgrade","upgrades","upgraded","raised",
  "raises","outperform","buy","strong","exceed","exceeds","exceeded",
  "milestone","expansion","partnership","deal","wins","awarded","approved",
  "recovery","rally","rallies","bullish","positive","gain","gains",
  "dividend","buyback","revenue growth","market share","innovation",
  "breakthrough","launches","acquires","acquisition","merger","synergy",
]);

// Negative financial keywords → bearish signal
const NEGATIVE_WORDS = new Set([
  "miss","misses","missed","loss","losses","cuts","cut","downgrade",
  "downgrades","downgraded","recall","fraud","lawsuit","investigation",
  "decline","falls","fell","drop","dropped","warning","warns","debt",
  "default","bankruptcy","layoff","layoffs","restructuring","penalty",
  "fine","suspended","halted","concern","risk","negative","weak",
  "disappoints","disappointing","below expectations","profit warning",
  "revenue miss","guidance cut","sell","underperform","bearish",
]);

/**
 * Score a single headline string: returns +1 (bullish), -1 (bearish), 0 (neutral)
 */
function scoreHeadline(headline) {
  const lower = headline.toLowerCase();
  let score = 0;
  for (const word of POSITIVE_WORDS) if (lower.includes(word)) score++;
  for (const word of NEGATIVE_WORDS) if (lower.includes(word)) score--;
  return score > 0 ? 1 : score < 0 ? -1 : 0;
}

/**
 * Fetch and score news sentiment for a symbol from Finnhub.
 * @param {string} symbol  - e.g. "AAPL" or "RELIANCE.NS"
 * @returns {object}  { score, confidence, headlines, source }
 *   score: number in [-1, +1]
 *   confidence: 0–1 (how many headlines we found)
 */
async function fetchNewsSentiment(symbol) {
  const cacheKey = `sentiment:${symbol}`;
  const cached   = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.log("[sentiment] FINNHUB_API_KEY not set — skipping sentiment layer");
    return { score: 0, confidence: 0, headlines: [], source: "none", skipped: true };
  }

  // Strip exchange suffix for Finnhub (RELIANCE.NS → RELIANCE)
  const finnhubSym = symbol.replace(/\.(NS|BO)$/i, "");

  const today     = new Date();
  const weekAgo   = new Date(today - 7 * 24 * 3600 * 1000);
  const dateFmt   = (d) => d.toISOString().split("T")[0];
  const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(finnhubSym)}&from=${dateFmt(weekAgo)}&to=${dateFmt(today)}&token=${apiKey}`;

  try {
    const raw      = await httpGet(url, { "Referer": "https://finnhub.io" });
    const articles = JSON.parse(raw);

    if (!Array.isArray(articles) || articles.length === 0) {
      const result = { score: 0, confidence: 0, headlines: [], source: "finnhub", noNews: true };
      setCache(cacheKey, result);
      return result;
    }

    // Score each headline
    const scored = articles.slice(0, 30).map((a) => ({
      headline: a.headline,
      score:    scoreHeadline(a.headline),
      date:     a.datetime ? new Date(a.datetime * 1000).toISOString().split("T")[0] : "unknown",
    }));

    const totalScore = scored.reduce((s, a) => s + a.score, 0);
    const netScore   = Math.max(-1, Math.min(1, totalScore / Math.max(scored.length, 1)));
    // Confidence scales with number of articles (saturates at 20+ articles)
    const confidence = Math.min(1, scored.length / 20);

    const result = {
      score:      +netScore.toFixed(3),
      confidence: +confidence.toFixed(2),
      headlines:  scored.slice(0, 5),   // return top 5 for UI display
      source:     "finnhub",
      articleCount: scored.length,
    };

    setCache(cacheKey, result);
    console.log(`[sentiment] ${symbol}: score=${netScore.toFixed(3)}, articles=${scored.length}, conf=${confidence.toFixed(2)}`);
    return result;

  } catch (err) {
    console.warn(`[sentiment] Finnhub fetch failed for ${symbol}: ${err.message}`);
    return { score: 0, confidence: 0, headlines: [], source: "error", error: err.message };
  }
}


// ══════════════════════════════════════════════════════════════════
//
//   ACCURACY LAYER 3 — Earnings Window Detection
//
//   Fetches upcoming earnings dates from Finnhub's free earnings
//   calendar endpoint. If the stock is within ±3 days of a known
//   earnings date, predictions are flagged as HIGH UNCERTAINTY:
//     - Confidence bands widened by 40%
//     - Confidence score reduced by 20 points
//     - earningsWarning = true + message in response
//
//   Falls back gracefully if key missing or fetch fails.
//
// ══════════════════════════════════════════════════════════════════

/**
 * Check if today is within `windowDays` days of a known earnings date.
 * @param {string} symbol
 * @param {number} windowDays  - default ±3 days
 * @returns {object} { nearEarnings, earningsDate, daysUntil, warning }
 */
async function checkEarningsWindow(symbol, windowDays = 3) {
  const cacheKey = `earnings:${symbol}`;
  const cached   = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.FINNHUB_API_KEY;
  const neutral = { nearEarnings: false, earningsDate: null, daysUntil: null, warning: null };

  if (!apiKey) {
    setCache(cacheKey, neutral);
    return neutral;
  }

  const finnhubSym = symbol.replace(/\.(NS|BO)$/i, "");
  const today      = new Date();
  const lookAhead  = new Date(today.getTime() + 30 * 24 * 3600 * 1000);
  const lookBack   = new Date(today.getTime() - windowDays * 24 * 3600 * 1000);
  const dateFmt    = (d) => d.toISOString().split("T")[0];

  try {
    const url  = `https://finnhub.io/api/v1/calendar/earnings?from=${dateFmt(lookBack)}&to=${dateFmt(lookAhead)}&symbol=${encodeURIComponent(finnhubSym)}&token=${apiKey}`;
    const raw  = await httpGet(url, { "Referer": "https://finnhub.io" });
    const data = JSON.parse(raw);
    const earningsArr = data?.earningsCalendar || [];

    if (earningsArr.length === 0) {
      setCache(cacheKey, neutral);
      return neutral;
    }

    // Find closest earnings date
    let closest = null;
    let minDiff = Infinity;
    for (const e of earningsArr) {
      if (!e.date) continue;
      const eDate = new Date(e.date);
      const diff  = (eDate - today) / (24 * 3600 * 1000);   // days
      if (Math.abs(diff) < Math.abs(minDiff)) {
        minDiff  = diff;
        closest  = e.date;
      }
    }

    const nearEarnings = closest && Math.abs(minDiff) <= windowDays;
    const result = {
      nearEarnings: !!nearEarnings,
      earningsDate: closest,
      daysUntil:    closest ? +minDiff.toFixed(1) : null,
      warning: nearEarnings
        ? minDiff >= 0
          ? `⚠️ Earnings in ~${Math.ceil(minDiff)} day(s) (${closest}). High uncertainty — bands widened.`
          : `⚠️ Earnings just reported ${Math.abs(Math.floor(minDiff))} day(s) ago (${closest}). Post-earnings volatility possible.`
        : null,
    };

    setCache(cacheKey, result);
    console.log(`[earnings] ${symbol}: nearEarnings=${nearEarnings}, date=${closest}, daysUntil=${minDiff?.toFixed(1)}`);
    return result;

  } catch (err) {
    console.warn(`[earnings] Finnhub fetch failed for ${symbol}: ${err.message}`);
    setCache(cacheKey, neutral);
    return neutral;
  }
}


// ══════════════════════════════════════════════════════════════════
//
//   PREDICTION ENGINE  —  8 Models + Dynamic Ensemble Weighting
//
// ══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
//  Shared math utilities
// ─────────────────────────────────────────────────────────────────

/** Ordinary Least Squares: returns { slope, intercept, r2 } */
function ols(x, y) {
  const n    = x.length;
  const sx   = x.reduce((a, b) => a + b, 0);
  const sy   = y.reduce((a, b) => a + b, 0);
  const sxy  = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sxx  = x.reduce((s, xi) => s + xi * xi, 0);
  const denom     = n * sxx - sx * sx;
  const slope     = denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const yMean = sy / n;
  const ssTot = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const ssRes = y.reduce((s, yi, i) => s + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const r2    = ssTot < 1e-12 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

/** Log-returns: ln(P[t] / P[t-1]) */
function logReturns(prices) {
  const r = [];
  for (let i = 1; i < prices.length; i++)
    r.push(Math.log(prices[i] / prices[i - 1]));
  return r;
}

/** Arithmetic mean */
function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

/** Unbiased sample variance */
function sampleVariance(arr) {
  const m = mean(arr);
  return arr.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(arr.length - 1, 1);
}

/** Exponential Moving Average with span p */
function emaSpan(prices, p) {
  const k = 2 / (p + 1);
  let e = prices[0];
  for (let i = 1; i < prices.length; i++) e = prices[i] * k + e * (1 - k);
  return e;
}

/** Softmax — converts log-odds to probability weights */
function softmax(arr) {
  const maxV = Math.max(...arr);
  const exp  = arr.map((v) => Math.exp(v - maxV));
  const sum  = exp.reduce((a, b) => a + b, 0);
  return exp.map((v) => v / sum);
}

// ─────────────────────────────────────────────────────────────────
//  MODEL 1 — Log-Linear Regression
//
//  log(P[t]) = α + β·t   solved by OLS
//  Forecast: exp(α + β·(n + h))
//
//  Strength:  captures compounding growth over long horizons
//  Weakness:  assumes constant exponential growth rate
// ─────────────────────────────────────────────────────────────────
function modelLogLinear(prices) {
  const x   = prices.map((_, i) => i);
  const logY = prices.map((p) => Math.log(p));
  const reg  = ols(x, logY);
  const n    = prices.length;
  return {
    name:     "Log-Linear Regression",
    forecast: (h) => Math.exp(reg.intercept + reg.slope * (n + h)),
    meta:     { r2: reg.r2, slopePerDay: reg.slope },
    reg,
  };
}

// ─────────────────────────────────────────────────────────────────
//  MODEL 2 — Holt's Double Exponential Smoothing
//
//  l[t] = α·P[t] + (1-α)·(l[t-1] + b[t-1])
//  b[t] = β·(l[t] - l[t-1]) + (1-β)·b[t-1]
//  Forecast: l + h·b
//
//  Strength:  adapts to recent trend changes
//  Weakness:  linear extrapolation only; no seasonality
// ─────────────────────────────────────────────────────────────────
function modelHolt(prices, alpha = 0.3, beta = 0.1) {
  let l = prices[0];
  let b = prices[1] - prices[0];
  for (let i = 1; i < prices.length; i++) {
    const lp = l;
    l = alpha * prices[i] + (1 - alpha) * (l + b);
    b = beta  * (l - lp)  + (1 - beta)  * b;
  }
  const floor = prices[prices.length - 1] * 0.05;
  return {
    name:     "Holt Double Smoothing",
    forecast: (h) => Math.max(l + h * b, floor),
    meta:     { level: l, trend: b, alpha, beta },
  };
}

// ─────────────────────────────────────────────────────────────────
//  MODEL 3 — SMA Drift
//
//  avg = mean(P[-w:])
//  drift = (P[-1] - P[-w]) / w
//  Forecast: avg + drift·h
//
//  Strength:  simple, stable, good short-horizon anchor
//  Weakness:  linear only; sensitive to window choice
// ─────────────────────────────────────────────────────────────────
function modelSMA(prices, w = 30) {
  const win   = prices.slice(-Math.min(w, prices.length));
  const avg   = mean(win);
  const drift = (prices[prices.length - 1] - prices[prices.length - win.length]) / win.length;
  const floor = prices[prices.length - 1] * 0.05;
  return {
    name:     "SMA Drift",
    forecast: (h) => Math.max(avg + drift * h, floor),
    meta:     { windowDays: win.length, avg, drift },
  };
}

// ─────────────────────────────────────────────────────────────────
//  MODEL 4 — AR(p) Autoregression
//
//  P[t] = c + φ₁·P[t-1] + φ₂·P[t-2] + … + φ_p·P[t-p]
//  Coefficients estimated per-lag via OLS (Yule-Walker approximation).
//  Multi-step via recursive simulation.
//
//  Strength:  captures short-term serial correlation in prices
//  Weakness:  instable at long horizons; may diverge or collapse
// ─────────────────────────────────────────────────────────────────
function modelAR(prices, p = 5) {
  p = Math.min(p, Math.floor(prices.length / 3), 10);
  if (p < 1) p = 1;

  // Build lagged design matrix
  const Y = prices.slice(p);
  const X = prices.slice(0, -p);   // just lag-1 for the per-lag OLS trick

  // Per-lag OLS: φ_i ≈ cov(P[t], P[t-i]) / var(P[t-i])
  const phi = [];
  for (let lag = 1; lag <= p; lag++) {
    const xi = prices.slice(lag > 1 ? lag - 1 : 0, prices.length - (lag > 1 ? lag - 1 : 0) - 1);
    const yi = prices.slice(p, prices.length);
    const n  = Math.min(xi.length, yi.length);
    const r  = ols(xi.slice(0, n), yi.slice(0, n));
    phi.push(r.slope / p);
  }
  const phiSum    = phi.reduce((a, b) => a + b, 0);
  const intercept = mean(prices) * (1 - phiSum);

  const last  = prices[prices.length - 1];
  const floor = last * 0.01;

  function forecast(h) {
    const buf = [...prices.slice(-p)];
    for (let step = 0; step < h; step++) {
      let next = intercept;
      for (let lag = 0; lag < p; lag++) next += phi[lag] * buf[buf.length - 1 - lag];
      // Clip runaway predictions: max ±80% per 100 steps
      const clipped = Math.max(Math.min(next, last * 8), floor);
      buf.push(clipped);
      if (buf.length > p + 1) buf.shift();
    }
    return Math.max(buf[buf.length - 1], floor);
  }

  return {
    name:     `AR(${p}) Autoregression`,
    forecast,
    meta:     { p, phi: phi.slice(0, 3), intercept },
  };
}

// ─────────────────────────────────────────────────────────────────
//  MODEL 5 — ARIMA(1,1,1)
//
//  Δ[t] = P[t] - P[t-1]  (I=1: first-difference for stationarity)
//  Δ[t] = c + φ·Δ[t-1] + θ·ε[t-1] + ε[t]
//
//  φ estimated via OLS on lagged differences
//  θ estimated via OLS on lagged residuals (conditional MLE approx)
//  Multi-step: future innovations ε → 0 (conditional expectation)
//
//  Strength:  handles non-stationary prices; combines AR momentum
//             with MA error-correction
//  Weakness:  MA term only corrects one step; degrades at long horizons
// ─────────────────────────────────────────────────────────────────
function modelARIMA(prices) {
  const last = prices[prices.length - 1];
  const floor = last * 0.01;

  // First differences
  const diff = [];
  for (let i = 1; i < prices.length; i++) diff.push(prices[i] - prices[i - 1]);

  if (diff.length < 4) {
    return { name: "ARIMA(1,1,1)", forecast: () => last, meta: { status: "insufficient data" } };
  }

  // AR(1) on differences
  const dLag = diff.slice(0, -1);
  const dCur = diff.slice(1);
  const { slope: phi, intercept: c } = ols(dLag, dCur);

  // MA(1): OLS on AR residuals
  const arResiduals = dCur.map((d, i) => d - (c + phi * dLag[i]));
  const theta = arResiduals.length > 1
    ? ols(arResiduals.slice(0, -1), arResiduals.slice(1)).slope
    : 0;

  // Clamp parameters to stationarity region
  const phiC  = Math.max(-0.99, Math.min(phi,  0.99));
  const thetaC = Math.max(-0.99, Math.min(theta, 0.99));

  let prevD   = diff[diff.length - 1];
  let prevEps = arResiduals[arResiduals.length - 1];

  function forecast(h) {
    let price = last;
    let dPrev = prevD;
    let eps   = prevEps;
    for (let step = 0; step < h; step++) {
      const dNext = c + phiC * dPrev + thetaC * eps;
      price += dNext;
      eps    = 0;        // E[ε[t+s]] = 0 for s > 0
      dPrev  = dNext;
      price  = Math.max(price, floor);
    }
    return price;
  }

  return {
    name:     "ARIMA(1,1,1)",
    forecast,
    meta:     { phi: phiC, theta: thetaC, c, lastDiff: prevD },
  };
}

// ─────────────────────────────────────────────────────────────────
//  MODEL 6 — ARCH(1) Volatility-Adjusted Forecast
//
//  ε[t] = r[t] - μ  (demeaned log-returns)
//  σ²[t] = ω + α·ε²[t-1]
//
//  The ARCH model doesn't shift the price forecast — it quantifies
//  how volatility clusters. Here we use it to produce a vol-adjusted
//  price forecast: price × exp(μ·h), with the σ exposed for bands.
//
//  Strength:  captures short-term volatility bursts
//  Weakness:  no persistence term (GARCH adds that); fades quickly
// ─────────────────────────────────────────────────────────────────
function modelARCH(prices) {
  const rets  = logReturns(prices);
  const mu    = mean(rets);
  const eps   = rets.map((r) => r - mu);
  const eps2  = eps.map((e) => e * e);

  // OLS: ε²[t] = ω + α·ε²[t-1]
  let { slope: alpha, intercept: omega } = ols(eps2.slice(0, -1), eps2.slice(1));
  alpha = Math.max(0, Math.min(alpha, 0.98));
  omega = Math.max(omega, 1e-8);

  const lastEps2   = eps2[eps2.length - 1];
  const sigma2Next = omega + alpha * lastEps2;
  const sigmaN     = Math.sqrt(sigma2Next);

  const last  = prices[prices.length - 1];
  const floor = last * 0.01;

  return {
    name:     "ARCH(1) Vol-Adjusted",
    forecast: (h) => Math.max(last * Math.exp(mu * h), floor),
    meta:     { alpha, omega, sigma2Next, sigmaN, mu },
    sigma:    (h) => sigmaN * Math.sqrt(h),
  };
}

// ─────────────────────────────────────────────────────────────────
//  MODEL 7 — GARCH(1,1)
//
//  σ²[t] = ω + α·ε²[t-1] + β·σ²[t-1]
//
//  Parameters: α=0.10, β=0.85 (standard empirical starting point).
//  ω calibrated from unconditional variance: ω = σ²_∞·(1-α-β)
//
//  Multi-step conditional variance:
//    σ²[t+h] = σ²_∞ + (α+β)^h · (σ²[t] - σ²_∞)
//
//  This is the PRIMARY band estimator — GARCH gives realistic,
//  horizon-aware uncertainty that widens more slowly than naive √h.
//
//  Strength:  long-memory volatility; widely used in risk management
//  Weakness:  assumes normal innovations; fat tails underestimated
// ─────────────────────────────────────────────────────────────────
function modelGARCH(prices) {
  const rets   = logReturns(prices);
  const mu     = mean(rets);
  const eps    = rets.map((r) => r - mu);
  const eps2   = eps.map((e) => e * e);

  const unconditionalVar = sampleVariance(rets);
  const alpha      = 0.10;
  const beta       = 0.85;
  const omega      = Math.max(unconditionalVar * (1 - alpha - beta), 1e-8);
  const longRunVar = omega / Math.max(1 - alpha - beta, 1e-6);
  const persistence = alpha + beta;

  // Filter conditional variance through the full series
  let sigma2 = unconditionalVar;
  for (let i = 0; i < eps2.length; i++) {
    sigma2 = omega + alpha * eps2[i] + beta * sigma2;
  }
  const sigma2_current = sigma2;

  const last  = prices[prices.length - 1];
  const floor = last * 0.01;

  /**
   * Multi-step GARCH conditional variance forecast (in log-return units).
   * σ²[h] = σ²_∞ + (α+β)^h · (σ²[0] - σ²_∞)
   * Returns σ[h] in log-return space × √h for scaling.
   */
  function conditionalVol(h) {
    const sigma2_h = longRunVar + Math.pow(persistence, h) * (sigma2_current - longRunVar);
    return Math.sqrt(Math.max(sigma2_h, 1e-10)) * Math.sqrt(h);
  }

  return {
    name:          "GARCH(1,1)",
    forecast:      (h) => Math.max(last * Math.exp(mu * h), floor),
    meta:          { alpha, beta, omega, sigma2_current, longRunVar, persistence, mu },
    conditionalVol,
  };
}

// ─────────────────────────────────────────────────────────────────
//  MODEL 8 — Momentum + RSI + Bollinger Band Mean-Reversion
//
//  Three regime signals combined into a daily drift:
//
//  (a) Momentum: (P[-1] / P[-20]) - 1, extrapolated as daily drift
//  (b) RSI overlay: RSI > 70 → dampen drift; RSI < 30 → boost drift
//      rsiFactor = (50 - RSI) / 50 × 0.15 per year → per day
//  (c) Bollinger: if |z| = |P - μ_20| / σ_20 > 1.5 → pull toward mean
//      bollingerPull = ±0.05 × (|z| - 1.5) per year → per day
//
//  Strength:  regime-aware; avoids chasing overbought/oversold extremes
//  Weakness:  signals conflict in trending markets; short-horizon only
// ─────────────────────────────────────────────────────────────────
function modelMomentumRSI(prices) {
  const last  = prices[prices.length - 1];
  const floor = last * 0.01;

  // 20-day momentum signal
  const win20    = Math.min(20, prices.length - 1);
  const momentum = (last / prices[prices.length - 1 - win20]) - 1;

  // RSI (14-day)
  let rsi = 50;
  if (prices.length >= 15) {
    const gains  = [], losses = [];
    for (let i = prices.length - 15; i < prices.length; i++) {
      const d = prices[i] - prices[i - 1];
      gains.push(d > 0 ? d : 0);
      losses.push(d < 0 ? -d : 0);
    }
    const ag = mean(gains);
    const al = mean(losses);
    rsi = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  const rsiFactor = ((50 - rsi) / 50) * 0.15 / 252;

  // Bollinger Band (20-day)
  const bWin    = Math.min(20, prices.length);
  const bSlice  = prices.slice(-bWin);
  const bMean   = mean(bSlice);
  const bStd    = Math.sqrt(sampleVariance(bSlice));
  const zScore  = bStd > 0 ? (last - bMean) / bStd : 0;
  const bollingerPull =
    zScore >  1.5 ? -0.05 * (zScore - 1.5)  / 252 :
    zScore < -1.5 ?  0.05 * (-zScore - 1.5) / 252 : 0;

  // Combined daily drift
  const dailyDrift = momentum / win20 + rsiFactor + bollingerPull;

  return {
    name:     "Momentum + RSI + Bollinger",
    forecast: (h) => Math.max(last * Math.exp(dailyDrift * h), floor),
    meta:     { rsi: +rsi.toFixed(1), momentum: +momentum.toFixed(4),
                rsiFactor: +rsiFactor.toFixed(6), zScore: +zScore.toFixed(3),
                dailyDrift: +dailyDrift.toFixed(6) },
    rsi,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Dynamic Ensemble Weighting via Walk-Forward Back-Test
//
//  For each of the last `testDays` prices, re-fit every model on
//  prices[:t] and forecast 1 step ahead. Accumulate MSE.
//
//  weight_i = softmax(-log(MSE_i + ε))
//
//  A model with lower average error on recent data gets higher weight.
//  This is a lightweight Bates-Granger (1969) optimal combination.
// ─────────────────────────────────────────────────────────────────
function computeDynamicWeights(prices, modelCount = 8, testDays = 30) {
  const n     = prices.length;
  const start = Math.max(15, n - testDays);
  const mses  = Array(modelCount).fill(0);
  let   count = 0;

  for (let t = start; t < n - 1; t++) {
    const train  = prices.slice(0, t);
    if (train.length < 10) continue;
    const actual = prices[t];

    try {
      const preds = [
        modelLogLinear(train).forecast(1),
        modelHolt(train).forecast(1),
        modelSMA(train).forecast(1),
        modelAR(train, 5).forecast(1),
        modelARIMA(train).forecast(1),
        modelARCH(train).forecast(1),
        modelGARCH(train).forecast(1),
        modelMomentumRSI(train).forecast(1),
      ];
      preds.forEach((p, i) => {
        mses[i] += isFinite(p) && p > 0
          ? (p - actual) ** 2
          : actual ** 2 * 10;   // heavy penalty for invalid output
      });
      count++;
    } catch (_) { /* skip degenerate windows */ }
  }

  if (count === 0) return Array(modelCount).fill(1 / modelCount);

  const avgMses = mses.map((m) => m / count);
  const logits  = avgMses.map((m) => -Math.log(m + 1));
  const weights = softmax(logits);

  const MODEL_NAMES = [
    "LogLinear","Holt","SMA","AR(5)","ARIMA","ARCH","GARCH","Momentum"
  ];
  console.log("[ensemble] Dynamic weights (30-day back-test):",
    weights.map((w, i) => `${MODEL_NAMES[i]}:${(w * 100).toFixed(1)}%`).join(" | ")
  );

  return weights;
}

// ─────────────────────────────────────────────────────────────────
//  Trend Classifier
// ─────────────────────────────────────────────────────────────────
function classifyTrend(prices) {
  const reg = ols(prices.map((_, i) => i), prices.map((p) => Math.log(p)));
  const pctPerDay = (Math.exp(reg.slope) - 1) * 100;
  if (pctPerDay >  0.15) return { label: "Strong Uptrend",   color: "#00e676", icon: "🚀", pctPerDay };
  if (pctPerDay >  0.03) return { label: "Uptrend",          color: "#69f0ae", icon: "📈", pctPerDay };
  if (pctPerDay < -0.15) return { label: "Strong Downtrend", color: "#ff1744", icon: "📉", pctPerDay };
  if (pctPerDay < -0.03) return { label: "Downtrend",        color: "#ff5252", icon: "⬇️",  pctPerDay };
  return                          { label: "Sideways",        color: "#ffab40", icon: "➡️",  pctPerDay };
}

// ─────────────────────────────────────────────────────────────────
//  Main Prediction Builder
// ─────────────────────────────────────────────────────────────────
/**
 * Build predictions with all 3 accuracy enhancement layers applied.
 *
 * @param {number[]} prices       - Full close price history
 * @param {object}   regime       - Output of detectMarketRegime()
 * @param {object}   sentiment    - Output of fetchNewsSentiment()
 * @param {object}   earnings     - Output of checkEarningsWindow()
 */
function buildPredictions(prices, regime = {}, sentiment = {}, earnings = {}) {
  const HORIZONS = [15, 30, 60, 100, 365, 730];
  const last     = prices[prices.length - 1];

  // ── Fit all 8 models ─────────────────────────────────────────
  const M1 = modelLogLinear(prices);
  const M2 = modelHolt(prices);
  const M3 = modelSMA(prices);
  const M4 = modelAR(prices, 5);
  const M5 = modelARIMA(prices);
  const M6 = modelARCH(prices);
  const M7 = modelGARCH(prices);
  const M8 = modelMomentumRSI(prices);
  const allModels = [M1, M2, M3, M4, M5, M6, M7, M8];

  // ── Dynamic weights via 30-day walk-forward back-test ────────
  const weights = computeDynamicWeights(prices, 8, 30);

  // ── RSI from M8 (for confidence adjustment) ──────────────────
  const rsiVal = M8.rsi;

  // ── Daily volatility ─────────────────────────────────────────
  const rets = logReturns(prices);
  const dVol = Math.sqrt(sampleVariance(rets));

  // ── Log-linear reg for r² metric ─────────────────────────────
  const reg = M1.reg;

  // ─────────────────────────────────────────────────────────────
  //  Layer 1 — Regime parameters
  //  biasMult:  multiplier on the ensemble price forecast
  //  bandMult:  multiplier on the confidence band width
  // ─────────────────────────────────────────────────────────────
  const regimeBiasMult = regime.biasMult ?? 1.0;
  const regimeBandMult = regime.bandMult ?? 1.0;

  // ─────────────────────────────────────────────────────────────
  //  Layer 2 — Sentiment bias
  //  sentimentScore: [-1, +1]
  //  sentimentConf:  [0, 1] — how many articles were found
  //  Applied as a horizon-decaying additive % on the forecast:
  //    horizon 15d  → full sentiment strength
  //    horizon 365d → ~10% of sentiment strength (news fades)
  // ─────────────────────────────────────────────────────────────
  const sentScore = sentiment.score      ?? 0;
  const sentConf  = sentiment.confidence ?? 0;
  // Max sentiment push: ±3% at short horizons, decaying with horizon
  const SENTIMENT_MAX = 0.03;

  function sentimentBias(h) {
    const horizonDecayFactor = Math.exp(-h / 60);   // half-life ~60 days
    return sentScore * sentConf * SENTIMENT_MAX * horizonDecayFactor;
  }

  // ─────────────────────────────────────────────────────────────
  //  Layer 3 — Earnings penalty
  //  If nearEarnings → widen bands by 40%, confidence -20 pts
  // ─────────────────────────────────────────────────────────────
  const nearEarnings     = earnings.nearEarnings ?? false;
  const earningsBandMult = nearEarnings ? 1.40 : 1.0;
  const earningsConfPenalty = nearEarnings ? 20 : 0;

  // ── Build predictions ─────────────────────────────────────────
  const predictions = HORIZONS.map((h) => {
    // 1. Raw model forecasts
    const forecasts = allModels.map((m) => {
      try {
        const f = m.forecast(h);
        return isFinite(f) && f > 0 ? f : last;
      } catch (_) { return last; }
    });

    // 2. Base weighted ensemble
    let ensemble = forecasts.reduce((s, f, i) => s + weights[i] * f, 0);
    ensemble = Math.max(Math.min(ensemble, last * 5), last * 0.1);

    // 3. Apply LAYER 1 — regime bias
    //    Bull-aligned: nudge forecast upward; bear-aligned: downward
    //    Bias fades with horizon (macro regime most relevant short-term)
    const regimeHorizonDecay = Math.exp(-h / 90);   // half-life 90 days
    const regimeBias = (regimeBiasMult - 1.0) * regimeHorizonDecay;
    ensemble = ensemble * (1 + regimeBias);
    ensemble = Math.max(Math.min(ensemble, last * 5), last * 0.1);

    // 4. Apply LAYER 2 — sentiment bias
    const sentBias = sentimentBias(h);
    ensemble = ensemble * (1 + sentBias);
    ensemble = Math.max(Math.min(ensemble, last * 5), last * 0.1);

    // 5. GARCH confidence band
    let sigmaH;
    try {
      sigmaH = M7.conditionalVol(h);
    } catch (_) {
      sigmaH = dVol * Math.sqrt(h);
    }

    // 6. Apply LAYER 1 + LAYER 3 band multipliers
    const totalBandMult = regimeBandMult * earningsBandMult;
    const halfBand = last * (Math.exp(sigmaH * 1.645) - 1) * totalBandMult;
    const bandLow  = Math.max(ensemble - halfBand, last * 0.05);
    const bandHigh = ensemble + halfBand;

    // 7. Confidence score — penalised by RSI extremity, horizon, earnings
    const rsiPenalty      = (Math.abs(rsiVal - 50) / 50) * 5;
    const horizonPenalty  = h * 0.025;
    const regimePenalty   = regime.state === "DIVERGENT" ? 5 : 0;
    const sentPenalty     = sentConf > 0.3 && Math.abs(sentScore) > 0.5 ? 0 : 3; // bonus if strong confirmed sentiment
    const rawConf = reg.r2 * 85
      - horizonPenalty
      - rsiPenalty
      - regimePenalty
      - earningsConfPenalty
      + (sentConf > 0.5 ? 2 : 0);  // small bonus for good sentiment data
    const confidence = +Math.min(92, Math.max(35, rawConf)).toFixed(1);

    const pctChange = +((ensemble - last) / last * 100).toFixed(2);

    return {
      days:      h,
      label:     h === 730 ? "2 Years" : `${h} Days`,
      predicted: +ensemble.toFixed(2),
      low:       +bandLow.toFixed(2),
      high:      +bandHigh.toFixed(2),
      pctChange,
      confidence,
      direction: ensemble >= last ? "up" : "down",
      // Applied layer adjustments (for UI transparency)
      appliedLayers: {
        regimeBias:   +(regimeBias * 100).toFixed(2),       // % shift from regime
        sentimentBias:+(sentBias * 100).toFixed(2),          // % shift from sentiment
        bandWidened:  totalBandMult !== 1.0,
        bandMultiplier: +totalBandMult.toFixed(2),
      },
      // Per-model breakdown
      modelBreakdown: Object.fromEntries(
        allModels.map((m, i) => [
          m.name,
          { price: +forecasts[i].toFixed(2), weight: +(weights[i] * 100).toFixed(1) },
        ])
      ),
    };
  });

  const ensembleWeights = Object.fromEntries(
    allModels.map((m, i) => [m.name, +(weights[i] * 100).toFixed(1)])
  );

  const modelMeta = Object.fromEntries(
    allModels.map((m) => [m.name, m.meta || {}])
  );

  return { predictions, reg, dailyVol: dVol, ensembleWeights, modelMeta };
}

// ─────────────────────────────────────────────────────────────────
//  Popular stocks list
// ─────────────────────────────────────────────────────────────────
const POPULAR_STOCKS = [
  { symbol: "AAPL",          name: "Apple Inc.",                   sector: "Technology",    region: "US" },
  { symbol: "MSFT",          name: "Microsoft Corp.",              sector: "Technology",    region: "US" },
  { symbol: "GOOGL",         name: "Alphabet Inc.",                sector: "Technology",    region: "US" },
  { symbol: "AMZN",          name: "Amazon.com Inc.",              sector: "Consumer",      region: "US" },
  { symbol: "NVDA",          name: "NVIDIA Corp.",                 sector: "Technology",    region: "US" },
  { symbol: "META",          name: "Meta Platforms Inc.",          sector: "Technology",    region: "US" },
  { symbol: "TSLA",          name: "Tesla Inc.",                   sector: "Automotive",    region: "US" },
  { symbol: "JPM",           name: "JPMorgan Chase",               sector: "Finance",       region: "US" },
  { symbol: "V",             name: "Visa Inc.",                    sector: "Finance",       region: "US" },
  { symbol: "JNJ",           name: "Johnson & Johnson",            sector: "Healthcare",    region: "US" },
  { symbol: "WMT",           name: "Walmart Inc.",                 sector: "Retail",        region: "US" },
  { symbol: "XOM",           name: "ExxonMobil Corp.",             sector: "Energy",        region: "US" },
  { symbol: "RELIANCE.NS",   name: "Reliance Industries",          sector: "Conglomerate",  region: "IN" },
  { symbol: "TCS.NS",        name: "Tata Consultancy Services",    sector: "Technology",    region: "IN" },
  { symbol: "HDFCBANK.NS",   name: "HDFC Bank",                    sector: "Finance",       region: "IN" },
  { symbol: "INFY.NS",       name: "Infosys Ltd.",                 sector: "Technology",    region: "IN" },
  { symbol: "ICICIBANK.NS",  name: "ICICI Bank",                   sector: "Finance",       region: "IN" },
  { symbol: "WIPRO.NS",      name: "Wipro Ltd.",                   sector: "Technology",    region: "IN" },
  { symbol: "SBIN.NS",       name: "State Bank of India",          sector: "Finance",       region: "IN" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance",                sector: "Finance",       region: "IN" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors",                  sector: "Automotive",    region: "IN" },
  { symbol: "ADANIENT.NS",   name: "Adani Enterprises",            sector: "Conglomerate",  region: "IN" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever",           sector: "FMCG",          region: "IN" },
  { symbol: "KOTAKBANK.NS",  name: "Kotak Mahindra Bank",          sector: "Finance",       region: "IN" },
  { symbol: "AXISBANK.NS",   name: "Axis Bank",                    sector: "Finance",       region: "IN" },
  { symbol: "LT.NS",         name: "Larsen & Toubro",              sector: "Infrastructure",region: "IN" },
  { symbol: "ZOMATO.NS",     name: "Zomato Ltd.",                  sector: "Technology",    region: "IN" },
  { symbol: "MARUTI.NS",     name: "Maruti Suzuki",                sector: "Automotive",    region: "IN" },
  { symbol: "SUNPHARMA.NS",  name: "Sun Pharmaceutical",           sector: "Healthcare",    region: "IN" },
  { symbol: "TITAN.NS",      name: "Titan Company",                sector: "Consumer",      region: "IN" },
  { symbol: "HCLTECH.NS",    name: "HCL Technologies",             sector: "Technology",    region: "IN" },
];

// ─────────────────────────────────────────────────────────────────
//  GET /stock/popular
// ─────────────────────────────────────────────────────────────────
router.get("/popular", (_req, res) => res.json({ stocks: POPULAR_STOCKS }));

// ─────────────────────────────────────────────────────────────────
//  GET /stock/cache-status
// ─────────────────────────────────────────────────────────────────
router.get("/cache-status", (_req, res) => {
  const entries = [];
  cache.forEach((v, k) => {
    const ageMs = Date.now() - v.ts;
    const ttlMs = Math.max(0, CACHE_TTL - ageMs);
    entries.push({ key: k, ageSeconds: Math.floor(ageMs / 1000), ttlSeconds: Math.floor(ttlMs / 1000) });
  });
  res.json({ cached: entries.length, entries });
});

// ─────────────────────────────────────────────────────────────────
//  POST /stock/predict
// ─────────────────────────────────────────────────────────────────
router.post("/predict", async (req, res) => {
  const symbol = normalizeSymbol((req.body.symbol || "").trim());
  if (!symbol) return res.status(400).json({ detail: "symbol is required" });

  try {
    const historical = await yf_fetchTimeSeries(symbol);
    const quote      = await yf_fetchQuote(symbol);

    const minBars = 30;
    if (historical.length < minBars)
      return res.status(404).json({
        detail: `Not enough data for "${symbol}" (${historical.length} bars, need ${minBars}).`
      });

    const closes = historical.map((d) => d.close).filter(Boolean);
    if (closes.length < minBars)
      return res.status(404).json({ detail: "Insufficient price data." });

    const currentPrice = closes[closes.length - 1];
    const region       = isIndian(symbol) ? "IN" : "US";

    console.log(`[predict] ${symbol} — running 8-model ensemble + 3 accuracy layers…`);

    // ── Run all three accuracy layers in PARALLEL (non-blocking) ──
    // If any layer fails it returns a safe neutral default — predictions
    // are never blocked by a missing API key or a network failure.
    const [regime, sentiment, earnings] = await Promise.all([
      detectMarketRegime(closes, region),
      fetchNewsSentiment(symbol),
      checkEarningsWindow(symbol),
    ]);

    console.log(`[predict] Regime: ${regime.state} | Sentiment: ${sentiment.score} (${sentiment.articleCount ?? 0} articles) | Earnings: ${earnings.nearEarnings ? earnings.earningsDate : "none"}`);

    // ── Build predictions with all layers applied ─────────────────
    const { predictions, reg, dailyVol, ensembleWeights, modelMeta } =
      buildPredictions(closes, regime, sentiment, earnings);

    const trend30  = classifyTrend(closes.slice(-Math.min(30,  closes.length)));
    const trend90  = classifyTrend(closes.slice(-Math.min(90,  closes.length)));
    const trend365 = classifyTrend(closes);

    const support    = +Math.min(...closes).toFixed(2);
    const resistance = +Math.max(...closes).toFixed(2);
    const avg52w     = +(closes.slice(-252).reduce((a, b) => a + b, 0) / Math.min(252, closes.length)).toFixed(2);

    // RSI (14-day)
    let rsi = null;
    if (closes.length >= 15) {
      const gains = [], losses = [];
      for (let i = closes.length - 15; i < closes.length; i++) {
        const d = closes[i] - closes[i - 1];
        gains.push(d > 0 ? d : 0);
        losses.push(d < 0 ? -d : 0);
      }
      const ag = mean(gains);
      const al = mean(losses);
      rsi = +(al === 0 ? 100 : 100 - 100 / (1 + ag / al)).toFixed(1);
    }

    // MACD
    const macd  = +(emaSpan(closes, Math.min(12, closes.length)) - emaSpan(closes, Math.min(26, closes.length))).toFixed(4);
    const ma50  = closes.length >= 50  ? +(closes.slice(-50).reduce((a, b) => a + b, 0) / 50).toFixed(2)   : null;
    const ma200 = closes.length >= 200 ? +(closes.slice(-200).reduce((a, b) => a + b, 0) / 200).toFixed(2) : null;

    const chartData  = historical.slice(-90).map((d) => ({ ...d }));
    const volumeData = historical.slice(-365).map((d) => ({ date: d.date, volume: d.volume, close: d.close }));

    res.json({
      symbol,
      name:         quote.name,
      currency:     quote.currency,
      currentPrice: +currentPrice.toFixed(2),
      marketCap:    quote.market_cap,
      pe:           quote.pe,
      dayChange:    quote.change_percent,
      dataSource:   "Yahoo Finance",
      predictions,
      ensembleWeights,
      modelMeta,

      // ── Accuracy layer outputs (shown in frontend) ──────────────
      marketRegime: {
        state:       regime.state,
        description: regime.description,
        biasMult:    regime.biasMult,
        indexSymbol: regime.indexSymbol,
        isHighVol:   regime.isHighVol,
        indexSlope30: regime.indexSlope30,
        stockSlope30: regime.stockSlope30,
      },
      newsSentiment: {
        score:        sentiment.score,
        confidence:   sentiment.confidence,
        articleCount: sentiment.articleCount ?? 0,
        headlines:    sentiment.headlines ?? [],
        skipped:      sentiment.skipped ?? false,
      },
      earningsAlert: {
        nearEarnings:  earnings.nearEarnings,
        earningsDate:  earnings.earningsDate,
        daysUntil:     earnings.daysUntil,
        warning:       earnings.warning,
      },

      technicals: {
        rsi:          rsi ?? "N/A",
        macd,
        support,
        resistance,
        avg52w,
        ma50,
        ma200,
        annualisedVol: +(dailyVol * Math.sqrt(252) * 100).toFixed(2),
        r2:            +reg.r2.toFixed(4),
      },
      trend: {
        short:   trend30,
        medium:  trend90,
        long:    trend365,
        overall: trend365.pctPerDay > 0 ? "upward" : "downward",
      },
      chartData,
      volumeData,
      dataPoints: closes.length,
    });

  } catch (err) {
    console.error("[stock/predict]", err.message);
    const msg = err.message || "Prediction failed";
    if (msg.includes("not found") || msg.includes("No data"))
      return res.status(404).json({ detail: msg });
    if (msg.includes("Too Many Requests") || msg.includes("429"))
      return res.status(429).json({ detail: "Yahoo Finance is rate-limiting. Wait 30s and retry." });
    res.status(500).json({ detail: msg });
  }
});

// ─────────────────────────────────────────────────────────────────
//  POST /stock/screener
//
//  FIX: Yahoo /v7/finance/quote batch now returns HTTP 401 (auth required).
//  New approach: use the same /v8/finance/chart endpoint as /predict.
//  Fetches 6 symbols in parallel via pooledFetch() — ~5s for 31 stocks,
//  instant on repeat calls (1h cache per symbol).
// ─────────────────────────────────────────────────────────────────

async function fetchQuoteViaChart(symbol) {
  const cacheKey = `screener:${symbol}`;
  const cached   = getCached(cacheKey);
  if (cached) return cached;

  const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
  for (const host of hosts) {
    try {
      const url  = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
      const raw  = await httpGet(url);
      const json = JSON.parse(raw);
      const meta = json?.chart?.result?.[0]?.meta;
      if (!meta?.regularMarketPrice) continue;

      const curr      = meta.regularMarketPrice;
      const prev      = meta.previousClose || meta.chartPreviousClose || curr;
      const dayChange = prev ? +(((curr - prev) / prev) * 100).toFixed(2) : 0;
      const q = {
        name:           meta.longName || meta.shortName || symbol,
        currency:       meta.currency || (isIndian(symbol) ? "INR" : "USD"),
        price:          curr,
        change_percent: dayChange,
      };
      setCache(cacheKey, q);
      return q;
    } catch (_) { /* try next host */ }
  }
  return null;
}

async function pooledFetch(tasks, concurrency = 6) {
  const results = new Array(tasks.length).fill(null);
  let   next    = 0;
  async function worker() {
    while (next < tasks.length) {
      const idx = next++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

router.post("/screener", async (req, res) => {
  const { priceMax = 9999, trend = "all", sector = "" } = req.body;

  const list = sector
    ? POPULAR_STOCKS.filter((s) => s.sector.toLowerCase().includes(sector.toLowerCase()))
    : POPULAR_STOCKS;

  console.log(`[screener] Fetching ${list.length} symbols via v8/chart (concurrency=6)…`);
  const tasks  = list.map((stock) => () => fetchQuoteViaChart(stock.symbol));
  const quotes = await pooledFetch(tasks, 6);

  const results = [];
  for (let i = 0; i < list.length; i++) {
    const stock = list[i];
    const q     = quotes[i];
    if (!q?.price) { console.warn(`[screener] No quote for ${stock.symbol}`); continue; }
    if (q.price > priceMax) continue;
    const dayChange = q.change_percent || 0;
    const trendDir  = dayChange >= 0 ? "up" : "down";
    if (trend !== "all" && trendDir !== trend) continue;
    results.push({ ...stock, name: q.name, currency: q.currency,
                   price: +q.price.toFixed(2), dayChange, trend: trendDir, ma50: null, ma200: null });
  }

  console.log(`[screener] done: ${results.length}/${list.length} stocks matched`);
  res.json({ results, count: results.length });
});

module.exports = router;
