/**
 * resume/courseExtractor.js
 * ──────────────────────────────────────────────────────────────────────────
 * Extracts course / certification names found in resume text.
 * Replaces Python's course_extractor.py + utils/courses.py.
 *
 * Exports:
 *   extractCourses(resumeText) → string[]
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

// ── Courses database ──────────────────────────────────────────────────────────
// Mirrors Python's utils/courses.py COURSES_DB
// Ordered longest-first so multi-word names match before sub-phrases
const COURSES_DB = [
  // Google certifications
  "google data analytics professional certificate",
  "google advanced data analytics",
  "google business intelligence",
  "google project management certificate",
  "google ux design certificate",
  "google it support professional certificate",
  "google cybersecurity professional certificate",
  "google cloud professional data engineer",
  "google cloud associate cloud engineer",

  // Meta / Facebook
  "meta front-end developer professional certificate",
  "meta back-end developer professional certificate",
  "meta social media marketing professional certificate",
  "meta database engineer professional certificate",

  // IBM
  "ibm data science professional certificate",
  "ibm data analyst professional certificate",
  "ibm data engineering professional certificate",
  "ibm machine learning professional certificate",
  "ibm full stack software developer",
  "ibm applied ai professional certificate",
  "ibm devops and software engineering",

  // AWS
  "aws certified solutions architect",
  "aws certified developer",
  "aws certified cloud practitioner",
  "aws certified data engineer",
  "aws certified machine learning specialty",
  "aws certified sysops administrator",

  // Microsoft
  "microsoft azure fundamentals",
  "microsoft azure data engineer",
  "microsoft azure ai engineer",
  "microsoft certified: azure developer associate",
  "microsoft power bi data analyst",

  // Coursera Specialisations
  "deep learning specialization",
  "machine learning specialization",
  "data science specialization",
  "applied data science with python",
  "mathematics for machine learning",
  "algorithms specialization",
  "natural language processing specialization",
  "tensorflow developer professional certificate",
  "tensorflow: advanced techniques specialization",

  // Udacity Nanodegrees
  "data analyst nanodegree",
  "data scientist nanodegree",
  "machine learning engineer nanodegree",
  "deep learning nanodegree",
  "full stack web developer nanodegree",
  "react developer nanodegree",

  // Stanford / Andrew Ng
  "machine learning course",
  "cs229 machine learning",
  "cs231n convolutional neural networks",
  "cs224n natural language processing",

  // DataCamp
  "datacamp data scientist",
  "datacamp data analyst",
  "datacamp data engineer",
  "datacamp machine learning scientist",

  // Specific popular courses (short names — keep near bottom to avoid sub-matching)
  "python for everybody",
  "python for data science",
  "sql for data science",
  "the web developer bootcamp",
  "the complete javascript course",
  "react the complete guide",
  "docker and kubernetes",
  "complete machine learning & data science bootcamp",
  "100 days of code",
  "cs50",

  // Certifications (non-course)
  "certified data professional",
  "certified analytics professional",
  "pmp certification",
  "pmp",
  "scrum master certification",
  "certified scrum master",
  "six sigma green belt",
  "six sigma black belt",
];

// Sort by length descending so longer phrases match first
const SORTED_COURSES = [...COURSES_DB].sort((a, b) => b.length - a.length);


// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Find all known courses / certifications mentioned in resume text.
 *
 * @param {string} resumeText  Full resume text
 * @returns {string[]}  Deduplicated list of course names found
 */
function extractCourses(resumeText) {
  if (!resumeText) return [];

  const lower = resumeText.toLowerCase();
  const found = new Set();

  for (const course of SORTED_COURSES) {
    if (lower.includes(course.toLowerCase())) {
      found.add(course);
    }
  }

  return [...found];
}


module.exports = { extractCourses, COURSES_DB };
