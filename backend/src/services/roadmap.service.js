// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: src/routes/roadmap.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// const express = require("express");
// const router  = express.Router();
// const { generateRoadmap } = require("../controllers/roadmap.controller");
// router.post("/generate", generateRoadmap);
// module.exports = router;


// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: src/controllers/roadmap.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// const { buildRoadmap } = require("../services/roadmap.service");
// exports.generateRoadmap = async (req, res) => {
//   const { role } = req.body;
//   if (!role) return res.status(400).json({ detail: "role is required" });
//   const result = await buildRoadmap(role);
//   res.json(result);
// };


// ─────────────────────────────────────────────────────────────────────────────
// FILE 3: src/services/roadmap.service.js  ← THE MAIN FILE
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

// Pre-built roadmaps for common roles — no API key needed, instant response.
// Structure: { role, overview, total_duration, total_skills, phases[], key_tools[], salary_range }

const ROADMAPS = {

  // ── Data Analyst ────────────────────────────────────────────────────────────
  "data analyst": {
    role:           "Data Analyst",
    overview:       "Data Analysts transform raw data into actionable business insights using statistics, visualization, and domain knowledge. This roadmap takes you from zero to job-ready in 6–12 months.",
    total_duration: "6–12 months",
    total_skills:   42,
    salary_range:   "₹4L – ₹18L / year (India) | $55K – $95K / year (US)",
    phases: [
      {
        phase:    "Mathematics & Statistics Foundation",
        duration: "4–6 weeks",
        categories: [
          { name: "Statistics", skills: [
            { name: "Descriptive Statistics", priority: "must" },
            { name: "Probability Basics",     priority: "must" },
            { name: "Hypothesis Testing",     priority: "must" },
            { name: "Regression Analysis",    priority: "must" },
            { name: "Distributions (Normal, Binomial)" },
            { name: "Confidence Intervals" },
          ]},
          { name: "Mathematics", skills: [
            { name: "Linear Algebra Basics" },
            { name: "Calculus Basics" },
            { name: "Matrix Operations" },
          ]},
        ],
        resources: ["Khan Academy Statistics", "StatQuest on YouTube", "Statistics for Data Science (Coursera)"],
      },
      {
        phase:    "Core Technical Skills",
        duration: "8–10 weeks",
        categories: [
          { name: "SQL", skills: [
            { name: "SELECT, WHERE, GROUP BY", priority: "must" },
            { name: "JOINs (INNER, LEFT, RIGHT)", priority: "must" },
            { name: "Window Functions",           priority: "must" },
            { name: "Subqueries & CTEs",          priority: "must" },
            { name: "Query Optimization" },
            { name: "Stored Procedures" },
          ]},
          { name: "Python", skills: [
            { name: "Pandas",   priority: "must" },
            { name: "NumPy",    priority: "must" },
            { name: "Matplotlib / Seaborn", priority: "must" },
            { name: "Jupyter Notebooks" },
            { name: "Data Cleaning techniques" },
          ]},
        ],
        resources: ["Mode SQL Tutorial", "Kaggle Python Course", "Python for Data Analysis (Wes McKinney)"],
      },
      {
        phase:    "Visualization & BI Tools",
        duration: "4–6 weeks",
        categories: [
          { name: "BI Tools", skills: [
            { name: "Power BI",  priority: "must" },
            { name: "Tableau" },
            { name: "Looker / Looker Studio" },
            { name: "Excel (Advanced)", priority: "must" },
          ]},
          { name: "Visualization Principles", skills: [
            { name: "Chart selection best practices" },
            { name: "Dashboard design" },
            { name: "Storytelling with data" },
            { name: "KPI definition & tracking" },
          ]},
        ],
        resources: ["Microsoft Learn – Power BI", "Tableau Public tutorials", "Storytelling with Data (book)"],
      },
      {
        phase:    "Advanced & Specialization",
        duration: "6–8 weeks",
        categories: [
          { name: "Advanced Analytics", skills: [
            { name: "A/B Testing & Experimentation" },
            { name: "Cohort Analysis" },
            { name: "Funnel Analysis" },
            { name: "Forecasting basics" },
          ]},
          { name: "Cloud & Big Data Basics", skills: [
            { name: "AWS / GCP basics" },
            { name: "BigQuery" },
            { name: "Spark basics" },
            { name: "ETL concepts" },
          ]},
          { name: "Soft Skills", skills: [
            { name: "Business communication" },
            { name: "Stakeholder management" },
            { name: "Requirement gathering" },
          ]},
        ],
        resources: ["Google Data Analytics Certificate", "Udemy – Advanced SQL", "DataTalks.Club"],
      },
    ],
    key_tools: [
      { name: "Python",    icon: "🐍", type: "Language"    },
      { name: "SQL",       icon: "🗄️", type: "Language"    },
      { name: "Power BI",  icon: "📊", type: "BI Tool"     },
      { name: "Excel",     icon: "📗", type: "Spreadsheet" },
      { name: "Tableau",   icon: "📈", type: "BI Tool"     },
      { name: "Jupyter",   icon: "📓", type: "Environment" },
      { name: "Git",       icon: "🔀", type: "Version Control" },
      { name: "BigQuery",  icon: "☁️", type: "Cloud DB"    },
    ],
  },

  // ── Data Scientist ──────────────────────────────────────────────────────────
  "data scientist": {
    role:           "Data Scientist",
    overview:       "Data Scientists build predictive models and extract deep insights using machine learning, statistics, and programming. This roadmap covers the full journey from foundations to deploying ML models.",
    total_duration: "10–18 months",
    total_skills:   55,
    salary_range:   "₹6L – ₹30L / year (India) | $80K – $150K / year (US)",
    phases: [
      {
        phase:    "Programming & Math Foundation",
        duration: "6–8 weeks",
        categories: [
          { name: "Python", skills: [
            { name: "Python fundamentals",   priority: "must" },
            { name: "OOP concepts" },
            { name: "Pandas & NumPy",        priority: "must" },
            { name: "Data structures" },
          ]},
          { name: "Math", skills: [
            { name: "Linear Algebra",        priority: "must" },
            { name: "Calculus & Gradients",  priority: "must" },
            { name: "Probability Theory",    priority: "must" },
            { name: "Statistics",            priority: "must" },
          ]},
        ],
        resources: ["3Blue1Brown – Linear Algebra", "fast.ai Practical Deep Learning", "MIT OpenCourseWare"],
      },
      {
        phase:    "Machine Learning Core",
        duration: "8–12 weeks",
        categories: [
          { name: "Supervised Learning", skills: [
            { name: "Linear & Logistic Regression", priority: "must" },
            { name: "Decision Trees & Random Forest", priority: "must" },
            { name: "Gradient Boosting (XGBoost)",    priority: "must" },
            { name: "SVM" },
            { name: "KNN" },
          ]},
          { name: "Unsupervised Learning", skills: [
            { name: "K-Means Clustering" },
            { name: "PCA",             priority: "must" },
            { name: "DBSCAN" },
            { name: "Anomaly Detection" },
          ]},
          { name: "Model Evaluation", skills: [
            { name: "Cross-validation",    priority: "must" },
            { name: "Precision / Recall",  priority: "must" },
            { name: "ROC-AUC" },
            { name: "Bias-Variance tradeoff" },
          ]},
        ],
        resources: ["Scikit-learn docs", "Hands-On ML with Scikit-Learn (book)", "Kaggle Learn"],
      },
      {
        phase:    "Deep Learning & NLP",
        duration: "8–10 weeks",
        categories: [
          { name: "Deep Learning", skills: [
            { name: "Neural Networks",      priority: "must" },
            { name: "CNNs" },
            { name: "RNNs / LSTMs" },
            { name: "Transformers / Attention" },
            { name: "PyTorch or TensorFlow", priority: "must" },
          ]},
          { name: "NLP", skills: [
            { name: "Text preprocessing" },
            { name: "Embeddings (Word2Vec, BERT)" },
            { name: "Sentiment Analysis" },
            { name: "LLM fine-tuning basics" },
          ]},
        ],
        resources: ["fast.ai", "Hugging Face course", "Deep Learning Specialization (Andrew Ng)"],
      },
      {
        phase:    "MLOps & Deployment",
        duration: "4–6 weeks",
        categories: [
          { name: "Deployment", skills: [
            { name: "Flask / FastAPI for ML",  priority: "must" },
            { name: "Docker basics",           priority: "must" },
            { name: "Model versioning (MLflow)" },
            { name: "Cloud deployment (AWS Sagemaker / GCP Vertex)" },
          ]},
          { name: "Data Engineering Basics", skills: [
            { name: "SQL & NoSQL",   priority: "must" },
            { name: "Spark basics" },
            { name: "Airflow basics" },
            { name: "Feature stores" },
          ]},
        ],
        resources: ["MLOps Zoomcamp", "Full Stack Deep Learning", "Made with ML"],
      },
    ],
    key_tools: [
      { name: "Python",     icon: "🐍", type: "Language"    },
      { name: "PyTorch",    icon: "🔥", type: "ML Framework" },
      { name: "Scikit-learn", icon: "🤖", type: "ML Library" },
      { name: "SQL",        icon: "🗄️", type: "Language"    },
      { name: "Docker",     icon: "🐳", type: "DevOps"      },
      { name: "MLflow",     icon: "📦", type: "MLOps"       },
      { name: "Jupyter",    icon: "📓", type: "Environment" },
      { name: "Git",        icon: "🔀", type: "Version Control" },
    ],
  },

  // ── Frontend Developer ──────────────────────────────────────────────────────
  "frontend developer": {
    role:           "Frontend Developer",
    overview:       "Frontend developers build the visual and interactive parts of web applications. This roadmap covers everything from HTML basics to modern React development and deployment.",
    total_duration: "8–14 months",
    total_skills:   48,
    salary_range:   "₹4L – ₹20L / year (India) | $60K – $120K / year (US)",
    phases: [
      {
        phase:    "Web Fundamentals",
        duration: "4–6 weeks",
        categories: [
          { name: "Core Web", skills: [
            { name: "HTML5 semantics",   priority: "must" },
            { name: "CSS3 & Flexbox",    priority: "must" },
            { name: "CSS Grid",          priority: "must" },
            { name: "Responsive design", priority: "must" },
            { name: "CSS animations" },
            { name: "Accessibility (a11y)" },
          ]},
        ],
        resources: ["MDN Web Docs", "CSS Tricks", "freeCodeCamp"],
      },
      {
        phase:    "JavaScript & Modern JS",
        duration: "6–8 weeks",
        categories: [
          { name: "JavaScript Core", skills: [
            { name: "ES6+ syntax",           priority: "must" },
            { name: "DOM manipulation",      priority: "must" },
            { name: "Async / Await & Promises", priority: "must" },
            { name: "Fetch API & REST",      priority: "must" },
            { name: "Closures & Prototypes" },
            { name: "Event handling" },
          ]},
          { name: "TypeScript", skills: [
            { name: "TypeScript basics",     priority: "must" },
            { name: "Interfaces & Types" },
            { name: "Generics" },
          ]},
        ],
        resources: ["javascript.info", "You Don't Know JS (book)", "TypeScript Handbook"],
      },
      {
        phase:    "React & Ecosystem",
        duration: "8–10 weeks",
        categories: [
          { name: "React", skills: [
            { name: "Components & Props",    priority: "must" },
            { name: "Hooks (useState, useEffect)", priority: "must" },
            { name: "Context API",           priority: "must" },
            { name: "React Router",          priority: "must" },
            { name: "Custom Hooks" },
          ]},
          { name: "State Management", skills: [
            { name: "Redux Toolkit" },
            { name: "Zustand" },
            { name: "React Query / TanStack" },
          ]},
          { name: "Styling", skills: [
            { name: "Tailwind CSS",          priority: "must" },
            { name: "CSS Modules" },
            { name: "Styled Components" },
          ]},
        ],
        resources: ["React docs (react.dev)", "Scrimba React Course", "Epic React by Kent C Dodds"],
      },
      {
        phase:    "Build Tools, Testing & Deployment",
        duration: "4–6 weeks",
        categories: [
          { name: "Tooling", skills: [
            { name: "Vite / Webpack",        priority: "must" },
            { name: "npm / pnpm",            priority: "must" },
            { name: "Git & GitHub",          priority: "must" },
            { name: "ESLint & Prettier" },
          ]},
          { name: "Testing", skills: [
            { name: "Jest",                  priority: "must" },
            { name: "React Testing Library" },
            { name: "Cypress (E2E)" },
          ]},
          { name: "Deployment", skills: [
            { name: "Vercel / Netlify",      priority: "must" },
            { name: "CI/CD basics" },
            { name: "Performance optimization" },
          ]},
        ],
        resources: ["Vercel docs", "Testing Library docs", "web.dev by Google"],
      },
    ],
    key_tools: [
      { name: "React",       icon: "⚛️", type: "Framework"  },
      { name: "TypeScript",  icon: "📘", type: "Language"   },
      { name: "Tailwind",    icon: "🎨", type: "CSS"        },
      { name: "Vite",        icon: "⚡", type: "Build Tool" },
      { name: "Git",         icon: "🔀", type: "VCS"        },
      { name: "Jest",        icon: "🧪", type: "Testing"    },
      { name: "VS Code",     icon: "💻", type: "Editor"     },
      { name: "Figma",       icon: "🖼️", type: "Design"     },
    ],
  },

  // ── Backend Developer ───────────────────────────────────────────────────────
  "backend developer": {
    role:           "Backend Developer",
    overview:       "Backend developers build the server-side logic, APIs, and databases that power applications. This roadmap covers Node.js, databases, system design, and cloud deployment.",
    total_duration: "9–15 months",
    total_skills:   50,
    salary_range:   "₹5L – ₹25L / year (India) | $70K – $140K / year (US)",
    phases: [
      {
        phase:    "Programming Foundation",
        duration: "4–6 weeks",
        categories: [
          { name: "Language (Node.js / Python / Java)", skills: [
            { name: "Node.js + Express",   priority: "must" },
            { name: "OOP & Design Patterns" },
            { name: "Data structures & Algorithms", priority: "must" },
            { name: "Error handling" },
            { name: "Async programming",   priority: "must" },
          ]},
        ],
        resources: ["Node.js docs", "The Odin Project", "CS50 on edX"],
      },
      {
        phase:    "APIs & Databases",
        duration: "6–8 weeks",
        categories: [
          { name: "API Design", skills: [
            { name: "REST API design",     priority: "must" },
            { name: "GraphQL basics" },
            { name: "Authentication (JWT, OAuth)", priority: "must" },
            { name: "API security best practices" },
            { name: "Rate limiting & caching" },
          ]},
          { name: "Databases", skills: [
            { name: "PostgreSQL / MySQL",  priority: "must" },
            { name: "MongoDB",             priority: "must" },
            { name: "Redis (caching)",     priority: "must" },
            { name: "ORM (Prisma / Mongoose)" },
            { name: "Database indexing" },
          ]},
        ],
        resources: ["PostgreSQL Tutorial", "MongoDB University", "REST API Design best practices"],
      },
      {
        phase:    "System Design & Architecture",
        duration: "6–8 weeks",
        categories: [
          { name: "System Design", skills: [
            { name: "Microservices",       priority: "must" },
            { name: "Message queues (RabbitMQ / Kafka)" },
            { name: "Load balancing" },
            { name: "CAP Theorem" },
            { name: "SQL vs NoSQL tradeoffs" },
          ]},
          { name: "DevOps Basics", skills: [
            { name: "Docker",              priority: "must" },
            { name: "Linux basics",        priority: "must" },
            { name: "CI/CD (GitHub Actions)" },
            { name: "Nginx basics" },
          ]},
        ],
        resources: ["System Design Primer (GitHub)", "Designing Data-Intensive Applications (book)", "ByteByteGo"],
      },
      {
        phase:    "Cloud & Scaling",
        duration: "4–6 weeks",
        categories: [
          { name: "Cloud", skills: [
            { name: "AWS (EC2, S3, Lambda)", priority: "must" },
            { name: "Serverless architecture" },
            { name: "Kubernetes basics" },
            { name: "Monitoring (Grafana, Prometheus)" },
          ]},
          { name: "Security", skills: [
            { name: "OWASP Top 10",        priority: "must" },
            { name: "HTTPS & TLS" },
            { name: "SQL injection prevention" },
            { name: "Secrets management" },
          ]},
        ],
        resources: ["AWS Free Tier", "The Linux Command Line (book)", "OWASP docs"],
      },
    ],
    key_tools: [
      { name: "Node.js",    icon: "🟩", type: "Runtime"    },
      { name: "Express",    icon: "🚂", type: "Framework"  },
      { name: "PostgreSQL", icon: "🐘", type: "Database"   },
      { name: "MongoDB",    icon: "🍃", type: "Database"   },
      { name: "Redis",      icon: "🔴", type: "Cache"      },
      { name: "Docker",     icon: "🐳", type: "Container"  },
      { name: "AWS",        icon: "☁️", type: "Cloud"      },
      { name: "Git",        icon: "🔀", type: "VCS"        },
    ],
  },

  // ── DevOps Engineer ─────────────────────────────────────────────────────────
  "devops engineer": {
    role:           "DevOps Engineer",
    overview:       "DevOps Engineers bridge development and operations, automating infrastructure and deployment pipelines. This roadmap covers Linux, CI/CD, containers, and cloud platforms.",
    total_duration: "10–16 months",
    total_skills:   52,
    salary_range:   "₹6L – ₹28L / year (India) | $85K – $160K / year (US)",
    phases: [
      {
        phase:    "Linux & Networking Foundation",
        duration: "4–6 weeks",
        categories: [
          { name: "Linux", skills: [
            { name: "Shell scripting (Bash)", priority: "must" },
            { name: "File system & permissions", priority: "must" },
            { name: "Process management" },
            { name: "Cron jobs" },
            { name: "SSH & key management" },
          ]},
          { name: "Networking", skills: [
            { name: "TCP/IP fundamentals",  priority: "must" },
            { name: "DNS, HTTP/HTTPS",      priority: "must" },
            { name: "Firewalls & Security groups" },
            { name: "Load balancers" },
          ]},
        ],
        resources: ["Linux Journey", "The Linux Command Line (book)", "Networking for DevOps (YouTube)"],
      },
      {
        phase:    "Containers & Orchestration",
        duration: "6–8 weeks",
        categories: [
          { name: "Docker", skills: [
            { name: "Dockerfile",          priority: "must" },
            { name: "Docker Compose",      priority: "must" },
            { name: "Container networking" },
            { name: "Image optimization" },
          ]},
          { name: "Kubernetes", skills: [
            { name: "Pods & Deployments",  priority: "must" },
            { name: "Services & Ingress",  priority: "must" },
            { name: "ConfigMaps & Secrets" },
            { name: "Helm charts" },
            { name: "kubectl",             priority: "must" },
          ]},
        ],
        resources: ["Docker docs", "Kubernetes the Hard Way (GitHub)", "KodeKloud"],
      },
      {
        phase:    "CI/CD & Infrastructure as Code",
        duration: "6–8 weeks",
        categories: [
          { name: "CI/CD", skills: [
            { name: "GitHub Actions",      priority: "must" },
            { name: "Jenkins basics" },
            { name: "GitLab CI" },
            { name: "Pipeline design" },
          ]},
          { name: "IaC", skills: [
            { name: "Terraform",           priority: "must" },
            { name: "Ansible" },
            { name: "CloudFormation" },
          ]},
        ],
        resources: ["HashiCorp Learn – Terraform", "Ansible docs", "GitHub Actions docs"],
      },
      {
        phase:    "Cloud Platforms & Monitoring",
        duration: "6–8 weeks",
        categories: [
          { name: "Cloud", skills: [
            { name: "AWS (EC2, EKS, S3, RDS)", priority: "must" },
            { name: "GCP or Azure basics" },
            { name: "Serverless (Lambda)" },
            { name: "Cloud cost optimization" },
          ]},
          { name: "Monitoring & Observability", skills: [
            { name: "Prometheus",          priority: "must" },
            { name: "Grafana",             priority: "must" },
            { name: "ELK Stack (logs)" },
            { name: "Alerting strategies" },
            { name: "Distributed tracing" },
          ]},
        ],
        resources: ["AWS Solutions Architect (Udemy)", "Grafana docs", "Site Reliability Engineering (Google book)"],
      },
    ],
    key_tools: [
      { name: "Docker",     icon: "🐳", type: "Container"  },
      { name: "Kubernetes", icon: "☸️", type: "Orchestration" },
      { name: "Terraform",  icon: "🏗️", type: "IaC"        },
      { name: "AWS",        icon: "☁️", type: "Cloud"      },
      { name: "GitHub Actions", icon: "⚙️", type: "CI/CD"  },
      { name: "Prometheus", icon: "🔥", type: "Monitoring" },
      { name: "Grafana",    icon: "📊", type: "Monitoring" },
      { name: "Ansible",    icon: "📜", type: "Automation" },
    ],
  },

  // ── Machine Learning Engineer ────────────────────────────────────────────────
  "machine learning engineer": {
    role:           "Machine Learning Engineer",
    overview:       "ML Engineers productionize machine learning models at scale — bridging data science and software engineering. Focuses on model training pipelines, deployment, and monitoring.",
    total_duration: "12–18 months",
    total_skills:   58,
    salary_range:   "₹8L – ₹40L / year (India) | $100K – $180K / year (US)",
    phases: [
      {
        phase:    "Software Engineering Foundation",
        duration: "6–8 weeks",
        categories: [
          { name: "Python Engineering", skills: [
            { name: "Advanced Python (OOP, decorators)", priority: "must" },
            { name: "Data structures & Algorithms",      priority: "must" },
            { name: "Unit testing (pytest)",             priority: "must" },
            { name: "Code profiling & optimization" },
          ]},
          { name: "Math for ML", skills: [
            { name: "Linear Algebra",  priority: "must" },
            { name: "Calculus",        priority: "must" },
            { name: "Probability & Statistics", priority: "must" },
          ]},
        ],
        resources: ["LeetCode (Medium problems)", "Fluent Python (book)", "3Blue1Brown math series"],
      },
      {
        phase:    "ML Core & Deep Learning",
        duration: "8–12 weeks",
        categories: [
          { name: "Classical ML", skills: [
            { name: "Scikit-learn",        priority: "must" },
            { name: "Feature engineering", priority: "must" },
            { name: "Ensemble methods (XGBoost, LightGBM)", priority: "must" },
            { name: "Model evaluation & tuning" },
          ]},
          { name: "Deep Learning", skills: [
            { name: "PyTorch",             priority: "must" },
            { name: "CNNs, RNNs, Transformers", priority: "must" },
            { name: "Transfer learning" },
            { name: "Distributed training" },
          ]},
        ],
        resources: ["fast.ai", "PyTorch docs", "Papers with Code"],
      },
      {
        phase:    "MLOps & Production",
        duration: "8–10 weeks",
        categories: [
          { name: "MLOps", skills: [
            { name: "MLflow / Weights & Biases", priority: "must" },
            { name: "Feature stores (Feast)" },
            { name: "Model versioning",          priority: "must" },
            { name: "Data versioning (DVC)" },
            { name: "Pipeline orchestration (Airflow / Prefect)", priority: "must" },
          ]},
          { name: "Serving & Monitoring", skills: [
            { name: "FastAPI model serving",     priority: "must" },
            { name: "Triton Inference Server" },
            { name: "Model drift monitoring" },
            { name: "A/B testing models" },
          ]},
        ],
        resources: ["MLOps Zoomcamp", "Made with ML", "Full Stack Deep Learning"],
      },
      {
        phase:    "Cloud & Scalability",
        duration: "4–6 weeks",
        categories: [
          { name: "Cloud ML", skills: [
            { name: "AWS SageMaker",       priority: "must" },
            { name: "GCP Vertex AI" },
            { name: "Azure ML" },
            { name: "Kubernetes for ML" },
            { name: "Spark & Distributed computing" },
          ]},
          { name: "System Design for ML", skills: [
            { name: "Real-time vs batch inference" },
            { name: "Recommendation systems" },
            { name: "Scaling ML pipelines" },
          ]},
        ],
        resources: ["AWS ML Specialty cert", "Chip Huyen – Designing ML Systems (book)", "MLSys seminars"],
      },
    ],
    key_tools: [
      { name: "PyTorch",   icon: "🔥", type: "ML Framework" },
      { name: "MLflow",    icon: "📦", type: "MLOps"        },
      { name: "Airflow",   icon: "🌊", type: "Orchestration"},
      { name: "Docker",    icon: "🐳", type: "Container"    },
      { name: "FastAPI",   icon: "⚡", type: "Serving"      },
      { name: "AWS",       icon: "☁️", type: "Cloud"        },
      { name: "Kubernetes",icon: "☸️", type: "Orchestration"},
      { name: "Git",       icon: "🔀", type: "VCS"          },
    ],
  },

  // ── Full Stack Developer ─────────────────────────────────────────────────────
  "full stack developer": {
    role:           "Full Stack Developer",
    overview:       "Full Stack Developers build complete web applications — both the frontend users see and the backend powering it. This roadmap covers React, Node.js, databases, and deployment.",
    total_duration: "12–18 months",
    total_skills:   60,
    salary_range:   "₹5L – ₹25L / year (India) | $70K – $130K / year (US)",
    phases: [
      {
        phase:    "Web Fundamentals",
        duration: "4–5 weeks",
        categories: [
          { name: "Core Web", skills: [
            { name: "HTML5",    priority: "must" },
            { name: "CSS3 & Responsive design", priority: "must" },
            { name: "JavaScript ES6+", priority: "must" },
            { name: "Git & GitHub",    priority: "must" },
          ]},
        ],
        resources: ["The Odin Project", "freeCodeCamp", "MDN Web Docs"],
      },
      {
        phase:    "Frontend Stack",
        duration: "6–8 weeks",
        categories: [
          { name: "React", skills: [
            { name: "React hooks",         priority: "must" },
            { name: "State management",    priority: "must" },
            { name: "React Router",        priority: "must" },
            { name: "TypeScript basics" },
            { name: "Tailwind CSS",        priority: "must" },
          ]},
        ],
        resources: ["react.dev", "Scrimba", "Josh Comeau's CSS course"],
      },
      {
        phase:    "Backend Stack",
        duration: "6–8 weeks",
        categories: [
          { name: "Node.js & APIs", skills: [
            { name: "Express.js",          priority: "must" },
            { name: "REST API design",     priority: "must" },
            { name: "JWT Authentication",  priority: "must" },
            { name: "GraphQL basics" },
          ]},
          { name: "Databases", skills: [
            { name: "PostgreSQL / MongoDB", priority: "must" },
            { name: "Prisma / Mongoose",    priority: "must" },
            { name: "Redis caching" },
          ]},
        ],
        resources: ["Node.js docs", "Prisma docs", "MongoDB University"],
      },
      {
        phase:    "DevOps & Deployment",
        duration: "4–5 weeks",
        categories: [
          { name: "Deployment", skills: [
            { name: "Docker basics",       priority: "must" },
            { name: "CI/CD (GitHub Actions)", priority: "must" },
            { name: "Vercel / Railway" },
            { name: "AWS basics" },
            { name: "NGINX" },
          ]},
        ],
        resources: ["Vercel docs", "Docker Getting Started", "AWS Fundamentals (Coursera)"],
      },
    ],
    key_tools: [
      { name: "React",      icon: "⚛️", type: "Frontend"  },
      { name: "Node.js",    icon: "🟩", type: "Backend"   },
      { name: "PostgreSQL", icon: "🐘", type: "Database"  },
      { name: "Docker",     icon: "🐳", type: "Container" },
      { name: "TypeScript", icon: "📘", type: "Language"  },
      { name: "Tailwind",   icon: "🎨", type: "CSS"       },
      { name: "Git",        icon: "🔀", type: "VCS"       },
      { name: "Prisma",     icon: "◆",  type: "ORM"       },
    ],
  },

  // ── UI/UX Designer ──────────────────────────────────────────────────────────
  "ui/ux designer": {
    role:           "UI/UX Designer",
    overview:       "UI/UX Designers create intuitive, beautiful digital experiences. This roadmap covers design thinking, prototyping tools, user research, and visual design principles.",
    total_duration: "6–10 months",
    total_skills:   38,
    salary_range:   "₹4L – ₹20L / year (India) | $55K – $110K / year (US)",
    phases: [
      {
        phase:    "Design Fundamentals",
        duration: "4–5 weeks",
        categories: [
          { name: "Visual Design", skills: [
            { name: "Typography",         priority: "must" },
            { name: "Color theory",       priority: "must" },
            { name: "Layout & Grids",     priority: "must" },
            { name: "Iconography" },
            { name: "Design systems" },
          ]},
        ],
        resources: ["Refactoring UI (book)", "Google Material Design", "Nielsen Norman Group"],
      },
      {
        phase:    "UX Research & Process",
        duration: "4–6 weeks",
        categories: [
          { name: "User Research", skills: [
            { name: "User interviews",    priority: "must" },
            { name: "Usability testing",  priority: "must" },
            { name: "Personas & journey maps", priority: "must" },
            { name: "Competitive analysis" },
            { name: "Card sorting" },
          ]},
          { name: "Information Architecture", skills: [
            { name: "Wireframing",        priority: "must" },
            { name: "User flows",         priority: "must" },
            { name: "Sitemap creation" },
          ]},
        ],
        resources: ["NNG UX courses", "Just Enough Research (book)", "Interaction Design Foundation"],
      },
      {
        phase:    "Prototyping & Tools",
        duration: "4–6 weeks",
        categories: [
          { name: "Design Tools", skills: [
            { name: "Figma",              priority: "must" },
            { name: "Prototyping in Figma", priority: "must" },
            { name: "Adobe XD" },
            { name: "FigJam (Whiteboarding)" },
          ]},
          { name: "Interaction Design", skills: [
            { name: "Microinteractions" },
            { name: "Motion design basics" },
            { name: "Responsive design principles" },
            { name: "Accessibility (WCAG)", priority: "must" },
          ]},
        ],
        resources: ["Figma tutorials (YouTube)", "Mobbin (inspiration)", "Dribbble"],
      },
      {
        phase:    "Portfolio & Collaboration",
        duration: "4–5 weeks",
        categories: [
          { name: "Handoff & Dev Collaboration", skills: [
            { name: "Design specs & annotations", priority: "must" },
            { name: "Zeplin / Figma Dev Mode" },
            { name: "CSS basics for designers" },
            { name: "HTML basics" },
          ]},
          { name: "Portfolio", skills: [
            { name: "Case study writing",   priority: "must" },
            { name: "Portfolio site",       priority: "must" },
            { name: "Behance / Dribbble profile" },
          ]},
        ],
        resources: ["UX Portfolio Secrets (YouTube)", "Laws of UX (website)", "DesignBetter.co"],
      },
    ],
    key_tools: [
      { name: "Figma",     icon: "🖼️", type: "Design"     },
      { name: "FigJam",    icon: "🗒️", type: "Whiteboard" },
      { name: "Maze",      icon: "🔬", type: "Testing"    },
      { name: "Hotjar",    icon: "🌡️", type: "Analytics"  },
      { name: "Notion",    icon: "📄", type: "Docs"       },
      { name: "Zeplin",    icon: "🔗", type: "Handoff"    },
      { name: "Lottie",    icon: "✨", type: "Animation"  },
      { name: "Miro",      icon: "🧩", type: "Whiteboard" },
    ],
  },
};

/**
 * Normalize role string for lookup
 */
function normalizeRole(role) {
  return role.toLowerCase().trim()
    .replace(/\s+/g, " ")
    .replace("sr.", "senior")
    .replace("sr ", "senior ");
}

/**
 * Find best matching roadmap for a given role string
 */
function findRoadmap(role) {
  const normalized = normalizeRole(role);

  // Exact match
  if (ROADMAPS[normalized]) return ROADMAPS[normalized];

  // Partial match — find the key that is most contained in the query or vice versa
  let bestKey  = null;
  let bestScore = 0;

  for (const key of Object.keys(ROADMAPS)) {
    const queryWords = normalized.split(" ");
    const keyWords   = key.split(" ");
    const overlap    = queryWords.filter((w) => keyWords.includes(w)).length;
    const score      = overlap / Math.max(queryWords.length, keyWords.length);
    if (score > bestScore) {
      bestScore = score;
      bestKey   = key;
    }
  }

  if (bestScore >= 0.4 && bestKey) return ROADMAPS[bestKey];
  return null;
}

/**
 * Generate a generic roadmap for roles we don't have a preset for
 */
function generateGenericRoadmap(role) {
  return {
    role,
    overview:       `A structured learning path for becoming a ${role}. The phases below cover the most commonly required skills for this role based on industry standards.`,
    total_duration: "8–14 months",
    total_skills:   30,
    salary_range:   "Varies by location and experience",
    phases: [
      {
        phase:    "Foundation",
        duration: "4–6 weeks",
        categories: [
          { name: "Core Concepts", skills: [
            { name: "Industry fundamentals",     priority: "must" },
            { name: "Domain knowledge",          priority: "must" },
            { name: "Basic tooling setup" },
          ]},
        ],
        resources: ["Search for beginner courses on Coursera, Udemy, or YouTube for " + role],
      },
      {
        phase:    "Core Skills",
        duration: "6–8 weeks",
        categories: [
          { name: "Technical Skills", skills: [
            { name: "Primary technical skill 1", priority: "must" },
            { name: "Primary technical skill 2", priority: "must" },
            { name: "Supporting tools" },
          ]},
        ],
        resources: ["Look up job descriptions for " + role + " to identify the most in-demand skills"],
      },
      {
        phase:    "Practical Application",
        duration: "6–8 weeks",
        categories: [
          { name: "Projects & Portfolio", skills: [
            { name: "Build 2–3 portfolio projects", priority: "must" },
            { name: "Contribute to open source" },
            { name: "Document your work on GitHub", priority: "must" },
          ]},
        ],
        resources: ["GitHub", "Kaggle (for data roles)", "Hackathons"],
      },
      {
        phase:    "Job Readiness",
        duration: "4 weeks",
        categories: [
          { name: "Career Prep", skills: [
            { name: "Resume tailored to " + role, priority: "must" },
            { name: "LinkedIn optimization",      priority: "must" },
            { name: "Interview prep" },
            { name: "Networking" },
          ]},
        ],
        resources: ["Glassdoor interview questions", "LinkedIn Learning", "Blind (community)"],
      },
    ],
    key_tools: [
      { name: "Git",    icon: "🔀", type: "VCS"   },
      { name: "VS Code",icon: "💻", type: "Editor"},
      { name: "Notion", icon: "📄", type: "Docs"  },
    ],
  };
}

/**
 * Main service function
 */
async function buildRoadmap(role) {
  const roadmap = findRoadmap(role) || generateGenericRoadmap(role);
  return roadmap;
}

module.exports = { buildRoadmap };
