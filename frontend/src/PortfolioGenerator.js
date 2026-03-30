// ─── PortfolioGenerator.js ────────────────────────────────────────────────────
// Uploads a PDF resume → calls /portfolio/generate → renders a live portfolio
// site preview + lets the user copy the full HTML to deploy anywhere.

import React, { useState, useRef } from "react";
import axios from "axios";
import { API } from "./constants";

// ── tiny helpers ──────────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{
    display: "inline-block", width: 14, height: 14,
    border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#5eead4",
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
      background: done ? "#22c55e" : active ? "var(--teal)" : "rgba(255,255,255,0.08)",
      color: (done || active) ? "white" : "rgba(255,255,255,0.35)",
      boxShadow: active ? "0 0 0 4px rgba(13,148,136,.18)" : "none",
      transition: "all .3s",
    }}>
      {done ? "✓" : n}
    </div>
    <span style={{
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: done ? "#4ade80" : active ? "#5eead4" : "rgba(255,255,255,0.35)",
    }}>{label}</span>
  </div>
);

// ── main component ─────────────────────────────────────────────────────────────
export default function PortfolioGenerator() {
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [step, setStep]           = useState(1);   // 1=upload  2=generating  3=done
  const [status, setStatus]       = useState("");
  const [portfolioHtml, setPortfolioHtml] = useState("");
  const [copied, setCopied]       = useState(false);
  const [theme, setTheme]         = useState("dark");
  const inputRef                  = useRef();
  const iframeRef                 = useRef();

  // ── file drop / pick ─────────────────────────────────────────────────────────
  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") { setStatus("Only PDF files are supported."); return; }
    setFile(f);
    setStatus("");
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  // ── generate ──────────────────────────────────────────────────────────────────
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

  // ── copy HTML ─────────────────────────────────────────────────────────────────
  const copyHtml = () => {
    navigator.clipboard.writeText(portfolioHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  // ── download HTML ─────────────────────────────────────────────────────────────
  const downloadHtml = () => {
    const blob = new Blob([portfolioHtml], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "portfolio.html"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── reset ─────────────────────────────────────────────────────────────────────
  const reset = () => {
    setFile(null); setStep(1); setStatus(""); setPortfolioHtml(""); setCopied(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fade-up" style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* ── header ── */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
          fontSize: 36, fontWeight: 800,
          color: "rgba(255,255,255,0.92)", lineHeight: 1.1,
          letterSpacing: "-1px", marginBottom: 10,
        }}>
          Portfolio{" "}
          <span style={{ background: "var(--teal)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Generator
          </span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7 }}>
          Upload your PDF resume and get a beautiful, deployable portfolio website in seconds.
        </p>
      </div>

      {/* ── step indicator ── */}
      <div style={{
        display: "flex", gap: 24, marginBottom: 36, padding: "16px 20px",
        background: "#0c1a3d", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.07)",
        flexWrap: "wrap",
      }}>
        <Step n={1} label="Upload Resume" active={step === 1} done={step > 1} />
        <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.08)", alignSelf: "center" }} />
        <Step n={2} label="AI Generates Portfolio" active={step === 2} done={step > 2} />
        <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.08)", alignSelf: "center" }} />
        <Step n={3} label="Preview & Download" active={step === 3} done={false} />
      </div>

      {/* ══ STEP 1 — Upload ══ */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragging ? "var(--teal)" : file ? "#22c55e" : "rgba(255,255,255,0.12)"}`,
              borderRadius: 18, padding: "52px 32px", textAlign: "center",
              cursor: "pointer", transition: "all .2s",
              background: dragging ? "rgba(13,148,136,0.04)" : file ? "rgba(34,197,94,0.04)" : "#0a1628",
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
              onChange={(e) => pickFile(e.target.files[0])} />
            <div style={{ fontSize: 44, marginBottom: 14 }}>{file ? "✅" : "📄"}</div>
            {file ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>{file.name}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  {(file.size / 1024).toFixed(1)} KB · Click to change
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.75)", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
                  Drop your PDF resume here
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  or click to browse · PDF only
                </div>
              </>
            )}
          </div>

          {/* theme picker */}
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
              Portfolio Theme
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { key: "dark",    label: "🌙 Dark Minimal",    desc: "Sleek dark bg, teal accents" },
                { key: "light",   label: "☀️ Clean Light",     desc: "White, professional, sharp" },
                { key: "gradient",label: "🌊 Gradient Glass",  desc: "Modern mesh gradient look" },
              ].map((t) => (
                <button key={t.key} onClick={() => setTheme(t.key)} style={{
                  padding: "12px 18px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  background: theme === t.key ? "rgba(13,148,136,.14)" : "#0c1a3d",
                  border: `1.5px solid ${theme === t.key ? "rgba(13,148,136,.5)" : "rgba(255,255,255,0.07)"}`,
                  transition: "all .15s",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme === t.key ? "#5eead4" : "rgba(255,255,255,0.75)", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* status */}
          {status && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13 }}>
              ⚠️ {status}
            </div>
          )}

          {/* generate btn */}
          <button onClick={handleGenerate} disabled={!file} style={{
            padding: "16px 32px", background: file ? "var(--teal)" : "rgba(255,255,255,0.06)",
            border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700,
            color: file ? "white" : "rgba(255,255,255,0.25)", cursor: file ? "pointer" : "not-allowed",
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            justifyContent: "center", transition: "all .2s",
            boxShadow: file ? "0 4px 24px rgba(13,148,136,0.25)" : "none",
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
          background: "#0a1628", borderRadius: 18, border: "1.5px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ position: "relative", width: 72, height: 72 }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "3px solid rgba(13,148,136,.15)",
            }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "3px solid transparent", borderTopColor: "#5eead4",
              animation: "spin 0.9s linear infinite",
            }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🌐</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.88)", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", textAlign: "center", marginBottom: 8 }}>
              Building your portfolio…
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              Parsing resume · Crafting layout · Adding your details
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%", background: "var(--teal)",
                animation: `bounce 1.2s ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Preview ══ */}
      {step === 3 && portfolioHtml && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* action bar */}
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
            padding: "14px 18px", background: "#0c1a3d",
            borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.07)",
          }}>
            <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 700, marginRight: "auto" }}>
              ✅ Portfolio ready!
            </span>

            <button onClick={copyHtml} style={{
              padding: "9px 18px", background: copied ? "rgba(34,197,94,.12)" : "rgba(255,255,255,.06)",
              border: `1px solid ${copied ? "rgba(34,197,94,.3)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: copied ? "#4ade80" : "rgba(255,255,255,0.7)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {copied ? "✓ Copied!" : "📋 Copy HTML"}
            </button>

            <button onClick={downloadHtml} style={{
              padding: "9px 18px", background: "var(--teal)", border: "none",
              borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>
              ⬇️ Download HTML
            </button>

            <button onClick={reset} style={{
              padding: "9px 18px", background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: "rgba(255,255,255,0.45)", cursor: "pointer",
            }}>
              ↩ Start Over
            </button>
          </div>

          {/* deploy hint */}
          <div style={{
            padding: "12px 18px", background: "rgba(99,102,241,.08)",
            border: "1px solid rgba(99,102,241,.2)", borderRadius: 12,
            fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7,
          }}>
            💡 <strong style={{ color: "rgba(255,255,255,0.75)" }}>Deploy it free:</strong>{" "}
            Download the HTML → drag it into{" "}
            <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" style={{ color: "#818cf8" }}>Netlify Drop</a>,{" "}
            <a href="https://tiiny.host" target="_blank" rel="noreferrer" style={{ color: "#818cf8" }}>Tiiny.host</a>, or push to a{" "}
            <a href="https://pages.github.com" target="_blank" rel="noreferrer" style={{ color: "#818cf8" }}>GitHub Pages</a> repo.
          </div>

          {/* live preview iframe */}
          <div style={{
            borderRadius: 16, overflow: "hidden",
            border: "1.5px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}>
            {/* browser chrome bar */}
            <div style={{
              background: "#0f172a", padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ef4444","#f59e0b","#22c55e"].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, marginLeft: 8, background: "rgba(255,255,255,0.04)",
                borderRadius: 6, padding: "4px 12px", fontSize: 12,
                color: "rgba(255,255,255,0.3)", textAlign: "center",
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

      {/* global keyframe additions */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: .4; }
          50%       { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
