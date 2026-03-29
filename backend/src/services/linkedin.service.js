const roleSkills = require("../utils/roleSkills");
const {
  calculateHeadlineScore,
  calculateAboutScore,
  calculateExperienceScore,
  calculateSkillsScore,
} = require("../utils/scoring");

// Safely flatten any value (string, array of objects, etc.) into a single lowercase string
function flattenToText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "object" ? Object.values(item).join(" ") : String(item)
      )
      .join(" ");
  }
  return String(value);
}

exports.analyzeProfile = async ({
  linkedin_url,
  target_role,
  headline,
  about,
  experience,
  skills,
  projects,
  certifications,
  education,
}) => {
  const combinedText = [
    flattenToText(headline),
    flattenToText(about),
    flattenToText(skills),
    flattenToText(experience),
    flattenToText(projects),
    flattenToText(certifications),
    flattenToText(education),
  ]
    .join(" ")
    .toLowerCase();

  const skillsForRole = roleSkills[target_role] || [];

  let matchedSkills = [];
  let missingSkills = [];

  skillsForRole.forEach((skill) => {
    if (combinedText.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  let strengths = [];
  let improvements = [];

  if (matchedSkills.length > 0) {
    strengths.push(
      `Good presence of relevant skills: ${matchedSkills.join(", ")}`
    );
  }

  if (missingSkills.length > 0) {
    improvements.push(`Add missing skills: ${missingSkills.join(", ")}`);
  }

  if (!combinedText.match(/\d+%|\d+x|\d+\s?(increase|growth|reduction)/)) {
    improvements.push(
      "Add quantified achievements (e.g., increased performance by 20%)"
    );
  } else {
    strengths.push("Includes quantified achievements");
  }

  if (!combinedText.includes("data") && target_role === "Data Analyst") {
    improvements.push(
      "Include more domain-specific keywords like 'data', 'analysis'"
    );
  }

  const headlineScore    = calculateHeadlineScore(flattenToText(headline).toLowerCase());
  const aboutScore       = calculateAboutScore(flattenToText(about).toLowerCase());
  const experienceScore  = calculateExperienceScore(flattenToText(experience).toLowerCase());
  const skillsScore      = calculateSkillsScore(matchedSkills, skillsForRole);

  const overallScore = headlineScore + aboutScore + experienceScore + skillsScore;

  const headlineSuggestion = `${target_role} | ${skillsForRole
    .slice(0, 4)
    .join(" | ")} | Driving Insights`;

  return {
    linkedin_url,
    target_role,
    overall_score: overallScore,
    score_breakdown: {
      headline:   headlineScore,
      about:      aboutScore,
      experience: experienceScore,
      skills:     skillsScore,
    },
    strengths,
    improvements,
    missing_skills:      missingSkills,
    headline_suggestion: headlineSuggestion,
  };
};
