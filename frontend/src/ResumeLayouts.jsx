// ─── ResumeLayouts.jsx ────────────────────────────────────────────────────────
// 10 distinct visual resume design patterns inspired by FlowCV & Jobscan.
// Layouts are chosen by VISUAL STYLE, not job category.
//
// Layouts:
//   "classic"      — Traditional single-column, centred header       (ATS-safe, formal)
//   "modern"       — Two-column coloured sidebar                     (Tech / Data)
//   "minimal"      — Ultra-clean, lots of whitespace, line accents   (Design / Creative)
//   "executive"    — Bold top banner, horizontal rule hierarchy      (Senior / Management)
//   "creative"     — Left accent bar, coloured name block            (Design / Marketing)
//   "compact"      — Dense info-maximised, great for freshers        (Fresher / short CVs)
//   "slate"        — Dark header band, clean white body              (Corporate / Finance)
//   "timeline"     — Vertical timeline on experience, dot markers    (Storytelling / PM)
//   "columns"      — Pure two-column no sidebar colour, typographic  (Consulting / Law)
//   "bold"         — Full-bleed colour header, strong visual impact  (Sales / Brand roles)
//
// Usage:
//   <ResumePreview resume={r} layout="slate" color="#0f4c81" />
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

// ── Shared primitives ─────────────────────────────────────────────────────────
const thinRule = (color = "#e2e8f0", mt = 6, mb = 6) => (
  <div style={{ height: 1, background: color, margin: `${mt}px 0 ${mb}px` }} />
);

function ContactRow({ personal, color, sep = " · ", style = {} }) {
  const items = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin &&
      `linkedin: ${personal.linkedin.replace(/.*linkedin\.com\/in\//, "")}`,
    personal.portfolio,
  ].filter(Boolean);
  return (
    <div style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.8, ...style }}>
      {items.map((v, i) => (
        <span key={i}>
          {i > 0 && <span style={{ color: "#cbd5e1", margin: "0 4px" }}>{sep}</span>}
          {v}
        </span>
      ))}
    </div>
  );
}

function BulletList({ bullets, color, size = 11.5 }) {
  return (
    <ul style={{ margin: "4px 0 0", paddingLeft: 0, listStyle: "none" }}>
      {(bullets || []).map((b, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            gap: 7,
            marginBottom: 3,
            fontSize: size,
            color: "#374151",
            lineHeight: 1.55,
          }}
        >
          <span style={{ color, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>▸</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function SkillPill({ label, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        background: color + "18",
        border: `1px solid ${color}33`,
        color,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 600,
        marginRight: 4,
        marginBottom: 4,
      }}
    >
      {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 1. CLASSIC — Traditional centred header, Georgia serif, ATS-safe
// ════════════════════════════════════════════════════════════════════════════════
function ClassicLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color }}>{title}</div>
        <div style={{ flex: 1, height: 1.5, background: color + "50" }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: 12, color: "#1e293b", lineHeight: 1.5, padding: "28px 32px", background: "#fff" }}>
      <div style={{ textAlign: "center", marginBottom: 16, borderBottom: `2.5px solid ${color}`, paddingBottom: 14 }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", color: "#0f172a" }}>{r.personal.name}</div>
        <div style={{ fontSize: 12, color: "#64748b", margin: "4px 0 6px", fontStyle: "italic" }}>{r.experience?.[0]?.title || "Professional"}</div>
        <ContactRow personal={r.personal} color={color} />
      </div>
      {r.summary && <S title="Professional Summary"><p style={{ margin: 0, fontSize: 12, color: "#374151", lineHeight: 1.65 }}>{r.summary}</p></S>}
      {r.experience?.length > 0 && (
        <S title="Experience">
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.title}</span>
                <span style={{ fontSize: 10.5, color: "#64748b" }}>{e.start} – {e.end || "Present"}</span>
              </div>
              <div style={{ fontSize: 11.5, color, fontStyle: "italic", marginBottom: 2 }}>{e.company}{e.location && `, ${e.location}`}</div>
              <BulletList bullets={e.bullets} color={color} />
            </div>
          ))}
        </S>
      )}
      {r.education?.length > 0 && (
        <S title="Education">
          {r.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div><span style={{ fontWeight: 700 }}>{e.degree} in {e.field}</span><span style={{ color: "#64748b", fontSize: 11 }}> — {e.school}</span></div>
              <span style={{ fontSize: 10.5, color: "#64748b" }}>{e.year}{e.gpa && ` · GPA ${e.gpa}`}</span>
            </div>
          ))}
        </S>
      )}
      {r.skills && (
        <S title="Skills">
          <div>{[...(r.skills.technical || []), ...(r.skills.tools || [])].map((s, i) => <SkillPill key={i} label={s} color={color} />)}</div>
        </S>
      )}
      {r.certifications?.length > 0 && (
        <S title="Certifications">
          {r.certifications.map((c, i) => (
            <div key={i} style={{ fontSize: 12, marginBottom: 2 }}>
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <span style={{ color: "#64748b" }}> — {c.issuer}, {c.year}</span>
            </div>
          ))}
        </S>
      )}
      {r.projects?.length > 0 && (
        <S title="Projects">
          {r.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>{p.name}</span>
              <span style={{ color: "#64748b", fontSize: 11 }}> · {p.stack}</span>
              <div style={{ fontSize: 11.5, color: "#374151" }}>{p.description}</div>
            </div>
          ))}
        </S>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 2. MODERN — Two-column, coloured left sidebar
// ════════════════════════════════════════════════════════════════════════════════
function ModernLayout({ resume: r, color }) {
  const SideSection = ({ title, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#fff", opacity: 0.7, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
  const MainSection = ({ title, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color, marginBottom: 2 }}>{title}</div>
      <div style={{ height: 2, background: color, width: 32, marginBottom: 7, borderRadius: 2 }} />
      {children}
    </div>
  );
  const allSkills = [...(r.skills?.technical || []), ...(r.skills?.tools || []), ...(r.skills?.soft || [])];
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", fontSize: 12, color: "#1e293b", background: "#fff", display: "flex", minHeight: 900 }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: color, padding: "28px 18px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>{r.personal.name}</div>
          <div style={{ fontSize: 11, color: "#fff", opacity: 0.85, fontWeight: 500, marginBottom: 12 }}>{r.experience?.[0]?.title || "Professional"}</div>
          <div style={{ height: 1, background: "rgba(255,255,255,.3)", marginBottom: 12 }} />
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin].filter(Boolean).map((v, i) => (
            <div key={i} style={{ fontSize: 10, color: "#fff", opacity: 0.8, marginBottom: 3 }}>{v}</div>
          ))}
        </div>
        {allSkills.length > 0 && (
          <SideSection title="Skills">
            {allSkills.map((s, i) => (
              <div key={i} style={{ fontSize: 10.5, color: "#fff", padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,.15)", marginBottom: 3 }}>{s}</div>
            ))}
          </SideSection>
        )}
        {r.education?.length > 0 && (
          <SideSection title="Education">
            {r.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10.5, color: "#fff", fontWeight: 700 }}>{e.degree}</div>
                <div style={{ fontSize: 10, color: "#fff", opacity: 0.75 }}>{e.field}</div>
                <div style={{ fontSize: 10, color: "#fff", opacity: 0.65 }}>{e.school} · {e.year}</div>
              </div>
            ))}
          </SideSection>
        )}
        {r.certifications?.length > 0 && (
          <SideSection title="Certifications">
            {r.certifications.map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: "#fff", opacity: 0.8, marginBottom: 4 }}>{c.name}</div>
            ))}
          </SideSection>
        )}
        {r.languages?.length > 0 && (
          <SideSection title="Languages">
            {r.languages.map((l, i) => (
              <div key={i} style={{ fontSize: 10, color: "#fff", opacity: 0.8 }}>{l.lang} · {l.level}</div>
            ))}
          </SideSection>
        )}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: "28px 24px" }}>
        {r.summary && (
          <MainSection title="Profile">
            <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.7 }}>{r.summary}</p>
          </MainSection>
        )}
        {r.experience?.length > 0 && (
          <MainSection title="Experience">
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{e.title}</span>
                  <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{e.start} – {e.end || "Present"}</span>
                </div>
                <div style={{ fontSize: 11.5, color, fontWeight: 600, marginBottom: 3 }}>{e.company}{e.location && ` · ${e.location}`}</div>
                <BulletList bullets={e.bullets} color={color} />
              </div>
            ))}
          </MainSection>
        )}
        {r.projects?.length > 0 && (
          <MainSection title="Projects">
            {r.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>{p.name}</span>
                <span style={{ color: "#94a3b8", fontSize: 11 }}> · {p.stack}</span>
                <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>{p.description}</div>
              </div>
            ))}
          </MainSection>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 3. MINIMAL — Ultra-clean, typographic hierarchy, generous whitespace
// ════════════════════════════════════════════════════════════════════════════════
function MinimalLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2.5px", color: "#94a3b8", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", fontSize: 12, color: "#1e293b", padding: "36px 40px", background: "#fff", lineHeight: 1.6 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-1px", color: "#0f172a", marginBottom: 2 }}>{r.personal.name}</div>
        <div style={{ fontSize: 13, color, fontWeight: 500, marginBottom: 10 }}>{r.experience?.[0]?.title || "Professional"}</div>
        <ContactRow personal={r.personal} color={color} sep="   ·   " />
      </div>
      {thinRule("#e2e8f0", 0, 24)}
      {r.summary && <S title="About"><p style={{ margin: 0, fontSize: 12.5, color: "#475569", lineHeight: 1.8, maxWidth: 520 }}>{r.summary}</p></S>}
      {r.experience?.length > 0 && (
        <S title="Experience">
          {r.experience.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: 16 }}>
              <div style={{ width: 100, flexShrink: 0, fontSize: 10.5, color: "#94a3b8", paddingTop: 2 }}>{e.start}<br />— {e.end || "Now"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 1 }}>{e.title}</div>
                <div style={{ fontSize: 11.5, color, marginBottom: 5 }}>{e.company}{e.location && `, ${e.location}`}</div>
                <BulletList bullets={e.bullets} color={color} />
              </div>
            </div>
          ))}
        </S>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          {r.education?.length > 0 && (
            <S title="Education">
              {r.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>{e.degree}, {e.field}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{e.school} · {e.year}</div>
                </div>
              ))}
            </S>
          )}
          {r.certifications?.length > 0 && (
            <S title="Certifications">
              {r.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 11.5, marginBottom: 4 }}>{c.name}<span style={{ color: "#94a3b8" }}> · {c.issuer}</span></div>
              ))}
            </S>
          )}
        </div>
        <div>
          {r.skills && (
            <S title="Skills">
              {[...(r.skills.technical || []), ...(r.skills.tools || [])].map((s, i) => (
                <div key={i} style={{ fontSize: 11.5, color: "#374151", padding: "2px 0", borderBottom: "1px solid #f1f5f9" }}>{s}</div>
              ))}
            </S>
          )}
        </div>
      </div>
      {r.projects?.length > 0 && (
        <S title="Projects">
          {r.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>{p.name}</span>
              <span style={{ color: "#94a3b8", fontSize: 11 }}> — {p.stack}</span>
              <div style={{ fontSize: 11.5, color: "#475569" }}>{p.description}</div>
            </div>
          ))}
        </S>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 4. EXECUTIVE — Bold top banner, date pills, leadership presence
// ════════════════════════════════════════════════════════════════════════════════
function ExecutiveLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 3, height: 14, background: color, borderRadius: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#0f172a" }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Lato','Segoe UI',system-ui,sans-serif", fontSize: 12, color: "#1e293b", background: "#fff" }}>
      <div style={{ background: color, padding: "26px 32px 22px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{r.personal.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginTop: 3, fontWeight: 500 }}>{r.experience?.[0]?.title || "Executive"}</div>
        <ContactRow personal={r.personal} color={color} style={{ marginTop: 10, color: "rgba(255,255,255,.75)", fontSize: 10.5 }} sep=" · " />
      </div>
      <div style={{ padding: "22px 32px" }}>
        {r.summary && (
          <S title="Executive Summary">
            <p style={{ margin: 0, fontSize: 12.5, color: "#374151", lineHeight: 1.7, fontStyle: "italic", borderLeft: `3px solid ${color}40`, paddingLeft: 12 }}>{r.summary}</p>
          </S>
        )}
        {r.experience?.length > 0 && (
          <S title="Career History">
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < r.experience.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{e.title}</span>
                  <span style={{ fontSize: 10.5, color: "#fff", background: color, padding: "1px 8px", borderRadius: 20, fontWeight: 600 }}>{e.start} – {e.end || "Present"}</span>
                </div>
                <div style={{ fontSize: 12, color, fontWeight: 700, marginBottom: 4 }}>
                  {e.company}{e.location && <span style={{ color: "#94a3b8", fontWeight: 400 }}> · {e.location}</span>}
                </div>
                <BulletList bullets={e.bullets} color={color} />
              </div>
            ))}
          </S>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            {r.education?.length > 0 && (
              <S title="Education">
                {r.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 700 }}>{e.degree} in {e.field}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{e.school} · {e.year}</div>
                  </div>
                ))}
              </S>
            )}
            {r.certifications?.length > 0 && (
              <S title="Certifications">
                {r.certifications.map((c, i) => (
                  <div key={i} style={{ fontSize: 11.5, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: "#64748b" }}> · {c.issuer} {c.year}</span>
                  </div>
                ))}
              </S>
            )}
          </div>
          <div>
            {r.skills && (
              <S title="Core Competencies">
                <div>{[...(r.skills.technical || []), ...(r.skills.soft || [])].map((s, i) => <SkillPill key={i} label={s} color={color} />)}</div>
              </S>
            )}
          </div>
        </div>
        {r.projects?.length > 0 && (
          <S title="Key Projects">
            {r.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{p.name}</span>
                <span style={{ color: "#64748b", fontSize: 11 }}> · {p.stack}</span>
                <div style={{ fontSize: 11.5, color: "#475569" }}>{p.description}</div>
              </div>
            ))}
          </S>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 5. CREATIVE — Left accent bar, coloured name, expressive layout
// ════════════════════════════════════════════════════════════════════════════════
function CreativeLayout({ resume: r, color }) {
  const S = ({ title, icon, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
        {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
        <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: color + "30" }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',system-ui,sans-serif", fontSize: 12, color: "#1e293b", background: "#fff", display: "flex", minHeight: 900 }}>
      <div style={{ width: 8, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "24px 28px" }}>
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `2px dashed ${color}40` }}>
          <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.5px", marginBottom: 2 }}>{r.personal.name}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 500, letterSpacing: "0.5px" }}>{r.experience?.[0]?.title || "Creative Professional"}</div>
          <ContactRow personal={r.personal} color={color} sep=" · " />
        </div>
        {r.summary && <S title="About Me" icon="✦"><p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.75 }}>{r.summary}</p></S>}
        {r.experience?.length > 0 && (
          <S title="Experience" icon="💼">
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{e.title}</span>
                  <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{e.start} – {e.end || "Present"}</span>
                </div>
                <div style={{ fontSize: 11.5, background: color + "18", display: "inline-block", padding: "1px 8px", borderRadius: 4, marginBottom: 4, color }}>{e.company}</div>
                <BulletList bullets={e.bullets} color={color} />
              </div>
            ))}
          </S>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            {r.education?.length > 0 && (
              <S title="Education" icon="🎓">
                {r.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 700 }}>{e.degree}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{e.field} · {e.school} · {e.year}</div>
                  </div>
                ))}
              </S>
            )}
          </div>
          <div>
            {r.skills && (
              <S title="Skills" icon="⚡">
                <div>{[...(r.skills.technical || []), ...(r.skills.tools || [])].map((s, i) => <SkillPill key={i} label={s} color={color} />)}</div>
              </S>
            )}
          </div>
        </div>
        {r.projects?.length > 0 && (
          <S title="Projects" icon="🚀">
            {r.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 7, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: `1px solid ${color}22` }}>
                <span style={{ fontWeight: 700 }}>{p.name}</span>
                <span style={{ color: "#94a3b8", fontSize: 11 }}> · {p.stack}</span>
                <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>{p.description}</div>
              </div>
            ))}
          </S>
        )}
        {r.certifications?.length > 0 && (
          <S title="Certifications" icon="🏅">
            {r.certifications.map((c, i) => (
              <div key={i} style={{ fontSize: 11.5, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                <span style={{ color: "#64748b" }}> · {c.issuer}</span>
              </div>
            ))}
          </S>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 6. COMPACT — Dense, info-maximised, left border accent
// ════════════════════════════════════════════════════════════════════════════════
function CompactLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", color: "#fff", background: color, padding: "2px 8px", display: "inline-block", borderRadius: 3, marginBottom: 5 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", fontSize: 11.5, color: "#1e293b", padding: "20px 26px", background: "#fff", lineHeight: 1.45 }}>
      <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>{r.personal.name}</div>
        <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 3 }}>{r.experience?.[0]?.title || "Professional"}</div>
        <div style={{ fontSize: 10.5, color: "#64748b" }}>{[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin].filter(Boolean).join(" | ")}</div>
      </div>
      {r.summary && <S title="Summary"><p style={{ margin: 0, fontSize: 11.5, color: "#374151", lineHeight: 1.6 }}>{r.summary}</p></S>}
      {r.experience?.length > 0 && (
        <S title="Experience">
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{e.title} @ {e.company}</span>
                <span style={{ fontSize: 10.5, color: "#64748b" }}>{e.start}–{e.end || "Present"}</span>
              </div>
              {(e.bullets || []).map((b, j) => <div key={j} style={{ fontSize: 11, color: "#374151", marginTop: 1, paddingLeft: 10 }}>• {b}</div>)}
            </div>
          ))}
        </S>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          {r.education?.length > 0 && (
            <S title="Education">
              {r.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 4, fontSize: 11 }}>
                  <span style={{ fontWeight: 700 }}>{e.degree} in {e.field}</span><br />
                  <span style={{ color: "#64748b" }}>{e.school} · {e.year}</span>
                </div>
              ))}
            </S>
          )}
          {r.certifications?.length > 0 && (
            <S title="Certifications">
              {r.certifications.map((c, i) => <div key={i} style={{ fontSize: 11, marginBottom: 2 }}>{c.name} · <span style={{ color: "#64748b" }}>{c.issuer}</span></div>)}
            </S>
          )}
        </div>
        <div>
          {r.skills && <S title="Skills"><div style={{ fontSize: 11 }}>{[...(r.skills.technical || []), ...(r.skills.tools || [])].join(" · ")}</div></S>}
          {r.projects?.length > 0 && (
            <S title="Projects">
              {r.projects.map((p, i) => <div key={i} style={{ fontSize: 11, marginBottom: 3 }}><span style={{ fontWeight: 700 }}>{p.name}</span> — {p.description}</div>)}
            </S>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 7. SLATE — Dark charcoal header band, clean white body, corporate feel
// ════════════════════════════════════════════════════════════════════════════════
function SlateLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#94a3b8" }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Source Sans Pro','Segoe UI',system-ui,sans-serif", fontSize: 12, color: "#1e293b", background: "#fff" }}>
      <div style={{ background: "#1e293b", padding: "26px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>{r.personal.name}</div>
            <div style={{ fontSize: 13, color, fontWeight: 600, marginTop: 4, letterSpacing: "0.5px" }}>{r.experience?.[0]?.title || "Professional"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            {[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin].filter(Boolean).map((v, i) => (
              <div key={i} style={{ fontSize: 10.5, color: "#94a3b8", marginBottom: 2 }}>{v}</div>
            ))}
          </div>
        </div>
        <div style={{ height: 3, background: color, borderRadius: 2, marginTop: 16 }} />
      </div>
      <div style={{ padding: "22px 32px" }}>
        {r.summary && <S title="Professional Profile"><p style={{ margin: 0, fontSize: 12.5, color: "#374151", lineHeight: 1.7 }}>{r.summary}</p></S>}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div>
            {r.experience?.length > 0 && (
              <S title="Work Experience">
                {r.experience.map((e, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{e.title}</span>
                      <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{e.start} – {e.end || "Present"}</span>
                    </div>
                    <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 4 }}>
                      {e.company}{e.location && <span style={{ color: "#94a3b8", fontWeight: 400 }}> · {e.location}</span>}
                    </div>
                    <BulletList bullets={e.bullets} color={color} />
                  </div>
                ))}
              </S>
            )}
            {r.projects?.length > 0 && (
              <S title="Projects">
                {r.projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 7 }}>
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                    <span style={{ color: "#94a3b8", fontSize: 11 }}> · {p.stack}</span>
                    <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>{p.description}</div>
                  </div>
                ))}
              </S>
            )}
          </div>
          <div>
            {r.skills && (
              <S title="Skills">
                {[...(r.skills.technical || []), ...(r.skills.tools || [])].map((s, i) => (
                  <div key={i} style={{ fontSize: 11.5, padding: "4px 0", borderBottom: "1px solid #f1f5f9", color: "#374151" }}>{s}</div>
                ))}
              </S>
            )}
            {r.education?.length > 0 && (
              <S title="Education">
                {r.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{e.degree} in {e.field}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{e.school}</div>
                    <div style={{ fontSize: 10.5, color }}>Class of {e.year}</div>
                  </div>
                ))}
              </S>
            )}
            {r.certifications?.length > 0 && (
              <S title="Certifications">
                {r.certifications.map((c, i) => (
                  <div key={i} style={{ fontSize: 11, marginBottom: 5 }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ color: "#64748b" }}>{c.issuer} · {c.year}</div>
                  </div>
                ))}
              </S>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 8. TIMELINE — Vertical timeline dots on experience, storytelling-first
// ════════════════════════════════════════════════════════════════════════════════
function TimelineLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color, marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${color}`, display: "inline-block" }}>{title}</div>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
  return (
    <div style={{ fontFamily: "'Merriweather','Georgia',serif", fontSize: 12, color: "#1e293b", padding: "28px 32px", background: "#fff", lineHeight: 1.55 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
          {r.personal.name?.charAt(0) || "?"}
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>{r.personal.name}</div>
          <div style={{ fontSize: 13, color, fontWeight: 600, marginBottom: 4 }}>{r.experience?.[0]?.title || "Professional"}</div>
          <ContactRow personal={r.personal} color={color} sep=" · " />
        </div>
      </div>
      {thinRule(color + "30", 0, 18)}
      {r.summary && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#475569", lineHeight: 1.75, fontStyle: "italic" }}>"{r.summary}"</p>
        </div>
      )}
      {r.experience?.length > 0 && (
        <S title="Experience">
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: color + "30" }} />
            {r.experience.map((e, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 14 }}>
                <div style={{ position: "absolute", left: -24 + 7 - 5, top: 4, width: 10, height: 10, borderRadius: "50%", background: color, border: "2px solid #fff", boxShadow: `0 0 0 2px ${color}50` }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{e.title}</span>
                  <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{e.start} – {e.end || "Present"}</span>
                </div>
                <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 4 }}>
                  {e.company}{e.location && <span style={{ color: "#94a3b8", fontWeight: 400 }}> · {e.location}</span>}
                </div>
                <BulletList bullets={e.bullets} color={color} />
              </div>
            ))}
          </div>
        </S>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          {r.education?.length > 0 && (
            <S title="Education">
              {r.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{e.degree} in {e.field}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{e.school} · {e.year}</div>
                </div>
              ))}
            </S>
          )}
          {r.certifications?.length > 0 && (
            <S title="Certifications">
              {r.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 11.5, marginBottom: 5 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: "#64748b" }}>{c.issuer} · {c.year}</div>
                </div>
              ))}
            </S>
          )}
        </div>
        <div>
          {r.skills && <S title="Skills"><div>{[...(r.skills.technical || []), ...(r.skills.tools || [])].map((s, i) => <SkillPill key={i} label={s} color={color} />)}</div></S>}
          {r.projects?.length > 0 && (
            <S title="Projects">
              {r.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <div style={{ fontSize: 11, color: "#475569" }}>{p.description}</div>
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
// 9. COLUMNS — Pure typographic two-column, no sidebar colour, consulting style
// ════════════════════════════════════════════════════════════════════════════════
function ColumnsLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color, marginBottom: 6, borderBottom: `1.5px solid ${color}`, paddingBottom: 3 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Garamond','Georgia',serif", fontSize: 12, color: "#1e293b", padding: "28px 32px", background: "#fff", lineHeight: 1.55 }}>
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `3px solid ${color}` }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}>{r.personal.name}</div>
        <div style={{ fontSize: 13, color, fontWeight: 600, marginBottom: 6 }}>{r.experience?.[0]?.title || "Professional"}</div>
        <ContactRow personal={r.personal} color={color} sep="  ·  " />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 28 }}>
        <div>
          {r.summary && <S title="Summary"><p style={{ margin: 0, fontSize: 12.5, color: "#374151", lineHeight: 1.75 }}>{r.summary}</p></S>}
          {r.experience?.length > 0 && (
            <S title="Professional Experience">
              {r.experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{e.title}</span>
                    <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{e.start} – {e.end || "Present"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic", marginBottom: 4 }}>{e.company}{e.location && `, ${e.location}`}</div>
                  <BulletList bullets={e.bullets} color={color} />
                </div>
              ))}
            </S>
          )}
          {r.projects?.length > 0 && (
            <S title="Notable Projects">
              {r.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <span style={{ color: "#94a3b8", fontSize: 11 }}> · {p.stack}</span>
                  <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>{p.description}</div>
                </div>
              ))}
            </S>
          )}
        </div>
        <div>
          {r.skills && (
            <S title="Core Skills">
              {[...(r.skills.technical || []), ...(r.skills.tools || [])].map((s, i) => (
                <div key={i} style={{ fontSize: 11.5, padding: "3px 0", borderBottom: "1px solid #f1f5f9", color: "#374151" }}>{s}</div>
              ))}
            </S>
          )}
          {r.education?.length > 0 && (
            <S title="Education">
              {r.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{e.degree} in {e.field}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{e.school}</div>
                  <div style={{ fontSize: 10.5, color }}>{e.year}</div>
                </div>
              ))}
            </S>
          )}
          {r.certifications?.length > 0 && (
            <S title="Certifications">
              {r.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 11, marginBottom: 5 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: "#64748b" }}>{c.issuer} · {c.year}</div>
                </div>
              ))}
            </S>
          )}
          {r.languages?.length > 0 && (
            <S title="Languages">
              {r.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 11.5, color: "#374151" }}>{l.lang} <span style={{ color: "#94a3b8", fontSize: 10.5 }}>({l.level})</span></div>
              ))}
            </S>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 10. BOLD — Full-bleed colour header, strong visual brand, sales/marketing
// ════════════════════════════════════════════════════════════════════════════════
function BoldLayout({ resume: r, color }) {
  const S = ({ title, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", color: "#0f172a", background: color + "18", padding: "4px 10px", borderLeft: `4px solid ${color}`, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Raleway','Segoe UI',system-ui,sans-serif", fontSize: 12, color: "#1e293b", background: "#fff" }}>
      <div style={{ background: color, padding: "32px 32px 24px", position: "relative" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "rgba(0,0,0,.15)" }} />
        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-1px", textTransform: "uppercase" }}>{r.personal.name}</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,.85)", fontWeight: 600, letterSpacing: "1px", marginTop: 4 }}>{r.experience?.[0]?.title || "Professional"}</div>
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,.9)", background: "rgba(0,0,0,.2)", padding: "2px 10px", borderRadius: 20 }}>{v}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "22px 32px" }}>
        {r.summary && <S title="Who I Am"><p style={{ margin: 0, fontSize: 12.5, color: "#374151", lineHeight: 1.75 }}>{r.summary}</p></S>}
        {r.experience?.length > 0 && (
          <S title="Experience">
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{e.title}</span>
                  <span style={{ fontSize: 10, color, fontWeight: 700, background: color + "18", padding: "1px 8px", borderRadius: 20 }}>{e.start} – {e.end || "Present"}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>
                  {e.company}{e.location && <span style={{ color: "#64748b", fontWeight: 400 }}> · {e.location}</span>}
                </div>
                <BulletList bullets={e.bullets} color={color} />
              </div>
            ))}
          </S>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            {r.education?.length > 0 && (
              <S title="Education">
                {r.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 700 }}>{e.degree} in {e.field}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{e.school} · {e.year}</div>
                  </div>
                ))}
              </S>
            )}
            {r.certifications?.length > 0 && (
              <S title="Certifications">
                {r.certifications.map((c, i) => (
                  <div key={i} style={{ fontSize: 11.5, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: "#64748b" }}> · {c.issuer}</span>
                  </div>
                ))}
              </S>
            )}
          </div>
          <div>
            {r.skills && <S title="Skills"><div>{[...(r.skills.technical || []), ...(r.skills.tools || [])].map((s, i) => <SkillPill key={i} label={s} color={color} />)}</div></S>}
            {r.projects?.length > 0 && (
              <S title="Projects">
                {r.projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                    <div style={{ fontSize: 11, color: "#475569" }}>{p.description}</div>
                  </div>
                ))}
              </S>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORT — Router + Metadata
// Usage: <ResumePreview resume={r} layout="timeline" color="#0f4c81" />
// ════════════════════════════════════════════════════════════════════════════════
export default function ResumePreview({ resume, layout = "classic", color = "#0d9488" }) {
  const props = { resume, color };
  switch (layout) {
    case "modern":    return <ModernLayout    {...props} />;
    case "minimal":   return <MinimalLayout   {...props} />;
    case "executive": return <ExecutiveLayout {...props} />;
    case "creative":  return <CreativeLayout  {...props} />;
    case "compact":   return <CompactLayout   {...props} />;
    case "slate":     return <SlateLayout     {...props} />;
    case "timeline":  return <TimelineLayout  {...props} />;
    case "columns":   return <ColumnsLayout   {...props} />;
    case "bold":      return <BoldLayout      {...props} />;
    default:          return <ClassicLayout   {...props} />;
  }
}

// Metadata for layout picker UI — used in ResumeMaker template gallery
export const LAYOUT_META = {
  classic:   { label: "Classic",   desc: "Traditional centred header, ATS-safe",         icon: "📄", tags: ["ATS", "Formal", "Finance", "Legal"] },
  modern:    { label: "Modern",    desc: "Coloured sidebar, two-column",                  icon: "🎨", tags: ["Tech", "Engineering", "Data"] },
  minimal:   { label: "Minimal",   desc: "Ultra-clean, generous whitespace",              icon: "⬜", tags: ["Design", "UX", "Creative"] },
  executive: { label: "Executive", desc: "Bold banner, leadership presence",              icon: "👔", tags: ["Senior", "Management", "C-Suite"] },
  creative:  { label: "Creative",  desc: "Accent bar, expressive layout",                 icon: "✨", tags: ["Marketing", "Design", "Brand"] },
  compact:   { label: "Compact",   desc: "Info-dense, perfect for freshers",              icon: "📋", tags: ["Fresher", "Intern", "Short CV"] },
  slate:     { label: "Slate",     desc: "Dark header, clean corporate body",             icon: "🖤", tags: ["Finance", "Consulting", "MBA"] },
  timeline:  { label: "Timeline",  desc: "Vertical timeline, storytelling flow",          icon: "🕐", tags: ["PM", "Strategy", "Storytelling"] },
  columns:   { label: "Columns",   desc: "Typographic two-column, no sidebar colour",     icon: "📰", tags: ["Consulting", "Law", "Academia"] },
  bold:      { label: "Bold",      desc: "Full-bleed colour header, high visual impact",  icon: "🎯", tags: ["Sales", "BD", "Marketing"] },
};

export const ALL_LAYOUTS = Object.keys(LAYOUT_META);
