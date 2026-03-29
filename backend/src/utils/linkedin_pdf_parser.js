// linkedin_pdf_parser.js
// Built specifically around LinkedIn's actual PDF export format
// Analyzed from real LinkedIn PDF structure:
//
// PAGE 1 LAYOUT:
//   Contact          <- literal word
//   email
//   linkedin url
//   (LinkedIn)
//   Top Skills       <- literal section header
//   skill1
//   skill2
//   Certifications   <- literal section header
//   cert1
//   cert2
//   Full Name
//   Headline
//   City, State, Country
//   Summary          <- literal section header
//   summary text...
//   Experience       <- literal section header
//   Company Name
//   Job Title
//   Month YYYY - Month YYYY (X years Y months)
//   City, State, Country
//   description...
//   Education        <- literal section header
//   Institution
//   Degree · (Month YYYY - Month YYYY)

const pdfParse = require("pdf-parse");

// All known LinkedIn section headers (exact casing LinkedIn uses)
const KNOWN_SECTIONS = [
  "Contact", "Top Skills", "Certifications", "Licenses & Certifications",
  "Licenses", "Summary", "Experience", "Education", "Skills", "Projects",
  "Publications", "Volunteer Experience", "Volunteer", "Awards",
  "Honors & Awards", "Languages", "Courses", "Recommendations",
  "Accomplishments", "Organizations", "Patents", "Test Scores", "Interests",
];
const SECTION_SET = new Set(KNOWN_SECTIONS.map((s) => s.toLowerCase()));

const DATE_RANGE_RE = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}/i;
const PAGE_RE       = /^Page \d+ of \d+$/i;

// ── Step 1: Clean raw text ───────────────────────────────────────────────────
function cleanText(raw) {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !PAGE_RE.test(l))
    .join("\n");
}

// ── Step 2: Split into sections ──────────────────────────────────────────────
function splitSections(cleanedText) {
  const lines    = cleanedText.split("\n");
  const sections = { PREAMBLE: [] };
  let current    = "PREAMBLE";

  for (const line of lines) {
    if (SECTION_SET.has(line.toLowerCase())) {
      current = line;
      if (!sections[current]) sections[current] = [];
    } else {
      sections[current].push(line);
    }
  }
  return sections;
}

// ── Step 3: Name + Headline from preamble ────────────────────────────────────
// Preamble = Contact info (email, url, "(LinkedIn)") + Name + Headline + Location
function extractNameAndHeadline(lines = []) {
  const filtered = lines.filter(
    (l) =>
      !l.includes("@") &&
      !l.includes("www.") &&
      !l.includes("http") &&
      l !== "(LinkedIn)" &&
      l.toLowerCase() !== "contact"
  );
  // Name: first line that starts with capital and has a space (proper name)
  const nameIdx  = filtered.findIndex((l) => /^[A-Z][a-z]+ [A-Z]/.test(l));
  const name     = nameIdx >= 0 ? filtered[nameIdx]     : filtered[0] || "";
  const headline = nameIdx >= 0 ? filtered[nameIdx + 1] : filtered[1] || "";
  return { name, headline };
}

// ── Step 4: Skills ───────────────────────────────────────────────────────────
function extractSkills(sections) {
  const lines = sections["Top Skills"] || sections["Skills"] || [];
  return lines
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 80)
    .join(", ");
}

// ── Step 5: Certifications ───────────────────────────────────────────────────
function extractCertifications(sections) {
  const lines =
    sections["Licenses & Certifications"] ||
    sections["Certifications"]            ||
    sections["Licenses"]                  || [];

  if (!lines.length) return [{ name: "", provider: "", year: "" }];

  const entries = [];
  const yearRe  = /\d{4}/;
  let i = 0;

  while (i < lines.length) {
    const name     = lines[i] || "";
    const provider = lines[i + 1] && !yearRe.test(lines[i + 1]) ? lines[i + 1] : "";
    let   year     = "";
    let   j        = provider ? i + 2 : i + 1;

    if (j < lines.length && yearRe.test(lines[j])) {
      year = lines[j].match(yearRe)?.[0] || "";
      j++;
    }

    if (name) entries.push({ name, provider, year });
    i = j > i ? j : i + 1;
  }

  return entries.length > 0 ? entries : [{ name: "", provider: "", year: "" }];
}

// ── Step 6: About / Summary ──────────────────────────────────────────────────
function extractAbout(sections) {
  const lines = sections["Summary"] || sections["About"] || [];
  return lines.join(" ").trim();
}

// ── Step 7: Experience ───────────────────────────────────────────────────────
// LinkedIn experience block (from real PDF):
//   Company Name
//   Job Title
//   Month YYYY - Month YYYY (X year X months)   <- date line with optional duration
//   City, State, Country                         <- location
//   description...
function extractExperience(sections) {
  const lines = sections["Experience"] || [];
  if (!lines.length) return [{ title: "", company: "", duration: "", location: "", description: "" }];

  // Find block start indices:
  // A block starts at line i where lines[i+2] looks like a date range
  const blockStarts = [];
  for (let i = 0; i < lines.length - 2; i++) {
    if (DATE_RANGE_RE.test(lines[i + 2])) {
      blockStarts.push(i);
    }
  }

  if (blockStarts.length === 0) return fallbackExperience(lines);

  const entries = [];
  for (let b = 0; b < blockStarts.length; b++) {
    const start = blockStarts[b];
    const end   = b + 1 < blockStarts.length ? blockStarts[b + 1] : lines.length;

    const company = lines[start]     || "";
    const title   = lines[start + 1] || "";

    // Date line (index start+2)
    const rawDate = lines[start + 2] || "";
    // Remove "(1 year 4 months)" style suffix
    const duration = rawDate.replace(/\s*\([\d\syrsmomonth]+\)\s*$/i, "").trim();

    let descStart = start + 3;
    let location  = "";

    // Location: short line, no leading digit, not a date
    if (
      descStart < end &&
      lines[descStart].length < 70 &&
      !/^\d/.test(lines[descStart]) &&
      !DATE_RANGE_RE.test(lines[descStart])
    ) {
      location = lines[descStart];
      descStart++;
    }

    const description = lines.slice(descStart, end).join(" ").trim();

    if (company || title) {
      entries.push({ title, company, duration, location, description });
    }
  }

  return entries.length > 0
    ? entries
    : [{ title: "", company: "", duration: "", location: "", description: "" }];
}

function fallbackExperience(lines) {
  const entries = [];
  let i = 0;
  while (i < lines.length) {
    const company   = lines[i]     || "";
    const title     = lines[i + 1] || "";
    let   duration  = "";
    let   location  = "";
    const descLines = [];
    let   j         = i + 2;

    if (j < lines.length && DATE_RANGE_RE.test(lines[j])) {
      duration = lines[j].replace(/\(.*?\)/, "").trim();
      j++;
    }
    if (j < lines.length && lines[j].length < 70 && !/^\d/.test(lines[j])) {
      location = lines[j];
      j++;
    }
    while (j < lines.length && !DATE_RANGE_RE.test(lines[j])) {
      descLines.push(lines[j]);
      j++;
    }
    if (company) {
      entries.push({ title, company, duration, location, description: descLines.join(" ").trim() });
    }
    i = j > i ? j : i + 1;
  }
  return entries.length > 0
    ? entries
    : [{ title: "", company: "", duration: "", location: "", description: "" }];
}

// ── Step 8: Education ────────────────────────────────────────────────────────
// LinkedIn education format:
//   Institution Name
//   Degree Name · (Month YYYY - Month YYYY)
//   OR
//   Institution Name
//    · (Month YYYY - Month YYYY)
function extractEducation(sections) {
  const lines   = sections["Education"] || [];
  if (!lines.length) return [{ institution: "", degree: "", year: "", description: "" }];

  const entries  = [];
  // Matches lines like "Master of Science - MS, Statistics · (January 2022 - January 2024)"
  const eduLineRe = /·\s*\(.*\d{4}/;
  let i = 0;

  while (i < lines.length) {
    const institution = lines[i] || "";
    let   degree      = "";
    let   year        = "";
    const descLines   = [];
    let   j           = i + 1;

    if (j < lines.length && eduLineRe.test(lines[j])) {
      const parts  = lines[j].split("·");
      degree       = parts[0].trim();
      const years  = (parts[1] || "").match(/\d{4}/g) || [];
      year         = years[years.length - 1] || ""; // graduation year = last year
      j++;
    } else if (j < lines.length && /\d{4}/.test(lines[j])) {
      year = (lines[j].match(/\d{4}/) || [""])[0];
      j++;
    }

    // Optional description lines
    while (j < lines.length && !eduLineRe.test(lines[j]) && lines[j].length > 20) {
      descLines.push(lines[j]);
      j++;
    }

    if (institution) {
      entries.push({ institution, degree, year, description: descLines.join(" ").trim() });
    }
    i = j > i ? j : i + 1;
  }

  return entries.length > 0
    ? entries
    : [{ institution: "", degree: "", year: "", description: "" }];
}

// ── Step 9: Projects ─────────────────────────────────────────────────────────
function extractProjects(sections) {
  const lines = sections["Projects"] || [];
  if (!lines.length) return [{ title: "", description: "", tech: "" }];

  const entries = [];
  let i = 0;
  while (i < lines.length) {
    const title     = lines[i] || "";
    const descLines = [];
    let   j         = i + 1;
    while (j < lines.length && lines[j].length > 30) {
      descLines.push(lines[j]);
      j++;
    }
    if (title) entries.push({ title, description: descLines.join(" ").trim(), tech: "" });
    i = j > i ? j : i + 1;
  }
  return entries.length > 0 ? entries : [{ title: "", description: "", tech: "" }];
}

// ── Main export ──────────────────────────────────────────────────────────────
async function parseLinkedInPDF(pdfBuffer) {
  const pdfData = await pdfParse(pdfBuffer);
  const rawText = pdfData.text;

  if (!rawText || rawText.trim().length < 50) {
    throw new Error(
      "Could not extract text from PDF. Ensure it is a LinkedIn profile PDF export."
    );
  }

  const cleaned  = cleanText(rawText);
  const sections = splitSections(cleaned);
  const { headline } = extractNameAndHeadline(sections["PREAMBLE"]);

  return {
    headline,
    about:          extractAbout(sections),
    skills:         extractSkills(sections),
    experience:     extractExperience(sections),
    education:      extractEducation(sections),
    projects:       extractProjects(sections),
    certifications: extractCertifications(sections),
  };
}

module.exports = { parseLinkedInPDF };
