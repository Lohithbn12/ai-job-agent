/**
 * resume/parser.js
 * ──────────────────────────────────────────────────────────────────────────
 * Extracts raw text from a PDF resume using pdf-parse.
 * Replaces Python's pdfplumber-based parser.py.
 *
 * Exports:
 *   extractTextFromPDF(filePath)  → Promise<string>
 *   extractTextFromBuffer(buffer) → Promise<string>
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const fs      = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Extract all text from a PDF file on disk.
 *
 * @param {string} filePath  Absolute or relative path to the PDF
 * @returns {Promise<string>} Full text content, pages joined with newlines
 */
async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  return extractTextFromBuffer(buffer);
}

/**
 * Extract all text from a PDF buffer (e.g. from multer memory storage).
 *
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromBuffer(buffer) {
  try {
    const data = await pdfParse(buffer, {
      // Normalise whitespace between pages
      pagerender: (pageData) => {
        return pageData.getTextContent().then((content) => {
          return content.items.map((item) => item.str).join(" ") + "\n";
        });
      },
    });
    return _cleanText(data.text);
  } catch (err) {
    throw new Error(`[Parser] Failed to parse PDF: ${err.message}`);
  }
}

/**
 * Clean extracted text:
 *  - Collapse multiple blank lines
 *  - Remove non-printable characters
 *  - Normalise unicode dashes / bullets
 */
function _cleanText(raw) {
  return raw
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")   // strip non-ASCII junk
    .replace(/[ \t]{2,}/g, " ")              // collapse inline spaces
    .replace(/\n{3,}/g, "\n\n")              // max 2 consecutive newlines
    .replace(/[–—]/g, "-")                   // normalise dashes
    .replace(/[•●▪▸◆]/g, "-")               // normalise bullets
    .trim();
}

module.exports = { extractTextFromPDF, extractTextFromBuffer };
