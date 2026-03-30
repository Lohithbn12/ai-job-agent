// src/routes/roadmap.routes.js
const express = require("express");
const router  = express.Router();
const { generateRoadmap } = require("../controllers/roadmap.controller");

// POST /roadmap/generate
router.post("/generate", generateRoadmap);

module.exports = router;
