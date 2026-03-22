/**
 * routes/courses.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * POST /search-courses/
 * Returns free courses and certifications from all major platforms.
 *
 * Platforms covered (free or free-to-audit):
 *   Coursera, edX, Simplilearn, Google Digital Garage,
 *   freeCodeCamp, Khan Academy, MIT OpenCourseWare,
 *   YouTube, Udacity (free content), Alison, NPTEL,
 *   IBM SkillsBuild, Microsoft Learn, AWS Skill Builder,
 *   LinkedIn Learning (free tier), Great Learning
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const express = require("express");
const router  = express.Router();


// ── POST /search-courses/ ─────────────────────────────────────────────────────

router.post("/search-courses/", async (req, res) => {
  const keyword = (req.body?.keyword || "").trim();
  if (!keyword) {
    return res.json({ courses: [], total: 0, by_platform: {} });
  }

  const courses = _searchFreeCourses(keyword, 8);

  const byPlatform = {};
  for (const c of courses) {
    const p = c.platform || "Other";
    byPlatform[p] = (byPlatform[p] || 0) + 1;
  }

  return res.json({ courses, total: courses.length, by_platform: byPlatform });
});


// ── Course database ───────────────────────────────────────────────────────────
// All entries are free-to-access or free-to-audit.
// Shape: { title, platform, url, level, free: true, certificate? }

const COURSE_DB = {

  // ══════════════════════════════════════════════════════════════════════════
  python: [
    { title:"Python for Everybody Specialization",          platform:"Coursera",            url:"https://www.coursera.org/specializations/python",                              level:"Beginner",     certificate:true  },
    { title:"Python Basics",                                platform:"Coursera",            url:"https://www.coursera.org/learn/python-basics",                                level:"Beginner",     certificate:true  },
    { title:"Introduction to Python Programming",           platform:"edX",                 url:"https://www.edx.org/learn/python",                                            level:"Beginner",     certificate:true  },
    { title:"Python for Data Science",                      platform:"Simplilearn",         url:"https://www.simplilearn.com/free-python-course-skillup",                      level:"Beginner",     certificate:true  },
    { title:"Python Tutorial for Beginners",                platform:"YouTube",             url:"https://www.youtube.com/watch?v=eWRyvpFn3gQ",                                level:"Beginner",     certificate:false },
    { title:"Scientific Computing with Python",             platform:"freeCodeCamp",        url:"https://www.freecodecamp.org/learn/scientific-computing-with-python/",         level:"Beginner",     certificate:true  },
    { title:"Python Programming",                           platform:"Khan Academy",        url:"https://www.khanacademy.org/computing/intro-to-python-fundamentals",           level:"Beginner",     certificate:false },
    { title:"Python and Statistics for Financial Analysis", platform:"Coursera",            url:"https://www.coursera.org/learn/python-statistics-financial-analysis",         level:"Intermediate", certificate:true  },
    { title:"Python for Machine Learning",                  platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/python-for-machine-learning", level:"Intermediate", certificate:true },
    { title:"Automate the Boring Stuff with Python",        platform:"YouTube",             url:"https://www.youtube.com/watch?v=1F_OgqRuSD0",                                level:"Intermediate", certificate:false },
    { title:"Python Programming MOOC",                      platform:"University of Helsinki", url:"https://programming-mooc.fi",                                              level:"Beginner",     certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  sql: [
    { title:"SQL for Data Science",                         platform:"Coursera",            url:"https://www.coursera.org/learn/sql-for-data-science",                         level:"Beginner",     certificate:true  },
    { title:"Introduction to SQL",                          platform:"edX",                 url:"https://www.edx.org/learn/sql",                                               level:"Beginner",     certificate:true  },
    { title:"SQL and Databases",                            platform:"freeCodeCamp",        url:"https://www.freecodecamp.org/learn/relational-database/",                     level:"Beginner",     certificate:true  },
    { title:"SQL Tutorial – Full Course",                   platform:"YouTube",             url:"https://www.youtube.com/watch?v=HXV3zeQKqGY",                                level:"Beginner",     certificate:false },
    { title:"Intro to SQL",                                 platform:"Khan Academy",        url:"https://www.khanacademy.org/computing/computer-programming/sql",              level:"Beginner",     certificate:false },
    { title:"SQL Fundamentals",                             platform:"Simplilearn",         url:"https://www.simplilearn.com/free-online-course-to-learn-sql-basics-skillup",  level:"Beginner",     certificate:true  },
    { title:"SQL for Analytics",                            platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/sql-for-data-analytics", level:"Intermediate", certificate:true },
    { title:"PostgreSQL Tutorial",                          platform:"YouTube",             url:"https://www.youtube.com/watch?v=qw--VYLpxG4",                                level:"Intermediate", certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "machine learning": [
    { title:"Machine Learning Specialization",              platform:"Coursera",            url:"https://www.coursera.org/specializations/machine-learning-introduction",      level:"Intermediate", certificate:true  },
    { title:"Machine Learning with Python",                 platform:"edX",                 url:"https://www.edx.org/learn/machine-learning",                                  level:"Intermediate", certificate:true  },
    { title:"Machine Learning",                             platform:"Simplilearn",         url:"https://www.simplilearn.com/free-machine-learning-course-skillup",            level:"Intermediate", certificate:true  },
    { title:"Machine Learning Crash Course",                platform:"Google Digital Garage",url:"https://developers.google.com/machine-learning/crash-course",               level:"Beginner",     certificate:true  },
    { title:"Practical Deep Learning for Coders",           platform:"fast.ai",             url:"https://course.fast.ai",                                                     level:"Intermediate", certificate:false },
    { title:"Machine Learning A-Z",                         platform:"YouTube",             url:"https://www.youtube.com/watch?v=GwIo3gDZCVQ",                                level:"Beginner",     certificate:false },
    { title:"Machine Learning for All",                     platform:"Coursera",            url:"https://www.coursera.org/learn/uol-machine-learning-for-all",                level:"Beginner",     certificate:true  },
    { title:"Intro to Machine Learning",                    platform:"Kaggle",              url:"https://www.kaggle.com/learn/intro-to-machine-learning",                     level:"Beginner",     certificate:true  },
    { title:"Machine Learning Fundamentals",                platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/machine-learning-fundamentals", level:"Beginner", certificate:true },
    { title:"Machine Learning with Python — Full Course",   platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=tPYj3fFJGjk",                                level:"Intermediate", certificate:false },
    { title:"MIT 6.S191: Introduction to Deep Learning",    platform:"MIT OpenCourseWare",  url:"https://introtodeeplearning.com",                                             level:"Advanced",     certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "data science": [
    { title:"IBM Data Science Professional Certificate",    platform:"Coursera",            url:"https://www.coursera.org/professional-certificates/ibm-data-science",         level:"Beginner",     certificate:true  },
    { title:"Data Science Fundamentals",                    platform:"edX",                 url:"https://www.edx.org/learn/data-science",                                      level:"Beginner",     certificate:true  },
    { title:"Data Science with Python",                     platform:"Simplilearn",         url:"https://www.simplilearn.com/free-data-science-course-skillup",                level:"Beginner",     certificate:true  },
    { title:"Data Science: Productivity Tools",             platform:"edX",                 url:"https://www.edx.org/learn/data-science/harvard-university-data-science-productivity-tools", level:"Intermediate", certificate:true },
    { title:"Data Science — Full Course",                   platform:"YouTube",             url:"https://www.youtube.com/watch?v=ua-CiDNNj30",                                level:"Beginner",     certificate:false },
    { title:"Data Science for Everyone",                    platform:"Alison",              url:"https://alison.com/course/introduction-to-data-science",                     level:"Beginner",     certificate:true  },
    { title:"Data Analyst Bootcamp",                        platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=PSNXoAs2FtQ",                                level:"Beginner",     certificate:false },
    { title:"Data Science Foundations",                     platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/data-science-foundations", level:"Beginner", certificate:true },
    { title:"Data Science with Python NPTEL",               platform:"NPTEL",               url:"https://nptel.ac.in/courses/106106116",                                       level:"Intermediate", certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "data analysis": [
    { title:"Google Data Analytics Professional Certificate",platform:"Coursera",           url:"https://www.coursera.org/professional-certificates/google-data-analytics",    level:"Beginner",     certificate:true  },
    { title:"Data Analysis with Python",                    platform:"freeCodeCamp",        url:"https://www.freecodecamp.org/learn/data-analysis-with-python/",               level:"Intermediate", certificate:true  },
    { title:"Data Analysis Fundamentals",                   platform:"Simplilearn",         url:"https://www.simplilearn.com/free-data-analytics-course-skillup",              level:"Beginner",     certificate:true  },
    { title:"Data Analysis with Python — Full Course",      platform:"YouTube",             url:"https://www.youtube.com/watch?v=r-uOLxNrNk8",                                level:"Beginner",     certificate:false },
    { title:"Data Analysis Using Excel",                    platform:"edX",                 url:"https://www.edx.org/learn/data-analysis/microsoft-analyzing-and-visualizing-data-with-excel", level:"Beginner", certificate:true },
    { title:"Statistics for Data Analysis",                 platform:"Alison",              url:"https://alison.com/course/statistics-for-data-analysis-using-microsoft-excel", level:"Beginner",    certificate:true  },
    { title:"Data Analysis Bootcamp",                       platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/data-analysis-using-excel", level:"Beginner", certificate:true },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "power bi": [
    { title:"Microsoft Power BI Data Analyst",              platform:"Microsoft Learn",     url:"https://learn.microsoft.com/en-us/training/paths/get-started-power-bi/",       level:"Beginner",     certificate:true  },
    { title:"Power BI Full Course",                         platform:"YouTube",             url:"https://www.youtube.com/watch?v=TmhQCQr_0aA",                                level:"Beginner",     certificate:false },
    { title:"Power BI for Beginners",                       platform:"Simplilearn",         url:"https://www.simplilearn.com/free-power-bi-course-skillup",                    level:"Beginner",     certificate:true  },
    { title:"Analyzing Data with Power BI",                 platform:"edX",                 url:"https://www.edx.org/learn/power-bi",                                          level:"Beginner",     certificate:true  },
    { title:"Power BI Tutorial",                            platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/power-bi",     level:"Beginner",     certificate:true  },
    { title:"Power BI — Full Course for Beginners",         platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=NNSHu0rkew8",                                level:"Beginner",     certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  tableau: [
    { title:"Data Visualisation with Tableau",              platform:"Coursera",            url:"https://www.coursera.org/specializations/data-visualization",                  level:"Beginner",     certificate:true  },
    { title:"Tableau for Beginners",                        platform:"Simplilearn",         url:"https://www.simplilearn.com/free-tableau-course-skillup",                     level:"Beginner",     certificate:true  },
    { title:"Tableau Tutorial — Full Course",               platform:"YouTube",             url:"https://www.youtube.com/watch?v=TPMlZxRRaBQ",                                level:"Beginner",     certificate:false },
    { title:"Introduction to Tableau",                      platform:"Alison",              url:"https://alison.com/course/introduction-to-tableau",                          level:"Beginner",     certificate:true  },
    { title:"Tableau Fundamentals",                         platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/tableau-for-beginners", level:"Beginner", certificate:true },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  javascript: [
    { title:"JavaScript Algorithms and Data Structures",    platform:"freeCodeCamp",        url:"https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",level:"Beginner",     certificate:true  },
    { title:"The Complete JavaScript Course",               platform:"YouTube",             url:"https://www.youtube.com/watch?v=W6NZfCO5SIk",                                level:"Beginner",     certificate:false },
    { title:"JavaScript Tutorial for Beginners",            platform:"Simplilearn",         url:"https://www.simplilearn.com/free-javascript-course-skillup",                  level:"Beginner",     certificate:true  },
    { title:"Introduction to JavaScript",                   platform:"edX",                 url:"https://www.edx.org/learn/javascript",                                        level:"Beginner",     certificate:true  },
    { title:"JavaScript Basics",                            platform:"Khan Academy",        url:"https://www.khanacademy.org/computing/computer-programming/programming",      level:"Beginner",     certificate:false },
    { title:"JavaScript — Full Course for Beginners",       platform:"YouTube",             url:"https://www.youtube.com/watch?v=PkZNo7MFNFg",                                level:"Beginner",     certificate:false },
    { title:"Modern JavaScript",                            platform:"Alison",              url:"https://alison.com/course/modern-javascript-for-beginners",                  level:"Intermediate", certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  react: [
    { title:"React Front End Development Libraries",        platform:"freeCodeCamp",        url:"https://www.freecodecamp.org/learn/front-end-development-libraries/",         level:"Intermediate", certificate:true  },
    { title:"React — Full Course for Beginners",            platform:"YouTube",             url:"https://www.youtube.com/watch?v=bMknfKXIFA8",                                level:"Intermediate", certificate:false },
    { title:"React JS Tutorial",                            platform:"Simplilearn",         url:"https://www.simplilearn.com/free-reactjs-course-skillup",                     level:"Intermediate", certificate:true  },
    { title:"React Basics",                                 platform:"edX",                 url:"https://www.edx.org/learn/react",                                             level:"Intermediate", certificate:true  },
    { title:"React Tutorial for Beginners",                 platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/react-js-tutorial", level:"Intermediate", certificate:true },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  aws: [
    { title:"AWS Cloud Practitioner Essentials",            platform:"AWS Skill Builder",   url:"https://explore.skillbuilder.aws/learn/course/134",                           level:"Beginner",     certificate:true  },
    { title:"AWS Cloud Practitioner — Full Course",         platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=3hLmDS179YE",                                level:"Beginner",     certificate:false },
    { title:"AWS Fundamentals",                             platform:"Coursera",            url:"https://www.coursera.org/specializations/aws-fundamentals",                   level:"Beginner",     certificate:true  },
    { title:"AWS for Beginners",                            platform:"Simplilearn",         url:"https://www.simplilearn.com/free-aws-course-skillup",                         level:"Beginner",     certificate:true  },
    { title:"Introduction to AWS",                          platform:"edX",                 url:"https://www.edx.org/learn/aws",                                               level:"Beginner",     certificate:true  },
    { title:"AWS Technical Essentials",                     platform:"AWS Skill Builder",   url:"https://explore.skillbuilder.aws/learn/course/1851",                          level:"Beginner",     certificate:true  },
    { title:"AWS Solutions Architect — Study Guide",        platform:"YouTube",             url:"https://www.youtube.com/watch?v=Ia-UEYYR44s",                                level:"Intermediate", certificate:false },
    { title:"Cloud Computing Fundamentals",                 platform:"Alison",              url:"https://alison.com/course/cloud-computing-fundamentals",                     level:"Beginner",     certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "azure": [
    { title:"Microsoft Azure Fundamentals (AZ-900)",        platform:"Microsoft Learn",     url:"https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/",         level:"Beginner",     certificate:true  },
    { title:"Azure Fundamentals — Full Course",             platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=NKEFWyqJ5XA",                                level:"Beginner",     certificate:false },
    { title:"Azure for Beginners",                          platform:"Simplilearn",         url:"https://www.simplilearn.com/free-azure-course-skillup",                       level:"Beginner",     certificate:true  },
    { title:"Introduction to Microsoft Azure",              platform:"edX",                 url:"https://www.edx.org/learn/azure",                                             level:"Beginner",     certificate:true  },
    { title:"Microsoft Azure Administrator",                platform:"Alison",              url:"https://alison.com/course/microsoft-azure-fundamentals",                     level:"Beginner",     certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  docker: [
    { title:"Docker for Beginners — Full Course",           platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=fqMOX6JJhGo",                                level:"Beginner",     certificate:false },
    { title:"Docker and Kubernetes Tutorial",               platform:"Simplilearn",         url:"https://www.simplilearn.com/free-docker-course-skillup",                      level:"Beginner",     certificate:true  },
    { title:"Introduction to Docker",                       platform:"edX",                 url:"https://www.edx.org/learn/docker",                                            level:"Beginner",     certificate:true  },
    { title:"Docker for Beginners",                         platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/docker-for-beginners", level:"Beginner", certificate:true },
    { title:"Play with Docker",                             platform:"Docker",              url:"https://training.play-with-docker.com",                                      level:"Beginner",     certificate:false },
    { title:"Docker Mastery",                               platform:"YouTube",             url:"https://www.youtube.com/watch?v=3c-iBn73dDE",                                level:"Intermediate", certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  kubernetes: [
    { title:"Introduction to Kubernetes",                   platform:"edX",                 url:"https://www.edx.org/learn/kubernetes",                                        level:"Intermediate", certificate:true  },
    { title:"Kubernetes for Beginners",                     platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=X48VuDVv0do",                                level:"Beginner",     certificate:false },
    { title:"Kubernetes Tutorial",                          platform:"Simplilearn",         url:"https://www.simplilearn.com/free-kubernetes-course-skillup",                  level:"Intermediate", certificate:true  },
    { title:"Kubernetes Basics",                            platform:"Google Digital Garage",url:"https://kubernetes.io/docs/tutorials/kubernetes-basics/",                   level:"Beginner",     certificate:false },
    { title:"Kubernetes — Full Course",                     platform:"YouTube",             url:"https://www.youtube.com/watch?v=d6WC5n9G_sM",                                level:"Intermediate", certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "deep learning": [
    { title:"Deep Learning Specialization",                 platform:"Coursera",            url:"https://www.coursera.org/specializations/deep-learning",                      level:"Advanced",     certificate:true  },
    { title:"Deep Learning with PyTorch",                   platform:"IBM SkillsBuild",     url:"https://skills.yourlearning.ibm.com",                                         level:"Intermediate", certificate:true  },
    { title:"Deep Learning Fundamentals",                   platform:"Simplilearn",         url:"https://www.simplilearn.com/free-deep-learning-course-skillup",               level:"Intermediate", certificate:true  },
    { title:"MIT 6.S191 Introduction to Deep Learning",     platform:"MIT OpenCourseWare",  url:"https://introtodeeplearning.com",                                             level:"Advanced",     certificate:false },
    { title:"Deep Learning for Computer Vision",            platform:"YouTube",             url:"https://www.youtube.com/watch?v=IA3WxTTPXqQ",                                level:"Advanced",     certificate:false },
    { title:"Practical Deep Learning",                      platform:"fast.ai",             url:"https://course.fast.ai",                                                     level:"Intermediate", certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  nlp: [
    { title:"Natural Language Processing Specialization",   platform:"Coursera",            url:"https://www.coursera.org/specializations/natural-language-processing",        level:"Advanced",     certificate:true  },
    { title:"NLP with Python",                              platform:"YouTube",             url:"https://www.youtube.com/watch?v=M7SWr5xobkA",                                level:"Intermediate", certificate:false },
    { title:"NLP Fundamentals",                             platform:"Simplilearn",         url:"https://www.simplilearn.com/free-nlp-course-skillup",                         level:"Intermediate", certificate:true  },
    { title:"Intro to NLP",                                 platform:"Kaggle",              url:"https://www.kaggle.com/learn/natural-language-processing",                   level:"Intermediate", certificate:true  },
    { title:"CS224N Natural Language Processing with DL",   platform:"MIT OpenCourseWare",  url:"https://web.stanford.edu/class/cs224n/",                                      level:"Advanced",     certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "web development": [
    { title:"Responsive Web Design",                        platform:"freeCodeCamp",        url:"https://www.freecodecamp.org/learn/2022/responsive-web-design/",              level:"Beginner",     certificate:true  },
    { title:"Web Development Bootcamp",                     platform:"YouTube",             url:"https://www.youtube.com/watch?v=ysEN5RaKOlA",                                level:"Beginner",     certificate:false },
    { title:"Introduction to Web Development",              platform:"edX",                 url:"https://www.edx.org/learn/web-development",                                   level:"Beginner",     certificate:true  },
    { title:"Web Development Fundamentals",                 platform:"Simplilearn",         url:"https://www.simplilearn.com/free-web-developer-course-skillup",               level:"Beginner",     certificate:true  },
    { title:"Full Stack Web Development",                   platform:"Alison",              url:"https://alison.com/course/full-stack-web-development",                       level:"Intermediate", certificate:true  },
    { title:"HTML CSS and JavaScript for Web Developers",   platform:"Coursera",            url:"https://www.coursera.org/learn/html-css-javascript-for-web-developers",      level:"Beginner",     certificate:true  },
    { title:"Web Dev for Beginners",                        platform:"Microsoft Learn",     url:"https://learn.microsoft.com/en-us/training/paths/web-development-101/",       level:"Beginner",     certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "devops": [
    { title:"Introduction to DevOps",                       platform:"edX",                 url:"https://www.edx.org/learn/devops",                                            level:"Beginner",     certificate:true  },
    { title:"DevOps Fundamentals",                          platform:"Simplilearn",         url:"https://www.simplilearn.com/free-devops-course-skillup",                      level:"Beginner",     certificate:true  },
    { title:"DevOps Beginners to Advanced",                 platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=j5Zsa_eOXeY",                                level:"Beginner",     certificate:false },
    { title:"DevOps for Developers",                        platform:"IBM SkillsBuild",     url:"https://skills.yourlearning.ibm.com",                                         level:"Intermediate", certificate:true  },
    { title:"DevOps with Git and CI/CD",                    platform:"Alison",              url:"https://alison.com/course/introduction-to-devops-tools",                     level:"Beginner",     certificate:true  },
    { title:"CI/CD with GitHub Actions",                    platform:"YouTube",             url:"https://www.youtube.com/watch?v=R8_veQiYBjI",                                level:"Intermediate", certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  git: [
    { title:"Git and GitHub — Full Course",                 platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=RGOj5yH7evk",                                level:"Beginner",     certificate:false },
    { title:"Introduction to Git and GitHub",               platform:"Coursera",            url:"https://www.coursera.org/learn/introduction-git-github",                     level:"Beginner",     certificate:true  },
    { title:"Git Tutorial",                                 platform:"Simplilearn",         url:"https://www.simplilearn.com/free-git-course-skillup",                         level:"Beginner",     certificate:true  },
    { title:"Version Control with Git",                     platform:"edX",                 url:"https://www.edx.org/learn/git",                                               level:"Beginner",     certificate:true  },
    { title:"Git for Beginners",                            platform:"Microsoft Learn",     url:"https://learn.microsoft.com/en-us/training/paths/intro-to-vc-git/",           level:"Beginner",     certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  java: [
    { title:"Java Programming and Software Engineering",    platform:"Coursera",            url:"https://www.coursera.org/specializations/java-programming",                   level:"Beginner",     certificate:true  },
    { title:"Java Tutorial for Beginners",                  platform:"YouTube",             url:"https://www.youtube.com/watch?v=eIrMbAQSU34",                                level:"Beginner",     certificate:false },
    { title:"Java Fundamentals",                            platform:"Simplilearn",         url:"https://www.simplilearn.com/free-java-course-skillup",                        level:"Beginner",     certificate:true  },
    { title:"Object Oriented Programming in Java",          platform:"edX",                 url:"https://www.edx.org/learn/java",                                              level:"Intermediate", certificate:true  },
    { title:"Java Programming Basics",                      platform:"Udacity",             url:"https://www.udacity.com/course/java-programming-basics--ud282",               level:"Beginner",     certificate:false },
    { title:"Java Full Course",                             platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=GoXwIVyNvX0",                                level:"Beginner",     certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "data engineering": [
    { title:"IBM Data Engineering Professional Certificate", platform:"Coursera",           url:"https://www.coursera.org/professional-certificates/ibm-data-engineer",        level:"Intermediate", certificate:true  },
    { title:"Data Engineering Fundamentals",                platform:"Simplilearn",         url:"https://www.simplilearn.com/free-data-engineering-course-skillup",            level:"Beginner",     certificate:true  },
    { title:"Data Engineering on Google Cloud",             platform:"Coursera",            url:"https://www.coursera.org/specializations/gcp-data-machine-learning",          level:"Intermediate", certificate:true  },
    { title:"Data Engineering Zoomcamp",                    platform:"YouTube",             url:"https://www.youtube.com/watch?v=-zpVha7bw5A",                                level:"Intermediate", certificate:false },
    { title:"Fundamentals of Data Engineering",             platform:"IBM SkillsBuild",     url:"https://skills.yourlearning.ibm.com",                                         level:"Beginner",     certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "cloud computing": [
    { title:"Cloud Computing Fundamentals",                 platform:"Alison",              url:"https://alison.com/course/cloud-computing-fundamentals",                     level:"Beginner",     certificate:true  },
    { title:"Cloud Computing Basics",                       platform:"Coursera",            url:"https://www.coursera.org/learn/cloud-computing-basics",                      level:"Beginner",     certificate:true  },
    { title:"Introduction to Cloud Computing",              platform:"IBM SkillsBuild",     url:"https://skills.yourlearning.ibm.com",                                         level:"Beginner",     certificate:true  },
    { title:"Cloud Computing on AWS, Azure and GCP",        platform:"Simplilearn",         url:"https://www.simplilearn.com/free-cloud-computing-course-skillup",             level:"Beginner",     certificate:true  },
    { title:"Google Cloud Digital Leader",                  platform:"Google Digital Garage",url:"https://cloud.google.com/training/business#cloud-digital-leader",            level:"Beginner",     certificate:true  },
    { title:"Cloud Computing Full Course",                  platform:"YouTube",             url:"https://www.youtube.com/watch?v=M988_fsOSWo",                                level:"Beginner",     certificate:false },
    { title:"Cloud Computing NPTEL",                        platform:"NPTEL",               url:"https://nptel.ac.in/courses/106105167",                                       level:"Intermediate", certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "cybersecurity": [
    { title:"Google Cybersecurity Professional Certificate", platform:"Coursera",           url:"https://www.coursera.org/professional-certificates/google-cybersecurity",     level:"Beginner",     certificate:true  },
    { title:"Introduction to Cybersecurity",                platform:"Cisco Networking Academy", url:"https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity",level:"Beginner",     certificate:true  },
    { title:"Cybersecurity Fundamentals",                   platform:"edX",                 url:"https://www.edx.org/learn/cybersecurity",                                     level:"Beginner",     certificate:true  },
    { title:"Cybersecurity for Beginners",                  platform:"Simplilearn",         url:"https://www.simplilearn.com/free-cyber-security-course-skillup",              level:"Beginner",     certificate:true  },
    { title:"Ethical Hacking Full Course",                  platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=3Kq1MIfTWCE",                                level:"Intermediate", certificate:false },
    { title:"Introduction to Cybersecurity",                platform:"Alison",              url:"https://alison.com/course/introduction-to-cybersecurity",                    level:"Beginner",     certificate:true  },
    { title:"Microsoft Security Fundamentals",              platform:"Microsoft Learn",     url:"https://learn.microsoft.com/en-us/training/paths/describe-concepts-of-security-compliance-identity/", level:"Beginner", certificate:true },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "excel": [
    { title:"Excel Skills for Business",                    platform:"Coursera",            url:"https://www.coursera.org/specializations/excel",                              level:"Beginner",     certificate:true  },
    { title:"Excel Tutorial — Full Course",                 platform:"YouTube",             url:"https://www.youtube.com/watch?v=Vl0H-qTclOg",                                level:"Beginner",     certificate:false },
    { title:"Microsoft Excel Fundamentals",                 platform:"Simplilearn",         url:"https://www.simplilearn.com/free-excel-course-skillup",                       level:"Beginner",     certificate:true  },
    { title:"Data Analysis with Excel",                     platform:"edX",                 url:"https://www.edx.org/learn/microsoft-excel",                                   level:"Beginner",     certificate:true  },
    { title:"Excel for Beginners",                          platform:"Alison",              url:"https://alison.com/course/microsoft-excel-2019-beginner-to-intermediate",     level:"Beginner",     certificate:true  },
    { title:"Excel and Google Sheets",                      platform:"Great Learning",      url:"https://www.mygreatlearning.com/academy/learn-for-free/courses/advanced-excel", level:"Beginner",   certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "ui ux": [
    { title:"Google UX Design Professional Certificate",    platform:"Coursera",            url:"https://www.coursera.org/professional-certificates/google-ux-design",         level:"Beginner",     certificate:true  },
    { title:"UX Design Fundamentals",                       platform:"edX",                 url:"https://www.edx.org/learn/user-experience",                                   level:"Beginner",     certificate:true  },
    { title:"UI UX Design",                                 platform:"Simplilearn",         url:"https://www.simplilearn.com/free-ux-design-course-skillup",                   level:"Beginner",     certificate:true  },
    { title:"Intro to UX Design",                           platform:"Alison",              url:"https://alison.com/course/ux-design-fundamentals",                           level:"Beginner",     certificate:true  },
    { title:"UX Design Crash Course",                       platform:"YouTube",             url:"https://www.youtube.com/watch?v=_lyzy-vChh4",                                level:"Beginner",     certificate:false },
    { title:"Figma for Beginners",                          platform:"YouTube",             url:"https://www.youtube.com/watch?v=FTFaQWZBqQ8",                                level:"Beginner",     certificate:false },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "project management": [
    { title:"Google Project Management Certificate",        platform:"Coursera",            url:"https://www.coursera.org/professional-certificates/google-project-management", level:"Beginner",    certificate:true  },
    { title:"Project Management Principles",                platform:"Alison",              url:"https://alison.com/course/project-management-principles",                    level:"Beginner",     certificate:true  },
    { title:"Introduction to Project Management",           platform:"edX",                 url:"https://www.edx.org/learn/project-management",                                level:"Beginner",     certificate:true  },
    { title:"Agile Project Management",                     platform:"Simplilearn",         url:"https://www.simplilearn.com/free-agile-scrum-certification-course",           level:"Beginner",     certificate:true  },
    { title:"NPTEL Project Management",                     platform:"NPTEL",               url:"https://nptel.ac.in/courses/110106048",                                       level:"Intermediate", certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "business analysis": [
    { title:"Business Analysis Fundamentals",               platform:"Simplilearn",         url:"https://www.simplilearn.com/free-business-analysis-course-skillup",           level:"Beginner",     certificate:true  },
    { title:"Introduction to Business Analysis",            platform:"Alison",              url:"https://alison.com/course/business-analysis-fundamentals",                   level:"Beginner",     certificate:true  },
    { title:"Business Foundations",                         platform:"Coursera",            url:"https://www.coursera.org/specializations/wharton-business-foundations",       level:"Beginner",     certificate:true  },
    { title:"Business Analysis",                            platform:"edX",                 url:"https://www.edx.org/learn/business-analysis",                                 level:"Beginner",     certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "digital marketing": [
    { title:"Fundamentals of Digital Marketing",            platform:"Google Digital Garage",url:"https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing", level:"Beginner",     certificate:true  },
    { title:"Digital Marketing Specialization",             platform:"Coursera",            url:"https://www.coursera.org/specializations/digital-marketing",                  level:"Beginner",     certificate:true  },
    { title:"Digital Marketing Fundamentals",               platform:"Simplilearn",         url:"https://www.simplilearn.com/free-digital-marketing-course-skillup",           level:"Beginner",     certificate:true  },
    { title:"Digital Marketing",                            platform:"Alison",              url:"https://alison.com/courses/it/digital-marketing",                            level:"Beginner",     certificate:true  },
    { title:"Social Media Marketing",                       platform:"edX",                 url:"https://www.edx.org/learn/social-media-marketing",                            level:"Beginner",     certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "tensorflow": [
    { title:"TensorFlow Developer Professional Certificate", platform:"Coursera",           url:"https://www.coursera.org/professional-certificates/tensorflow-in-practice",   level:"Intermediate", certificate:true  },
    { title:"TensorFlow 2.0 Complete Course",               platform:"freeCodeCamp",        url:"https://www.youtube.com/watch?v=tPYj3fFJGjk",                                level:"Intermediate", certificate:false },
    { title:"Intro to TensorFlow for Deep Learning",        platform:"Udacity",             url:"https://www.udacity.com/course/intro-to-tensorflow-for-deep-learning--ud187", level:"Intermediate", certificate:false },
    { title:"TensorFlow Tutorial",                          platform:"Simplilearn",         url:"https://www.simplilearn.com/free-tensorflow-course-skillup",                  level:"Intermediate", certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "r": [
    { title:"R Programming",                                platform:"Coursera",            url:"https://www.coursera.org/learn/r-programming",                               level:"Beginner",     certificate:true  },
    { title:"R for Data Science",                           platform:"edX",                 url:"https://www.edx.org/learn/r-programming",                                     level:"Intermediate", certificate:true  },
    { title:"R Programming Tutorial",                       platform:"YouTube",             url:"https://www.youtube.com/watch?v=_V8eKsto3Ug",                                level:"Beginner",     certificate:false },
    { title:"Introduction to R",                            platform:"Simplilearn",         url:"https://www.simplilearn.com/free-r-programming-course-skillup",               level:"Beginner",     certificate:true  },
    { title:"Statistics with R",                            platform:"Coursera",            url:"https://www.coursera.org/specializations/statistics",                        level:"Intermediate", certificate:true  },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  "statistics": [
    { title:"Statistics and Probability",                   platform:"Khan Academy",        url:"https://www.khanacademy.org/math/statistics-probability",                    level:"Beginner",     certificate:false },
    { title:"Statistics with Python Specialization",        platform:"Coursera",            url:"https://www.coursera.org/specializations/statistics-with-python",            level:"Intermediate", certificate:true  },
    { title:"Statistics Fundamentals",                      platform:"Simplilearn",         url:"https://www.simplilearn.com/free-statistics-course-skillup",                  level:"Beginner",     certificate:true  },
    { title:"Intro to Statistics",                          platform:"Udacity",             url:"https://www.udacity.com/course/intro-to-statistics--st101",                  level:"Beginner",     certificate:false },
    { title:"Statistics for Data Science",                  platform:"Alison",              url:"https://alison.com/course/statistics-for-data-science",                      level:"Intermediate", certificate:true  },
  ],
};

// Aliases — common alternate search terms
const ALIASES = {
  "ml":            "machine learning",
  "ai":            "machine learning",
  "artificial intelligence": "machine learning",
  "dl":            "deep learning",
  "ds":            "data science",
  "da":            "data analysis",
  "data analyst":  "data analysis",
  "bi":            "power bi",
  "js":            "javascript",
  "node":          "javascript",
  "node.js":       "javascript",
  "typescript":    "javascript",
  "html":          "web development",
  "css":           "web development",
  "frontend":      "web development",
  "backend":       "web development",
  "fullstack":     "web development",
  "full stack":    "web development",
  "ci/cd":         "devops",
  "jenkins":       "devops",
  "terraform":     "devops",
  "ansible":       "devops",
  "cloud":         "cloud computing",
  "gcp":           "cloud computing",
  "security":      "cybersecurity",
  "hacking":       "cybersecurity",
  "infosec":       "cybersecurity",
  "ux":            "ui ux",
  "ui":            "ui ux",
  "figma":         "ui ux",
  "design":        "ui ux",
  "pm":            "project management",
  "scrum":         "project management",
  "agile":         "project management",
  "ba":            "business analysis",
  "seo":           "digital marketing",
  "marketing":     "digital marketing",
  "pytorch":       "deep learning",
  "keras":         "deep learning",
  "pandas":        "python",
  "numpy":         "python",
  "sklearn":       "machine learning",
  "scikit":        "machine learning",
  "spark":         "data engineering",
  "kafka":         "data engineering",
  "airflow":       "data engineering",
  "dbt":           "data engineering",
  "snowflake":     "data engineering",
  "stats":         "statistics",
};


// ── Search function ───────────────────────────────────────────────────────────

function _searchFreeCourses(keyword, maxPerPlatform = 8) {
  const lower = keyword.toLowerCase().trim();

  // Resolve aliases
  const resolved = ALIASES[lower] || lower;

  // Try exact match first
  let results = COURSE_DB[resolved];

  // Try partial match across all keys
  if (!results) {
    for (const [key, courses] of Object.entries(COURSE_DB)) {
      if (resolved.includes(key) || key.includes(resolved)) {
        results = courses;
        break;
      }
    }
  }

  // Generic fallback — return links to search pages
  if (!results) {
    results = [
      { title:`${keyword} Free Course`,                 platform:"Simplilearn",         url:`https://www.simplilearn.com/free-${encodeURIComponent(lower)}-course-skillup`,           level:"Beginner", certificate:true  },
      { title:`Learn ${keyword} — Free Tutorial`,       platform:"freeCodeCamp",        url:`https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(lower)}`,          level:"Beginner", certificate:false },
      { title:`${keyword} Tutorial`,                    platform:"YouTube",             url:`https://www.youtube.com/results?search_query=${encodeURIComponent(lower)}+tutorial+free`,level:"Beginner", certificate:false },
      { title:`${keyword} Course`,                      platform:"Coursera",            url:`https://www.coursera.org/search?query=${encodeURIComponent(lower)}`,                    level:"Beginner", certificate:true  },
      { title:`${keyword} Course`,                      platform:"edX",                 url:`https://www.edx.org/search?q=${encodeURIComponent(lower)}`,                             level:"Beginner", certificate:true  },
      { title:`${keyword} Free Course`,                 platform:"Alison",              url:`https://alison.com/courses?query=${encodeURIComponent(lower)}`,                         level:"Beginner", certificate:true  },
      { title:`${keyword} Training`,                    platform:"Great Learning",      url:`https://www.mygreatlearning.com/academy/learn-for-free`,                               level:"Beginner", certificate:true  },
      { title:`${keyword} Course`,                      platform:"IBM SkillsBuild",     url:`https://skills.yourlearning.ibm.com`,                                                   level:"Beginner", certificate:true  },
    ];
  }

  return results.slice(0, maxPerPlatform);
}


module.exports = router;
