// ─── PortfolioGenerator.js ────────────────────────────────────────────────────
// Uploads a PDF resume → calls /portfolio/generate → renders a live portfolio
// site preview + lets the user copy the full HTML to deploy anywhere.

import React, { useState, useRef } from "react";
import axios from "axios";
import { API } from "./constants";

// ── colours ───────────────────────────────────────────────────────────────────
const C = {
  ocean:      "#1e6fd4",
  oceanDim:   "#1558b0",
  oceanSoft:  "rgba(30,111,212,0.07)",
  oceanBorder:"rgba(30,111,212,0.18)",
  teal:       "#0891b2",
  tealSoft:   "rgba(8,145,178,0.08)",
  tealBorder: "rgba(8,145,178,0.22)",
  navy:       "#0a1628",
  navyCard:   "#0f1f3d",
  white:      "#ffffff",
  bg:         "#f0f4f9",
  text:       "#0f172a",
  text2:      "#475569",
  text3:      "#94a3b8",
  border:     "rgba(30,111,212,0.12)",
  green:      "#16a34a",
  greenSoft:  "rgba(22,163,74,0.08)",
  greenBorder:"rgba(22,163,74,0.22)",
  red:        "#dc2626",
  redSoft:    "rgba(220,38,38,0.08)",
  redBorder:  "rgba(220,38,38,0.2)",
};

// ── tiny helpers ──────────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{
    display: "inline-block", width: 14, height: 14,
    border: `2px solid ${C.oceanSoft}`, borderTopColor: C.ocean,
    borderRadius: "50%", animation: "spin 0.7s linear infinite",
    verticalAlign: "middle",
  }} />
);

const Step = ({ n, label, active, done }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
      flexShrink: 0,
      background: done ? C.green : active ? C.ocean : "rgba(30,111,212,0.1)",
      color: (done || active) ? "white" : C.text3,
      boxShadow: active ? `0 0 0 4px ${C.oceanSoft}` : "none",
      transition: "all .3s",
    }}>
      {done ? "✓" : n}
    </div>
    <span style={{
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: done ? C.green : active ? C.ocean : C.text3,
    }}>{label}</span>
  </div>
);

// ── main component ────────────────────────────────────────────────────────────
export default function PortfolioGenerator() {
  const [file, setFile]                   = useState(null);
  const [dragging, setDragging]           = useState(false);
  const [step, setStep]                   = useState(1);
  const [status, setStatus]               = useState("");
  const [portfolioHtml, setPortfolioHtml] = useState("");
  const [copied, setCopied]               = useState(false);
  const [theme, setTheme]                 = useState("dark");
  const inputRef                          = useRef();
  const iframeRef                         = useRef();

  // ── file drop / pick ──────────────────────────────────────────────────────
  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") { setStatus("Only PDF files are supported."); return; }
    setFile(f); setStatus("");
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  // ── generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!file) { setStatus("Please upload a PDF resume first."); return; }
    try {
      setStep(2); setStatus("Parsing resume & building portfolio…");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("theme", theme);
      const res = await axios.post(`${API}/portfolio/generate`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPortfolioHtml(res.data.html || "");
      setStatus("Portfolio generated!");
      setStep(3);
    } catch (err) {
      setStatus(err?.response?.data?.detail || "Generation failed. Please try again.");
      setStep(1);
    }
  };

  // ── copy HTML ─────────────────────────────────────────────────────────────
  const copyHtml = () => {
    navigator.clipboard.writeText(portfolioHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  // ── download HTML ─────────────────────────────────────────────────────────
  const downloadHtml = () => {
    const blob = new Blob([portfolioHtml], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "portfolio.html"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setFile(null); setStep(1); setStatus(""); setPortfolioHtml(""); setCopied(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fade-up" style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* ── header ── */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 34, fontWeight: 800,
          color: C.text, lineHeight: 1.15,
          letterSpacing: "-0.8px", marginBottom: 10,
        }}>
          Portfolio{" "}
          <span style={{ color: C.ocean }}>Generator</span>
        </h1>
        <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.7 }}>
          Upload your PDF resume and get a beautiful, deployable portfolio website in seconds.
        </p>
      </div>

      {/* ── step indicator ── */}
      <div style={{
        display: "flex", gap: 24, marginBottom: 32,
        padding: "16px 22px",
        background: C.white,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        boxShadow: `0 1px 4px rgba(30,111,212,0.06)`,
        flexWrap: "wrap", alignItems: "center",
      }}>
        <Step n={1} label="Upload Resume"        active={step === 1} done={step > 1} />
        <div style={{ flex: 1, height: 1, background: C.border, minWidth: 20 }} />
        <Step n={2} label="AI Generates Portfolio" active={step === 2} done={step > 2} />
        <div style={{ flex: 1, height: 1, background: C.border, minWidth: 20 }} />
        <Step n={3} label="Preview & Download"   active={step === 3} done={false} />
      </div>

      {/* ══ STEP 1 — Upload ══ */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragging ? C.ocean : file ? C.green : C.oceanBorder}`,
              borderRadius: 16, padding: "52px 32px", textAlign: "center",
              cursor: "pointer", transition: "all .2s",
              background: dragging ? C.oceanSoft : file ? C.greenSoft : C.white,
              boxShadow: `0 1px 4px rgba(30,111,212,0.06)`,
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
              onChange={(e) => pickFile(e.target.files[0])} />
            <div style={{ fontSize: 44, marginBottom: 14 }}>{file ? "✅" : "📄"}</div>
            {file ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.green, fontFamily: "'Outfit', sans-serif" }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 13, color: C.text3, marginTop: 6 }}>
                  {(file.size / 1024).toFixed(1)} KB · Click to change
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'Outfit', sans-serif" }}>
                  Drop your PDF resume here
                </div>
                <div style={{ fontSize: 13, color: C.text3, marginTop: 6 }}>
                  or click to browse · PDF only
                </div>
              </>
            )}
          </div>

          {/* theme picker */}
          <div>
            <div style={{
              fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "1.1px", color: C.text3,
              fontFamily: "'JetBrains Mono', monospace", marginBottom: 12,
            }}>
              Portfolio Theme
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {[
                { key: "dark",     label: "🌙 Dark Minimal",    desc: "Sleek dark for tech accounts" },
                { key: "light",    label: "☀️ Clean Light",     desc: "White, professional, sharp" },
                { key: "gradient", label: "🌊 Gradient Glass",  desc: "Modern mesh gradient look" },
              ].map((t) => (
                <button key={t.key} onClick={() => setTheme(t.key)} style={{
                  padding: "12px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  background: theme === t.key ? C.oceanSoft : C.white,
                  border: `1.5px solid ${theme === t.key ? C.ocean : C.border}`,
                  transition: "all .15s",
                  boxShadow: theme === t.key ? `0 2px 12px rgba(30,111,212,0.12)` : "none",
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: theme === t.key ? C.ocean : C.text,
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* status / error */}
          {status && (
            <div style={{
              padding: "12px 16px", borderRadius: 10,
              background: C.redSoft, border: `1px solid ${C.redBorder}`,
              color: C.red, fontSize: 13,
            }}>
              ⚠️ {status}
            </div>
          )}

          {/* generate btn */}
          <button onClick={handleGenerate} disabled={!file} style={{
            padding: "15px 32px",
            background: file ? `linear-gradient(135deg, ${C.ocean}, ${C.oceanDim})` : "rgba(30,111,212,0.06)",
            border: `1px solid ${file ? C.ocean : C.border}`,
            borderRadius: 12, fontSize: 15, fontWeight: 700,
            color: file ? "white" : C.text3,
            cursor: file ? "pointer" : "not-allowed",
            fontFamily: "'Outfit', sans-serif",
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", justifyContent: "center",
            transition: "all .2s",
            boxShadow: file ? `0 4px 20px rgba(30,111,212,0.3)` : "none",
          }}>
            ✨ Generate My Portfolio
          </button>
        </div>
      )}

      {/* ══ STEP 2 — Generating ══ */}
      {step === 2 && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "80px 32px", gap: 24,
          background: C.white, borderRadius: 18,
          border: `1px solid ${C.border}`,
          boxShadow: `0 4px 20px rgba(30,111,212,0.08)`,
        }}>
          <div style={{ position: "relative", width: 72, height: 72 }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: `3px solid ${C.oceanSoft}`,
            }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "3px solid transparent", borderTopColor: C.ocean,
              animation: "spin 0.9s linear infinite",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            }}>🌐</div>
          </div>
          <div>
            <div style={{
              fontSize: 18, fontWeight: 700, color: C.text,
              fontFamily: "'Outfit', sans-serif", textAlign: "center", marginBottom: 8,
            }}>
              Building your portfolio…
            </div>
            <div style={{ fontSize: 13, color: C.text2, textAlign: "center" }}>
              Parsing resume · Crafting layout · Adding your details
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%", background: C.ocean,
                animation: `bounce 1.2s ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Preview ══ */}
      {step === 3 && portfolioHtml && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* action bar */}
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
            padding: "14px 18px",
            background: C.white,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            boxShadow: `0 1px 4px rgba(30,111,212,0.06)`,
          }}>
            <span style={{ fontSize: 13, color: C.green, fontWeight: 700, marginRight: "auto" }}>
              ✅ Portfolio ready!
            </span>

            <button onClick={copyHtml} style={{
              padding: "9px 18px",
              background: copied ? C.greenSoft : C.white,
              border: `1px solid ${copied ? C.greenBorder : C.border}`,
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: copied ? C.green : C.text2,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all .15s",
            }}>
              {copied ? "✓ Copied!" : "📋 Copy HTML"}
            </button>

            <button onClick={downloadHtml} style={{
              padding: "9px 18px",
              background: `linear-gradient(135deg, ${C.ocean}, ${C.oceanDim})`,
              border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: "white", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: `0 4px 14px rgba(30,111,212,0.3)`,
            }}>
              ⬇️ Download HTML
            </button>

            <button onClick={reset} style={{
              padding: "9px 18px",
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: C.text2, cursor: "pointer",
              transition: "all .15s",
            }}>
              ↩ Start Over
            </button>
          </div>

          {/* deploy hint */}
          <div style={{
            padding: "12px 18px",
            background: "rgba(30,111,212,0.05)",
            border: `1px solid rgba(30,111,212,0.15)`,
            borderRadius: 12, fontSize: 13,
            color: C.text2, lineHeight: 1.7,
          }}>
            💡 <strong style={{ color: C.text }}>Deploy it free:</strong>{" "}
            Download the HTML → drag it into{" "}
            <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" style={{ color: C.ocean, fontWeight: 600 }}>Netlify Drop</a>,{" "}
            <a href="https://tiiny.host" target="_blank" rel="noreferrer" style={{ color: C.ocean, fontWeight: 600 }}>Tiiny.host</a>, or push to a{" "}
            <a href="https://pages.github.com" target="_blank" rel="noreferrer" style={{ color: C.ocean, fontWeight: 600 }}>GitHub Pages</a> repo.
          </div>

          {/* live preview iframe */}
          <div style={{
            borderRadius: 16, overflow: "hidden",
            border: `1px solid ${C.border}`,
            boxShadow: `0 8px 40px rgba(30,111,212,0.12)`,
          }}>
            {/* browser chrome bar */}
            <div style={{
              background: C.navy, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, marginLeft: 8,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 6, padding: "4px 12px", fontSize: 12,
                color: "rgba(255,255,255,0.35)", textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                portfolio.html — preview
              </div>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={portfolioHtml}
              title="Portfolio Preview"
              sandbox="allow-scripts"
              style={{ width: "100%", height: 680, border: "none", background: "white" }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0);    opacity: .4; }
          50%       { transform: translateY(-6px); opacity: 1;  }
        }
      `}</style>
    </div>
  );
}
