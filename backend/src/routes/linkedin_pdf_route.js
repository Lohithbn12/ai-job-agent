// linkedin_pdf_route.js
const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const { parseLinkedInPDF } = require("../utils/linkedin_pdf_parser");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Only PDF files are accepted"), false);
  },
});

// POST /linkedin/parse-pdf
router.post("/parse-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No PDF file uploaded" });
    }

    // Parser now accepts buffer directly and runs pdf-parse internally
    const parsed = await parseLinkedInPDF(req.file.buffer);
    res.json({ success: true, data: parsed });

  } catch (err) {
    console.error("LinkedIn PDF parse error:", err.message);
    res.status(500).json({ detail: "Failed to parse PDF: " + err.message });
  }
});

module.exports = router;
