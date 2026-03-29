exports.calculateHeadlineScore = (text) => {
  let score = 0;
  if (text.includes("analyst") || text.includes("developer")) score += 10;
  if (text.includes("|")) score += 5;
  if (text.length > 20) score += 5;
  return score;
};

exports.calculateAboutScore = (text) => {
  let score = 0;
  if (text.length > 100) score += 10;
  if (text.includes("experience")) score += 5;
  if (text.includes("skilled")) score += 5;
  return score;
};

exports.calculateExperienceScore = (text) => {
  let score = 0;
  if (text.includes("worked") || text.includes("developed")) score += 10;
  if (text.match(/\d+%|\d+x/)) score += 10;
  if (text.length > 200) score += 10;
  return score;
};

exports.calculateSkillsScore = (matchedSkills, totalSkills) => {
  if (totalSkills.length === 0) return 0;
  return Math.round((matchedSkills.length / totalSkills.length) * 30);
};