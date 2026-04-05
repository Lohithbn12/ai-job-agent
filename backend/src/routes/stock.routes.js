/**
 * src/routes/stock.routes.js
 *
 * Stock Predictor — Multi-source data fetching
 * ─────────────────────────────────────────────────────────────────
 *  Primary:  Yahoo Finance v8 JSON endpoint (no download, no block)
 *  Fallback: Stooq CSV (free, no auth, works for US + Indian stocks)
 *  Supports: US stocks (AAPL, TSLA) + Indian stocks (RELIANCE.NS, TCS.NS)
 *
 * Models: Linear Regression + Holt's Exponential Smoothing + SMA Ensemble
 * Fixes:  In-memory cache (1hr TTL) + exponential-backoff retry (3x)
 */

"use strict";

const express = require("express");
const router  = express.Router();
const https   = require("https");

// ─────────────────────────────────────────────────────────────────
//  In-Memory Cache  (1 hour TTL per symbol)
// ─────────────────────────────────────────────────────────────────
const cache     = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    console.log(`[cache HIT] ${key}`);
    return entry.data;
  }
  return null;
}
function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ─────────────────────────────────────────────────────────────────
//  Retry with Exponential Backoff
// ─────────────────────────────────────────────────────────────────
async function withRetry(fn, retries = 3, delayMs = 3000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < retries - 1) {
        const wait = delayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 1000);
        console.warn(`[retry] Attempt ${attempt + 1} failed: ${err.message}. Retrying in ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────
//  HTTP fetch helper (uses Node built-in https — no extra deps)
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
//  Helpers
// ─────────────────────────────────────────────────────────────────
function isIndian(symbol) {
  const s = symbol.toUpperCase();
  return s.endsWith(".NS") || s.endsWith(".BO");
}

// Convert Yahoo symbol to Stooq symbol  (AAPL → AAPL.US, RELIANCE.NS → RELIANCE.NS)
function toStooqSymbol(symbol) {
  if (isIndian(symbol)) return symbol.toLowerCase();
  return symbol.toLowerCase() + ".us";
}

// ─────────────────────────────────────────────────────────────────
//  Data source 1: Yahoo Finance v8 JSON (chart endpoint — not blocked)
// ─────────────────────────────────────────────────────────────────
async function fetchFromYahooChart(symbol) {
  const end   = Math.floor(Date.now() / 1000);
  const start = end - 2 * 365 * 24 * 3600;
  const url   = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&period1=${start}&period2=${end}&events=history`;

  const raw  = await httpGet(url);
  const json = JSON.parse(raw);

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
  const csv = await httpGet(url, { "Referer": "https://stooq.com/" });

  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) throw new Error(`No Stooq data for "${symbol}"`);

  const header = lines[0].toLowerCase().split(",");
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
      volume:  +(cols[volumeIdx] || 0),
    };
  }).filter((d) => d.close > 0 && d.date).sort((a, b) => a.date.localeCompare(b.date));
}

// ─────────────────────────────────────────────────────────────────
//  Data source 3: Yahoo Finance quote (current price/meta)
// ─────────────────────────────────────────────────────────────────
async function fetchQuoteFromYahoo(symbol) {
  // Try query1 first, fall back to query2 (some symbols only work on one host)
  const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
  let lastErr;
  for (const host of hosts) {
    try {
      const url  = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      const raw  = await httpGet(url);
      const json = JSON.parse(raw);
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
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// ─────────────────────────────────────────────────────────────────
//  Public fetchers  (cache + retry + fallback)
// ─────────────────────────────────────────────────────────────────
async function yf_fetchTimeSeries(symbol) {
  const cacheKey = `ts:${symbol}`;
  const cached   = getCached(cacheKey);
  if (cached) return cached;

  let data;
  try {
    // Try Yahoo chart API first (v8 — not the blocked download endpoint)
    data = await withRetry(() => fetchFromYahooChart(symbol));
    console.log(`[ts] Yahoo chart OK for ${symbol} (${data.length} bars)`);
  } catch (err) {
    console.warn(`[ts] Yahoo failed for ${symbol}: ${err.message} — trying Stooq...`);
    // Fallback to Stooq
    data = await withRetry(() => fetchFromStooq(symbol));
    console.log(`[ts] Stooq OK for ${symbol} (${data.length} bars)`);
  }

  if (!data || data.length === 0)
    throw new Error(`No data found for "${symbol}". US example: AAPL | Indian example: RELIANCE.NS`);

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

// ─────────────────────────────────────────────────────────────────
//  Math / prediction helpers
// ─────────────────────────────────────────────────────────────────
function linearRegression(x, y) {
  const n = x.length;
  const sx  = x.reduce((a, b) => a + b, 0);
  const sy  = y.reduce((a, b) => a + b, 0);
  const sxy = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sxx = x.reduce((s, xi) => s + xi * xi, 0);
  const slope     = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const yMean = sy / n;
  const ssTot = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const ssRes = y.reduce((s, yi, i) => s + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

function holtSmoothing(prices, alpha = 0.3, beta = 0.1) {
  let l = prices[0], b = prices[1] - prices[0];
  for (let i = 1; i < prices.length; i++) {
    const lp = l;
    l = alpha * prices[i] + (1 - alpha) * (l + b);
    b = beta  * (l - lp) + (1 - beta) * b;
  }
  return { forecast: (h) => l + h * b };
}

function smaForecast(prices, w = 20) {
  const slice = prices.slice(-Math.min(w, prices.length));
  const avg   = slice.reduce((a, b) => a + b, 0) / slice.length;
  const drift = (prices[prices.length - 1] - prices[prices.length - Math.min(w, prices.length)]) / Math.min(w, prices.length);
  return (h) => avg + drift * h;
}

function annualisedVol(prices) {
  const returns = [];
  for (let i = 1; i < prices.length; i++) returns.push(Math.log(prices[i] / prices[i - 1]));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance * 252);
}

function classifyTrend(prices) {
  const reg = linearRegression(prices.map((_, i) => i), prices.map((p) => Math.log(p)));
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
  const dVol   = annualisedVol(closePrices) / Math.sqrt(252);
  const last   = closePrices[closePrices.length - 1];
  const n      = closePrices.length;

  const predictions = HORIZONS.map((h) => {
    const regPred  = Math.exp(reg.intercept + reg.slope * (n + h));
    const holtPred = Math.max(holt.forecast(h), last * 0.1);
    const smaPred  = Math.max(sma(h), last * 0.1);
    const ensemble = 0.40 * regPred + 0.40 * holtPred + 0.20 * smaPred;
    const band     = last * dVol * Math.sqrt(h) * 1.64;
    const pctChg   = ((ensemble - last) / last) * 100;
    return {
      days:       h,
      label:      h === 730 ? "2 Years" : `${h} Days`,
      predicted:  +ensemble.toFixed(2),
      low:        +(ensemble - band).toFixed(2),
      high:       +(ensemble + band).toFixed(2),
      pctChange:  +pctChg.toFixed(2),
      confidence: +(Math.min(95, Math.max(45, reg.r2 * 100 - h * 0.03)).toFixed(1)),
      direction:  ensemble >= last ? "up" : "down",
    };
  });

  return { predictions, reg, dailyVol: dVol };
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
//  GET /stock/cache-status  (optional debug endpoint)
// ─────────────────────────────────────────────────────────────────
router.get("/cache-status", (_req, res) => {
  const entries = [];
  cache.forEach((v, k) => {
    const ageMs  = Date.now() - v.ts;
    const ttlMs  = Math.max(0, CACHE_TTL - ageMs);
    entries.push({ key: k, ageSeconds: Math.floor(ageMs / 1000), ttlSeconds: Math.floor(ttlMs / 1000) });
  });
  res.json({ cached: entries.length, entries });
});

// ─────────────────────────────────────────────────────────────────
//  POST /stock/predict
// ─────────────────────────────────────────────────────────────────
router.post("/predict", async (req, res) => {
  const symbol = (req.body.symbol || "").trim().toUpperCase();
  if (!symbol) return res.status(400).json({ detail: "symbol is required" });

  try {
    // Sequential fetches to reduce simultaneous Yahoo Finance connections
    const historical = await yf_fetchTimeSeries(symbol);
    const quote      = await yf_fetchQuote(symbol);

    const minBars = 20;
    if (historical.length < minBars)
      return res.status(404).json({ detail: `Not enough data for "${symbol}" (${historical.length} bars).` });

    const closes = historical.map((d) => d.close).filter(Boolean);
    if (closes.length < minBars) return res.status(404).json({ detail: "Insufficient price data." });

    const currentPrice = closes[closes.length - 1];
    const { predictions, reg, dailyVol } = buildPredictions(closes);

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
      const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
      rsi = +(100 - 100 / (1 + (avgLoss === 0 ? 100 : avgGain / avgLoss))).toFixed(1);
    }

    // MACD
    const ema  = (data, p) => { const k = 2/(p+1); let e = data[0]; for(let i=1;i<data.length;i++) e=data[i]*k+e*(1-k); return e; };
    const macd = +(ema(closes, Math.min(12, closes.length)) - ema(closes, Math.min(26, closes.length))).toFixed(4);
    const ma50  = closes.length >= 50  ? +(closes.slice(-50).reduce((a,b)=>a+b,0)/50).toFixed(2)   : null;
    const ma200 = closes.length >= 200 ? +(closes.slice(-200).reduce((a,b)=>a+b,0)/200).toFixed(2) : null;

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
      technicals: { rsi: rsi ?? "N/A", macd, support, resistance, avg52w, ma50, ma200,
                    annualisedVol: +(dailyVol * Math.sqrt(252) * 100).toFixed(2), r2: +reg.r2.toFixed(4) },
      trend: { short: trend30, medium: trend90, long: trend365,
               overall: trend365.pctPerDay > 0 ? "upward" : "downward" },
      chartData, volumeData,
      dataPoints: closes.length,
    });

  } catch (err) {
    console.error("[stock/predict]", err.message);
    const msg = err.message || "Prediction failed";
    if (msg.includes("not found") || msg.includes("No data"))
      return res.status(404).json({ detail: msg });
    if (msg.includes("Too Many Requests") || msg.includes("429"))
      return res.status(429).json({ detail: "Yahoo Finance is rate-limiting requests. Please wait 30 seconds and try again." });
    res.status(500).json({ detail: msg });
  }
});

// ─────────────────────────────────────────────────────────────────
//  POST /stock/screener
//  Uses Yahoo Finance /v7/finance/quote batch endpoint — fetches up
//  to 10 symbols in ONE request (same approach as Python yf.download)
// ─────────────────────────────────────────────────────────────────

async function batchFetchQuotes(symbols) {
  // Yahoo accepts comma-separated symbols — batch of up to 10 at once
  const joined = symbols.map(encodeURIComponent).join("%2C");
  const hosts  = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

  for (const host of hosts) {
    try {
      const url = `https://${host}/v7/finance/quote?symbols=${joined}&fields=regularMarketPrice,regularMarketPreviousClose,longName,shortName,currency`;
      const raw  = await httpGet(url);
      const json = JSON.parse(raw);
      const items = json?.quoteResponse?.result || [];
      if (items.length > 0) {
        console.log(`[screener] batch OK via ${host}: got ${items.length}/${symbols.length} quotes`);
        return items;
      }
    } catch (e) {
      console.warn(`[screener] batch ${host} failed: ${e.message}`);
    }
  }
  return [];
}

router.post("/screener", async (req, res) => {
  const { priceMax = 9999, trend = "all", sector = "" } = req.body;

  const list = sector
    ? POPULAR_STOCKS.filter((s) => s.sector.toLowerCase().includes(sector.toLowerCase()))
    : POPULAR_STOCKS;

  // Check if all symbols are cached already
  const quoteMap = {};
  const needFetch = [];

  for (const stock of list) {
    const cached = getCached(`screener:${stock.symbol}`);
    if (cached) {
      quoteMap[stock.symbol] = cached;
    } else {
      needFetch.push(stock.symbol);
    }
  }

  // Batch fetch in chunks of 10 (like Python's yf.download with threads=True)
  const CHUNK = 10;
  for (let i = 0; i < needFetch.length; i += CHUNK) {
    const chunk   = needFetch.slice(i, i + CHUNK);
    const fetched = await batchFetchQuotes(chunk);

    for (const item of fetched) {
      const sym  = item.symbol;
      const curr = item.regularMarketPrice;
      const prev = item.regularMarketPreviousClose || curr;
      const dayChange = prev ? +(((curr - prev) / prev) * 100).toFixed(2) : 0;

      const q = {
        name:           item.longName || item.shortName || sym,
        currency:       item.currency || (isIndian(sym) ? "INR" : "USD"),
        price:          curr,
        change_percent: dayChange,
      };

      quoteMap[sym] = q;
      setCache(`screener:${sym}`, q);
    }

    // Small delay between chunks to be polite
    if (i + CHUNK < needFetch.length) await new Promise(r => setTimeout(r, 300));
  }

  // Filter and build results
  const results = [];
  for (const stock of list) {
    const q = quoteMap[stock.symbol];
    if (!q?.price) continue;

    const price     = q.price;
    if (price > priceMax) continue;

    const dayChange = q.change_percent || 0;
    const trendDir  = dayChange >= 0 ? "up" : "down";
    if (trend !== "all" && trendDir !== trend) continue;

    results.push({
      ...stock,
      price:     +price.toFixed(2),
      dayChange,
      trend:     trendDir,
      ma50:      null,
      ma200:     null,
    });
  }

  console.log(`[screener] done: ${results.length}/${list.length} stocks matched`);
  res.json({ results, count: results.length });
});

module.exports = router;
