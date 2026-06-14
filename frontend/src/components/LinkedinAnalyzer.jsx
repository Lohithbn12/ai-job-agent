import React, { useState, useRef } from "react";
import "../App.css";

// ── How to export LinkedIn PDF — shown as a step guide ───────────────────
const EXPORT_STEPS = [
  { icon: "👤", text: 'Go to your LinkedIn profile page' },
  { icon: "⋯", text: 'Click the "More" button below your name' },
  { icon: "💾", text: 'Select "Save to PDF"' },
  { icon: "📤", text: 'Upload the downloaded PDF below' },
];

function LinkedinAnalyzer() {
  // ── Input mode ───────────────────────────────────────────────────────────
  const [importMode, setImportMode] = useState("choose"); // "choose" | "pdf" | "manual"
  const [pdfState, setPdfState] = useState("idle"); // "idle" | "parsing" | "done" | "error"
  const [pdfError, setPdfError] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const fileRef = useRef(null);

  // ── Form state ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    linkedin_url: "",
    target_role: "Data Analyst",
    headline: "",
    about: "",
    skills: "",
  });

  const [experiences, setExperiences] = useState([
    { title: "", company: "", duration: "", location: "", description: "" },
  ]);
  const [educations, setEducations] = useState([
    { degree: "", institution: "", year: "", description: "" },
  ]);
  const [projectsList, setProjectsList] = useState([
    { title: "", description: "", tech: "" },
  ]);
  const [certificationsList, setCertificationsList] = useState([
    { name: "", provider: "", year: "" },
  ]);

  // ── Result state ─────────────────────────────────────────────────────────
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Form field helpers ───────────────────────────────────────────────────
  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleExpChange = (i, field, value) => {
    const u = [...experiences]; u[i][field] = value; setExperiences(u);
  };
  const addExperience = () => setExperiences([...experiences, { title: "", company: "", duration: "", location: "", description: "" }]);
  const removeExperience = (i) => setExperiences(experiences.filter((_, idx) => idx !== i));

  const handleEducationChange = (i, field, value) => {
    const u = [...educations]; u[i][field] = value; setEducations(u);
  };
  const addEducation = () => setEducations([...educations, { degree: "", institution: "", year: "", description: "" }]);
  const removeEducation = (i) => setEducations(educations.filter((_, idx) => idx !== i));

  const handleProjectChange = (i, field, value) => {
    const u = [...projectsList]; u[i][field] = value; setProjectsList(u);
  };
  const addProject = () => setProjectsList([...projectsList, { title: "", description: "", tech: "" }]);
  const removeProject = (i) => setProjectsList(projectsList.filter((_, idx) => idx !== i));

  const handleCertChange = (i, field, value) => {
    const u = [...certificationsList]; u[i][field] = value; setCertificationsList(u);
  };
  const addCert = () => setCertificationsList([...certificationsList, { name: "", provider: "", year: "" }]);
  const removeCert = (i) => setCertificationsList(certificationsList.filter((_, idx) => idx !== i));

  // ── PDF Import ───────────────────────────────────────────────────────────
  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfState("parsing");
    setPdfError("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("http://localhost:8000/linkedin/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Parse failed");

      // Auto-fill all form fields from parsed PDF
      const d = data.data;

      setForm((prev) => ({
        ...prev,
        headline: d.headline || "",
        about: d.about || "",
        skills: d.skills || "",
      }));

      if (d.experience?.length > 0) setExperiences(d.experience);
      if (d.education?.length > 0) setEducations(d.education);
      if (d.projects?.length > 0) setProjectsList(d.projects);
      if (d.certifications?.length > 0) setCertificationsList(d.certifications);

      setPdfState("done");
      // Switch to manual form so user can review/edit
      setImportMode("manual");
    } catch (err) {
      setPdfState("error");
      setPdfError(err.message);
    }

    // Reset file input so same file can be re-uploaded if needed
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Analyze ──────────────────────────────────────────────────────────────
  const analyzeProfile = async () => {
    if (!form.target_role) { alert("Target Role is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/linkedin/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experience: experiences,
          education: educations,
          projects: projectsList,
          certifications: certificationsList,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing profile");
    }
    setLoading(false);
  };

  // ── Choose screen ────────────────────────────────────────────────────────
  if (importMode === "choose") {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-title">LinkedIn Profile Analyzer</div>
            <div className="page-subtitle">Optimize your profile for hiring managers 🚀</div>
          </div>
        </div>

        <div className="card section" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h3 style={{ marginBottom: 8 }}>How would you like to add your profile?</h3>
          <p style={{ color: "#8888a8", fontSize: 14, marginBottom: 28 }}>
            Choose the easiest option for you
          </p>

          {/* PDF Option */}
          <div
            className="card section"
            style={{ cursor: "pointer", border: "2px solid #2563eb", marginBottom: 16, textAlign: "left" }}
            onClick={() => setImportMode("pdf")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 32 }}>📄</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                  Import from LinkedIn PDF
                  <span style={{
                    background: "#2563eb", color: "#fff", fontSize: 10,
                    borderRadius: 4, padding: "2px 7px", marginLeft: 8, verticalAlign: "middle"
                  }}>RECOMMENDED</span>
                </div>
                <div style={{ color: "#8888a8", fontSize: 13 }}>
                  Export your profile as a PDF from LinkedIn and upload it here. We'll fill everything in automatically.
                </div>
              </div>
            </div>
          </div>

          {/* Manual Option */}
          <div
            className="card section"
            style={{ cursor: "pointer", textAlign: "left" }}
            onClick={() => setImportMode("manual")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 32 }}>✏️</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Fill in Manually</div>
                <div style={{ color: "#8888a8", fontSize: 13 }}>
                  Type in your profile details directly. Best if you want full control over what gets analyzed.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PDF import screen ────────────────────────────────────────────────────
  if (importMode === "pdf") {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="page-title">Import LinkedIn PDF</div>
            <div className="page-subtitle">We'll read your profile automatically</div>
          </div>
        </div>

        {/* Step guide toggle */}
        <div className="card section">
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            onClick={() => setShowGuide(!showGuide)}
          >
            <h3 style={{ margin: 0 }}>📋 How to export your LinkedIn PDF</h3>
            <span style={{ color: "#8888a8", fontSize: 20 }}>{showGuide ? "▲" : "▼"}</span>
          </div>

          {showGuide && (
            <div style={{ marginTop: 16 }}>
              {EXPORT_STEPS.map((step, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "10px 0", borderBottom: i < EXPORT_STEPS.length - 1 ? "1px solid #1e293b" : "none"
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: "#1e3a5f",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0
                  }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, color: "#444460", marginBottom: 2 }}>Step {i + 1}</div>
                    <div style={{ fontSize: 14 }}>{step.text}</div>
                  </div>
                </div>
              ))}

              <div style={{
                background: "#0f2d1f", border: "1px solid #1a3a2a",
                borderRadius: 8, padding: 12, marginTop: 14,
                fontSize: 13, color: "#10b981"
              }}>
                💡 Tip: Make sure your full profile is visible (public or private, both work) before saving to PDF.
              </div>
            </div>
          )}
        </div>

        {/* Upload area */}
        <div className="card section">
          <h3 style={{ marginBottom: 16 }}>Upload Your LinkedIn PDF</h3>

          <div
            style={{
              border: "2px dashed #1e3a5f", borderRadius: 12,
              padding: "36px 24px", textAlign: "center",
              cursor: "pointer", transition: "border-color 0.2s",
              background: "#0b1628"
            }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handlePDFUpload({ target: { files: [file] } });
            }}
          >
            {pdfState === "idle" && (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Drop your PDF here</div>
                <div style={{ color: "#8888a8", fontSize: 13 }}>or click to browse files</div>
              </>
            )}

            {pdfState === "parsing" && (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Reading your profile...</div>
                <div style={{ color: "#8888a8", fontSize: 13 }}>This takes just a second</div>
              </>
            )}

            {pdfState === "error" && (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
                <div style={{ fontWeight: 600, color: "#f43f5e", marginBottom: 6 }}>Upload failed</div>
                <div style={{ color: "#444460", fontSize: 13 }}>{pdfError}</div>
                <div style={{ color: "#8888a8", fontSize: 12, marginTop: 8 }}>Click to try again</div>
              </>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handlePDFUpload}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setImportMode("choose")}>
            ← Back
          </button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setImportMode("manual")}>
            Fill in manually instead
          </button>
        </div>
      </div>
    );
  }

  // ── Manual form (also shown after PDF auto-fill for review) ──────────────
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">LinkedIn Profile Analyzer</div>
          <div className="page-subtitle">
            {pdfState === "done"
              ? "✅ Profile imported from PDF — review and edit below"
              : "Optimize your profile for hiring managers 🚀"}
          </div>
        </div>
      </div>

      {/* Back + PDF import option banner (when in manual mode from choose screen) */}
      {pdfState !== "done" && (
        <div className="card section" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "#0f1f3d", border: "1px solid #1e3a5f"
        }}>
          <div style={{ fontSize: 13, color: "#444460" }}>
            💡 Want to auto-fill from PDF instead?
          </div>
          <button
            className="btn btn-outline"
            style={{ padding: "6px 14px", fontSize: 12, marginBottom: 0 }}
            onClick={() => setImportMode("pdf")}
          >
            Import PDF
          </button>
        </div>
      )}

      {/* BASIC INFO */}
      <div className="card section">
        <h3>Basic Info</h3>
        <input
          className="input section"
          placeholder="LinkedIn URL (optional)"
          value={form.linkedin_url}
          onChange={(e) => handleChange("linkedin_url", e.target.value)}
        />
        <select
          className="input section"
          value={form.target_role}
          onChange={(e) => handleChange("target_role", e.target.value)}
        >
          <optgroup label="Data & Analytics">
            <option>Data Analyst</option>
            <option>Data Scientist</option>
            <option>Business Analyst</option>
            <option>Data Engineer</option>
            <option>Business Intelligence Analyst</option>
            <option>Analytics Engineer</option>
          </optgroup>
          <optgroup label="AI & ML">
            <option>Machine Learning Engineer</option>
            <option>AI Engineer</option>
          </optgroup>
          <optgroup label="Engineering">
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
            <option>Software Engineer</option>
            <option>Web Developer</option>
            <option>Mobile App Developer</option>
            <option>DevOps Engineer</option>
            <option>Cloud Engineer</option>
            <option>Site Reliability Engineer</option>
          </optgroup>
          <optgroup label="Other">
            <option>Cyber Security Analyst</option>
            <option>Security Engineer</option>
            <option>QA Engineer</option>
            <option>Test Engineer</option>
            <option>Product Manager</option>
            <option>Project Manager</option>
            <option>Program Manager</option>
            <option>UI/UX Designer</option>
            <option>Graphic Designer</option>
            <option>System Administrator</option>
            <option>Network Engineer</option>
            <option>Database Administrator</option>
          </optgroup>
        </select>
      </div>

      {/* CORE */}
      <div className="card section">
        <h3>Core Profile Sections</h3>
        <input
          className="input section"
          placeholder="Headline"
          value={form.headline}
          onChange={(e) => handleChange("headline", e.target.value)}
        />
        <textarea
          className="input section"
          rows="4"
          placeholder="About Section"
          value={form.about}
          onChange={(e) => handleChange("about", e.target.value)}
        />

        <h3>Experience</h3>
        {experiences.map((exp, index) => (
          <div key={index} className="section" style={{ borderBottom: "1px solid #1e293b", paddingBottom: 15 }}>
            <input className="input section" placeholder="Job Title" value={exp.title}
              onChange={(e) => handleExpChange(index, "title", e.target.value)} />
            <input className="input section" placeholder="Company" value={exp.company}
              onChange={(e) => handleExpChange(index, "company", e.target.value)} />
            <input className="input section" placeholder="Duration (e.g. Aug 2024 - Present)" value={exp.duration}
              onChange={(e) => handleExpChange(index, "duration", e.target.value)} />
            <input className="input section" placeholder="Location" value={exp.location}
              onChange={(e) => handleExpChange(index, "location", e.target.value)} />
            <textarea className="input section" rows="3" placeholder="Description" value={exp.description}
              onChange={(e) => handleExpChange(index, "description", e.target.value)} />
            {experiences.length > 1 && (
              <button className="btn btn-outline" onClick={() => removeExperience(index)}>Remove</button>
            )}
          </div>
        ))}
        <button className="btn btn-primary" onClick={addExperience}>+ Add Experience</button>

        <input
          className="input section"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={(e) => handleChange("skills", e.target.value)}
        />
      </div>

      {/* OPTIONAL */}
      <div className="card section">
        <h3>Optional Sections</h3>

        <div className="card section">
          <h3>Projects</h3>
          {projectsList.map((proj, i) => (
            <div key={i} className="section">
              <input className="input section" placeholder="Project Title" value={proj.title}
                onChange={(e) => handleProjectChange(i, "title", e.target.value)} />
              <textarea className="input section" placeholder="Description" value={proj.description}
                onChange={(e) => handleProjectChange(i, "description", e.target.value)} />
              <input className="input section" placeholder="Tech Stack" value={proj.tech}
                onChange={(e) => handleProjectChange(i, "tech", e.target.value)} />
              {projectsList.length > 1 && (
                <button className="btn btn-outline" onClick={() => removeProject(i)}>Remove</button>
              )}
            </div>
          ))}
          <button className="btn btn-primary" onClick={addProject}>+ Add Project</button>
        </div>

        <div className="card section">
          <h3>Certifications</h3>
          {certificationsList.map((cert, i) => (
            <div key={i} className="section">
              <input className="input section" placeholder="Certification Name" value={cert.name}
                onChange={(e) => handleCertChange(i, "name", e.target.value)} />
              <input className="input section" placeholder="Provider" value={cert.provider}
                onChange={(e) => handleCertChange(i, "provider", e.target.value)} />
              <input className="input section" placeholder="Year" value={cert.year}
                onChange={(e) => handleCertChange(i, "year", e.target.value)} />
              {certificationsList.length > 1 && (
                <button className="btn btn-outline" onClick={() => removeCert(i)}>Remove</button>
              )}
            </div>
          ))}
          <button className="btn btn-primary" onClick={addCert}>+ Add Certification</button>
        </div>

        <div className="card section">
          <h3>Education</h3>
          {educations.map((edu, i) => (
            <div key={i} className="section">
              <input className="input section" placeholder="Degree" value={edu.degree}
                onChange={(e) => handleEducationChange(i, "degree", e.target.value)} />
              <input className="input section" placeholder="Institution" value={edu.institution}
                onChange={(e) => handleEducationChange(i, "institution", e.target.value)} />
              <input className="input section" placeholder="Year" value={edu.year}
                onChange={(e) => handleEducationChange(i, "year", e.target.value)} />
              <textarea className="input section" placeholder="Description" value={edu.description}
                onChange={(e) => handleEducationChange(i, "description", e.target.value)} />
              {educations.length > 1 && (
                <button className="btn btn-outline" onClick={() => removeEducation(i)}>Remove</button>
              )}
            </div>
          ))}
          <button className="btn btn-primary" onClick={addEducation}>+ Add Education</button>
        </div>
      </div>

      <button className="btn btn-primary" onClick={analyzeProfile}>
        {loading ? "Analyzing..." : "Analyze Profile"}
      </button>

      {result && result.strengths && (
        <div className="card section">
          <h3>Overall Score: {result.overall_score}</h3>
          <div className="divider"></div>
          <h4>Strengths</h4>
          <ul>{(result.strengths || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
          <h4>Improvements</h4>
          <ul>{(result.improvements || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
          <h4>Missing Skills</h4>
          <ul>{(result.missing_skills || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
          <div className="divider"></div>
          <h4>Suggested Headline</h4>
          <p className="badge">{result.headline_suggestion}</p>
        </div>
      )}
    </div>
  );
}

export default LinkedinAnalyzer;
