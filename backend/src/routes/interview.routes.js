/**
 * routes/interview.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * POST /interview-questions/
 *
 * Strategy (in order of reliability):
 *   1. Scrape GeeksforGeeks search results page
 *   2. Scrape GitHub awesome-interview-questions raw markdown
 *   3. Scrape Stack Overflow questions via their public API (no key needed)
 *   4. Scrape Wikipedia-style role overviews for theoretical questions
 *   5. Smart fallback: generate from a role-aware question template bank
 *
 * npm install axios cheerio
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const cheerio = require("cheerio");

// ── HTTP client ────────────────────────────────────────────────────────────
const http = axios.create({
  timeout: 12000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
  },
});

// ── In-memory cache: 30 minutes ───────────────────────────────────────────
const CACHE     = new Map();
const CACHE_TTL = 30 * 60 * 1000;

function toSlug(role) {
  return role.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function guessDifficulty(text) {
  if (/(implement|design|architect|optimi|thread|concurren|complexity|distributed|scalab)/i.test(text)) return "Hard";
  if (/(difference between|explain|what is|how does|compare|why|define|list|basic)/i.test(text)) return "Easy";
  return "Medium";
}

function clean(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 1 — Stack Overflow Public API (100% free, no key required)
// Gets real questions tagged with the role from SO
// ════════════════════════════════════════════════════════════════════════════
async function scrapeStackOverflow(role, division) {
  try {
    // Map role to SO tags
    const tagMap = {
      "data scientist":        "data-science",
      "data analyst":          "data-analysis",
      "machine learning":      "machine-learning",
      "software engineer":     "software-engineering",
      "frontend developer":    "javascript",
      "backend developer":     "node.js",
      "full stack developer":  "javascript",
      "react developer":       "reactjs",
      "python developer":      "python",
      "java developer":        "java",
      "devops engineer":       "devops",
      "data engineer":         "apache-spark",
      "sql developer":         "sql",
      "android developer":     "android",
      "ios developer":         "ios",
    };

    const lower   = role.toLowerCase();
    const tag     = tagMap[lower] || toSlug(role).replace(/-developer|-engineer|-analyst/g, "");
    const soUrl   = `https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${tag}&site=stackoverflow&pagesize=30&filter=withbody`;

    const { data } = await http.get(soUrl);
    if (!data.items || !data.items.length) return [];

    const questions = data.items
      .filter(item => item.answer_count > 0)
      .slice(0, 20)
      .map(item => ({
        q:          clean(item.title) + "?",
        a:          clean(cheerio.load(item.body).text()).slice(0, 600) +
                    `\n\nSee full discussion: https://stackoverflow.com/q/${item.question_id}`,
        difficulty: guessDifficulty(item.title),
        company:    "",
        source:     "Stack Overflow",
      }));

    console.log(`[SO] ${questions.length} questions for '${role}'`);
    return questions;
  } catch (e) {
    console.log(`[SO] Failed: ${e.message}`);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 2 — GitHub: h5bp/Front-end-Developer-Interview-Questions (raw markdown)
// Great for frontend/general questions
// ════════════════════════════════════════════════════════════════════════════
async function scrapeGitHubInterviewQuestions(role, division) {
  try {
    const GITHUB_SOURCES = {
      "frontend":  "https://raw.githubusercontent.com/h5bp/Front-end-Developer-Interview-Questions/main/src/questions/general-questions.md",
      "css":       "https://raw.githubusercontent.com/h5bp/Front-end-Developer-Interview-Questions/main/src/questions/css-questions.md",
      "javascript":"https://raw.githubusercontent.com/h5bp/Front-end-Developer-Interview-Questions/main/src/questions/javascript-questions.md",
      "react":     "https://raw.githubusercontent.com/sudheerj/reactjs-interview-questions/master/README.md",
      "general":   "https://raw.githubusercontent.com/DopplerHQ/awesome-interview-questions/master/README.md",
    };

    const lower = role.toLowerCase();
    let url = GITHUB_SOURCES.general;
    if (lower.includes("front") || lower.includes("css") || lower.includes("html")) url = GITHUB_SOURCES.frontend;
    if (lower.includes("javascript") || lower.includes("js"))  url = GITHUB_SOURCES.javascript;
    if (lower.includes("react"))   url = GITHUB_SOURCES.react;

    const { data } = await http.get(url);
    const lines    = data.split("\n");
    const questions = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Markdown list items that look like questions
      if (/^[-*]\s+.{20,}/.test(line)) {
        const qText = line.replace(/^[-*]\s+/, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
        if (qText.length < 20 || qText.length > 300) continue;
        if (!/[a-zA-Z]/.test(qText)) continue;

        // Try to grab next non-empty line as context for the answer
        let answer = `This is a commonly asked ${role} interview question. `;
        answer += `Key points to cover: explain the concept clearly, give a practical example, `;
        answer += `and mention any trade-offs or edge cases relevant to ${role} work.`;

        questions.push({
          q:          qText.endsWith("?") ? qText : qText + "?",
          a:          answer,
          difficulty: guessDifficulty(qText),
          company:    "",
          source:     "GitHub Interview Questions",
        });
      }
    }

    // Filter to role-relevant questions
    const relevant = questions.filter(q =>
      q.q.toLowerCase().includes(lower.split(" ")[0]) ||
      /(javascript|react|css|html|node|api|rest|async|promise|closure|component|hook|state)/i.test(q.q)
    );

    const result = relevant.length >= 5 ? relevant : questions.slice(0, 30);
    console.log(`[GitHub] ${result.length} questions for '${role}'`);
    return result;
  } catch (e) {
    console.log(`[GitHub] Failed: ${e.message}`);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 3 — GeeksforGeeks via their search endpoint
// ════════════════════════════════════════════════════════════════════════════
async function scrapeGFGSearch(role) {
  try {
    const slug  = toSlug(role);
    const url   = `https://www.geeksforgeeks.org/${slug}-interview-questions/`;
    const { data } = await http.get(url);
    const $     = cheerio.load(data);
    const questions = [];

    // Try multiple selector patterns GFG uses
    const selectors = [
      ".entry-content h2",
      ".entry-content h3",
      "article h2",
      "article h3",
      ".post-content h2",
      ".post-content h3",
    ];

    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const qText = clean($(el).text());
        if (qText.length < 20 || qText.length > 300) return;
        if (/table of content|advertisement|related article|conclusion|introduction|prerequisite/i.test(qText)) return;

        // Gather answer from next siblings
        let answer = "";
        let node   = $(el).next();
        let count  = 0;
        while (node.length && count < 5) {
          const tag = (node[0].tagName || "").toLowerCase();
          if (["h1","h2","h3"].includes(tag)) break;
          const txt = clean(node.text());
          if (txt.length > 30) { answer += txt + "\n\n"; count++; }
          node = node.next();
        }
        if (answer.trim().length > 40) {
          questions.push({
            q:          qText,
            a:          answer.trim().slice(0, 1000),
            difficulty: guessDifficulty(qText),
            company:    "",
            source:     "GeeksforGeeks",
          });
        }
      });
      if (questions.length >= 5) break;
    }

    console.log(`[GFG] ${questions.length} questions for '${role}'`);
    return questions;
  } catch (e) {
    console.log(`[GFG] Failed: ${e.message}`);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 4 — Smart Template Bank (always works, role-aware)
// Generates realistic questions tailored to the role
// ════════════════════════════════════════════════════════════════════════════
function generateTemplateQuestions(role, division) {
  const r = role; // e.g. "Data Scientist"

  const THEORETICAL = [
    { q:`What are the core responsibilities of a ${r} in a typical organisation?`, difficulty:"Easy" },
    { q:`What tools and technologies does a ${r} commonly use day-to-day?`, difficulty:"Easy" },
    { q:`How do you stay updated with the latest trends in the ${r} field?`, difficulty:"Easy" },
    { q:`Describe the typical workflow or process a ${r} follows on a project.`, difficulty:"Medium" },
    { q:`What is the difference between a junior and senior ${r}? What separates them?`, difficulty:"Medium" },
    { q:`How would you explain your role as a ${r} to a non-technical stakeholder?`, difficulty:"Easy" },
    { q:`What are the most common challenges faced by a ${r} and how do you handle them?`, difficulty:"Medium" },
    { q:`How do you ensure the quality and accuracy of your work as a ${r}?`, difficulty:"Medium" },
    { q:`Describe a project where you had a significant impact as a ${r}.`, difficulty:"Medium" },
    { q:`What metrics or KPIs do you use to measure success in your role as a ${r}?`, difficulty:"Medium" },
    { q:`How do you approach learning a new technology or framework as a ${r}?`, difficulty:"Easy" },
    { q:`What is your experience with agile or scrum methodologies as a ${r}?`, difficulty:"Easy" },
    { q:`How do you handle tight deadlines and competing priorities as a ${r}?`, difficulty:"Medium" },
    { q:`What would your first 30/60/90 days look like as a ${r} joining a new company?`, difficulty:"Medium" },
    { q:`How do you collaborate with cross-functional teams like product, design, or engineering as a ${r}?`, difficulty:"Medium" },
    { q:`What is your approach to documentation and knowledge sharing as a ${r}?`, difficulty:"Easy" },
    { q:`How do you handle disagreements with teammates or managers about technical decisions?`, difficulty:"Hard" },
    { q:`Describe a time you had to learn something quickly under pressure as a ${r}.`, difficulty:"Medium" },
    { q:`What distinguishes a good ${r} from a great one in your view?`, difficulty:"Hard" },
    { q:`How do you approach technical debt in your work as a ${r}?`, difficulty:"Hard" },
  ];

  const APTITUDE = [
    { q:"A project deadline is in 10 days. You have completed 60% of the work in the first 6 days. Will you meet the deadline at this pace?", difficulty:"Easy",
      a:"Work remaining: 40%. Days remaining: 4. Daily rate so far: 60/6 = 10% per day. Work completable in 4 days: 4 × 10% = 40%. Yes, you will exactly meet the deadline at the current pace." },
    { q:"Your team of 5 takes 20 days to complete a task. How long will it take a team of 4?", difficulty:"Easy",
      a:"Total work = 5 × 20 = 100 person-days. New time = 100 / 4 = 25 days." },
    { q:"A dataset has 10,000 rows. After removing duplicates, 7,500 remain. What is the duplication rate?", difficulty:"Easy",
      a:"Duplicates = 10,000 - 7,500 = 2,500. Duplication rate = (2,500 / 10,000) × 100 = 25%." },
    { q:"Revenue grew from ₹50 lakhs to ₹80 lakhs year-over-year. What is the percentage growth?", difficulty:"Easy",
      a:"Growth % = ((80 - 50) / 50) × 100 = (30/50) × 100 = 60%." },
    { q:"If the probability of passing a test on any attempt is 0.7, what is the probability of failing both the first and second attempt?", difficulty:"Medium",
      a:"P(fail once) = 1 - 0.7 = 0.3. P(fail twice) = 0.3 × 0.3 = 0.09 = 9%." },
    { q:"A system processes 500 requests per minute. Each request takes 80ms on average. How many requests are in-flight at any time?", difficulty:"Medium",
      a:"Using Little's Law: L = λ × W = (500/60) requests/sec × 0.08 sec ≈ 0.667 requests. Round up to 1; at peak plan for a queue of 2-3." },
    { q:"You have sales data: Jan=120, Feb=95, Mar=140, Apr=110. What is the average monthly sales?", difficulty:"Easy",
      a:"Average = (120 + 95 + 140 + 110) / 4 = 465 / 4 = 116.25." },
    { q:"A column has 800 null values out of 5,000 records. What is the null rate? Is imputation safe?", difficulty:"Medium",
      a:"Null rate = (800/5000) × 100 = 16%. This is above the 15% threshold. Imputation carries bias risk. Investigate WHY the data is missing (MCAR/MAR/MNAR) before deciding." },
    { q:"A/B test: Group A (n=1000) has 5% conversion. Group B (n=1000) has 6% conversion. What is the absolute and relative lift?", difficulty:"Medium",
      a:"Absolute lift = 6% - 5% = 1 percentage point. Relative lift = (6% - 5%) / 5% × 100 = 20%. Always report both — a 20% relative lift sounds impressive; 1 point absolute tells you the real scale." },
    { q:"Your sprint velocity is 40 story points per 2-week sprint. The backlog has 200 story points remaining. How many sprints to complete?", difficulty:"Easy",
      a:"Sprints needed = 200 / 40 = 5 sprints = 10 weeks at current velocity." },
    { q:"You need to process 2 million records. Your current script handles 50,000 records per hour. How long will it take?", difficulty:"Easy",
      a:"Time = 2,000,000 / 50,000 = 40 hours." },
    { q:"In a survey of 200 people, 60% prefer option A. What is the 95% confidence interval for this proportion?", difficulty:"Hard",
      a:"p = 0.6, n = 200. SE = √(p(1-p)/n) = √(0.6×0.4/200) = √(0.0012) ≈ 0.0346. 95% CI = 0.6 ± 1.96 × 0.0346 = [0.532, 0.668]. We are 95% confident the true proportion is between 53.2% and 66.8%." },
    { q:"Work can be done by A in 12 days and by B in 18 days. If they work together, how many days to finish?", difficulty:"Easy",
      a:"A's rate = 1/12, B's rate = 1/18. Combined = 1/12 + 1/18 = 3/36 + 2/36 = 5/36. Days = 36/5 = 7.2 days." },
    { q:"A model has 90% accuracy on a dataset where 95% of records are class 0. Is this a good model?", difficulty:"Hard",
      a:"No — a naive model that always predicts class 0 would achieve 95% accuracy. This 90% model is actually worse than doing nothing. Check precision, recall, F1-score, and ROC-AUC instead." },
    { q:"3 people can paint a wall in 4 hours. How long for 6 people to paint the same wall?", difficulty:"Easy",
      a:"Total work = 3 × 4 = 12 person-hours. Time with 6 people = 12 / 6 = 2 hours." },
  ];

  const CODING = [
    { q:`Write a function in Python to find all duplicates in a list.`, difficulty:"Easy",
      a:`def find_duplicates(lst):
    seen = set()
    duplicates = []
    for item in lst:
        if item in seen:
            if item not in duplicates:
                duplicates.append(item)
        else:
            seen.add(item)
    return duplicates

# Example
print(find_duplicates([1, 2, 3, 2, 4, 3, 5]))  # [2, 3]
# Time: O(n) | Space: O(n)` },
    { q:`Write a SQL query to find the top 5 records by a numeric column.`, difficulty:"Easy",
      a:`SELECT *
FROM your_table
ORDER BY numeric_column DESC
LIMIT 5;

-- For SQL Server use: TOP 5 ... ORDER BY numeric_column DESC
-- Always use ORDER BY with LIMIT to get predictable results.` },
    { q:`Implement a function to reverse a string without using built-in reverse methods.`, difficulty:"Easy",
      a:`# Python
def reverse_string(s):
    result = ""
    for char in s:
        result = char + result
    return result

# Or more Pythonically (O(n)):
def reverse_string_v2(s):
    return s[::-1]

print(reverse_string("hello"))  # "olleh"` },
    { q:`Write a SQL query to find employees whose salary is above the average salary in their department.`, difficulty:"Medium",
      a:`WITH dept_avg AS (
    SELECT department_id, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY department_id
)
SELECT e.employee_id, e.name, e.salary, da.avg_sal
FROM employees e
JOIN dept_avg da ON e.department_id = da.department_id
WHERE e.salary > da.avg_sal
ORDER BY e.department_id, e.salary DESC;` },
    { q:`Write a function to check if a string is a palindrome.`, difficulty:"Easy",
      a:`def is_palindrome(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]

print(is_palindrome("racecar"))   # True
print(is_palindrome("A man a plan a canal Panama"))  # True
# Time: O(n) | Space: O(n)` },
    { q:`Write a SQL query to calculate month-over-month revenue growth.`, difficulty:"Hard",
      a:`WITH monthly AS (
    SELECT DATE_TRUNC('month', order_date) AS month,
           SUM(revenue) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT month,
       revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
       ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) /
             NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100, 2) AS mom_growth_pct
FROM monthly
ORDER BY month;` },
    { q:`Write a function to find the second largest number in a list.`, difficulty:"Easy",
      a:`def second_largest(lst):
    unique = list(set(lst))
    if len(unique) < 2:
        return None
    unique.sort(reverse=True)
    return unique[1]

print(second_largest([5, 3, 9, 1, 9, 7]))  # 7
# Time: O(n log n) | For O(n) use two-pass approach` },
    { q:`Write a SQL query to find all users who have not placed an order.`, difficulty:"Easy",
      a:`-- Method 1: LEFT JOIN
SELECT u.user_id, u.name
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.user_id IS NULL;

-- Method 2: NOT EXISTS (often faster)
SELECT user_id, name
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders WHERE user_id = u.user_id
);` },
    { q:`Implement FizzBuzz in Python in a way that is extensible for new rules.`, difficulty:"Medium",
      a:`def fizzbuzz(n, rules=None):
    if rules is None:
        rules = [(3, "Fizz"), (5, "Buzz")]
    for i in range(1, n + 1):
        output = "".join(label for div, label in rules if i % div == 0)
        print(output or str(i))

fizzbuzz(15)
# Add new rule without changing the function (Open/Closed Principle):
fizzbuzz(15, rules=[(3, "Fizz"), (5, "Buzz"), (7, "Bazz")])` },
    { q:`Write a function to flatten a nested list to any depth.`, difficulty:"Medium",
      a:`def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

print(flatten([1, [2, [3, [4]], 5]]))  # [1, 2, 3, 4, 5]` },
  ];

  const banks = { theoretical: THEORETICAL, aptitude: APTITUDE, coding: CODING };
  const bank  = banks[division] || THEORETICAL;

  return bank.map(item => ({
    q:          item.q,
    a:          item.a || `Strong answer structure for "${item.q}":\n\n` +
                `1. Define the core concept clearly\n` +
                `2. Give a concrete example from your experience\n` +
                `3. Mention trade-offs or edge cases\n` +
                `4. Quantify impact where possible (%, time saved, scale)\n\n` +
                `Tip: Use the STAR method (Situation → Task → Action → Result) for behavioural questions.`,
    difficulty: item.difficulty || "Medium",
    company:    "",
    source:     "JobScan Question Bank",
  }));
}

// ════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR
// ════════════════════════════════════════════════════════════════════════════
async function fetchAllQuestions(role, division) {
  console.log(`[Interview] Fetching '${role}' | ${division}...`);

  // Run live sources in parallel
  const [soResult, gfgResult, ghResult] = await Promise.allSettled([
    scrapeStackOverflow(role, division),
    scrapeGFGSearch(role),
    scrapeGitHubInterviewQuestions(role, division),
  ]);

  const live = [
    ...(soResult.value  || []),
    ...(gfgResult.value || []),
    ...(ghResult.value  || []),
  ];

  // Deduplicate by question text
  const seen   = new Set();
  const unique = live.filter(q => {
    const key = q.q.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Always generate template questions as filler/fallback
  const templates = generateTemplateQuestions(role, division);

  // Division-aware filter on live results
  let liveFiltered = unique;
  if (division === "aptitude") {
    const apt = unique.filter(q =>
      /(\d+%|percentage|probability|ratio|average|mean|median|calculate|how many|how much|profit|loss|speed|time|work|survey|dataset|null|test|sprint|velocity)/i.test(q.q)
    );
    liveFiltered = apt.length >= 3 ? apt : unique;
  } else if (division === "coding") {
    const code = unique.filter(q =>
      /(write|implement|code|program|function|algorithm|sql|query|script|O\(|data structure|debug)/i.test(q.q)
    );
    liveFiltered = code.length >= 3 ? code : unique;
  }

  // Merge: live questions first, then template questions (no duplicates)
  const liveKeys = new Set(liveFiltered.map(q => q.q.toLowerCase().trim()));
  const extraTemplates = templates.filter(q => !liveKeys.has(q.q.toLowerCase().trim()));
  const merged = [...liveFiltered, ...extraTemplates];

  console.log(`[Interview] Live: ${liveFiltered.length} | Templates: ${extraTemplates.length} | Total: ${merged.length}`);
  return merged;
}

// ── Shuffle ────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ════════════════════════════════════════════════════════════════════════════
// POST /interview-questions/
// ════════════════════════════════════════════════════════════════════════════
router.post("/interview-questions/", async (req, res) => {
  const role     = (req.body?.role     || "").trim();
  const division = (req.body?.division || "theoretical").trim().toLowerCase();

  if (!role) return res.json({ questions: [], total: 0, role: "", division });

  if (!["aptitude", "theoretical", "coding"].includes(division)) {
    return res.status(400).json({ detail: "division must be aptitude, theoretical, or coding" });
  }

  const cacheKey = `${role.toLowerCase()}::${division}`;

  if (CACHE.has(cacheKey)) {
    const { questions, cachedAt } = CACHE.get(cacheKey);
    if (Date.now() - cachedAt < CACHE_TTL) {
      console.log(`[Interview] Cache hit: '${role}' | ${division} (${questions.length} q)`);
      return res.json({ questions: shuffle(questions), total: questions.length, role, division, cached: true });
    }
    CACHE.delete(cacheKey);
  }

  try {
    const questions = await fetchAllQuestions(role, division);
    CACHE.set(cacheKey, { questions, cachedAt: Date.now() });
    return res.json({ questions: shuffle(questions), total: questions.length, role, division });
  } catch (err) {
    console.error(`[Interview] Error for '${role}' | ${division}:`, err.message);
    // Even on error, return template questions so the user always gets something
    const fallback = generateTemplateQuestions(role, division);
    return res.json({ questions: shuffle(fallback), total: fallback.length, role, division, warning: "Live fetch failed, showing template questions." });
  }
});

module.exports = router;
