// src/controllers/roadmap.controller.js
const { buildRoadmap } = require("../services/roadmap.service");

exports.generateRoadmap = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !role.trim()) {
      return res.status(400).json({ detail: "role is required" });
    }
    const result = await buildRoadmap(role.trim());
    res.json(result);
  } catch (error) {
    console.error("Roadmap Error:", error.message);
    res.status(500).json({ detail: "Failed to generate roadmap" });
  }
};
