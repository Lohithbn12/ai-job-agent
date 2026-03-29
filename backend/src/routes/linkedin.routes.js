const express = require("express");
const router = express.Router();

const { analyzeLinkedIn } = require("../controllers/linkedin.controller");

// POST /linkedin/analyze
router.post("/analyze", analyzeLinkedIn);

module.exports = router;