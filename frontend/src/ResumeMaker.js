// ─── ResumeMaker.js ───────────────────────────────────────────────────────────
// Complete Resume Maker with 2 modes:
//   1. ATS Score Checker — upload PDF, instant NLP-powered score
//   2. Build from Scratch — 150-template gallery + guided section builder
//
// Import in App.js:
//   import ResumeMaker from "./ResumeMaker";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API, EMPTY_RESUME, Spinner, Label, Tag, FilterChip, 
         MetaRow, AddRow, Section } from "./constants";
import { RESUME_TEMPLATES, TEMPLATE_CATEGORIES } from "./templates";

function ATSScoreRing({ score }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#facc15" : "#f87171";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth={9} />
        <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1), stroke .3s" }}
        />
        <text x={55} y={52} textAnchor="middle" fill={color} fontSize={22} fontWeight={800} fontFamily="Plus Jakarta Sans, system-ui, sans-serif">{score}</text>
        <text x={55} y={67} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="Inter Tight,sans-serif">ATS Score</text>
      </svg>
      <div style={{ fontSize: 12, fontWeight: 600, color, textAlign: "center" }}>
        {score >= 85 ? "🏆 Excellent" : score >= 70 ? "✅ Good" : score >= 55 ? "⚠️ Fair" : "❌ Needs Work"}
      </div>
    </div>
  );
}

// ─── Lightweight local score (used while backend call is in-flight) ───────────
function computeLocalScore(resume) {
  let score = 0;
  const p = resume.personal;
  if (p.name)      score += 10;
  if (p.email)     score += 8;
  if (p.phone)     score += 5;
  if (p.location)  score += 4;
  if (p.linkedin)  score += 5;
  if (resume.summary && resume.summary.length > 60) score += 12;
  const allSkills = [...resume.skills.technical, ...resume.skills.soft, ...resume.skills.tools];
  score += Math.min(allSkills.length * 2, 20);
  score += Math.min(resume.experience.length * 8, 24);
  score += Math.min(resume.education.length * 5, 10);
  score += Math.min(resume.certifications.length * 3, 9);
  score += Math.min(resume.projects.length * 2, 8);
  return Math.min(score, 99);
}

// ─── ATS Suggestions panel (driven by backend result) ────────────────────────
function ATSSuggestions({ atsResult, localScore }) {
  // If no backend result yet, show local quick-tips
  if (!atsResult) {
    const score = localScore;
    const tips = [];
    if (score < 10)  tips.push({ icon: "👤", text: "Fill in your name, email and phone first" });
    if (score < 25)  tips.push({ icon: "📝", text: "Write a professional summary (80–120 words)" });
    if (score < 40)  tips.push({ icon: "💼", text: "Add at least one work experience entry" });
    if (score < 55)  tips.push({ icon: "🛠", text: "Add 10+ skills across Technical, Tools and Soft Skills" });
    if (score < 70)  tips.push({ icon: "🏅", text: "Add certifications to boost ATS keyword density" });
    if (tips.length === 0) tips.push({ icon: "✅", text: "Score updating — click 'Analyse Resume' for full report" });
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {tips.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "9px 11px", background: "var(--teal-soft)", border: "1px solid rgba(99,102,241,.13)", borderRadius: 9, fontSize: 11, color: "var(--teal)" }}>
            <span style={{ flexShrink: 0 }}>{t.icon}</span><span style={{ lineHeight: 1.5 }}>{t.text}</span>
          </div>
        ))}
      </div>
    );
  }

  // Backend result available — show top suggestions ranked by impact
  const top = atsResult.suggestions.slice(0, 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {top.map((s, i) => {
        const impactColor = s.impact >= 5 ? "#f87171" : s.impact >= 3 ? "#fbbf24" : "var(--teal)";
        return (
          <div key={i} style={{ padding: "9px 11px", background: "#f8fafc", border: `1px solid ${impactColor}22`, borderRadius: 9, fontSize: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: impactColor, fontSize: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>{s.section}</span>
              {s.impact > 0 && <span style={{ fontSize: 10, color: impactColor, fontWeight: 700 }}>+{s.impact} pts</span>}
            </div>
            <div style={{ color: "#94a3b8", lineHeight: 1.5 }}>{s.fix}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Resume PDF-like Preview ──────────────────────────────────────────────────

// ─── VISUAL STYLES ────────────────────────────────────────────────────────────
// 8 resume visual styles: 2 with photo (top-left), 6 without photo.
// Styles are independent of job role — user picks a look they like.

const VISUAL_STYLES = [
  // ── WITH PHOTO (top-left) ────────────────────────────────────────────────
  {
    id:"vs1", name:"Navy Photo", hasPhoto:true, badge:"With Photo", icon:"🔵",
    desc:"Dark navy header with top-left photo. Classic & authoritative.",
    accent:"#1e3a8a", headerBg:"#1e3a8a", headerText:"#fff",
    headingColor:"#1e3a8a", bodyBg:"#fff", textColor:"#1e293b", borderColor:"#1e3a8a",
  },
  {
    id:"vs2", name:"Teal Photo", hasPhoto:true, badge:"With Photo", icon:"🟢",
    desc:"Teal header with top-left photo. Modern and distinctive.",
    accent:"#0d9488", headerBg:"#0d9488", headerText:"#fff",
    headingColor:"#0d9488", bodyBg:"#fff", textColor:"#1e293b", borderColor:"#0d9488",
  },
  // ── WITHOUT PHOTO ────────────────────────────────────────────────────────
  {
    id:"vs3", name:"Classic Blue", hasPhoto:false, badge:"", icon:"⚪",
    desc:"Black & white with blue accents. Timeless ATS-friendly.",
    accent:"#1e40af", headerBg:null, headerText:null,
    headingColor:"#1e3a5f", bodyBg:"#fff", textColor:"#374151", borderColor:"#1e40af",
  },
  {
    id:"vs4", name:"Bold Purple", hasPhoto:false, badge:"Popular", icon:"🟣",
    desc:"Strong purple header bar. Bold and attention-grabbing.",
    accent:"#7c3aed", headerBg:"#7c3aed", headerText:"#fff",
    headingColor:"#7c3aed", bodyBg:"#fff", textColor:"#1e293b", borderColor:"#7c3aed",
  },
  {
    id:"vs5", name:"Minimal Slate", hasPhoto:false, badge:"", icon:"🌫️",
    desc:"Maximum white space, subtle grey lines. Ultra-clean.",
    accent:"#475569", headerBg:null, headerText:null,
    headingColor:"#0f172a", bodyBg:"#fff", textColor:"#334155", borderColor:"#cbd5e1",
  },
  {
    id:"vs6", name:"Rose Modern", hasPhoto:false, badge:"Trending", icon:"🌸",
    desc:"Warm rose-pink header. Stands out while staying professional.",
    accent:"#be185d", headerBg:"#be185d", headerText:"#fff",
    headingColor:"#be185d", bodyBg:"#fff", textColor:"#1e293b", borderColor:"#be185d",
  },
  {
    id:"vs7", name:"Forest Green", hasPhoto:false, badge:"", icon:"🌿",
    desc:"Deep green with clean horizontal lines. Business & consulting.",
    accent:"#065f46", headerBg:null, headerText:null,
    headingColor:"#064e3b", bodyBg:"#fff", textColor:"#1e293b", borderColor:"#065f46",
  },
  {
    id:"vs8", name:"Sunset Orange", hasPhoto:false, badge:"", icon:"🟠",
    desc:"Deep orange header. Energetic and memorable.",
    accent:"#c2410c", headerBg:"#c2410c", headerText:"#fff",
    headingColor:"#c2410c", bodyBg:"#fff", textColor:"#1e293b", borderColor:"#c2410c",
  },
];

// ─── Style Picker ─────────────────────────────────────────────────────────────
function StylePicker({ activeId, onChange }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase",
        letterSpacing:"1px", marginBottom:10 }}>Resume Style</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {VISUAL_STYLES.map(s => (
          <button key={s.id} onClick={() => onChange(s.id)}
            title={s.desc}
            style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"6px 12px",
              background: activeId===s.id ? s.accent+"18" : "white",
              border:`1.5px solid ${activeId===s.id ? s.accent : "rgba(0,0,0,.1)"}`,
              borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:600,
              color: activeId===s.id ? s.accent : "#475569",
              transition:"all .15s",
            }}>
            <span>{s.icon}</span>
            <span>{s.name}</span>
            {s.badge && (
              <span style={{ padding:"1px 6px", background:s.accent, color:"white",
                borderRadius:10, fontSize:9, fontWeight:700 }}>{s.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shared resume section heading ────────────────────────────────────────────
function SectionHead({ label, color, border }) {
  return (
    <div style={{ fontSize:9.5, fontWeight:700, color, textTransform:"uppercase",
      letterSpacing:"1px", marginBottom:5, paddingBottom:3,
      borderBottom:`1.5px solid ${(border||color)+"33"}` }}>
      {label}
    </div>
  );
}

// ─── Shared experience blocks ─────────────────────────────────────────────────
function ExpBlocks({ experience, color }) {
  return experience.map((exp, i) => (
    <div key={i} style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <div style={{ fontWeight:700, fontSize:11.5 }}>{exp.title}</div>
        <div style={{ fontSize:10, color:"#6b7280" }}>{exp.start} – {exp.end||"Present"}</div>
      </div>
      <div style={{ color:"#374151", fontStyle:"italic", marginBottom:4 }}>
        {exp.company}{exp.location ? ` · ${exp.location}` : ""}
      </div>
      {(exp.bullets||[]).filter(Boolean).map((b,j) => (
        <div key={j} style={{ display:"flex", gap:6, marginBottom:2 }}>
          <span style={{ color, flexShrink:0 }}>•</span>
          <span style={{ color:"#374151" }}>{b}</span>
        </div>
      ))}
    </div>
  ));
}

// ─── Shared education blocks ──────────────────────────────────────────────────
function EduBlocks({ education }) {
  return education.map((edu, i) => (
    <div key={i} style={{ marginBottom:6 }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <div style={{ fontWeight:700 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</div>
        <div style={{ fontSize:10, color:"#6b7280" }}>{edu.year}</div>
      </div>
      <div style={{ color:"#374151" }}>{edu.school}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</div>
    </div>
  ));
}

// ─── ResumePreview — dispatches to correct style renderer ────────────────────
function ResumePreview({ resume, styleId }) {
  const p   = resume.personal;
  const hasContent = p.name || resume.summary || resume.experience.length || resume.education.length;

  if (!hasContent) return (
    <div style={{ textAlign:"center", padding:"60px 20px", color:"#475569" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
      <div style={{ fontSize:14, fontWeight:600 }}>Preview will appear here</div>
      <div style={{ fontSize:12, marginTop:6 }}>Fill in your details to see your resume</div>
    </div>
  );

  const style = VISUAL_STYLES.find(s => s.id === (styleId||"vs3")) || VISUAL_STYLES[2];

  // Route to correct renderer
  if (style.hasPhoto)      return <PhotoTopLeftResume  resume={resume} s={style} />;
  if (style.headerBg)      return <BoldHeaderResume    resume={resume} s={style} />;
  return                          <ClassicResume        resume={resume} s={style} />;
}

// ─── Style 1 & 2: Photo top-left + colored header ────────────────────────────
function PhotoTopLeftResume({ resume, s }) {
  const p   = resume.personal;
  const sk  = resume.skills || { technical:[], tools:[], soft:[] };
  const cer = resume.certifications || [];
  const allSkills = [...(sk.technical||[]), ...(sk.tools||[])];

  return (
    <div style={{ fontFamily:"'Arial',sans-serif", fontSize:11, lineHeight:1.55,
      color:s.textColor, background:s.bodyBg, minHeight:600 }}>

      {/* ── Colored header with photo top-left ── */}
      <div style={{ background:s.headerBg, color:s.headerText, padding:"20px 28px",
        display:"flex", alignItems:"center", gap:20 }}>

        {/* Photo placeholder — top left */}
        <div style={{ width:72, height:72, borderRadius:10, flexShrink:0,
          background:"rgba(255,255,255,0.2)",
          border:"2px solid rgba(255,255,255,0.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:26, overflow:"hidden" }}>
          {resume.personal?.photoUrl
            ? <img src={resume.personal.photoUrl} alt="photo"
                style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : "👤"}
        </div>

        {/* Name + contact */}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:"-.3px", marginBottom:5 }}>
            {p.name || "Your Name"}
          </div>
          <div style={{ fontSize:10, display:"flex", flexWrap:"wrap", gap:"0 14px", opacity:.9 }}>
            {p.email    && <span>✉ {p.email}</span>}
            {p.phone    && <span>📞 {p.phone}</span>}
            {p.location && <span>📍 {p.location}</span>}
            {p.linkedin && <span>🔗 {p.linkedin}</span>}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding:"22px 28px" }}>

        {resume.summary && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Professional Summary" color={s.headingColor} border={s.borderColor} />
            <div style={{ color:s.textColor, lineHeight:1.65 }}>{resume.summary}</div>
          </div>
        )}

        {resume.experience.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Work Experience" color={s.headingColor} border={s.borderColor} />
            <ExpBlocks experience={resume.experience} color={s.headingColor} />
          </div>
        )}

        {resume.education.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Education" color={s.headingColor} border={s.borderColor} />
            <EduBlocks education={resume.education} />
          </div>
        )}

        {allSkills.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Skills" color={s.headingColor} border={s.borderColor} />
            <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 8px" }}>
              {allSkills.slice(0,18).map((sk2,i) => (
                <span key={i} style={{ padding:"2px 9px",
                  background:s.headingColor+"15", border:`1px solid ${s.headingColor}30`,
                  borderRadius:4, fontSize:10, color:s.headingColor, fontWeight:600 }}>
                  {sk2}
                </span>
              ))}
            </div>
          </div>
        )}

        {resume.projects?.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Projects" color={s.headingColor} border={s.borderColor} />
            {resume.projects.map((pr,i) => (
              <div key={i} style={{ marginBottom:7 }}>
                <div style={{ fontWeight:700 }}>{pr.name}</div>
                {pr.stack && <div style={{ fontSize:10, color:s.headingColor, marginBottom:2 }}>{pr.stack}</div>}
                {pr.description && <div style={{ color:s.textColor }}>{pr.description}</div>}
              </div>
            ))}
          </div>
        )}

        {cer.length > 0 && (
          <div>
            <SectionHead label="Certifications" color={s.headingColor} border={s.borderColor} />
            {cer.map((c,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span>{c.name||c}</span>
                <span style={{ color:"#6b7280", fontSize:10 }}>
                  {c.issuer ? `${c.issuer}${c.year ? ` · ${c.year}` : ""}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles 4, 6, 8: Bold full-width colored header (no photo) ───────────────
function BoldHeaderResume({ resume, s }) {
  const p   = resume.personal;
  const sk  = resume.skills || { technical:[], tools:[], soft:[] };
  const cer = resume.certifications || [];
  const allSkills = [...(sk.technical||[]), ...(sk.tools||[]), ...(sk.soft||[])];

  return (
    <div style={{ fontFamily:"'Arial',sans-serif", fontSize:11, lineHeight:1.55,
      color:s.textColor, background:s.bodyBg, minHeight:600 }}>

      {/* Bold color header */}
      <div style={{ background:s.headerBg, color:s.headerText, padding:"22px 32px 20px" }}>
        <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-.3px" }}>
          {p.name || "Your Name"}
        </div>
        <div style={{ fontSize:10, marginTop:7, display:"flex", flexWrap:"wrap",
          gap:"0 16px", opacity:.9 }}>
          {p.email    && <span>✉ {p.email}</span>}
          {p.phone    && <span>📞 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.linkedin && <span>🔗 {p.linkedin}</span>}
          {p.portfolio && <span>🌐 {p.portfolio}</span>}
        </div>
      </div>

      <div style={{ padding:"22px 32px" }}>

        {resume.summary && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Professional Summary" color={s.headingColor} border={s.borderColor} />
            <div style={{ lineHeight:1.65 }}>{resume.summary}</div>
          </div>
        )}

        {resume.experience.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Work Experience" color={s.headingColor} border={s.borderColor} />
            <ExpBlocks experience={resume.experience} color={s.headingColor} />
          </div>
        )}

        {resume.education.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Education" color={s.headingColor} border={s.borderColor} />
            <EduBlocks education={resume.education} />
          </div>
        )}

        {allSkills.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Skills" color={s.headingColor} border={s.borderColor} />
            <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 8px" }}>
              {allSkills.slice(0,18).map((sk2,i) => (
                <span key={i} style={{ padding:"2px 9px",
                  background:s.headingColor+"15", border:`1px solid ${s.headingColor}25`,
                  borderRadius:4, fontSize:10, color:s.headingColor, fontWeight:600 }}>
                  {sk2}
                </span>
              ))}
            </div>
          </div>
        )}

        {resume.projects?.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <SectionHead label="Projects" color={s.headingColor} border={s.borderColor} />
            {resume.projects.map((pr,i) => (
              <div key={i} style={{ marginBottom:7 }}>
                <div style={{ fontWeight:700 }}>{pr.name}</div>
                {pr.stack && <div style={{ fontSize:10, color:s.headingColor, marginBottom:2 }}>{pr.stack}</div>}
                {pr.description && <div style={{ color:s.textColor }}>{pr.description}</div>}
              </div>
            ))}
          </div>
        )}

        {cer.length > 0 && (
          <div>
            <SectionHead label="Certifications" color={s.headingColor} border={s.borderColor} />
            {cer.map((c,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span>{c.name||c}</span>
                <span style={{ color:"#6b7280", fontSize:10 }}>
                  {c.issuer ? `${c.issuer}${c.year ? ` · ${c.year}` : ""}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        {resume.languages?.length > 0 && (
          <div>
            <SectionHead label="Languages" color={s.headingColor} border={s.borderColor} />
            <div>{resume.languages.map(l => `${l.lang} (${l.level})`).join(" · ")}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles 3, 5, 7: Classic / Minimal (no colored header, no photo) ─────────
function ClassicResume({ resume, s }) {
  const p   = resume.personal;
  const sk  = resume.skills || { technical:[], tools:[], soft:[] };
  const cer = resume.certifications || [];

  return (
    <div style={{ fontFamily:"'Arial',sans-serif", fontSize:11, lineHeight:1.55,
      color:s.textColor, background:s.bodyBg, padding:"32px 36px", minHeight:600 }}>

      {/* Classic text header */}
      <div style={{ borderBottom:`2px solid ${s.borderColor}`, paddingBottom:14, marginBottom:14 }}>
        <div style={{ fontSize:22, fontWeight:700, color:s.headingColor, letterSpacing:"-.3px" }}>
          {p.name || "Your Name"}
        </div>
        <div style={{ fontSize:10, color:"#475569", marginTop:4, display:"flex",
          flexWrap:"wrap", gap:"0 14px" }}>
          {p.email    && <span>✉ {p.email}</span>}
          {p.phone    && <span>📞 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.linkedin && <span>🔗 {p.linkedin}</span>}
          {p.portfolio && <span>🌐 {p.portfolio}</span>}
        </div>
      </div>

      {resume.summary && (
        <div style={{ marginBottom:12 }}>
          <SectionHead label="Professional Summary" color={s.headingColor} border={s.borderColor} />
          <div style={{ color:s.textColor, lineHeight:1.6 }}>{resume.summary}</div>
        </div>
      )}

      {resume.experience.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <SectionHead label="Work Experience" color={s.headingColor} border={s.borderColor} />
          <ExpBlocks experience={resume.experience} color={s.headingColor} />
        </div>
      )}

      {resume.education.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <SectionHead label="Education" color={s.headingColor} border={s.borderColor} />
          <EduBlocks education={resume.education} />
        </div>
      )}

      {([...(sk.technical||[]), ...(sk.tools||[]), ...(sk.soft||[])].length > 0) && (
        <div style={{ marginBottom:12 }}>
          <SectionHead label="Skills" color={s.headingColor} border={s.borderColor} />
          {sk.technical?.length > 0 && <div style={{ marginBottom:3 }}><strong>Technical: </strong>{sk.technical.join(" · ")}</div>}
          {sk.tools?.length     > 0 && <div style={{ marginBottom:3 }}><strong>Tools: </strong>{sk.tools.join(" · ")}</div>}
          {sk.soft?.length      > 0 && <div><strong>Soft Skills: </strong>{sk.soft.join(" · ")}</div>}
        </div>
      )}

      {cer.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <SectionHead label="Certifications" color={s.headingColor} border={s.borderColor} />
          {cer.map((c,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span>{c.name||c}</span>
              <span style={{ color:"#6b7280", fontSize:10 }}>
                {c.issuer ? `${c.issuer}${c.year ? ` · ${c.year}` : ""}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {resume.projects?.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <SectionHead label="Projects" color={s.headingColor} border={s.borderColor} />
          {resume.projects.map((pr,i) => (
            <div key={i} style={{ marginBottom:6 }}>
              <div style={{ fontWeight:700 }}>{pr.name}
                {pr.url && <span style={{ fontWeight:400, color:"#64748b", fontSize:10 }}> ({pr.url})</span>}
              </div>
              {pr.stack && <div style={{ color:"#6b7280", fontSize:10 }}>Stack: {pr.stack}</div>}
              <div style={{ color:s.textColor }}>{pr.description}</div>
            </div>
          ))}
        </div>
      )}

      {resume.languages?.length > 0 && (
        <div>
          <SectionHead label="Languages" color={s.headingColor} border={s.borderColor} />
          <div>{resume.languages.map(l => `${l.lang} (${l.level})`).join(" · ")}</div>
        </div>
      )}
    </div>
  );
}

function ExpEntry({ exp, onChange, onRemove, idx }) {
  const updateBullet = (bi, val) => {
    const bullets = [...(exp.bullets || ["", "", ""])];
    bullets[bi] = val;
    onChange({ ...exp, bullets });
  };
  return (
    <div style={{ background: "#f8fafc", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 12, padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>Experience #{idx + 1}</div>
        <button onClick={onRemove} style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 7, color: "#f87171", cursor: "pointer", fontSize: 11, padding: "4px 10px" }}>Remove</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Job Title *</div>
          <input className="dark-input" style={{ width: "100%" }} value={exp.title || ""} onChange={e => onChange({ ...exp, title: e.target.value })} placeholder="e.g. Data Analyst" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Company *</div>
          <input className="dark-input" style={{ width: "100%" }} value={exp.company || ""} onChange={e => onChange({ ...exp, company: e.target.value })} placeholder="e.g. Acme Corp" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Location</div>
          <input className="dark-input" style={{ width: "100%" }} value={exp.location || ""} onChange={e => onChange({ ...exp, location: e.target.value })} placeholder="e.g. Bangalore, India" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Start</div>
            <input className="dark-input" style={{ width: "100%" }} value={exp.start || ""} onChange={e => onChange({ ...exp, start: e.target.value })} placeholder="Jan 2022" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>End</div>
            <input className="dark-input" style={{ width: "100%" }} value={exp.end || ""} onChange={e => onChange({ ...exp, end: e.target.value })} placeholder="Present" />
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>Key Achievements / Responsibilities <span style={{ color: "#475569" }}>(use action verbs + numbers)</span></div>
      {[0, 1, 2, 3].map(bi => (
        <input key={bi} className="dark-input" style={{ width: "100%", marginBottom: 6 }} value={(exp.bullets || [])[bi] || ""} onChange={e => updateBullet(bi, e.target.value)} placeholder={["• Increased revenue by X% by implementing...", "• Built / Designed / Led / Managed...", "• Collaborated with cross-functional teams to...", "• Reduced cost / time by X% through..."][bi]} />
      ))}
    </div>
  );
}

// ─── ATS Resume Maker Page ────────────────────────────────────────────────────
// ─── ATS Landing Page with Template Gallery ───────────────────────────────────


function ATSLandingPage({ onMode, onTemplate }) {
  // TWO main modes: "ats_score" | "build" | null
  const [mainMode, setMainMode] = useState(null);

  if (mainMode === "ats_score") return <ATSScoreChecker onBack={() => setMainMode(null)} />;
  if (mainMode === "build")     return <TemplateGallery onBack={() => setMainMode(null)} onTemplate={onTemplate} onScratch={() => onMode("build")} />;

  return (
    <div className="fade-up" style={{ maxWidth:900, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <div style={{ width:64, height:64, borderRadius:18, background:"var(--teal)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 16px", boxShadow:"0 6px 24px rgba(13,148,136,.3)" }}>📄</div>
        <h1 style={{ fontSize:36, fontWeight:800, color:"#0f172a", letterSpacing:"-.8px", marginBottom:10 }}>Resume Maker</h1>
        <p style={{ fontSize:16, color:"#475569", maxWidth:480, margin:"0 auto", lineHeight:1.7 }}>
          ATS-powered resume tools. Check your score or build a new resume from 150 professional templates.
        </p>
      </div>

      {/* 2 big option cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:40 }} className="two-col">

        {/* Option 1: ATS Score Checker */}
        <button onClick={() => setMainMode("ats_score")}
          style={{ background:"white", border:"2px solid rgba(0,0,0,.08)", borderRadius:20, padding:"36px 32px", textAlign:"left", cursor:"pointer", transition:"all .2s", display:"flex", flexDirection:"column", gap:0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="var(--teal)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(13,148,136,.15)"; e.currentTarget.style.transform="translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(0,0,0,.08)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}>
          <div style={{ width:60, height:60, borderRadius:16, background:"rgba(13,148,136,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, marginBottom:20 }}>🎯</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:8, letterSpacing:"-.3px" }}>Check ATS Score</div>
          <div style={{ fontSize:14, color:"#475569", lineHeight:1.7, marginBottom:20 }}>
            Upload your existing resume PDF. Get an instant ATS score, see what keywords you're missing, and get ranked suggestions to improve it.
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
            {["📊 0–100 ATS Score","🔍 Keyword Analysis","💡 Fix Suggestions","📈 Section Breakdown"].map(f=>(
              <span key={f} style={{ padding:"4px 11px", background:"rgba(13,148,136,.08)", borderRadius:20, fontSize:12, fontWeight:600, color:"var(--teal)" }}>{f}</span>
            ))}
          </div>
          <div style={{ marginTop:"auto", display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700, color:"var(--teal)" }}>
            Check my score → <span style={{ fontSize:18 }}>→</span>
          </div>
        </button>

        {/* Option 2: Build from Scratch */}
        <button onClick={() => setMainMode("build")}
          style={{ background:"white", border:"2px solid rgba(0,0,0,.08)", borderRadius:20, padding:"36px 32px", textAlign:"left", cursor:"pointer", transition:"all .2s", display:"flex", flexDirection:"column" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="#4f46e5"; e.currentTarget.style.boxShadow="0 8px 32px rgba(79,70,229,.15)"; e.currentTarget.style.transform="translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(0,0,0,.08)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}>
          <div style={{ width:60, height:60, borderRadius:16, background:"rgba(79,70,229,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, marginBottom:20 }}>✍️</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:8, letterSpacing:"-.3px" }}>Build from Scratch</div>
          <div style={{ fontSize:14, color:"#475569", lineHeight:1.7, marginBottom:20 }}>
            Choose from 150 professional templates across 15 categories. Fill in your details with live ATS scoring as you type.
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
            {["📋 150 Templates","🏷️ 15 Categories","⚡ Live ATS Score","💾 PDF Export"].map(f=>(
              <span key={f} style={{ padding:"4px 11px", background:"rgba(79,70,229,.08)", borderRadius:20, fontSize:12, fontWeight:600, color:"#4f46e5" }}>{f}</span>
            ))}
          </div>
          <div style={{ marginTop:"auto", display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700, color:"#4f46e5" }}>
            Browse templates → <span style={{ fontSize:18 }}>→</span>
          </div>
        </button>
      </div>

      {/* Import option */}
      <div style={{ background:"#f8fafc", border:"1.5px dashed rgba(0,0,0,.12)", borderRadius:14, padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:28 }}>📂</span>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Already have a resume PDF?</div>
            <div style={{ fontSize:13, color:"#475569", marginTop:2 }}>Import it to pre-fill the builder and get an instant ATS score.</div>
          </div>
        </div>
        <button onClick={() => onMode("import")}
          style={{ padding:"10px 22px", background:"var(--teal)", border:"none", borderRadius:10, color:"white", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(13,148,136,.3)" }}>
          Import PDF →
        </button>
      </div>
    </div>
  );
}

// ─── ATS Score Checker (Option 1) ─────────────────────────────────────────────
function ATSScoreChecker({ onBack }) {
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");

  const handleCheck = async () => {
    if (!file) return;
    try {
      setLoading(true); setError("");
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${API}/ats/import-resume/`, fd);
      setResult(res.data.ats_result);
    } catch (e) {
      setError("Could not analyse the PDF. Make sure it's a text-based (not scanned) PDF.");
    } finally { setLoading(false); }
  };

  const scoreColor = result ? (result.score >= 80 ? "#059669" : result.score >= 60 ? "var(--teal)" : result.score >= 40 ? "#d97706" : "#dc2626") : "var(--teal)";

  return (
    <div className="fade-up" style={{ maxWidth:720, margin:"0 auto" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#475569", fontSize:13, cursor:"pointer", marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>← Back to Resume Maker</button>
      <h2 style={{ fontSize:28, fontWeight:800, color:"#0f172a", marginBottom:6, letterSpacing:"-.4px" }}>ATS Score Checker</h2>
      <p style={{ color:"#475569", fontSize:14, marginBottom:32, lineHeight:1.7 }}>Upload your resume PDF to get an instant ATS score, keyword analysis, and ranked improvement suggestions.</p>

      {!result ? (
        <>
          <label style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"56px 32px", border:`2px dashed ${file ? "var(--teal)" : "rgba(0,0,0,.12)"}`, borderRadius:18, cursor:"pointer", background:file ? "rgba(13,148,136,.04)" : "white", transition:"all .2s" }}
            onMouseEnter={e => { if (!file) { e.currentTarget.style.borderColor="var(--teal)"; e.currentTarget.style.background="rgba(13,148,136,.03)"; }}}
            onMouseLeave={e => { if (!file) { e.currentTarget.style.borderColor="rgba(0,0,0,.12)"; e.currentTarget.style.background="white"; }}}>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display:"none" }} />
            <div style={{ fontSize:40, opacity:file ? 1 : .4 }}>📄</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:700, color:file ? "var(--teal)" : "#374151", marginBottom:5 }}>{file ? file.name : "Click to upload your resume"}</div>
              <div style={{ fontSize:13, color:"#94a3b8" }}>PDF files only · Text-based (not scanned)</div>
            </div>
          </label>

          {error && <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(220,38,38,.07)", border:"1px solid rgba(220,38,38,.2)", borderRadius:9, fontSize:13, color:"#dc2626" }}>⚠ {error}</div>}

          <button onClick={handleCheck} disabled={!file || loading}
            style={{ marginTop:16, width:"100%", padding:"14px", background:"var(--teal)", border:"none", borderRadius:12, color:"white", fontSize:15, fontWeight:700, cursor:!file||loading?"not-allowed":"pointer", opacity:!file||loading?.5:1, display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 16px rgba(13,148,136,.3)", transition:"all .15s" }}>
            {loading ? <><span className="spinner" />Analysing your resume…</> : "Check ATS Score →"}
          </button>
        </>
      ) : (
        <div className="fade-in">
          {/* Score hero */}
          <div style={{ background:"white", border:"2px solid rgba(0,0,0,.08)", borderRadius:20, padding:"32px", textAlign:"center", marginBottom:20, boxShadow:"0 4px 24px rgba(0,0,0,.06)" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
              <ATSScoreRing score={result.score} />
            </div>
            <div style={{ fontSize:24, fontWeight:800, color:scoreColor, marginBottom:6 }}>{result.grade}</div>
            <div style={{ fontSize:14, color:"#475569" }}>Your resume scored <strong style={{ color:scoreColor }}>{result.score}/100</strong> on ATS systems</div>

            {result.word_count && <div style={{ marginTop:10, fontSize:12, color:"#94a3b8" }}>Word count: {result.word_count} · Extraction: {result.extraction_method}</div>}
          </div>

          {/* Score breakdown */}
          <div style={{ background:"white", border:"1.5px solid rgba(0,0,0,.08)", borderRadius:16, padding:"20px 24px", marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase", marginBottom:16 }}>Score Breakdown</div>
            {Object.values(result.breakdown || {}).map(bd => {
              const pct = bd.max > 0 ? (bd.score / bd.max) * 100 : 0;
              const bc = pct >= 75 ? "#059669" : pct >= 50 ? "var(--teal)" : pct >= 30 ? "#d97706" : "#dc2626";
              return (
                <div key={bd.label} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>{bd.label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:bc }}>{bd.score}/{bd.max}</span>
                  </div>
                  <div style={{ height:6, background:"rgba(0,0,0,.06)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:bc, borderRadius:4, transition:"width .8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two column: keywords + suggestions */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }} className="two-col">
            {/* Keywords */}
            <div style={{ background:"white", border:"1.5px solid rgba(0,0,0,.08)", borderRadius:16, padding:"20px 24px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase", marginBottom:14 }}>Keywords Found</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                {(result.keyword_hits || []).slice(0,12).map((kw,i) => (
                  <span key={i} style={{ padding:"3px 9px", background:"rgba(5,150,105,.08)", border:"1px solid rgba(5,150,105,.2)", borderRadius:5, fontSize:11, color:"#059669", fontWeight:600 }}>✓ {kw}</span>
                ))}
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase", marginBottom:10 }}>Missing Keywords</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {(result.keyword_gaps || []).slice(0,10).map((kw,i) => (
                  <span key={i} style={{ padding:"3px 9px", background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.15)", borderRadius:5, fontSize:11, color:"#dc2626", fontWeight:600 }}>✗ {kw}</span>
                ))}
              </div>
            </div>

            {/* Top suggestions */}
            <div style={{ background:"white", border:"1.5px solid rgba(0,0,0,.08)", borderRadius:16, padding:"20px 24px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase", marginBottom:14 }}>Top Fixes (by impact)</div>
              {(result.suggestions || []).slice(0,5).map((s,i) => {
                const ic = s.impact >= 5 ? "#dc2626" : s.impact >= 3 ? "#d97706" : "var(--teal)";
                return (
                  <div key={i} style={{ padding:"10px 12px", background:"#f8fafc", border:`1px solid ${ic}22`, borderRadius:9, marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:ic, textTransform:"uppercase", letterSpacing:".5px" }}>{s.section}</span>
                      {s.impact > 0 && <span style={{ fontSize:11, fontWeight:700, color:ic }}>+{s.impact}pts</span>}
                    </div>
                    <div style={{ fontSize:12, color:"#475569", lineHeight:1.5 }}>{s.fix}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Issues */}
          {result.issues?.length > 0 && (
            <div style={{ background:"rgba(220,38,38,.04)", border:"1px solid rgba(220,38,38,.12)", borderRadius:14, padding:"16px 20px", marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#dc2626", textTransform:"uppercase", letterSpacing:".5px", marginBottom:10 }}>Issues Found ({result.issues.length})</div>
              {result.issues.map((iss,i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontSize:13, color:"#374151" }}>
                  <span style={{ color:"#dc2626", flexShrink:0 }}>⚠</span>{iss}
                </div>
              ))}
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => { setResult(null); setFile(null); }} className="btn-ghost" style={{ flex:1, padding:"12px", textAlign:"center" }}>Check Another Resume</button>
            <button onClick={onBack} style={{ flex:1, padding:"12px", background:"var(--teal)", border:"none", borderRadius:10, color:"white", fontWeight:700, cursor:"pointer" }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Template Gallery (Option 2) ──────────────────────────────────────────────
function TemplateGallery({ onBack, onTemplate, onScratch }) {
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch]       = useState("");
  const [preview, setPreview]     = useState(null);
  const [hovered, setHovered]     = useState(null);

  const filtered = RESUME_TEMPLATES.filter(t => {
    const mc = filterCat === "All" || t.category === filterCat;
    const ms = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(g => g.toLowerCase().includes(search.toLowerCase())) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const MiniResume = ({ tpl }) => {
    const r = tpl.resume, c = tpl.color;
    return (
      <div style={{ height:160, background:"white", overflow:"hidden", fontFamily:"Arial,sans-serif", fontSize:4.5, lineHeight:1.4, padding:"9px 10px", position:"relative" }}>
        <div style={{ borderBottom:`1.5px solid ${c}`, paddingBottom:4, marginBottom:4 }}>
          <div style={{ fontWeight:700, fontSize:6.5, color:"#0f172a" }}>Your Name</div>
          <div style={{ color:"#64748b", fontSize:4, marginTop:1 }}>{r.personal.email || "you@email.com"} · {r.personal.phone || "+91 98765 43210"}</div>
        </div>
        {r.summary && <div style={{ marginBottom:4 }}>
          <div style={{ fontWeight:700, fontSize:5, color:c, textTransform:"uppercase", letterSpacing:".3px", marginBottom:1 }}>Summary</div>
          <div style={{ color:"#374151" }}>{r.summary.slice(0,100)}…</div>
        </div>}
        {r.experience?.[0] && <div style={{ marginBottom:4 }}>
          <div style={{ fontWeight:700, fontSize:5, color:c, textTransform:"uppercase", letterSpacing:".3px", marginBottom:1 }}>Experience</div>
          <div style={{ fontWeight:700, color:"#0f172a" }}>{r.experience[0].title}</div>
          <div style={{ color:"#64748b" }}>{r.experience[0].company}</div>
        </div>}
        <div>
          <div style={{ fontWeight:700, fontSize:5, color:c, textTransform:"uppercase", letterSpacing:".3px", marginBottom:1 }}>Skills</div>
          <div style={{ color:"#374151" }}>{[...r.skills.technical,...r.skills.tools].slice(0,5).join(" · ")}</div>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${c},${c}66)` }} />
      </div>
    );
  };

  return (
    <div className="fade-up">
      {/* Preview modal */}
      {preview && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}
          onClick={() => setPreview(null)}>
          <div style={{ background:"white", borderRadius:20, overflow:"hidden", maxWidth:640, width:"100%", maxHeight:"90vh", display:"flex", flexDirection:"column" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(0,0,0,.08)", display:"flex", justifyContent:"space-between", alignItems:"center", background:`${preview.color}08`, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:preview.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{preview.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:16, color:"#0f172a" }}>{preview.name}</div>
                  <div style={{ fontSize:12, color:"#64748b" }}>{preview.category} · {preview.tags.join(", ")}</div>
                </div>
              </div>
              <button onClick={() => setPreview(null)} style={{ background:"rgba(0,0,0,.06)", border:"none", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13, color:"#64748b" }}>✕ Close</button>
            </div>
            <div style={{ overflowY:"auto", flex:1, padding:20, background:"#f8fafc" }}>
              <div style={{ background:"white", borderRadius:10, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.08)" }}>
                <ResumePreview resume={preview.resume} />
              </div>
            </div>
            <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(0,0,0,.08)", display:"flex", gap:10, flexShrink:0 }}>
              <button onClick={() => setPreview(null)} className="btn-ghost" style={{ flex:1, padding:"11px", textAlign:"center" }}>Cancel</button>
              <button onClick={() => { onTemplate(preview); setPreview(null); }}
                style={{ flex:2, padding:"11px", background:preview.color, border:"none", borderRadius:9, fontSize:14, fontWeight:700, color:"white", cursor:"pointer" }}>
                Use This Template →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#475569", fontSize:13, cursor:"pointer", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>← Back</button>
          <h2 style={{ fontSize:28, fontWeight:800, color:"#0f172a", letterSpacing:"-.4px" }}>Choose a Template</h2>
          <p style={{ fontSize:14, color:"#475569", marginTop:4 }}>150 professional templates across 15 categories</p>
        </div>
        <button onClick={onScratch} style={{ padding:"10px 20px", background:"white", border:"1.5px solid rgba(0,0,0,.12)", borderRadius:10, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
          Skip — blank resume
        </button>
      </div>

      {/* Search + filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:220 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"#94a3b8", pointerEvents:"none" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by role, skill, or category…"
            style={{ width:"100%", padding:"10px 13px 10px 36px", background:"white", border:"1.5px solid rgba(0,0,0,.1)", borderRadius:10, fontSize:13, color:"#0f172a", outline:"none" }}
            onFocus={e => { e.target.style.borderColor="var(--teal)"; e.target.style.boxShadow="0 0 0 3px rgba(13,148,136,.1)"; }}
            onBlur={e => { e.target.style.borderColor="rgba(0,0,0,.1)"; e.target.style.boxShadow="none"; }} />
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {TEMPLATE_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{ padding:"7px 13px", border:`1.5px solid ${filterCat===cat?"var(--teal)":"rgba(0,0,0,.1)"}`, borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s", background:filterCat===cat?"rgba(13,148,136,.08)":"white", color:filterCat===cat?"var(--teal)":"#475569" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:18 }}>Showing <strong style={{ color:"#374151" }}>{filtered.length}</strong> templates{search ? ` for "${search}"` : ""}</div>

      {/* Template grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:14 }}>
        {filtered.map(tpl => (
          <div key={tpl.id}
            onMouseEnter={() => setHovered(tpl.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ background:"white", border:`2px solid ${hovered===tpl.id?tpl.color:"rgba(0,0,0,.08)"}`, borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"all .2s", transform:hovered===tpl.id?"translateY(-3px)":"none", boxShadow:hovered===tpl.id?`0 8px 24px ${tpl.color}25`:"0 1px 4px rgba(0,0,0,.05)" }}>

            {/* Mini resume preview */}
            <div style={{ position:"relative", borderBottom:`1px solid ${tpl.color}20` }} onClick={() => setPreview(tpl)}>
              <MiniResume tpl={tpl} />
              {tpl.badge && (
                <div style={{ position:"absolute", top:8, left:8, padding:"2px 8px", background:tpl.color, borderRadius:20, fontSize:9, fontWeight:700, color:"white" }}>{tpl.badge}</div>
              )}
              <div style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:"50%", background:tpl.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{tpl.icon}</div>
              {/* Preview hover overlay */}
              {hovered===tpl.id && (
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"white", fontSize:12, fontWeight:700, background:"rgba(0,0,0,.6)", padding:"4px 10px", borderRadius:6 }}>👁 Preview</span>
                </div>
              )}
            </div>

            {/* Info + use button */}
            <div style={{ padding:"10px 12px 12px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:2 }}>{tpl.name}</div>
              <div style={{ fontSize:11, color:"#64748b", marginBottom:8 }}>{tpl.category}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
                {tpl.tags.slice(0,2).map(tag => (
                  <span key={tag} style={{ padding:"2px 6px", background:`${tpl.color}12`, border:`1px solid ${tpl.color}25`, borderRadius:4, fontSize:10, color:tpl.color, fontWeight:600 }}>{tag}</span>
                ))}
              </div>
              <button onClick={() => onTemplate(tpl)}
                style={{ width:"100%", padding:"8px", background:tpl.color, border:"none", borderRadius:8, fontSize:12, fontWeight:700, color:"white", cursor:"pointer", transition:"opacity .15s" }}
                onMouseEnter={e => e.currentTarget.style.opacity=".85"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                Use Template →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ATSPage() {
  const [atsMode, setAtsMode] = useState(null); // null | "import" | "build"
  const [resume, setResume] = useState(EMPTY_RESUME);
  const [activeSection, setActiveSection] = useState("personal");
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [resumeStyle, setResumeStyle] = useState("vs3"); // default: Classic Blue

  // Backend ATS analysis
  const [atsResult, setAtsResult] = useState(null);   // full backend result
  const [analysing, setAnalysing] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  // skill input states
  const [newTech, setNewTech] = useState("");
  const [newSoft, setNewSoft] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newCert, setNewCert] = useState({ name: "", issuer: "", year: "" });
  const [newLang, setNewLang] = useState({ lang: "", level: "Fluent" });

  const localScore = computeLocalScore(resume);
  const displayScore = atsResult ? atsResult.score : localScore;

  // ── Call backend to score resume ─────────────────────────────────────────
  const analyseResume = async () => {
    try {
      setAnalysing(true);
      const res = await axios.post(`${API}/ats/score/`, resume);
      setAtsResult(res.data);
    } catch (e) {
      console.error("ATS score failed", e);
    } finally {
      setAnalysing(false);
    }
  };

  // Auto-analyse when user hasn't changed the resume for 2 seconds
  const debounceRef = useRef(null);
  useEffect(() => {
    if (atsMode !== "build") return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (resume.personal.name || resume.summary || resume.experience.length) {
        analyseResume();
      }
    }, 2000);
    return () => clearTimeout(debounceRef.current);
  }, [resume, atsMode]);

  const updatePersonal = (k, v) => setResume(r => ({ ...r, personal: { ...r.personal, [k]: v } }));
  const updateSkills = (cat, fn) => setResume(r => ({ ...r, skills: { ...r.skills, [cat]: fn(r.skills[cat]) } }));

  const addExp = () => setResume(r => ({ ...r, experience: [...r.experience, { title: "", company: "", location: "", start: "", end: "", bullets: ["", "", ""] }] }));
  const updateExp = (i, val) => setResume(r => ({ ...r, experience: r.experience.map((e, idx) => idx === i ? val : e) }));
  const removeExp = (i) => setResume(r => ({ ...r, experience: r.experience.filter((_, idx) => idx !== i) }));

  const addEdu = () => setResume(r => ({ ...r, education: [...r.education, { degree: "", field: "", school: "", year: "", gpa: "" }] }));
  const updateEdu = (i, k, v) => setResume(r => ({ ...r, education: r.education.map((e, idx) => idx === i ? { ...e, [k]: v } : e) }));
  const removeEdu = (i) => setResume(r => ({ ...r, education: r.education.filter((_, idx) => idx !== i) }));

  const addProject = () => setResume(r => ({ ...r, projects: [...r.projects, { name: "", stack: "", description: "", url: "" }] }));
  const applyTemplate = (tpl) => setResume(tpl.resume);
  const updateProject = (i, k, v) => setResume(r => ({ ...r, projects: r.projects.map((p, idx) => idx === i ? { ...p, [k]: v } : p) }));
  const removeProject = (i) => setResume(r => ({ ...r, projects: r.projects.filter((_, idx) => idx !== i) }));

  // ── Import ────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!importFile) return;
    try {
      setImporting(true);
      setImportStatus("Parsing your resume…");
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await axios.post(`${API}/ats/import-resume/`, fd);
      const d = res.data;
      // Merge extracted data into resume state
      setResume(r => ({
        ...r,
        personal: { ...r.personal, ...d.resume.personal },
        summary:  d.resume.summary || r.summary,
        skills:   d.resume.skills,
      }));
      if (d.ats_result) setAtsResult(d.ats_result);
      setImportStatus(`✅ Imported ${d.raw_skills?.length || 0} skills. ${d.parse_note}`);
      setAtsMode("build");
    } catch {
      setImportStatus("⚠️ Could not parse the PDF fully — you can fill in details manually.");
      setAtsMode("build");
    } finally {
      setImporting(false);
    }
  };

  const SECTIONS = [
    { key: "personal",  label: "Personal Info", icon: "👤" },
    { key: "summary",   label: "Summary",       icon: "📝" },
    { key: "experience",label: "Experience",    icon: "💼" },
    { key: "education", label: "Education",     icon: "🎓" },
    { key: "skills",    label: "Skills",        icon: "🛠" },
    { key: "certs",     label: "Certifications",icon: "🏅" },
    { key: "projects",  label: "Projects",      icon: "🚀" },
    { key: "languages", label: "Languages",     icon: "🌐" },
  ];

  // ── Score color ───────────────────────────────────────────────────────────
  const scoreColor = displayScore >= 80 ? "#22c55e" : displayScore >= 60 ? "#facc15" : displayScore >= 40 ? "#fb923c" : "#f87171";

  // ── Mode selector + Template picker ─────────────────────────────────────
  if (!atsMode) return <ATSLandingPage onMode={setAtsMode} onTemplate={(tpl) => { applyTemplate(tpl); setAtsMode("build"); }} />;

  // ── Import mode ───────────────────────────────────────────────────────────
  if (atsMode === "import" && !resume.personal.email && !resume.experience.length) return (
    <div className="fade-up" style={{ maxWidth: 520, margin: "0 auto" }}>
      <button onClick={() => setAtsMode(null)} style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
      <h2 style={{ fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 8, letterSpacing: "-.5px" }}>Import your resume</h2>
      <p style={{ color: "#475569", fontSize: 13, marginBottom: 32, lineHeight: 1.7 }}>We'll score your current resume instantly and show exactly what to fix to boost your ATS score.</p>

      <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "44px 32px", border: "1px dashed rgba(99,102,241,.35)", borderRadius: 18, cursor: "pointer", background: "rgba(99,102,241,.03)", transition: "all .25s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,.6)"; e.currentTarget.style.background = "rgba(13,148,136,.07)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,.35)"; e.currentTarget.style.background = "rgba(99,102,241,.03)"; }}>
        <input type="file" accept=".pdf" onChange={e => setImportFile(e.target.files[0])} style={{ display: "none" }} />
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--teal-glow)", border: "1px solid rgba(99,102,241,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📄</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: importFile ? "var(--teal)" : "var(--text2)", marginBottom: 5 }}>{importFile ? importFile.name : "Click to select your resume"}</div>
          <div style={{ fontSize: 12, color: "#475569" }}>PDF files only</div>
        </div>
      </label>

      {importStatus && <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(13,148,136,.08)", borderRadius: 10, fontSize: 12, color: "var(--teal)", lineHeight: 1.6 }}>{importStatus}</div>}

      <button onClick={handleImport} disabled={importing || !importFile} style={{ marginTop: 14, width: "100%", padding: "15px", background: "var(--teal)", border: "none", borderRadius: 13, fontSize: 15, fontWeight: 700, color: "white", cursor: importing || !importFile ? "not-allowed" : "pointer", opacity: importing || !importFile ? .5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
        {importing ? <><Spinner />Analysing…</> : "Import & Score →"}
      </button>

      <button onClick={() => setAtsMode("build")} style={{ marginTop: 10, width: "100%", padding: "12px", background: "transparent", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 13, fontSize: 13, color: "#475569", cursor: "pointer" }}>
        Skip — build from scratch
      </button>
    </div>
  );

  // ── Builder mode ──────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button onClick={() => setAtsMode(null)} style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>← Resume Maker</button>
          <h2 style={{ fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-.4px" }}>Build your resume</h2>
          {atsResult && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Detected role: <span style={{ color: "var(--teal)" }}>{atsResult.detected_roles?.join(", ")}</span></div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={analyseResume} disabled={analysing} style={{ padding: "9px 18px", background: "rgba(13,148,136,.08)", border: "1px solid rgba(99,102,241,.3)", borderRadius: 10, color: "var(--teal)", fontSize: 13, fontWeight: 600, cursor: analysing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            {analysing ? <><Spinner />Analysing…</> : "🔍 Analyse Resume"}
          </button>
          <button onClick={() => setShowPreview(p => !p)} style={{ padding: "9px 18px", background: showPreview ? "rgba(13,148,136,.2)" : "var(--bg2)", border: `1px solid ${showPreview ? "rgba(13,148,136,.4)" : "rgba(0,0,0,.06)"}`, borderRadius: 10, color: showPreview ? "var(--teal)" : "var(--text2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {showPreview ? "✏️ Edit" : "👁 Preview"}
          </button>
        </div>
      </div>

      <div className="ats-cols" style={{ display: "flex", gap: 20 }}>

        {/* ── Left panel: score + suggestions ── */}
        {!showPreview && (
          <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Score card */}
            <div style={{ background: "#ffffff", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
              <ATSScoreRing score={displayScore} />
              {analysing && <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>Updating score…</div>}
              {atsResult && (
                <div style={{ marginTop: 10, display: "flex", gap: 6, justifyContent: "center" }}>
                  <button onClick={() => setShowBreakdown(b => !b)} style={{ padding: "5px 11px", background: "#f8fafc", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 7, fontSize: 11, color: "#475569", cursor: "pointer" }}>
                    {showBreakdown ? "▲ Hide" : "Breakdown"}
                  </button>
                  <button onClick={() => setShowKeywords(b => !b)} style={{ padding: "5px 11px", background: "#f8fafc", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 7, fontSize: 11, color: "#475569", cursor: "pointer" }}>
                    Keywords
                  </button>
                </div>
              )}
            </div>

            {/* Section breakdown */}
            {showBreakdown && atsResult && (
              <div style={{ background: "#ffffff", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>Score Breakdown</div>
                {Object.entries(atsResult.breakdown).map(([key, val]) => {
                  const pct = val.max > 0 ? (val.score / val.max) * 100 : 0;
                  const barColor = pct >= 75 ? "#22c55e" : pct >= 50 ? "#facc15" : "#f87171";
                  return (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "#475569" }}>{val.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{val.score}/{val.max}</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(0,0,0,.06)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width .6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Keyword gaps */}
            {showKeywords && atsResult && (
              <div style={{ background: "#ffffff", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Missing Keywords</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {atsResult.keyword_gaps.slice(0, 8).map((kw, i) => (
                    <span key={i} style={{ padding: "3px 8px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 6, fontSize: 10, color: "#fca5a5" }}>{kw}</span>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Found Keywords</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {atsResult.keyword_hits.slice(0, 8).map((kw, i) => (
                    <span key={i} style={{ padding: "3px 8px", background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 6, fontSize: 10, color: "#86efac" }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div style={{ background: "#ffffff", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
                {atsResult ? "Top Fixes (by impact)" : "Quick Tips"}
              </div>
              <ATSSuggestions atsResult={atsResult} localScore={localScore} />
            </div>

            {/* Section nav */}
            <div style={{ background: "#ffffff", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 14, overflow: "hidden" }}>
              {SECTIONS.map(s => (
                <button key={s.key} onClick={() => setActiveSection(s.key)} className="nav-btn"
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", border: "none", borderBottom: "1px solid var(--sb-border)", textAlign: "left", background: activeSection === s.key ? "var(--teal-glow)" : "transparent", cursor: "pointer", position: "relative" }}>
                  {activeSection === s.key && <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, background: "var(--teal)", borderRadius: "0 3px 3px 0" }} />}
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: activeSection === s.key ? 700 : 500, color: activeSection === s.key ? "var(--teal)" : "var(--text2)", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>{s.label}</span>
                  {/* Show section score badge if we have breakdown */}
                  {atsResult && (() => {
                    const key = { personal: "contact_info", summary: "summary", experience: "experience", education: "education", skills: "skills", certs: "certifications", projects: "projects", languages: null }[s.key];
                    if (!key) return null;
                    const bd = atsResult.breakdown[key];
                    if (!bd) return null;
                    const pct = Math.round((bd.score / bd.max) * 100);
                    const c = pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--yellow)" : "var(--red)";
                    return <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: c }}>{pct}%</span>;
                  })()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Right: form or preview ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {showPreview ? (
            <div style={{ border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid var(--sb-border)" }}>
                <StylePicker activeId={resumeStyle} onChange={setResumeStyle} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>resume_preview.pdf</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ATSScoreRing score={displayScore} />
                    {atsResult && <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor }}>ATS: {atsResult.grade}</span>}
                  </div>
                </div>
              </div>
              <ResumePreview resume={resume} styleId={resumeStyle} />
              {/* Issues summary below preview */}
              {atsResult && atsResult.issues.length > 0 && (
                <div style={{ padding: 16, background: "rgba(239,68,68,.04)", borderTop: "1px solid rgba(239,68,68,.12)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".5px" }}>Issues found ({atsResult.issues.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {atsResult.issues.map((issue, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#fca5a5", display: "flex", gap: 7 }}>
                        <span style={{ flexShrink: 0, color: "#f87171" }}>⚠</span>{issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="slide-in">
              {/* ── Personal ── */}
              {activeSection === "personal" && (
                <div className="section-card">
                  <Label>Personal Information</Label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[["name","Full Name","e.g. Rahul Sharma"],["email","Email","rahul@email.com"],["phone","Phone","+91 98765 43210"],["location","Location","Bangalore, India"],["linkedin","LinkedIn URL","linkedin.com/in/rahul"],["portfolio","Portfolio / GitHub","github.com/rahul"]].map(([k, label, ph]) => (
                      <div key={k}>
                        <div style={{ fontSize: 11, color: "#475569", marginBottom: 5 }}>{label} {["name","email"].includes(k) && <span style={{ color: "#f87171" }}>*</span>}</div>
                        <input className="dark-input" style={{ width: "100%" }} value={resume.personal[k] || ""} onChange={e => updatePersonal(k, e.target.value)} placeholder={ph} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.15)", borderRadius: 10, fontSize: 12, color: "#86efac" }}>
                    💡 <strong>ATS tip:</strong> Use a professional email. LinkedIn URL adds a strong trust signal. Avoid nicknames in email.
                  </div>
                </div>
              )}

              {/* ── Summary ── */}
              {activeSection === "summary" && (
                <div className="section-card">
                  <Label>Professional Summary</Label>
                  <p style={{ fontSize: 12, color: "#475569", marginBottom: 12, lineHeight: 1.6 }}>Write 3–5 sentences: who you are, your top skills, years of experience and what you bring. Mirror keywords from job descriptions you're targeting.</p>
                  <textarea className="dark-textarea" rows={6} value={resume.summary} onChange={e => setResume(r => ({ ...r, summary: e.target.value }))} placeholder="Results-driven Data Analyst with 2+ years of experience in SQL, Python and Power BI. Proven track record of delivering actionable business insights that increased revenue by 20%. Skilled in data wrangling, visualization and cross-functional stakeholder communication…" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: "#475569" }}>{resume.summary.split(/\s+/).filter(Boolean).length} words</span>
                    <span style={{ fontSize: 11, color: resume.summary.split(/\s+/).filter(Boolean).length >= 60 ? "#22c55e" : "#f87171" }}>
                      {resume.summary.split(/\s+/).filter(Boolean).length >= 60 ? "✅ Good length" : "Aim for 60–120 words"}
                    </span>
                  </div>
                  <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--teal-soft)", border: "1px solid rgba(99,102,241,.15)", borderRadius: 10, fontSize: 12, color: "var(--teal)" }}>
                    💡 <strong>ATS tip:</strong> Mirror exact keywords from the job description. ATS systems match your summary against requirements first. Include: role title, years of experience, 2–3 skills, and one metric.
                  </div>
                </div>
              )}

              {/* ── Experience ── */}
              {activeSection === "experience" && (
                <div>
                  {resume.experience.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", border: "1px dashed var(--border2)", borderRadius: 14, marginBottom: 14, color: "#475569" }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>💼</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No experience added yet</div>
                      <div style={{ fontSize: 12 }}>Click below to add work experience</div>
                    </div>
                  )}
                  {resume.experience.map((exp, i) => (
                    <ExpEntry key={i} exp={exp} idx={i} onChange={v => updateExp(i, v)} onRemove={() => removeExp(i)} />
                  ))}
                  <button onClick={addExp} style={{ width: "100%", padding: "13px", background: "rgba(13,148,136,.1)", border: "1px dashed var(--border2)", borderRadius: 12, color: "var(--teal)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Experience</button>
                  <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--teal-soft)", border: "1px solid rgba(99,102,241,.15)", borderRadius: 10, fontSize: 12, color: "var(--teal)" }}>
                    💡 <strong>ATS tip:</strong> Start every bullet with an action verb (Built, Led, Increased, Automated). Add measurable results (%, $, users, time saved). ATS scores bullet quality heavily.
                  </div>
                </div>
              )}

              {/* ── Education ── */}
              {activeSection === "education" && (
                <div>
                  {resume.education.map((edu, i) => (
                    <div key={i} style={{ background: "#f8fafc", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 12, padding: 18, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)" }}>Education #{i + 1}</div>
                        <button onClick={() => removeEdu(i)} style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 7, color: "#f87171", cursor: "pointer", fontSize: 11, padding: "4px 10px" }}>Remove</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[["degree","Degree","e.g. B.Tech, B.Sc, MBA"],["field","Field of Study","e.g. Computer Science"],["school","University / College","e.g. IIT Bombay"],["year","Graduation Year","e.g. 2023"],["gpa","GPA / Percentage","e.g. 8.5 / 85%"]].map(([k, label, ph]) => (
                          <div key={k}>
                            <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{label}</div>
                            <input className="dark-input" style={{ width: "100%" }} value={edu[k] || ""} onChange={e => updateEdu(i, k, e.target.value)} placeholder={ph} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={addEdu} style={{ width: "100%", padding: "13px", background: "rgba(13,148,136,.1)", border: "1px dashed var(--border2)", borderRadius: 12, color: "var(--teal)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Education</button>
                </div>
              )}

              {/* ── Skills ── */}
              {activeSection === "skills" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { cat: "technical", label: "Technical Skills", color: "var(--teal)", placeholder: "e.g. Python, SQL, Machine Learning", val: newTech, setVal: setNewTech, tip: "Include exact tool/language names as they appear in job postings." },
                    { cat: "tools", label: "Tools & Platforms", color: "#10b981", placeholder: "e.g. Power BI, Tableau, AWS", val: newTool, setVal: setNewTool, tip: "Tools are strong ATS keywords — list every relevant one you've used." },
                    { cat: "soft", label: "Soft Skills", color: "#f59e0b", placeholder: "e.g. Communication, Leadership", val: newSoft, setVal: setNewSoft, tip: "Soft skills matter less for ATS but help with human review. Keep to 4–6." },
                  ].map(({ cat, label, color, placeholder, val, setVal, tip }) => (
                    <div key={cat} className="section-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <Label>{label}</Label>
                        <span style={{ fontSize: 11, color: "#475569" }}>{resume.skills[cat].length} added</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, minHeight: 28 }}>
                        {resume.skills[cat].length === 0 && <span style={{ fontSize: 12, color: "#475569", fontStyle: "italic" }}>None added yet</span>}
                        {resume.skills[cat].map((s, i) => <Tag key={i} label={s} color={color} onRemove={() => updateSkills(cat, prev => prev.filter((_, idx) => idx !== i))} />)}
                      </div>
                      <AddRow value={val} onChange={setVal} placeholder={placeholder} onAdd={() => { const v = val.trim(); if (v && !resume.skills[cat].includes(v)) updateSkills(cat, prev => [...prev, v]); setVal(""); }} />
                      <div style={{ marginTop: 10, fontSize: 11, color: "#475569" }}>💡 {tip}</div>
                    </div>
                  ))}
                  {/* Missing keyword suggestions from backend */}
                  {atsResult && atsResult.keyword_gaps.length > 0 && (
                    <div style={{ padding: "14px 16px", background: "rgba(239,68,68,.05)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>🎯 ATS says add these keywords to your skills:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {atsResult.keyword_gaps.map((kw, i) => (
                          <button key={i} onClick={() => { if (!resume.skills.technical.includes(kw)) updateSkills("technical", p => [...p, kw]); }}
                            style={{ padding: "4px 10px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 6, fontSize: 11, color: "#fca5a5", cursor: "pointer", fontWeight: 600 }}>
                            + {kw}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>Click a keyword to add it to Technical Skills instantly.</div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Certifications ── */}
              {activeSection === "certs" && (
                <div className="section-card">
                  <Label>Certifications</Label>
                  {resume.certifications.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                      {resume.certifications.map((c, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1.5px solid rgba(0,0,0,.1)" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: "#475569" }}>{c.issuer} {c.year && `· ${c.year}`}</div>
                          </div>
                          <button onClick={() => setResume(r => ({ ...r, certifications: r.certifications.filter((_, idx) => idx !== i) }))} style={{ background: "rgba(239,68,68,.1)", border: "none", borderRadius: 6, color: "#f87171", cursor: "pointer", fontSize: 11, padding: "4px 8px" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <input className="dark-input" placeholder="Certificate name" value={newCert.name} onChange={e => setNewCert(c => ({ ...c, name: e.target.value }))} />
                    <input className="dark-input" placeholder="Issuer (Google, AWS…)" value={newCert.issuer} onChange={e => setNewCert(c => ({ ...c, issuer: e.target.value }))} />
                    <input className="dark-input" placeholder="Year" value={newCert.year} onChange={e => setNewCert(c => ({ ...c, year: e.target.value }))} />
                  </div>
                  <button onClick={() => { if (newCert.name.trim()) { setResume(r => ({ ...r, certifications: [...r.certifications, { ...newCert }] })); setNewCert({ name: "", issuer: "", year: "" }); } }} className="add-btn" style={{ padding: "9px 16px", background: "rgba(59,130,246,.15)", border: "1px solid rgba(59,130,246,.25)", borderRadius: 9, fontSize: 13, color: "#93c5fd", cursor: "pointer", fontWeight: 600 }}>+ Add Certificate</button>
                  <div style={{ marginTop: 14, fontSize: 11, color: "#475569" }}>💡 Google, AWS, Microsoft, Meta, IBM, and Coursera certs carry the strongest ATS weight. Include completion year.</div>
                </div>
              )}

              {/* ── Projects ── */}
              {activeSection === "projects" && (
                <div>
                  {resume.projects.map((pr, i) => (
                    <div key={i} style={{ background: "#f8fafc", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 12, padding: 18, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)" }}>Project #{i + 1}</div>
                        <button onClick={() => removeProject(i)} style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 7, color: "#f87171", cursor: "pointer", fontSize: 11, padding: "4px 10px" }}>Remove</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <div><div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Project Name</div><input className="dark-input" style={{ width: "100%" }} value={pr.name} onChange={e => updateProject(i, "name", e.target.value)} placeholder="e.g. Customer Churn Predictor" /></div>
                        <div><div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Tech Stack</div><input className="dark-input" style={{ width: "100%" }} value={pr.stack} onChange={e => updateProject(i, "stack", e.target.value)} placeholder="Python, Scikit-learn, Streamlit" /></div>
                        <div><div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>URL / GitHub</div><input className="dark-input" style={{ width: "100%" }} value={pr.url} onChange={e => updateProject(i, "url", e.target.value)} placeholder="github.com/you/project" /></div>
                      </div>
                      <div><div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Description (include outcome + metrics)</div><textarea className="dark-textarea" rows={3} value={pr.description} onChange={e => updateProject(i, "description", e.target.value)} placeholder="Built a machine learning pipeline that predicts customer churn with 89% accuracy using XGBoost, reducing retention costs by 15%…" /></div>
                    </div>
                  ))}
                  <button onClick={addProject} style={{ width: "100%", padding: "13px", background: "rgba(13,148,136,.1)", border: "1px dashed var(--border2)", borderRadius: 12, color: "var(--teal)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Project</button>
                </div>
              )}

              {/* ── Languages ── */}
              {activeSection === "languages" && (
                <div className="section-card">
                  <Label>Languages</Label>
                  {resume.languages.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                      {resume.languages.map((l, i) => (
                        <Tag key={i} label={`${l.lang} · ${l.level}`} color="var(--teal)" onRemove={() => setResume(r => ({ ...r, languages: r.languages.filter((_, idx) => idx !== i) }))} />
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Language</div>
                      <input className="dark-input" style={{ width: "100%" }} placeholder="e.g. English" value={newLang.lang} onChange={e => setNewLang(l => ({ ...l, lang: e.target.value }))} />
                    </div>
                    <div style={{ width: 140 }}>
                      <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Proficiency</div>
                      <select value={newLang.level} onChange={e => setNewLang(l => ({ ...l, level: e.target.value }))} style={{ width: "100%", padding: "9px 12px", background: "#f8fafc", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 9, color: "#0f172a", fontSize: 13 }}>
                        {["Native", "Fluent", "Conversational", "Basic"].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <button onClick={() => { if (newLang.lang.trim()) { setResume(r => ({ ...r, languages: [...r.languages, { ...newLang }] })); setNewLang(l => ({ ...l, lang: "" })); } }} className="add-btn" style={{ padding: "9px 16px", background: "rgba(59,130,246,.15)", border: "1px solid rgba(59,130,246,.25)", borderRadius: 9, fontSize: 13, color: "#93c5fd", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>+ Add</button>
                  </div>
                </div>
              )}

              {/* Section nav buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                {SECTIONS.findIndex(s => s.key === activeSection) > 0 ? (
                  <button onClick={() => setActiveSection(SECTIONS[SECTIONS.findIndex(s => s.key === activeSection) - 1].key)} style={{ padding: "10px 20px", background: "#f8fafc", border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 10, color: "#475569", fontSize: 13, cursor: "pointer" }}>← Previous</button>
                ) : <div />}
                {SECTIONS.findIndex(s => s.key === activeSection) < SECTIONS.length - 1 ? (
                  <button onClick={() => setActiveSection(SECTIONS[SECTIONS.findIndex(s => s.key === activeSection) + 1].key)} style={{ padding: "10px 24px", background: "var(--teal)", border: "none", borderRadius: 10, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>Next →</button>
                ) : (
                  <button onClick={() => { setShowPreview(true); analyseResume(); }} style={{ padding: "10px 24px", background: "#22c55e", border: "none", borderRadius: 10, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>Preview & Score ✓</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Live Clock component ──────────────────────────────────────────────────────

export default ATSPage;
