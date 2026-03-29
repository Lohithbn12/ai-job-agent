// ─── ResumeLayouts.jsx ────────────────────────────────────────────────────────
// 6 distinct FlowCV-style resume visual designs.
// Used by ResumeMaker.js: <ResumePreview resume={r} layout={template.layout} color={template.color} />
//
// Layouts:
//   "classic"   — Traditional single-column, serif header  (ATS-safe, formal)
//   "modern"    — Two-column with coloured sidebar         (Tech / Data roles)
//   "minimal"   — Ultra-clean, lots of whitespace          (Design / Creative)
//   "executive" — Bold top banner, accent rules            (Senior / Management)
//   "creative"  — Left accent bar, coloured name block     (Design / Marketing)
//   "compact"   — Dense, info-maximised, no wasted space   (Fresher / short CVs)
//
// Each layout receives:
//   resume  — full resume object (personal, summary, experience, education, skills, …)
//   color   — hex accent colour from the template
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

// ── Shared helpers ────────────────────────────────────────────────────────────
const dot  = (color) => ({ display:"inline-block", width:5, height:5, borderRadius:"50%", background:color, margin:"0 7px 2px" });
const rule = (color, mt=8, mb=8) => <div style={{ height:2, background:color, margin:`${mt}px 0 ${mb}px`, borderRadius:2 }} />;
const thinRule = (color="#e2e8f0", mt=6, mb=6) => <div style={{ height:1, background:color, margin:`${mt}px 0 ${mb}px` }} />;

function ContactRow({ personal, color, sep=" · " }) {
  const items = [
    personal.email, personal.phone, personal.location,
    personal.linkedin && `linkedin.com/in/${personal.linkedin.replace(/.*linkedin\.com\/in\//,"")}`,
    personal.portfolio,
  ].filter(Boolean);
  return (
    <div style={{ fontSize:11, color:"#475569", lineHeight:1.8 }}>
      {items.map((v,i) => <span key={i}>{i>0 && <span style={{ color:"#cbd5e1" }}>{sep}</span>}{v}</span>)}
    </div>
  );
}

function BulletList({ bullets, color }) {
  return (
    <ul style={{ margin:"4px 0 0", paddingLeft:0, listStyle:"none" }}>
      {(bullets||[]).map((b,i) => (
        <li key={i} style={{ display:"flex", gap:7, marginBottom:3, fontSize:12, color:"#374151", lineHeight:1.55 }}>
          <span style={{ color, fontWeight:900, flexShrink:0, marginTop:1 }}>▸</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function SkillPill({ label, color }) {
  return (
    <span style={{ display:"inline-block", padding:"2px 9px", background:color+"18", border:`1px solid ${color}33`,
      color, borderRadius:20, fontSize:10.5, fontWeight:600, marginRight:4, marginBottom:4 }}>
      {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LAYOUT 1 — CLASSIC
// Traditional single-column, centred header, serif-inspired
// Best for: Finance, Legal, Senior Engineering, formal roles
// ════════════════════════════════════════════════════════════════════════════════
function ClassicLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
        <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.2px", color }}>{title}</div>
        <div style={{ flex:1, height:1.5, background:color+"50" }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:12, color:"#1e293b", lineHeight:1.5, padding:"28px 32px", background:"#fff" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:16, borderBottom:`2.5px solid ${color}`, paddingBottom:14 }}>
        <div style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", color:"#0f172a" }}>{r.personal.name}</div>
        <div style={{ fontSize:12, color:"#64748b", margin:"4px 0 6px", fontStyle:"italic" }}>
          {r.experience?.[0]?.title || "Professional"}
        </div>
        <ContactRow personal={r.personal} color={color} sep="  ·  " />
      </div>
      {/* Summary */}
      {r.summary && <S title="Professional Summary"><p style={{ margin:0, fontSize:12, color:"#374151", lineHeight:1.65 }}>{r.summary}</p></S>}
      {/* Experience */}
      {r.experience?.length > 0 && (
        <S title="Experience">
          {r.experience.map((e,i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                <span style={{ fontWeight:700, fontSize:13 }}>{e.title}</span>
                <span style={{ fontSize:10.5, color:"#64748b" }}>{e.start} – {e.end || "Present"}</span>
              </div>
              <div style={{ fontSize:11.5, color, fontStyle:"italic", marginBottom:2 }}>{e.company}{e.location && `, ${e.location}`}</div>
              <BulletList bullets={e.bullets} color={color} />
            </div>
          ))}
        </S>
      )}
      {/* Education */}
      {r.education?.length > 0 && (
        <S title="Education">
          {r.education.map((e,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <div>
                <span style={{ fontWeight:700 }}>{e.degree} in {e.field}</span>
                <span style={{ color:"#64748b", fontSize:11 }}> — {e.school}</span>
              </div>
              <span style={{ fontSize:10.5, color:"#64748b" }}>{e.year}{e.gpa && ` · GPA ${e.gpa}`}</span>
            </div>
          ))}
        </S>
      )}
      {/* Skills */}
      {r.skills && (
        <S title="Skills">
          <div>
            {[...(r.skills.technical||[]), ...(r.skills.tools||[])].map((s,i) => <SkillPill key={i} label={s} color={color} />)}
          </div>
        </S>
      )}
      {/* Certifications */}
      {r.certifications?.length > 0 && (
        <S title="Certifications">
          {r.certifications.map((c,i) => (
            <div key={i} style={{ fontSize:12, marginBottom:2 }}>
              <span style={{ fontWeight:600 }}>{c.name}</span>
              <span style={{ color:"#64748b" }}> — {c.issuer}, {c.year}</span>
            </div>
          ))}
        </S>
      )}
      {/* Projects */}
      {r.projects?.length > 0 && (
        <S title="Projects">
          {r.projects.map((p,i) => (
            <div key={i} style={{ marginBottom:6 }}>
              <span style={{ fontWeight:700 }}>{p.name}</span>
              <span style={{ color:"#64748b", fontSize:11 }}> · {p.stack}</span>
              <div style={{ fontSize:11.5, color:"#374151" }}>{p.description}</div>
            </div>
          ))}
        </S>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LAYOUT 2 — MODERN (Two-Column)
// Coloured left sidebar for contact/skills, white right panel for experience
// Best for: Software Engineers, Data roles, Tech roles
// ════════════════════════════════════════════════════════════════════════════════
function ModernLayout({ resume: r, color }) {
  const SideSection = ({ title, children }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:9.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.5px", color:"#fff", opacity:.7, marginBottom:6 }}>{title}</div>
      {children}
    </div>
  );
  const MainSection = ({ title, children }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"1px", color, marginBottom:2 }}>{title}</div>
      <div style={{ height:2, background:color, width:32, marginBottom:7, borderRadius:2 }} />
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", display:"flex", minHeight:800, fontSize:12, color:"#1e293b" }}>
      {/* Sidebar */}
      <div style={{ width:200, flexShrink:0, background:color, padding:"28px 18px", color:"#fff" }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, marginBottom:10 }}>
            {r.personal.name?.[0] || "U"}
          </div>
          <div style={{ fontSize:16, fontWeight:800, lineHeight:1.2, marginBottom:4 }}>{r.personal.name}</div>
          <div style={{ fontSize:11, opacity:.8 }}>{r.experience?.[0]?.title || "Professional"}</div>
        </div>
        {thinRule("rgba(255,255,255,.3)", 0, 14)}
        <SideSection title="Contact">
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin].filter(Boolean).map((v,i) => (
            <div key={i} style={{ fontSize:10.5, opacity:.9, marginBottom:4, wordBreak:"break-word" }}>{v}</div>
          ))}
        </SideSection>
        {r.skills?.technical?.length > 0 && (
          <SideSection title="Technical Skills">
            {r.skills.technical.map((s,i) => (
              <div key={i} style={{ fontSize:10.5, marginBottom:3, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,.6)", flexShrink:0 }} />
                {s}
              </div>
            ))}
          </SideSection>
        )}
        {r.skills?.tools?.length > 0 && (
          <SideSection title="Tools">
            {r.skills.tools.map((s,i) => (
              <div key={i} style={{ fontSize:10.5, marginBottom:3, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,.6)", flexShrink:0 }} />
                {s}
              </div>
            ))}
          </SideSection>
        )}
        {r.certifications?.length > 0 && (
          <SideSection title="Certifications">
            {r.certifications.map((c,i) => (
              <div key={i} style={{ fontSize:10, marginBottom:5, lineHeight:1.4, opacity:.9 }}>
                <div style={{ fontWeight:700 }}>{c.name}</div>
                <div style={{ opacity:.75 }}>{c.issuer} · {c.year}</div>
              </div>
            ))}
          </SideSection>
        )}
        {r.languages?.length > 0 && (
          <SideSection title="Languages">
            {r.languages.map((l,i) => (
              <div key={i} style={{ fontSize:10.5, marginBottom:3, opacity:.9 }}>{l.lang} — {l.level}</div>
            ))}
          </SideSection>
        )}
      </div>
      {/* Main Content */}
      <div style={{ flex:1, padding:"28px 24px", background:"#fff" }}>
        {r.summary && (
          <MainSection title="Profile">
            <p style={{ margin:0, fontSize:12, color:"#374151", lineHeight:1.7 }}>{r.summary}</p>
          </MainSection>
        )}
        {r.experience?.length > 0 && (
          <MainSection title="Experience">
            {r.experience.map((e,i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:700, fontSize:13 }}>{e.title}</span>
                  <span style={{ fontSize:10.5, color:"#64748b", whiteSpace:"nowrap", marginLeft:8 }}>{e.start} – {e.end||"Present"}</span>
                </div>
                <div style={{ fontSize:11.5, color, fontWeight:600 }}>{e.company}{e.location && ` · ${e.location}`}</div>
                <BulletList bullets={e.bullets} color={color} />
              </div>
            ))}
          </MainSection>
        )}
        {r.education?.length > 0 && (
          <MainSection title="Education">
            {r.education.map((e,i) => (
              <div key={i} style={{ marginBottom:6 }}>
                <div style={{ fontWeight:700 }}>{e.degree} in {e.field}</div>
                <div style={{ fontSize:11.5, color:"#64748b" }}>{e.school} · {e.year}{e.gpa && ` · GPA: ${e.gpa}`}</div>
              </div>
            ))}
          </MainSection>
        )}
        {r.projects?.length > 0 && (
          <MainSection title="Projects">
            {r.projects.map((p,i) => (
              <div key={i} style={{ marginBottom:7 }}>
                <span style={{ fontWeight:700 }}>{p.name}</span>
                <span style={{ fontSize:11, color:"#64748b" }}> · {p.stack}</span>
                <div style={{ fontSize:11.5, color:"#374151" }}>{p.description}</div>
              </div>
            ))}
          </MainSection>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LAYOUT 3 — MINIMAL
// Ultra-clean, generous whitespace, thin typography
// Best for: UX/UI Designers, Researchers, Creative roles
// ════════════════════════════════════════════════════════════════════════════════
function MinimalLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom:18, display:"flex", gap:24 }}>
      <div style={{ width:110, flexShrink:0, paddingTop:1 }}>
        <div style={{ fontSize:9.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"#94a3b8" }}>{title}</div>
      </div>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  );
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", fontSize:12, color:"#1e293b", padding:"36px 40px", background:"#fff", lineHeight:1.6 }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:28, fontWeight:300, letterSpacing:"-1px", color:"#0f172a", marginBottom:4 }}>
          {r.personal.name}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <div style={{ width:28, height:2.5, background:color, borderRadius:2 }} />
          <div style={{ fontSize:12, color:"#64748b" }}>{r.experience?.[0]?.title || "Professional"}</div>
        </div>
        <div style={{ fontSize:11, color:"#94a3b8" }}>
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin].filter(Boolean).join("   ·   ")}
        </div>
      </div>
      {thinRule("#f1f5f9", 0, 20)}
      {r.summary && <S title="About"><p style={{ margin:0, fontSize:12, color:"#475569", lineHeight:1.75, fontWeight:300 }}>{r.summary}</p></S>}
      {r.experience?.length > 0 && (
        <S title="Experience">
          {r.experience.map((e,i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:1 }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{e.title}</span>
                <span style={{ fontSize:10.5, color:"#94a3b8" }}>{e.start} – {e.end||"Present"}</span>
              </div>
              <div style={{ fontSize:11, color, marginBottom:4 }}>{e.company}</div>
              {(e.bullets||[]).map((b,j) => (
                <div key={j} style={{ fontSize:11.5, color:"#475569", marginBottom:2, paddingLeft:12, borderLeft:`2px solid ${color}40` }}>{b}</div>
              ))}
            </div>
          ))}
        </S>
      )}
      {r.education?.length > 0 && (
        <S title="Education">
          {r.education.map((e,i) => (
            <div key={i} style={{ marginBottom:5 }}>
              <span style={{ fontWeight:600 }}>{e.degree}</span>
              <span style={{ color:"#64748b" }}> · {e.field} · {e.school} · {e.year}</span>
            </div>
          ))}
        </S>
      )}
      {r.skills && (
        <S title="Skills">
          <div>{[...(r.skills.technical||[]), ...(r.skills.tools||[])].join(" · ")}</div>
        </S>
      )}
      {r.projects?.length > 0 && (
        <S title="Projects">
          {r.projects.map((p,i) => (
            <div key={i} style={{ marginBottom:6 }}>
              <span style={{ fontWeight:600 }}>{p.name}</span>
              <span style={{ color:"#94a3b8", fontSize:11 }}> · {p.stack}</span>
              <div style={{ fontSize:11.5, color:"#475569" }}>{p.description}</div>
            </div>
          ))}
        </S>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LAYOUT 4 — EXECUTIVE
// Bold full-width top banner, ruled section headers
// Best for: Senior / Leadership / Management roles
// ════════════════════════════════════════════════════════════════════════════════
function ExecutiveLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
        <div style={{ width:4, height:18, background:color, borderRadius:2 }} />
        <div style={{ fontSize:12, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.5px", color:"#0f172a" }}>{title}</div>
        <div style={{ flex:1, height:1, background:"#e2e8f0" }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily:"'Segoe UI','Inter',system-ui,sans-serif", fontSize:12, color:"#1e293b", background:"#fff" }}>
      {/* Top banner */}
      <div style={{ background:`linear-gradient(135deg,${color},${color}cc)`, padding:"28px 32px", color:"#fff" }}>
        <div style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.5px", marginBottom:4 }}>{r.personal.name}</div>
        <div style={{ fontSize:14, fontWeight:300, opacity:.9, marginBottom:10 }}>{r.experience?.[0]?.title || "Senior Professional"}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 16px", fontSize:11, opacity:.85 }}>
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin].filter(Boolean).map((v,i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>
      <div style={{ padding:"24px 32px" }}>
        {r.summary && <S title="Executive Summary"><p style={{ margin:0, fontSize:12.5, color:"#374151", lineHeight:1.7, fontStyle:"italic" }}>{r.summary}</p></S>}
        {r.experience?.length > 0 && (
          <S title="Professional Experience">
            {r.experience.map((e,i) => (
              <div key={i} style={{ marginBottom:12, paddingLeft:14, borderLeft:`3px solid ${color}30` }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:700, fontSize:13.5 }}>{e.title}</span>
                  <span style={{ fontSize:11, color:"#64748b" }}>{e.start} – {e.end||"Present"}</span>
                </div>
                <div style={{ color, fontSize:12, fontWeight:600, marginBottom:4 }}>{e.company}{e.location && ` · ${e.location}`}</div>
                <BulletList bullets={e.bullets} color={color} />
              </div>
            ))}
          </S>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div>
            {r.education?.length > 0 && (
              <S title="Education">
                {r.education.map((e,i) => (
                  <div key={i} style={{ marginBottom:6 }}>
                    <div style={{ fontWeight:700 }}>{e.degree} — {e.field}</div>
                    <div style={{ fontSize:11.5, color:"#64748b" }}>{e.school} · {e.year}</div>
                  </div>
                ))}
              </S>
            )}
            {r.certifications?.length > 0 && (
              <S title="Certifications">
                {r.certifications.map((c,i) => (
                  <div key={i} style={{ fontSize:12, marginBottom:4 }}>
                    <span style={{ fontWeight:600 }}>{c.name}</span>
                    <span style={{ color:"#64748b" }}> · {c.issuer}</span>
                  </div>
                ))}
              </S>
            )}
          </div>
          <div>
            {r.skills && (
              <S title="Core Competencies">
                <div>{[...(r.skills.technical||[]), ...(r.skills.soft||[])].map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3, fontSize:12 }}>
                    <span style={{ color, fontSize:14 }}>✓</span>{s}
                  </div>
                ))}</div>
              </S>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LAYOUT 5 — CREATIVE SIDEBAR
// Bold left accent bar, name in coloured block, expressive typography
// Best for: Marketing, Design, Sales, Creative
// ════════════════════════════════════════════════════════════════════════════════
function CreativeLayout({ resume: r, color }) {
  const S = ({ title, icon, children }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        {icon && <span style={{ fontSize:14 }}>{icon}</span>}
        <span style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.5px", color }}>{title}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", fontSize:12, color:"#1e293b", background:"#fff", display:"flex" }}>
      {/* Accent bar */}
      <div style={{ width:8, background:`linear-gradient(to bottom, ${color}, ${color}88)`, flexShrink:0 }} />
      <div style={{ flex:1, padding:"0 0 28px" }}>
        {/* Header */}
        <div style={{ background:color, padding:"22px 28px", marginBottom:20 }}>
          <div style={{ fontSize:26, fontWeight:800, color:"#fff", letterSpacing:"-0.5px" }}>{r.personal.name}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.8)", fontWeight:300, marginTop:3 }}>
            {r.experience?.[0]?.title || "Creative Professional"}
          </div>
        </div>
        <div style={{ padding:"0 28px" }}>
          {/* Contact pills */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
            {[r.personal.email, r.personal.phone, r.personal.location].filter(Boolean).map((v,i) => (
              <span key={i} style={{ padding:"3px 10px", background:color+"14", color, borderRadius:20, fontSize:10.5, fontWeight:600 }}>{v}</span>
            ))}
          </div>
          {r.summary && (
            <S title="About Me" icon="✦">
              <p style={{ margin:0, fontSize:12, color:"#475569", lineHeight:1.75 }}>{r.summary}</p>
            </S>
          )}
          {r.experience?.length > 0 && (
            <S title="Experience" icon="💼">
              {r.experience.map((e,i) => (
                <div key={i} style={{ marginBottom:11 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontWeight:700, fontSize:13 }}>{e.title}</span>
                    <span style={{ fontSize:10.5, color:"#94a3b8" }}>{e.start} – {e.end||"Present"}</span>
                  </div>
                  <div style={{ fontSize:11.5, background:color+"18", display:"inline-block", padding:"1px 8px", borderRadius:4, marginBottom:4, color }}>{e.company}</div>
                  <BulletList bullets={e.bullets} color={color} />
                </div>
              ))}
            </S>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div>
              {r.education?.length > 0 && (
                <S title="Education" icon="🎓">
                  {r.education.map((e,i) => (
                    <div key={i} style={{ marginBottom:6 }}>
                      <div style={{ fontWeight:700 }}>{e.degree}</div>
                      <div style={{ fontSize:11, color:"#64748b" }}>{e.field} · {e.school} · {e.year}</div>
                    </div>
                  ))}
                </S>
              )}
            </div>
            <div>
              {r.skills && (
                <S title="Skills" icon="⚡">
                  <div>{[...(r.skills.technical||[]), ...(r.skills.tools||[])].map((s,i) => <SkillPill key={i} label={s} color={color} />)}</div>
                </S>
              )}
            </div>
          </div>
          {r.projects?.length > 0 && (
            <S title="Projects" icon="🚀">
              {r.projects.map((p,i) => (
                <div key={i} style={{ marginBottom:7, padding:"8px 12px", background:"#f8fafc", borderRadius:8, border:`1px solid ${color}22` }}>
                  <span style={{ fontWeight:700 }}>{p.name}</span>
                  <span style={{ color:"#94a3b8", fontSize:11 }}> · {p.stack}</span>
                  <div style={{ fontSize:11.5, color:"#475569", marginTop:2 }}>{p.description}</div>
                </div>
              ))}
            </S>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LAYOUT 6 — COMPACT
// Dense layout, info-maximised, small but readable, perfect for freshers
// Best for: Fresher, internship, short CVs, or cramming lots of content
// ════════════════════════════════════════════════════════════════════════════════
function CompactLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.2px", color:"#fff", background:color, padding:"2px 8px", display:"inline-block", borderRadius:3, marginBottom:5 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", fontSize:11.5, color:"#1e293b", padding:"20px 26px", background:"#fff", lineHeight:1.45 }}>
      {/* Header */}
      <div style={{ borderLeft:`4px solid ${color}`, paddingLeft:12, marginBottom:14 }}>
        <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", letterSpacing:"-0.5px" }}>{r.personal.name}</div>
        <div style={{ fontSize:12, color, fontWeight:600, marginBottom:3 }}>{r.experience?.[0]?.title || "Professional"}</div>
        <div style={{ fontSize:10.5, color:"#64748b" }}>
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin].filter(Boolean).join(" | ")}
        </div>
      </div>
      {r.summary && <S title="Summary"><p style={{ margin:"0 0 0 0", fontSize:11.5, color:"#374151", lineHeight:1.6 }}>{r.summary}</p></S>}
      {r.experience?.length > 0 && (
        <S title="Experience">
          {r.experience.map((e,i) => (
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontWeight:700 }}>{e.title} @ {e.company}</span>
                <span style={{ fontSize:10.5, color:"#64748b" }}>{e.start}–{e.end||"Present"}</span>
              </div>
              {(e.bullets||[]).map((b,j) => (
                <div key={j} style={{ fontSize:11, color:"#374151", marginTop:1, paddingLeft:10 }}>• {b}</div>
              ))}
            </div>
          ))}
        </S>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          {r.education?.length > 0 && (
            <S title="Education">
              {r.education.map((e,i) => (
                <div key={i} style={{ marginBottom:4, fontSize:11 }}>
                  <span style={{ fontWeight:700 }}>{e.degree} in {e.field}</span><br/>
                  <span style={{ color:"#64748b" }}>{e.school} · {e.year}</span>
                </div>
              ))}
            </S>
          )}
          {r.certifications?.length > 0 && (
            <S title="Certifications">
              {r.certifications.map((c,i) => (
                <div key={i} style={{ fontSize:11, marginBottom:2 }}>{c.name} · <span style={{ color:"#64748b" }}>{c.issuer}</span></div>
              ))}
            </S>
          )}
        </div>
        <div>
          {r.skills && (
            <S title="Skills">
              <div style={{ fontSize:11 }}>{[...(r.skills.technical||[]), ...(r.skills.tools||[])].join(" · ")}</div>
            </S>
          )}
          {r.projects?.length > 0 && (
            <S title="Projects">
              {r.projects.map((p,i) => (
                <div key={i} style={{ fontSize:11, marginBottom:3 }}>
                  <span style={{ fontWeight:700 }}>{p.name}</span> — {p.description}
                </div>
              ))}
            </S>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — Router
// Usage: <ResumePreview resume={r} layout="modern" color="#0d9488" />
// ════════════════════════════════════════════════════════════════════════════════
export default function ResumePreview({ resume, layout = "classic", color = "#0d9488" }) {
  const props = { resume, color };
  switch (layout) {
    case "modern":    return <ModernLayout    {...props} />;
    case "minimal":   return <MinimalLayout   {...props} />;
    case "executive": return <ExecutiveLayout {...props} />;
    case "creative":  return <CreativeLayout  {...props} />;
    case "compact":   return <CompactLayout   {...props} />;
    default:          return <ClassicLayout   {...props} />;
  }
}

export const LAYOUT_META = {
  classic:   { label:"Classic",    desc:"Traditional, ATS-safe, formal",        icon:"📄", preview:"#f8fafc" },
  modern:    { label:"Modern",     desc:"Two-column, coloured sidebar",          icon:"🎨", preview:"#eff6ff" },
  minimal:   { label:"Minimal",    desc:"Ultra-clean, lots of whitespace",       icon:"⬜", preview:"#fafafa" },
  executive: { label:"Executive",  desc:"Bold banner, leadership presence",      icon:"👔", preview:"#fff7ed" },
  creative:  { label:"Creative",   desc:"Expressive, accent bar, colourful",     icon:"✨", preview:"#fdf4ff" },
  compact:   { label:"Compact",    desc:"Info-dense, perfect for freshers",      icon:"📋", preview:"#f0fdf4" },
};
