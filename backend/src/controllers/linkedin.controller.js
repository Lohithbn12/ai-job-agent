const { analyzeProfile } = require("../services/linkedin.service");

exports.analyzeLinkedIn = async (req, res) => {
  try {
    const {
      linkedin_url,
      target_role,
      headline,
      about,
      skills,
      experience,
      education,
      projects,
      certifications,
    } = req.body;

    if (!target_role) {
      return res.status(400).json({
        detail: "target_role is required",
      });
    }

    const result = await analyzeProfile({
      linkedin_url,
      target_role,
      headline,
      about,
      skills,
      experience,
      education,
      projects,
      certifications,
    });

    res.json(result);
  } catch (error) {
    console.error("LinkedIn Analyzer Error:", error.message);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
