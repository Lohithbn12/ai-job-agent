/**
 * src/routes/portfolio.routes.js
 *
 * POST /portfolio/generate
 *   - Accepts multipart/form-data: field "file" (PDF) + optional field "theme"
 *   - Parses PDF with pdf-parse
 *   - Calls Google Gemini API (FREE tier — no credit card needed)
 *   - Returns { html, theme, chars }
 *
 * FREE TIER LIMITS (Gemini 2.5 Flash):
 *   10 RPM · 250 000 TPM · 250 RPD  ← plenty for a portfolio tool
 *
 * Setup:
 *   1. Go to https://aistudio.google.com  (sign in with any Google account)
 *   2. Click "Get API key" → Create API key
 *   3. Add to your .env:  GEMINI_API_KEY=AIza...
 *   4. npm install @google/generative-ai pdf-parse multer
 */

"use strict";

const express  = require("express");
const multer   = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are supported"));
  },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const THEMES = {
  dark: {
    label: "Dark Minimal",
    hint: `
      Background: #0a0f1e (very dark navy). Text: #e2e8f0. Accent: #14b8a6 (teal).
      Cards: #0f172a with 1px border rgba(255,255,255,0.08). Headings: white.
      Section dividers: subtle horizontal rules. Font: 'Inter', system-ui.
      Links and buttons: #5eead4 teal. Nav bar: semi-transparent dark with blur.
    `,
  },
  light: {
    label: "Clean Light",
    hint: `
      Background: #ffffff. Text: #1e293b. Accent: #0d9488 (teal-600).
      Cards: #f8fafc with 1px border #e2e8f0. Headings: #0f172a.
      Section dividers: #e2e8f0. Font: 'Inter', system-ui.
      Links and buttons: #0d9488 teal.
    `,
  },
  gradient: {
    label: "Gradient Glass",
    hint: `
      Background: linear-gradient(135deg,#0f0c29,#302b63,#24243e) fixed.
      Glassmorphism cards: background rgba(255,255,255,0.06),
      backdrop-filter blur(12px), border 1px solid rgba(255,255,255,0.12).
      Text: #f1f5f9. Accent: #a78bfa (violet). Headings: white.
      Font: 'Plus Jakarta Sans', system-ui. Links: #c4b5fd.
    `,
  },
};

function buildPrompt(resumeText, theme) {
  const t = THEMES[theme] || THEMES.dark;
  return `
You are an expert frontend developer and portfolio designer.
Below is plain text extracted from a candidate's PDF resume.

Your ONLY task: output a complete, deployable, single-file HTML portfolio website for this person.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME:
${resumeText.slice(0, 6000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THEME: ${t.label}
${t.hint}

STRICT REQUIREMENTS:
1. Output ONLY the raw HTML document starting with <!DOCTYPE html>.
   Do NOT wrap it in markdown code fences. Do NOT add any explanation text.
2. All CSS inside one <style> tag in <head>. No external stylesheet files.
3. All JS inside one <script> tag before </body>. No external JS files.
   (You MAY import Google Fonts via a <link> tag.)
4. Sections to include (skip sections where the resume has no data):
   - Hero / Header: full name, job title, contact icons (email, phone, LinkedIn, GitHub)
   - About / Summary: concise professional bio 2-3 sentences
   - Skills: chip/tag layout, grouped by category when possible
   - Experience: timeline or card layout, newest first, with bullet achievements
   - Education: institution, degree, year
   - Projects: cards with name, description, tech stack tags, links
   - Certifications / Awards: if any in the resume
   - Footer / Contact CTA
5. UX rules:
   - Fully responsive at 375px and 1440px
   - Sticky nav bar with smooth-scroll links
   - CSS @keyframes fade-up animation via IntersectionObserver
   - Hover micro-interactions on cards (translateY + box-shadow)
   - Apply the theme colours exactly as described above
   - Professional and memorable design
6. Do NOT invent details that contradict the resume.
7. Return the FULL HTML without any truncation.
`;
}

router.post(
  "/generate",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ detail: "No PDF file uploaded." });
    }

    let resumeText = "";
    try {
      const parsed = await pdfParse(req.file.buffer);
      resumeText   = (parsed.text || "").trim();
    } catch (err) {
      return res.status(422).json({ detail: "Could not read PDF: " + err.message });
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(422).json({
        detail: "PDF appears to be empty or image-only. Please use a text-based PDF.",
      });
    }

    const theme = (req.body.theme || req.query.theme || "dark").toLowerCase();

    let html = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result   = await model.generateContent(buildPrompt(resumeText, theme));
      const response = await result.response;
      html = (response.text() || "").trim();

      // Strip any accidental markdown fences
      html = html
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      if (!html.toLowerCase().startsWith("<!doctype")) {
        throw new Error("Model did not return a valid HTML document.");
      }
    } catch (err) {
      console.error("[portfolio/generate] Gemini error:", err.message);
      return res.status(500).json({ detail: "AI generation failed: " + err.message });
    }

    return res.json({ html, theme, chars: html.length });
  }
);

module.exports = router;
