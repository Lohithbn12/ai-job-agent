// ─── templates.js ─────────────────────────────────────────────────────────
// 150 professional resume templates across 15 categories.
// Each template contains: id, name, category, color, icon, badge, tags, resume (full data)

export const RESUME_TEMPLATES = [
  {
    id:"t1", layout:"modern", name:"Data Analyst", category:"Data", color:"#0d9488", icon:"📊",
    badge:"Most Popular", tags:["SQL", "Python", "Power BI"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Results-driven Data Analyst with 2+ years delivering actionable insights through SQL, Python, and Power BI. Reduced reporting time by 60% and identified ₹15Cr cost-saving opportunity.",
      experience:[{title:"Data Analyst",company:"TechCorp Ltd",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Built SQL pipelines reducing manual reporting by 60%","Created Power BI dashboards tracking 50+ KPIs for 200 stakeholders","Identified ₹15Cr cost-saving through customer churn analysis","Automated ETL workflows saving 15 hrs/week"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"VTU Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "SQL", "Statistics", "Data Visualization"],tools:["Power BI", "Tableau", "Excel", "Pandas", "NumPy"],soft:["Communication", "Attention to Detail", "Problem Solving"]},
      certifications:[{name:"Google Data Analytics Certificate",issuer:"Google",year:"2022"}],
      projects:[{name:"Customer Churn Model",stack:"Python, Scikit-learn, Tableau",description:"Predicted churn with 87% accuracy saving ₹8Cr/year",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t2", layout:"executive", name:"Senior Data Analyst", category:"Data", color:"#0369a1", icon:"📈",
    badge:"", tags:["Advanced SQL", "Python", "Tableau"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Senior Data Analyst with 5+ years turning complex datasets into business strategy. Led analytics team of 4 and drove 30% revenue growth through data-driven pricing model.",
      experience:[{title:"Senior Data Analyst",company:"Analytics Corp",location:"Bangalore, India",start:"Mar 2019",end:"",bullets:["Led team of 4 analysts delivering BI solutions for C-suite","Built pricing model increasing revenue by 30% (₹40Cr impact)","Designed A/B testing framework running 50+ experiments/month","Reduced dashboard load time from 45s to 3s via query optimization"]}],
      education:[{degree:"M.Sc",field:"Statistics",school:"IISc Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "R", "SQL", "Advanced Statistics", "A/B Testing"],tools:["Tableau", "Power BI", "Snowflake", "dbt", "Databricks"],soft:["Leadership", "Storytelling", "Strategic Thinking"]},
      certifications:[{name:"Tableau Desktop Specialist",issuer:"Tableau",year:"2022"}],
      projects:[{name:"Pricing Optimization Engine",stack:"Python, XGBoost, Tableau",description:"Dynamic pricing model driving 30% revenue uplift",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t3", layout:"modern", name:"Data Scientist", category:"Data", color:"#4f46e5", icon:"🔬",
    badge:"Trending", tags:["Python", "ML", "Deep Learning"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Data Scientist with 3+ years building production ML systems. Deployed 8 models serving 10M+ predictions/day. Expert in NLP, computer vision, and predictive modelling.",
      experience:[{title:"Data Scientist",company:"AI Company",location:"Bangalore, India",start:"Jul 2021",end:"",bullets:["Deployed NLP sentiment model processing 5M reviews/day at 94% accuracy","Reduced model training time by 65% via distributed training on AWS SageMaker","Built recommender system increasing click-through by 28%","Published 2 internal research papers on LLM fine-tuning"]}],
      education:[{degree:"M.Tech",field:"Artificial Intelligence",school:"IIT Madras",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "Machine Learning", "Deep Learning", "NLP", "Statistics"],tools:["PyTorch", "TensorFlow", "MLflow", "AWS SageMaker", "Docker"],soft:["Research", "Critical Thinking", "Documentation"]},
      certifications:[{name:"TensorFlow Developer Certificate",issuer:"Google",year:"2022"}],
      projects:[{name:"Sentiment API",stack:"PyTorch, FastAPI, Docker",description:"Production NLP service at 94% accuracy",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t4", layout:"modern", name:"Business Intelligence Analyst", category:"Data", color:"#0891b2", icon:"💹",
    badge:"", tags:["Power BI", "SQL", "DAX"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"BI Analyst with 4 years building enterprise analytics platforms. Created self-service BI ecosystem used by 500+ employees, reducing ad-hoc data requests by 70%.",
      experience:[{title:"BI Analyst",company:"Enterprise Corp",location:"Bangalore, India",start:"Feb 2020",end:"",bullets:["Built Power BI platform used by 500+ employees company-wide","Reduced ad-hoc data requests by 70% through self-service analytics","Designed star-schema data model improving query performance by 80%","Created executive scorecard tracking 25 strategic KPIs"]}],
      education:[{degree:"B.Com",field:"Business Analytics",school:"Symbiosis Pune",year:"2022",gpa:"8.5"}],
      skills:{technical:["SQL", "DAX", "MDX", "Data Modelling", "Business Analysis"],tools:["Power BI", "SSAS", "Azure", "SQL Server", "Excel"],soft:["Business Acumen", "Stakeholder Management", "Presentation"]},
      certifications:[{name:"Microsoft Power BI Data Analyst",issuer:"Microsoft",year:"2022"}],
      projects:[{name:"Executive Scorecard",stack:"Power BI, SQL Server, SSAS",description:"Real-time C-suite dashboard with 25 KPIs",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t5", layout:"modern", name:"Data Engineer", category:"Data", color:"#7c3aed", icon:"🔧",
    badge:"", tags:["Spark", "Airflow", "dbt"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Data Engineer with 4 years building high-throughput pipelines. Processed 10TB+/day with Apache Spark. Reduced data latency from 24hrs to real-time enabling instant business decisions.",
      experience:[{title:"Data Engineer",company:"Data Platform Co",location:"Bangalore, India",start:"Mar 2020",end:"",bullets:["Built Spark pipeline processing 10TB+/day with 99.9% SLA","Reduced latency from 24hrs to real-time using Kafka streaming","Designed Snowflake DWH cutting query time from 45s to 2s","Led dbt migration improving data quality coverage from 40% to 95%"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"BITS Pilani",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "SQL", "Scala", "Data Modelling", "ETL/ELT"],tools:["Apache Spark", "Airflow", "Kafka", "dbt", "Snowflake", "AWS Glue"],soft:["Problem Solving", "Collaboration", "Documentation"]},
      certifications:[{name:"Databricks Certified Data Engineer",issuer:"Databricks",year:"2022"}],
      projects:[{name:"Real-time Analytics Platform",stack:"Kafka, Spark, Snowflake",description:"1M events/sec with <5s latency",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t6", layout:"modern", name:"ML Engineer", category:"AI/ML", color:"#7c3aed", icon:"🤖",
    badge:"", tags:["PyTorch", "MLOps", "Kubernetes"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"ML Engineer with 3+ years deploying scalable ML systems in production. Owns ML platform serving 50+ models. Reduced model deployment time from 2 weeks to 4 hours.",
      experience:[{title:"ML Engineer",company:"ML Platform Co",location:"Bangalore, India",start:"Aug 2021",end:"",bullets:["Owns ML platform serving 50+ production models to 10M+ users","Reduced model deployment time from 2 weeks to 4 hours","Built automated retraining pipeline detecting and fixing data drift","Implemented model monitoring reducing silent failures by 90%"]}],
      education:[{degree:"M.Tech",field:"CS - ML Specialisation",school:"IIT Bombay",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "MLOps", "System Design", "Feature Engineering"],tools:["PyTorch", "Kubeflow", "MLflow", "Kubernetes", "Docker", "Feast"],soft:["Engineering Rigour", "Cross-team Collaboration"]},
      certifications:[{name:"AWS Certified ML Specialty",issuer:"Amazon",year:"2022"}],
      projects:[{name:"ML Platform",stack:"Kubeflow, MLflow, Kubernetes",description:"Unified ML platform serving 50+ models",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t7", layout:"modern", name:"AI Research Scientist", category:"AI/ML", color:"#9333ea", icon:"🧠",
    badge:"", tags:["LLMs", "PyTorch", "Research"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"AI Research Scientist with 4 years at the intersection of research and production. Published 5 papers (3 NeurIPS/ICML). Built LLM-powered product serving 2M users.",
      experience:[{title:"AI Research Scientist",company:"AI Lab",location:"Bangalore, India",start:"Jan 2020",end:"",bullets:["Published 5 papers at NeurIPS (2), ICML (1), ACL (2)","Built LLM fine-tuning pipeline reducing task-specific training cost by 80%","Developed multimodal model combining vision+text for product search","Mentored 4 junior researchers on production deployment of research models"]}],
      education:[{degree:"PhD",field:"Computer Science - AI",school:"IISc Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "Deep Learning", "NLP", "Computer Vision", "Research Methodology"],tools:["PyTorch", "JAX", "HuggingFace", "CUDA", "AWS"],soft:["Research", "Writing", "Mentoring"]},
      certifications:[],
      projects:[{name:"LLM Fine-tuning Framework",stack:"PyTorch, HuggingFace, AWS",description:"Fine-tuning framework reducing compute cost by 80%",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t8", layout:"classic", name:"Quantitative Analyst", category:"Finance", color:"#065f46", icon:"📐",
    badge:"", tags:["Python", "Statistics", "Risk"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Quant Analyst with 3 years in algorithmic trading and risk modelling. Built models managing ₹500Cr portfolio. Expert in time series analysis and Monte Carlo simulation.",
      experience:[{title:"Quantitative Analyst",company:"Investment Bank",location:"Bangalore, India",start:"Jun 2021",end:"",bullets:["Built algo trading strategy generating 18% annual alpha on ₹100Cr AUM","Developed VaR model now used firm-wide for ₹500Cr portfolio risk management","Created credit scoring model reducing default rate by 22%","Automated daily P&L reporting saving 3 hrs/day for trading desk"]}],
      education:[{degree:"M.Sc",field:"Financial Mathematics",school:"IIT Delhi",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "Statistics", "Time Series", "Stochastic Calculus", "R"],tools:["pandas", "NumPy", "QuantLib", "Bloomberg", "Excel VBA"],soft:["Analytical Rigour", "Attention to Detail", "Pressure"]},
      certifications:[{name:"FRM (Financial Risk Manager)",issuer:"GARP",year:"2022"}],
      projects:[{name:"Trading Strategy",stack:"Python, pandas, Backtrader",description:"18% alpha algo trading strategy on live portfolio",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t9", layout:"modern", name:"Analytics Engineer", category:"Data", color:"#0f766e", icon:"⚙️",
    badge:"", tags:["dbt", "SQL", "Snowflake"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Analytics Engineer bridging data engineering and analytics. Built dbt models powering all company analytics. Reduced time-to-insight from 3 days to 3 hours.",
      experience:[{title:"Analytics Engineer",company:"Startup",location:"Bangalore, India",start:"Apr 2021",end:"",bullets:["Built 200+ dbt models powering analytics for 100+ stakeholders","Reduced time-to-insight from 3 days to 3 hours","Implemented data contracts ensuring 99.9% data quality SLA","Owned semantic layer enabling self-service analytics company-wide"]}],
      education:[{degree:"B.Tech",field:"Information Technology",school:"NIT Trichy",year:"2022",gpa:"8.5"}],
      skills:{technical:["SQL", "dbt", "Python", "Data Modelling", "Analytics"],tools:["dbt", "Snowflake", "Looker", "Airflow", "git"],soft:["Documentation", "Teaching", "Problem Solving"]},
      certifications:[{name:"dbt Certified Analytics Engineer",issuer:"dbt Labs",year:"2022"}],
      projects:[{name:"Semantic Layer",stack:"dbt, Snowflake, Looker",description:"Company-wide semantic layer enabling self-service",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t10", layout:"executive", name:"Data Architect", category:"Data", color:"#1e40af", icon:"🏗️",
    badge:"Senior", tags:["Cloud", "Data Modelling", "Governance"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Data Architect with 8 years designing enterprise data ecosystems. Architected cloud data platform processing 50TB/day. Led data governance program achieving ISO 27001.",
      experience:[{title:"Data Architect",company:"Fortune 500 Co",location:"Bangalore, India",start:"Jan 2016",end:"",bullets:["Architected cloud data platform on AWS processing 50TB/day","Led data governance program achieving ISO 27001 certification","Reduced data infrastructure cost by ₹2Cr/year through optimization","Defined data standards adopted across 5 business units"]}],
      education:[{degree:"M.Tech",field:"Computer Science",school:"IIT Kharagpur",year:"2022",gpa:"8.5"}],
      skills:{technical:["Data Architecture", "Cloud Architecture", "Data Governance", "Security", "SQL"],tools:["AWS", "Azure", "Snowflake", "Databricks", "Collibra", "Informatica"],soft:["Leadership", "Strategic Planning", "Communication"]},
      certifications:[{name:"AWS Certified Data Analytics",issuer:"Amazon",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t11", layout:"modern", name:"NLP Engineer", category:"AI/ML", color:"#be185d", icon:"💬",
    badge:"", tags:["NLP", "Python", "Transformers"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"NLP Engineer with 3 years building conversational AI and text analytics systems. Built chatbot handling 1M+ queries/day. Expert in LLM fine-tuning and RAG systems.",
      experience:[{title:"NLP Engineer",company:"AI Startup",location:"Bangalore, India",start:"Sep 2021",end:"",bullets:["Built enterprise chatbot handling 1M+ queries/day at 92% resolution rate","Fine-tuned LLaMA-2 for domain-specific QA reducing hallucinations by 60%","Built RAG system improving answer accuracy from 71% to 94%","Deployed multilingual NER model supporting 8 languages"]}],
      education:[{degree:"M.Tech",field:"Language Technology",school:"IIIT Hyderabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "NLP", "LLMs", "Information Extraction", "Linguistics"],tools:["HuggingFace", "LangChain", "OpenAI API", "FastAPI", "Pinecone"],soft:["Research", "Attention to Detail"]},
      certifications:[],
      projects:[{name:"Multilingual NER System",stack:"PyTorch, HuggingFace, FastAPI",description:"8-language NER with 91% F1 score",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t12", layout:"modern", name:"Computer Vision Engineer", category:"AI/ML", color:"#dc2626", icon:"👁️",
    badge:"", tags:["CV", "YOLO", "PyTorch"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Computer Vision Engineer with 3 years building real-time vision systems. Deployed object detection on edge devices at 60fps. Reduced inspection defect miss-rate by 95%.",
      experience:[{title:"CV Engineer",company:"Vision Tech",location:"Bangalore, India",start:"Oct 2021",end:"",bullets:["Deployed real-time defect detection reducing miss-rate by 95%","Optimised YOLOv8 model for edge deployment at 60fps on Jetson Nano","Built OCR pipeline processing 100K+ invoices/day at 98.5% accuracy","Created synthetic data generation pipeline reducing annotation cost by 70%"]}],
      education:[{degree:"B.Tech",field:"Electronics & Communication",school:"NITK Surathkal",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "Computer Vision", "Deep Learning", "Edge AI", "Image Processing"],tools:["PyTorch", "OpenCV", "YOLO", "TensorRT", "ONNX", "Docker"],soft:["Innovation", "Detail-oriented"]},
      certifications:[],
      projects:[{name:"Defect Detection System",stack:"PyTorch, YOLO, TensorRT",description:"Real-time quality inspection at 60fps",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t13", layout:"compact", name:"Data Analyst Fresher", category:"Fresher", color:"#0891b2", icon:"🎓",
    badge:"For Freshers", tags:["SQL", "Python", "Excel"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Recent B.Tech graduate passionate about data analytics. Strong foundation in Python, SQL, and data visualization built through 3 internships and 5 personal projects. Top 10% in Kaggle competition.",
      experience:[{title:"Data Analytics Intern",company:"IT Company",location:"Bangalore, India",start:"May 2023",end:"",bullets:["Built dashboard in Power BI tracking 20 sales KPIs for team of 15","Wrote SQL queries reducing manual report generation time by 40%","Performed exploratory analysis on 50K+ customer records","Presented findings to manager, findings implemented in Q3 strategy"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"Your University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "SQL", "Statistics", "Data Visualization"],tools:["Excel", "Power BI", "Tableau", "Pandas", "MySQL"],soft:["Quick Learner", "Teamwork", "Communication"]},
      certifications:[{name:"Google Data Analytics Certificate",issuer:"Google",year:"2022"}],
      projects:[{name:"Sales Analytics Dashboard",stack:"Python, Power BI, SQL",description:"Automated sales reporting saving 8hrs/week",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t14", layout:"modern", name:"Research Data Analyst", category:"Data", color:"#0369a1", icon:"🔍",
    badge:"", tags:["R", "SPSS", "Survey Analysis"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Research Data Analyst with 3 years supporting academic and policy research. Analysed survey data from 50K+ respondents. Expert in R, SPSS, and mixed-methods research.",
      experience:[{title:"Research Analyst",company:"Research Institute",location:"Bangalore, India",start:"Jan 2021",end:"",bullets:["Analysed survey data from 50,000+ respondents for government policy study","Built R Shiny app enabling non-technical researchers to explore data independently","Reduced analysis turnaround from 2 weeks to 3 days","Co-authored 3 published research papers"]}],
      education:[{degree:"M.Sc",field:"Applied Statistics",school:"Delhi School of Economics",year:"2022",gpa:"8.5"}],
      skills:{technical:["R", "Statistics", "Survey Methodology", "Regression Analysis", "Causal Inference"],tools:["R Shiny", "SPSS", "STATA", "Excel", "Python"],soft:["Academic Writing", "Rigour", "Collaboration"]},
      certifications:[],
      projects:[{name:"Survey Analysis Platform",stack:"R, Shiny, PostgreSQL",description:"Self-service research analytics for non-technical users",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t15", layout:"modern", name:"Marketing Analytics Manager", category:"Marketing", color:"#9333ea", icon:"📣",
    badge:"", tags:["Google Analytics", "Attribution", "SQL"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Marketing Analytics Manager with 5 years optimising ₹50Cr+ annual ad budgets. Built multi-touch attribution model correctly crediting 8 channels. Grew ROAS from 2.1x to 4.8x.",
      experience:[{title:"Marketing Analytics Manager",company:"D2C Brand",location:"Bangalore, India",start:"Jun 2019",end:"",bullets:["Built multi-touch attribution model for ₹50Cr/year ad budget across 8 channels","Grew blended ROAS from 2.1x to 4.8x in 18 months","Identified 3 high-performing customer segments driving 60% of revenue","Created marketing mix model reducing wasted spend by ₹8Cr/year"]}],
      education:[{degree:"MBA",field:"Marketing & Analytics",school:"IIM Calcutta",year:"2022",gpa:"8.5"}],
      skills:{technical:["Marketing Analytics", "Attribution Modelling", "SQL", "Statistics", "A/B Testing"],tools:["Google Analytics 4", "Meta Ads Manager", "Tableau", "Python", "Amplitude"],soft:["Leadership", "Storytelling", "Stakeholder Management"]},
      certifications:[{name:"Google Analytics Certification",issuer:"Google",year:"2022"}],
      projects:[{name:"Marketing Mix Model",stack:"Python, Tableau, GA4",description:"Attribution model for ₹50Cr budget with 40% efficiency gain",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t16", layout:"modern", name:"Software Engineer", category:"Engineering", color:"#2563eb", icon:"💻",
    badge:"Popular", tags:["React", "Node.js", "AWS"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Full-Stack Software Engineer with 3+ years building scalable web applications. Shipped features used by 100K+ users. Reduced API latency by 40% and improved deployment frequency 10x.",
      experience:[{title:"Software Engineer",company:"Startup Inc",location:"Bangalore, India",start:"Jun 2021",end:"",bullets:["Built React dashboard serving 100K+ monthly active users","Reduced API response time by 40% via Redis caching and query optimisation","Implemented CI/CD pipelines cutting deployment time from 2hrs to 15 mins","Led migration from monolith to microservices — zero downtime"]}],
      education:[{degree:"B.E.",field:"Information Science",school:"PESIT Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["JavaScript", "TypeScript", "Python", "Java", "System Design"],tools:["React", "Node.js", "AWS", "Docker", "PostgreSQL", "Redis"],soft:["Teamwork", "Ownership", "Code Review"]},
      certifications:[{name:"AWS Solutions Architect Associate",issuer:"Amazon",year:"2022"}],
      projects:[{name:"Real-time Chat App",stack:"React, Socket.io, Node.js",description:"Scalable chat app handling 10K concurrent users",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t17", layout:"modern", name:"Frontend Developer", category:"Engineering", color:"#db2777", icon:"🎨",
    badge:"", tags:["React", "TypeScript", "CSS"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Frontend Developer with 3 years building fast, accessible, pixel-perfect web apps. Improved Core Web Vitals score from 52 to 94. Reduced JS bundle size by 55% on flagship product.",
      experience:[{title:"Frontend Developer",company:"Digital Agency",location:"Bangalore, India",start:"Jul 2021",end:"",bullets:["Improved Lighthouse score from 52 to 94 optimising Core Web Vitals","Reduced JS bundle size by 55% via code splitting and lazy loading","Built reusable component library used across 5 product teams","Implemented pixel-perfect designs from Figma — zero QA rework"]}],
      education:[{degree:"B.Sc",field:"Computer Science",school:"Anna University",year:"2022",gpa:"8.5"}],
      skills:{technical:["JavaScript", "TypeScript", "HTML5", "CSS3", "Web Performance", "Accessibility"],tools:["React", "Next.js", "Tailwind CSS", "Figma", "Webpack", "Storybook"],soft:["Attention to Detail", "Design Sensibility"]},
      certifications:[{name:"Meta Frontend Developer Certificate",issuer:"Meta",year:"2022"}],
      projects:[{name:"Design System",stack:"React, TypeScript, Storybook",description:"40+ component library adopted by 3 product teams",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t18", layout:"modern", name:"Backend Developer", category:"Engineering", color:"#0f766e", icon:"🖥️",
    badge:"", tags:["Java", "Spring Boot", "Kafka"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Backend Developer with 4 years designing high-performance APIs and microservices. Built payment API handling ₹100Cr+/month. Expert in Java Spring Boot and event-driven architecture.",
      experience:[{title:"Backend Developer",company:"FinTech Startup",location:"Bangalore, India",start:"Jun 2020",end:"",bullets:["Built payment API handling ₹100Cr+ transactions/month at 99.99% uptime","Reduced DB query latency from 800ms to 50ms via indexing + query optimisation","Migrated monolith to 12 microservices — deployment time down 80%","Implemented Kafka event streaming for real-time fraud detection"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"JNTU Hyderabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["Java", "Python", "SQL", "System Design", "Microservices"],tools:["Spring Boot", "Kafka", "PostgreSQL", "Redis", "Docker", "Kubernetes"],soft:["Code Quality", "Documentation", "Performance"]},
      certifications:[{name:"Oracle Java SE 11 Developer",issuer:"Oracle",year:"2022"}],
      projects:[{name:"Fraud Detection",stack:"Java, Kafka, Redis",description:"Real-time fraud detection processing 1M transactions/day",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t19", layout:"modern", name:"Full Stack Developer", category:"Engineering", color:"#0369a1", icon:"🌐",
    badge:"", tags:["React", "Node.js", "MongoDB"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Full Stack Developer with 4 years delivering end-to-end web products. Shipped 10+ production apps. Grew one product from 0 to 500 paying customers in 6 months.",
      experience:[{title:"Full Stack Developer",company:"Product Startup",location:"Bangalore, India",start:"May 2020",end:"",bullets:["Shipped 3 full-stack features end-to-end serving 50K+ users/month","Reduced page load from 4.2s to 1.1s through caching and optimisation","Built REST API processing 1M+ requests/day at 99.9% uptime","Integrated 5 third-party APIs (Stripe, Twilio, SendGrid, AWS S3)"]}],
      education:[{degree:"B.E.",field:"Computer Engineering",school:"Pune University",year:"2022",gpa:"8.5"}],
      skills:{technical:["JavaScript", "Python", "SQL", "REST APIs", "System Design"],tools:["React", "Node.js", "MongoDB", "PostgreSQL", "Redis", "AWS", "Docker"],soft:["Ownership", "Fast Learner"]},
      certifications:[{name:"MongoDB Certified Developer",issuer:"MongoDB",year:"2022"}],
      projects:[{name:"SaaS PM Tool",stack:"React, Node.js, MongoDB",description:"PM tool with 500 paying customers in 6 months",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t20", layout:"modern", name:"DevOps Engineer", category:"Engineering", color:"#059669", icon:"⚙️",
    badge:"", tags:["Kubernetes", "Terraform", "CI/CD"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"DevOps Engineer with 4 years automating infrastructure and building resilient pipelines. Went from 4 deployments/month to 25/day. Cut cloud costs by ₹40L/year.",
      experience:[{title:"DevOps Engineer",company:"CloudFirst Tech",location:"Bangalore, India",start:"Feb 2020",end:"",bullets:["Increased deployment frequency from 4/month to 25/day using Jenkins + ArgoCD","Reduced AWS costs by ₹40L/year via rightsizing and Spot instances","Built Kubernetes cluster managing 200+ microservices at 99.95% uptime","Automated security scanning — 100% critical CVEs caught pre-production"]}],
      education:[{degree:"B.Tech",field:"Electronics",school:"NIT Warangal",year:"2022",gpa:"8.5"}],
      skills:{technical:["Linux", "Cloud Architecture", "Scripting", "Security", "Networking"],tools:["Kubernetes", "Terraform", "Jenkins", "Docker", "AWS", "Ansible", "Prometheus"],soft:["Incident Management", "On-Call", "Documentation"]},
      certifications:[{name:"CKA (Certified Kubernetes Administrator)",issuer:"CNCF",year:"2022"}],
      projects:[{name:"Zero-Downtime Deploy",stack:"K8s, ArgoCD, Helm",description:"Blue-green deployment for 50+ services",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t21", layout:"modern", name:"Python Developer", category:"Engineering", color:"#0284c7", icon:"🐍",
    badge:"", tags:["Python", "FastAPI", "PostgreSQL"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Python Developer with 3 years building scalable APIs and automation tools. Reduced operational overhead by 40% through Python automation. Expert in FastAPI and async programming.",
      experience:[{title:"Python Developer",company:"Tech Company",location:"Bangalore, India",start:"Aug 2021",end:"",bullets:["Built FastAPI service handling 500K+ requests/day at <50ms p99 latency","Automated 12 manual workflows saving 20 hrs/week across the team","Built data pipeline processing 1M records/day using asyncio","Reduced codebase technical debt by 30% through systematic refactoring"]}],
      education:[{degree:"B.Sc",field:"Computer Science",school:"Bangalore University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "SQL", "Async Programming", "REST APIs", "Testing"],tools:["FastAPI", "PostgreSQL", "Redis", "Celery", "Docker", "pytest"],soft:["Clean Code", "Automation", "Documentation"]},
      certifications:[],
      projects:[{name:"Async Data Pipeline",stack:"FastAPI, Celery, PostgreSQL",description:"1M records/day async pipeline",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t22", layout:"modern", name:"Mobile Developer", category:"Engineering", color:"#be185d", icon:"📱",
    badge:"", tags:["React Native", "Flutter", "iOS/Android"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Mobile Developer with 3 years shipping cross-platform apps with 500K+ combined downloads. Expert in React Native and Flutter. Maintains 4.6+ star ratings across all apps.",
      experience:[{title:"Mobile Developer",company:"App Studio",location:"Bangalore, India",start:"Sep 2021",end:"",bullets:["Published 4 apps with 500K+ combined downloads and 4.6 avg star rating","Reduced app crash rate from 2.1% to 0.03% through systematic debugging","Improved app startup time by 60% via lazy loading and code splitting","Built offline-first architecture handling poor network conditions"]}],
      education:[{degree:"B.E.",field:"Computer Engineering",school:"MIT Pune",year:"2022",gpa:"8.5"}],
      skills:{technical:["JavaScript", "Dart", "Swift", "Kotlin", "Mobile Architecture"],tools:["React Native", "Flutter", "Firebase", "Redux", "XCode", "Android Studio"],soft:["User Focus", "Quality", "Iteration"]},
      certifications:[],
      projects:[{name:"Fitness Tracking App",stack:"React Native, Firebase",description:"100K+ downloads, 4.7 stars",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t23", layout:"modern", name:"Site Reliability Engineer", category:"Engineering", color:"#0369a1", icon:"🛡️",
    badge:"", tags:["SRE", "Observability", "Kubernetes"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"SRE with 4 years ensuring reliability of systems serving 100M+ users. Reduced MTTR from 4hrs to 18 mins. Achieved 99.99% uptime on business-critical services.",
      experience:[{title:"Site Reliability Engineer",company:"Big Tech",location:"Bangalore, India",start:"Mar 2020",end:"",bullets:["Reduced MTTR from 4hrs to 18 mins via improved alerting and runbooks","Achieved 99.99% uptime for payment service processing ₹1000Cr/month","Built capacity planning model predicting infra needs 6 months ahead","Led 20+ post-mortems establishing blameless SRE culture"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"IIT Roorkee",year:"2022",gpa:"8.5"}],
      skills:{technical:["SRE", "Systems Programming", "Distributed Systems", "On-Call", "Incident Management"],tools:["Kubernetes", "Prometheus", "Grafana", "PagerDuty", "Terraform", "Python"],soft:["Reliability Mindset", "Root Cause Analysis"]},
      certifications:[{name:"GCP Professional Cloud Architect",issuer:"Google",year:"2022"}],
      projects:[{name:"Chaos Engineering Framework",stack:"Go, Kubernetes",description:"Automated chaos testing finding 15 critical reliability gaps",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t24", layout:"modern", name:"Embedded Systems Engineer", category:"Engineering", color:"#1e40af", icon:"🔌",
    badge:"", tags:["C", "RTOS", "Firmware"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Embedded Engineer with 4 years developing firmware for IoT and automotive applications. Reduced power consumption by 40%. 5M+ devices running my firmware in production.",
      experience:[{title:"Embedded Systems Engineer",company:"IoT Company",location:"Bangalore, India",start:"Jan 2020",end:"",bullets:["Developed RTOS firmware running on 5M+ deployed IoT devices","Reduced power consumption by 40% through sleep mode optimisation","Implemented OTA update system reducing field maintenance costs by 60%","Ported Linux kernel drivers for custom ARM Cortex-M7 hardware"]}],
      education:[{degree:"B.Tech",field:"Electronics & Communication",school:"NIT Karnataka",year:"2022",gpa:"8.5"}],
      skills:{technical:["C", "C++", "RTOS", "ARM Assembly", "Hardware Debugging"],tools:["FreeRTOS", "Zephyr", "GDB", "JTAG", "CAN Bus", "MQTT"],soft:["Precision", "Low-level Thinking", "Hardware Empathy"]},
      certifications:[],
      projects:[{name:"OTA Update System",stack:"C, FreeRTOS, MQTT",description:"Secure OTA for 5M+ devices",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t25", layout:"modern", name:"Blockchain Developer", category:"Engineering", color:"#7c3aed", icon:"⛓️",
    badge:"", tags:["Solidity", "Web3", "Smart Contracts"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Blockchain Developer with 3 years building DeFi protocols and NFT platforms. Smart contracts handling $50M+ TVL. Expert in Solidity and EVM-compatible chains.",
      experience:[{title:"Blockchain Developer",company:"DeFi Startup",location:"Bangalore, India",start:"Oct 2021",end:"",bullets:["Developed DeFi protocol with $50M+ TVL and 10K+ active users","Audited and fixed 3 critical vulnerabilities in smart contracts preventing $5M exploit","Built NFT marketplace doing $2M+ in monthly trading volume","Implemented gas optimisation reducing user transaction costs by 35%"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"BITS Goa",year:"2022",gpa:"8.5"}],
      skills:{technical:["Solidity", "JavaScript", "Cryptography", "DeFi", "Smart Contract Security"],tools:["Hardhat", "ethers.js", "OpenZeppelin", "The Graph", "IPFS", "React"],soft:["Security Mindset", "Innovation"]},
      certifications:[{name:"Ethereum Developer Certification",issuer:"Consensys",year:"2022"}],
      projects:[{name:"DeFi Lending Protocol",stack:"Solidity, Hardhat, React",description:"$50M TVL lending protocol",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t26", layout:"modern", name:"Game Developer", category:"Engineering", color:"#ea580c", icon:"🎮",
    badge:"", tags:["Unity", "C#", "Game Design"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Game Developer with 3 years shipping mobile and PC games. 2M+ total downloads across titles. Expert in Unity, performance optimisation, and multiplayer architecture.",
      experience:[{title:"Game Developer",company:"Game Studio",location:"Bangalore, India",start:"Jun 2021",end:"",bullets:["Shipped 3 mobile games with 2M+ combined downloads","Optimised rendering pipeline improving frame rate from 24fps to 60fps","Built multiplayer system supporting 100 concurrent players per room","Implemented procedural level generation reducing content creation time by 70%"]}],
      education:[{degree:"B.Sc",field:"Game Technology",school:"Manipal University",year:"2022",gpa:"8.5"}],
      skills:{technical:["C#", "C++", "Game Architecture", "Physics", "Shader Programming"],tools:["Unity", "Unreal Engine", "Photon", "Git", "FMOD", "Blender"],soft:["Creativity", "Performance Mindset", "Player Empathy"]},
      certifications:[{name:"Unity Certified Professional",issuer:"Unity",year:"2022"}],
      projects:[{name:"Battle Royale Mobile Game",stack:"Unity, Photon, C#",description:"100-player battle royale with <50ms latency",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t27", layout:"modern", name:"Cloud Engineer", category:"Cloud", color:"#d97706", icon:"☁️",
    badge:"", tags:["AWS", "GCP", "Terraform"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Cloud Engineer with 4 years architecting and managing cloud infrastructure. Migrated 150+ services to cloud saving $1.5M/year. Multi-cloud certified (AWS + GCP).",
      experience:[{title:"Cloud Engineer",company:"Cloud Solutions Co",location:"Bangalore, India",start:"Apr 2020",end:"",bullets:["Migrated 150+ services to AWS saving $1.5M/year in infrastructure costs","Designed disaster recovery achieving 99.99% uptime across 3 regions","Reduced cloud spend by 30% through Reserved Instances and rightsizing","Implemented infrastructure-as-code with Terraform for 100% reproducibility"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"VIT Vellore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Cloud Architecture", "Infrastructure", "Networking", "Security", "Cost Optimisation"],tools:["AWS", "GCP", "Terraform", "Kubernetes", "Ansible", "CloudWatch"],soft:["Problem Solving", "Documentation"]},
      certifications:[{name:"AWS Solutions Architect Professional",issuer:"Amazon",year:"2022"}],
      projects:[{name:"Multi-cloud DR System",stack:"Terraform, AWS, GCP",description:"Active-active multi-cloud with zero-RPO",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t28", layout:"executive", name:"Security Engineer", category:"Security", color:"#dc2626", icon:"🔐",
    badge:"", tags:["Penetration Testing", "SIEM", "CloudSec"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Security Engineer with 4 years protecting systems at scale. Identified 1000+ vulnerabilities. Built SIEM reducing mean time to detect from 48hrs to 45 mins.",
      experience:[{title:"Security Engineer",company:"InfoSec Corp",location:"Bangalore, India",start:"Mar 2020",end:"",bullets:["Identified and remediated 1000+ vulnerabilities across web apps and infrastructure","Built SIEM reducing MTTD from 48hrs to 45 mins","Led incident response for 5 critical breaches limiting blast radius to <2hrs","Implemented zero-trust architecture across 500-service microservices platform"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"Manipal",year:"2022",gpa:"8.5"}],
      skills:{technical:["Penetration Testing", "Threat Modelling", "Incident Response", "SIEM", "Cloud Security"],tools:["Splunk", "Nessus", "Burp Suite", "AWS Security Hub", "CrowdStrike"],soft:["Analytical Mindset", "Detail-oriented"]},
      certifications:[{name:"CISSP",issuer:"(ISC)²",year:"2022"}],
      projects:[{name:"Zero Trust Implementation",stack:"Terraform, Kubernetes, OPA",description:"Zero-trust for 500-service platform",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t29", layout:"compact", name:"QA Engineer", category:"Engineering", color:"#0369a1", icon:"🧪",
    badge:"", tags:["Selenium", "pytest", "API Testing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"QA Engineer with 3 years building quality into the SDLC. Automated 80% of regression suite. Reduced production bugs by 70% and release cycle from 2 weeks to 3 days.",
      experience:[{title:"QA Engineer",company:"Product Co",location:"Bangalore, India",start:"Sep 2021",end:"",bullets:["Automated 80% of regression test suite reducing manual testing from 3 days to 2hrs","Reduced production bugs by 70% through shift-left testing strategy","Built API testing framework catching 95% of integration issues pre-release","Reduced release cycle from 2 weeks to 3 days through parallelised CI"]}],
      education:[{degree:"B.E.",field:"Information Science",school:"BMS College Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Test Automation", "API Testing", "Performance Testing", "Quality Processes", "SQL"],tools:["Selenium", "pytest", "Postman", "JMeter", "Jenkins", "Docker"],soft:["Attention to Detail", "Process Thinking"]},
      certifications:[{name:"ISTQB Advanced Test Analyst",issuer:"ISTQB",year:"2022"}],
      projects:[{name:"Test Automation Framework",stack:"Python, Selenium, pytest",description:"80% automation coverage in 3 months",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t30", layout:"executive", name:"Software Architect", category:"Engineering", color:"#1e40af", icon:"🏛️",
    badge:"Senior", tags:["Architecture", "Design Patterns", "AWS"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Software Architect with 8 years designing enterprise systems. Architected platform handling 10B+ daily requests. Led technical strategy for Series B startup from 10 to 200 engineers.",
      experience:[{title:"Software Architect",company:"Scale-up Company",location:"Bangalore, India",start:"Jan 2016",end:"",bullets:["Architected event-driven platform handling 10B+ daily requests at 99.99% uptime","Led engineering organisation from 10 to 200 engineers over 4 years","Defined API standards and design patterns adopted company-wide","Reduced infrastructure cost by $3M/year through architectural modernisation"]}],
      education:[{degree:"M.Tech",field:"Computer Science",school:"IIT Delhi",year:"2022",gpa:"8.5"}],
      skills:{technical:["Software Architecture", "System Design", "Distributed Systems", "API Design", "Cloud"],tools:["AWS", "Kafka", "Kubernetes", "PostgreSQL", "Redis", "gRPC"],soft:["Technical Leadership", "Communication", "Strategy"]},
      certifications:[{name:"AWS Professional Solutions Architect",issuer:"Amazon",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t31", layout:"compact", name:"Product Manager", category:"Management", color:"#ea580c", icon:"🎯",
    badge:"", tags:["Roadmap", "Agile", "Metrics"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Product Manager with 4 years leading cross-functional teams. Grew DAU by 45% through data-driven prioritisation. Managed ₹30Cr revenue product serving 500+ enterprise clients.",
      experience:[{title:"Product Manager",company:"SaaS Co",location:"Bangalore, India",start:"Mar 2020",end:"",bullets:["Grew DAU by 45% launching 3 high-impact features in 6 months","Reduced churn by 20% through targeted onboarding improvements","Managed roadmap for ₹30Cr revenue product with 500+ enterprise clients","Ran 50+ user interviews defining product vision and quarterly OKRs"]}],
      education:[{degree:"MBA",field:"Marketing & Strategy",school:"IIM Ahmedabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["Product Strategy", "Roadmapping", "OKRs", "A/B Testing", "SQL"],tools:["JIRA", "Figma", "Mixpanel", "Amplitude", "Confluence"],soft:["Leadership", "Stakeholder Management", "Data-Driven"]},
      certifications:[{name:"CSPO (Certified Scrum Product Owner)",issuer:"Scrum Alliance",year:"2022"}],
      projects:[{name:"Onboarding Redesign",stack:"Figma, Mixpanel",description:"Activation rate from 32% to 61%",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t32", layout:"executive", name:"Senior Product Manager", category:"Management", color:"#c2410c", icon:"🚀",
    badge:"Senior", tags:["0→1 Product", "B2B SaaS", "Growth"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Senior PM with 6+ years building 0→1 products. Took 2 products from concept to $5M ARR. Expert at identifying unmet user needs and translating them into loved features.",
      experience:[{title:"Senior Product Manager",company:"Series B Startup",location:"Bangalore, India",start:"Jan 2018",end:"",bullets:["Took 2 products from 0 to $5M ARR in under 18 months each","Defined and shipped MVP in 90 days by ruthless scope prioritisation","Built product analytics instrumentation tracking 200+ user events","Grew NPS from 18 to 52 through systematic customer feedback loops"]}],
      education:[{degree:"MBA",field:"General Management",school:"IIM Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["0→1 Product Development", "Product Strategy", "User Research", "Financial Modelling"],tools:["ProductBoard", "Figma", "SQL", "Mixpanel", "Intercom", "Notion"],soft:["Vision", "Execution", "Customer Empathy"]},
      certifications:[],
      projects:[{name:"Enterprise Collaboration Tool",stack:"Figma, SQL, Amplitude",description:"0 to $5M ARR in 14 months",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t33", layout:"creative", name:"Technical Product Manager", category:"Management", color:"#7c3aed", icon:"⚡",
    badge:"", tags:["APIs", "Technical Specs", "Agile"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Technical PM with 3 years owning platform and API products. Managed developer platform used by 5000+ external developers. Reduced API integration time from 3 days to 4 hours.",
      experience:[{title:"Technical PM",company:"Platform Company",location:"Bangalore, India",start:"Jun 2021",end:"",bullets:["Managed developer platform used by 5000+ external developers","Reduced API integration time from 3 days to 4 hours","Shipped 3 major API versions maintaining 100% backward compatibility","Grew developer ecosystem from 200 to 5000 active integrations in 18 months"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"IIT Hyderabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["Technical Product Management", "APIs", "Developer Experience", "SQL", "System Design"],tools:["JIRA", "Swagger", "Postman", "Amplitude", "Confluence", "GitHub"],soft:["Technical Credibility", "Communication"]},
      certifications:[],
      projects:[{name:"Developer Platform",stack:"REST APIs, OAuth",description:"5000 active developer integrations",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t34", layout:"minimal", name:"Growth PM", category:"Management", color:"#0891b2", icon:"📊",
    badge:"", tags:["Growth", "Experimentation", "Funnels"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Growth PM with 4 years running experimentation programmes. Shipped 200+ A/B tests. Grew MAU from 500K to 5M through systematic growth loops and viral mechanics.",
      experience:[{title:"Growth PM",company:"Consumer App",location:"Bangalore, India",start:"Feb 2020",end:"",bullets:["Ran 200+ A/B tests, 35% win rate — 3x industry average","Grew MAU from 500K to 5M through growth loops and viral mechanics","Built referral programme generating 30% of new user acquisition","Reduced CAC by 45% through optimised onboarding funnel"]}],
      education:[{degree:"MBA",field:"Marketing",school:"XLRI Jamshedpur",year:"2022",gpa:"8.5"}],
      skills:{technical:["Growth Hacking", "Experimentation", "Funnel Optimisation", "SQL", "Analytics"],tools:["Mixpanel", "Braze", "Optimizely", "SQL", "Amplitude", "Looker"],soft:["Curiosity", "Speed", "Data-Driven"]},
      certifications:[],
      projects:[{name:"Referral Programme",stack:"Python, SQL, Braze",description:"30% of new user acquisition via referral",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t35", layout:"executive", name:"Project Manager", category:"Management", color:"#0369a1", icon:"📋",
    badge:"", tags:["PMP", "Agile", "Stakeholders"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Project Manager with 5 years delivering complex technology projects. ₹50Cr+ project portfolio delivered on time and within budget. PMP certified with Agile expertise.",
      experience:[{title:"Project Manager",company:"Consulting Firm",location:"Bangalore, India",start:"Jan 2019",end:"",bullets:["Delivered ₹50Cr ERP implementation on time and 8% under budget","Managed 15-person cross-functional team across 3 time zones","Reduced project risk by 40% through proactive risk management framework","Achieved 97% stakeholder satisfaction across 20+ projects"]}],
      education:[{degree:"MBA",field:"Operations",school:"FMS Delhi",year:"2022",gpa:"8.5"}],
      skills:{technical:["Project Management", "Risk Management", "Budgeting", "Stakeholder Management", "Agile"],tools:["MS Project", "JIRA", "Confluence", "Smartsheet", "Power BI"],soft:["Leadership", "Communication", "Problem Solving"]},
      certifications:[{name:"PMP (Project Management Professional)",issuer:"PMI",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t36", layout:"creative", name:"UX Designer", category:"Design", color:"#e11d48", icon:"🎭",
    badge:"", tags:["Figma", "User Research", "Prototyping"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"UX Designer with 3 years creating user-centred digital experiences. Improved conversion by 35% on e-commerce checkout redesign. End-to-end designer: research to handoff.",
      experience:[{title:"UX Designer",company:"E-commerce Platform",location:"Bangalore, India",start:"Sep 2021",end:"",bullets:["Redesigned checkout flow increasing conversion by 35% (₹8Cr revenue impact)","Conducted 60+ user research sessions and 20 usability tests","Built design system with 80+ components adopted by 4 product teams","Reduced design-to-dev handoff time by 40% using Figma Dev Mode"]}],
      education:[{degree:"B.Des",field:"Interaction Design",school:"NID Ahmedabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["User Research", "Wireframing", "Prototyping", "Usability Testing", "Information Architecture"],tools:["Figma", "Adobe XD", "Maze", "Hotjar", "Miro"],soft:["Empathy", "Communication", "Iteration"]},
      certifications:[{name:"Google UX Design Certificate",issuer:"Google",year:"2022"}],
      projects:[{name:"Checkout Redesign",stack:"Figma, Maze",description:"35% conversion improvement",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t37", layout:"creative", name:"Product Designer", category:"Design", color:"#db2777", icon:"✨",
    badge:"", tags:["Product Design", "Systems", "Mobile"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Product Designer with 4 years designing mobile and web products used by millions. Led design for 0→1 fintech app that reached #1 in App Store. Specialist in complex financial UX.",
      experience:[{title:"Product Designer",company:"FinTech App",location:"Bangalore, India",start:"Mar 2020",end:"",bullets:["Led design for fintech app reaching #1 Finance in App Store with 4.9 stars","Built design system with 120+ components serving 8 product squads","Improved user task completion from 61% to 89% through UX overhaul","Reduced support tickets by 35% by improving onboarding experience"]}],
      education:[{degree:"B.Des",field:"Communication Design",school:"NID Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Product Design", "Design Systems", "Mobile UX", "Financial UX", "Accessibility"],tools:["Figma", "Principle", "ProtoPie", "Zeroheight", "Lottie"],soft:["User Advocacy", "Systems Thinking"]},
      certifications:[],
      projects:[{name:"FinTech Design System",stack:"Figma, Zeroheight",description:"120-component system for 8 squads",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t38", layout:"creative", name:"UI Developer", category:"Design", color:"#0284c7", icon:"🖌️",
    badge:"", tags:["HTML/CSS", "React", "Design Systems"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"UI Developer bridging design and engineering with 3 years. Implemented 200+ design specifications with pixel-perfect accuracy. Specialises in accessible, performant UI components.",
      experience:[{title:"UI Developer",company:"Product Studio",location:"Bangalore, India",start:"Jul 2021",end:"",bullets:["Implemented 200+ screens from Figma with pixel-perfect accuracy","Built accessible component library (WCAG 2.1 AA) used by 3 teams","Reduced CSS bundle size by 60% through design token implementation","Cut design-QA cycle from 3 days to 4 hours through Storybook workflow"]}],
      education:[{degree:"B.Sc",field:"Computer Science",school:"Christ University Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["HTML5", "CSS3", "JavaScript", "Accessibility", "Web Animation"],tools:["React", "Storybook", "Tailwind CSS", "Figma", "Framer Motion"],soft:["Precision", "Design Sensibility", "Collaboration"]},
      certifications:[],
      projects:[{name:"Accessible Component Library",stack:"React, Storybook",description:"WCAG 2.1 AA component library",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t39", layout:"creative", name:"Graphic Designer", category:"Design", color:"#7c3aed", icon:"🎨",
    badge:"", tags:["Branding", "Illustrator", "Print"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Graphic Designer with 4 years creating brand identities and marketing collateral. Led complete rebrand for ₹100Cr company. Specialises in brand systems and digital design.",
      experience:[{title:"Graphic Designer",company:"Design Agency",location:"Bangalore, India",start:"Jan 2020",end:"",bullets:["Led complete rebrand for ₹100Cr company — 40% brand recall improvement","Designed brand identities for 15+ startups from seed to Series A","Created marketing collateral driving 3x increase in event attendance","Built brand guidelines adopted across 200+ employee organisation"]}],
      education:[{degree:"B.Des",field:"Visual Communication",school:"Srishti School of Design",year:"2022",gpa:"8.5"}],
      skills:{technical:["Brand Identity", "Typography", "Layout Design", "Color Theory", "Print Design"],tools:["Adobe Illustrator", "Photoshop", "InDesign", "Figma", "After Effects"],soft:["Creative Vision", "Attention to Detail"]},
      certifications:[],
      projects:[{name:"Series A Startup Rebrand",stack:"Adobe CC, Figma",description:"Complete brand system for funded startup",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t40", layout:"creative", name:"Motion Designer", category:"Design", color:"#9333ea", icon:"🎬",
    badge:"", tags:["After Effects", "Cinema 4D", "Animation"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Motion Designer with 3 years creating engaging animations for products and marketing. Grew brand social engagement by 180% through motion content. Expert in UI animation and video production.",
      experience:[{title:"Motion Designer",company:"Creative Agency",location:"Bangalore, India",start:"Oct 2021",end:"",bullets:["Created motion design system improving product animations consistency by 100%","Grew brand social engagement by 180% through motion content strategy","Produced 50+ explainer videos with average 85% completion rate","Reduced animation production time by 40% through template system"]}],
      education:[{degree:"B.Des",field:"Animation & Film",school:"Symbiosis Pune",year:"2022",gpa:"8.5"}],
      skills:{technical:["Motion Design", "UI Animation", "Video Production", "Storytelling", "Brand"],tools:["After Effects", "Cinema 4D", "Lottie", "Figma", "Premiere Pro"],soft:["Creativity", "Storytelling", "Craft"]},
      certifications:[],
      projects:[{name:"Product Onboarding Animation",stack:"After Effects, Lottie",description:"40% reduction in support queries post-animation",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t41", layout:"classic", name:"Business Analyst", category:"Business", color:"#0284c7", icon:"📈",
    badge:"", tags:["SQL", "Requirements", "Process"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Business Analyst with 3 years bridging business and technology. Saved ₹25L/year identifying process inefficiencies. Expert at requirements gathering and stakeholder communication.",
      experience:[{title:"Business Analyst",company:"Consulting Firm",location:"Bangalore, India",start:"Jan 2021",end:"",bullets:["Saved ₹25L/year identifying and eliminating 3 redundant workflows","Delivered requirements for ₹2Cr ERP implementation on time, 10% under budget","Created executive dashboards in Excel/Tableau tracking 20+ KPIs","Facilitated 100+ stakeholder workshops to gather and validate requirements"]}],
      education:[{degree:"B.Com",field:"Finance",school:"Delhi University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Requirements Analysis", "Process Mapping", "SQL", "BRD/FRD Writing", "Data Analysis"],tools:["Excel", "Tableau", "Power BI", "JIRA", "Confluence", "MS Visio"],soft:["Communication", "Critical Thinking", "Stakeholder Management"]},
      certifications:[{name:"CBAP",issuer:"IIBA",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t42", layout:"executive", name:"Management Consultant", category:"Business", color:"#1e40af", icon:"💼",
    badge:"Senior", tags:["Strategy", "M&A", "Operations"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Management Consultant with 5 years at Big 4 advising Fortune 500 companies. Led ₹500Cr cost transformation programme. Expert in strategy, operations, and M&A due diligence.",
      experience:[{title:"Senior Consultant",company:"Big 4 Firm",location:"Bangalore, India",start:"Jul 2019",end:"",bullets:["Led ₹500Cr cost transformation delivering ₹80Cr in sustainable savings","Conducted M&A due diligence for 3 acquisitions totalling $500M in deal value","Built operating model for 10,000-person organisation post-merger","Managed team of 6 across 4-month engagement delivering 200-page strategy report"]}],
      education:[{degree:"MBA",field:"Finance & Strategy",school:"IIM Ahmedabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["Management Consulting", "Strategy", "Financial Analysis", "Operations", "M&A"],tools:["PowerPoint", "Excel", "Power BI", "SQL", "Tableau"],soft:["Structured Thinking", "Communication", "Leadership"]},
      certifications:[],
      projects:[{name:"Market Entry Strategy",stack:"Excel, PowerPoint",description:"$200M market entry strategy for FMCG client",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t43", layout:"classic", name:"Operations Manager", category:"Business", color:"#065f46", icon:"🏭",
    badge:"", tags:["Operations", "Process", "Six Sigma"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Operations Manager with 5 years optimising supply chain and operations. Reduced operational costs by ₹3Cr/year and improved on-time delivery from 78% to 97%.",
      experience:[{title:"Operations Manager",company:"Manufacturing Co",location:"Bangalore, India",start:"Mar 2019",end:"",bullets:["Improved on-time delivery from 78% to 97% through supply chain redesign","Reduced operational costs by ₹3Cr/year through process optimisation","Led Six Sigma Black Belt project saving ₹1.5Cr/year","Managed 50-person operations team across 3 shifts"]}],
      education:[{degree:"MBA",field:"Operations",school:"XLRI Jamshedpur",year:"2022",gpa:"8.5"}],
      skills:{technical:["Supply Chain", "Process Optimisation", "Six Sigma", "Lean", "Inventory Management"],tools:["SAP", "Excel", "Power BI", "AutoCAD", "Minitab"],soft:["Leadership", "Problem Solving", "Process Thinking"]},
      certifications:[{name:"Six Sigma Black Belt",issuer:"ASQ",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t44", layout:"classic", name:"Sales Manager", category:"Business", color:"#dc2626", icon:"🤝",
    badge:"", tags:["B2B Sales", "CRM", "Revenue"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Sales Manager with 5 years closing enterprise deals. Consistently 140%+ of quota. Built and led team of 12 AEs achieving highest-ever company ARR of ₹25Cr.",
      experience:[{title:"Sales Manager",company:"SaaS Company",location:"Bangalore, India",start:"Jun 2019",end:"",bullets:["Achieved 140%+ of quota for 5 consecutive years","Built and led team of 12 AEs achieving ₹25Cr ARR (highest in company history)","Closed 3 enterprise deals >₹1Cr each in single quarter","Reduced sales cycle from 90 days to 45 days through process improvement"]}],
      education:[{degree:"MBA",field:"Marketing",school:"NMIMS Mumbai",year:"2022",gpa:"8.5"}],
      skills:{technical:["Enterprise Sales", "Account Management", "Negotiation", "Pipeline Management", "CRM"],tools:["Salesforce", "HubSpot", "LinkedIn Sales Navigator", "Gong", "Excel"],soft:["Persistence", "Relationship Building", "Leadership"]},
      certifications:[],
      projects:[{name:"Enterprise Sales Playbook",stack:"Salesforce, Gong",description:"Playbook cutting sales cycle by 50%",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t45", layout:"classic", name:"Finance Manager", category:"Finance", color:"#0369a1", icon:"💰",
    badge:"", tags:["FP&A", "Excel", "Financial Modelling"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Finance Manager with 6 years in FP&A and corporate finance. Built 3-statement financial models used for $50M fundraise. Reduced month-end close from 10 days to 4 days.",
      experience:[{title:"Finance Manager",company:"Tech Company",location:"Bangalore, India",start:"Jan 2018",end:"",bullets:["Built 3-statement financial model used for successful $50M Series B fundraise","Reduced month-end close process from 10 days to 4 days","Developed annual budgeting process with 95% forecast accuracy","Led finance team of 5 through IPO readiness preparation"]}],
      education:[{degree:"CA",field:"Chartered Accountancy",school:"ICAI",year:"2022",gpa:"8.5"}],
      skills:{technical:["Financial Modelling", "FP&A", "Budgeting", "Variance Analysis", "M&A"],tools:["Excel", "Power BI", "SAP", "Oracle NetSuite", "Tableau"],soft:["Analytical Rigour", "Leadership", "Stakeholder Management"]},
      certifications:[{name:"Chartered Accountant (CA)",issuer:"ICAI",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t46", layout:"minimal", name:"HR Manager", category:"HR", color:"#9333ea", icon:"👥",
    badge:"", tags:["Talent Acquisition", "HRBP", "Culture"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"HR Manager with 5 years building high-performing teams. Hired 200+ employees, reduced time-to-hire by 40%. Built people programmes that improved eNPS from 28 to 61.",
      experience:[{title:"HR Manager",company:"Tech Startup",location:"Bangalore, India",start:"Apr 2019",end:"",bullets:["Hired 200+ employees across 15 departments in 2 years","Reduced time-to-hire from 45 days to 27 days through process improvement","Built L&D programme upskilling 150 employees; 30% promotion rate","Improved eNPS from 28 to 61 through targeted culture initiatives"]}],
      education:[{degree:"MBA",field:"HR & OB",school:"TISS Mumbai",year:"2022",gpa:"8.5"}],
      skills:{technical:["Talent Acquisition", "HR Business Partnering", "L&D", "Compensation & Benefits", "HR Analytics"],tools:["Workday", "Darwinbox", "LinkedIn Recruiter", "Greenhouse", "Excel"],soft:["Empathy", "Communication", "Strategy"]},
      certifications:[{name:"SHRM-SCP",issuer:"SHRM",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t47", layout:"minimal", name:"Talent Acquisition Specialist", category:"HR", color:"#7c3aed", icon:"🎯",
    badge:"", tags:["Recruiting", "Sourcing", "ATS"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"TA Specialist with 3 years filling senior tech roles at scale. Hired 150+ engineers and data scientists. Reduced cost-per-hire by 35% and improved offer acceptance to 92%.",
      experience:[{title:"Talent Acquisition Specialist",company:"Tech Company",location:"Bangalore, India",start:"Jul 2021",end:"",bullets:["Hired 150+ engineers and data scientists across 8 teams","Improved offer acceptance rate from 72% to 92% through candidate experience focus","Reduced cost-per-hire by 35% through employee referral programme","Built technical assessment framework reducing mis-hires by 50%"]}],
      education:[{degree:"BBA",field:"HR",school:"Symbiosis Pune",year:"2022",gpa:"8.5"}],
      skills:{technical:["Technical Recruiting", "Boolean Search", "Candidate Experience", "Employer Branding", "Data-Driven Hiring"],tools:["Greenhouse", "LinkedIn Recruiter", "HackerRank", "Workday", "Excel"],soft:["Communication", "Empathy", "Speed"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t48", layout:"creative", name:"Digital Marketing Manager", category:"Marketing", color:"#9333ea", icon:"📣",
    badge:"", tags:["SEO", "Google Ads", "Analytics"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Digital Marketing Manager with 4 years driving growth through data-driven campaigns. Grew organic traffic by 300% and reduced CAC by 45%.",
      experience:[{title:"Digital Marketing Manager",company:"D2C Brand",location:"Bangalore, India",start:"Feb 2020",end:"",bullets:["Grew organic traffic 300% in 12 months through SEO and content","Reduced CAC by 45% optimising Google/Meta Ads","Managed ₹2Cr/month ad budget across Google, Meta, LinkedIn","Built attribution model for ₹50Cr in revenue across 5 channels"]}],
      education:[{degree:"BMS",field:"Marketing",school:"Mumbai University",year:"2022",gpa:"8.5"}],
      skills:{technical:["SEO", "SEM", "Content Marketing", "Email Marketing", "Analytics"],tools:["Google Analytics 4", "Google Ads", "Meta Ads", "Semrush", "HubSpot"],soft:["Creativity", "Data Analysis", "Storytelling"]},
      certifications:[{name:"Google Digital Marketing Certificate",issuer:"Google",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t49", layout:"creative", name:"Content Marketing Manager", category:"Marketing", color:"#be185d", icon:"✍️",
    badge:"", tags:["Content", "SEO", "Brand Voice"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Content Marketing Manager with 4 years building content engines that drive organic growth. Grew blog from 0 to 500K monthly visitors. Content strategy responsible for 40% of pipeline.",
      experience:[{title:"Content Marketing Manager",company:"B2B SaaS",location:"Bangalore, India",start:"Jan 2020",end:"",bullets:["Grew blog from 0 to 500K monthly visitors, ranking #1 for 200+ keywords","Content strategy responsible for 40% of company pipeline ($2M ARR)","Built team of 6 writers, SEO specialists, and video producers","Launched podcast reaching 50K listeners — top 10% in business category"]}],
      education:[{degree:"BA",field:"English Literature",school:"St. Stephens Delhi",year:"2022",gpa:"8.5"}],
      skills:{technical:["Content Strategy", "SEO", "Copywriting", "Editorial Planning", "Brand Voice"],tools:["HubSpot", "Semrush", "WordPress", "Canva", "Hotjar"],soft:["Storytelling", "Creativity", "SEO Thinking"]},
      certifications:[{name:"HubSpot Content Marketing",issuer:"HubSpot",year:"2022"}],
      projects:[{name:"Company Blog",stack:"WordPress, Semrush",description:"500K monthly visitors, 200+ #1 rankings",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t50", layout:"creative", name:"Social Media Manager", category:"Marketing", color:"#e11d48", icon:"📱",
    badge:"", tags:["Instagram", "LinkedIn", "Community"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Social Media Manager with 3 years growing brand communities. Grew combined following from 10K to 500K. Social media strategy contributed 25% of e-commerce revenue.",
      experience:[{title:"Social Media Manager",company:"Fashion Brand",location:"Bangalore, India",start:"Aug 2021",end:"",bullets:["Grew combined social following from 10K to 500K in 18 months","Social media strategy contributing 25% of e-commerce revenue (₹5Cr/year)","Viral campaign reaching 10M+ impressions with ₹50K budget","Built creator partnership programme with 200+ micro-influencers"]}],
      education:[{degree:"BBA",field:"Marketing",school:"Amity University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Social Media Strategy", "Content Creation", "Community Management", "Influencer Marketing", "Analytics"],tools:["Meta Business Suite", "LinkedIn Analytics", "Canva", "Hootsuite", "Later"],soft:["Creativity", "Trend Awareness", "Community Building"]},
      certifications:[{name:"Meta Social Media Marketing",issuer:"Meta",year:"2022"}],
      projects:[{name:"Viral Campaign",stack:"Canva, Meta Ads",description:"10M impressions, 300% ROI",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t51", layout:"compact", name:"Software Engineer Fresher", category:"Fresher", color:"#2563eb", icon:"💻",
    badge:"For Freshers", tags:["Python", "Java", "DSA"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Recent Computer Science graduate with strong foundation in Python, Java, and data structures. 3 internships, competitive programmer (top 5% on LeetCode). Eager to contribute to production systems.",
      experience:[{title:"Software Developer Intern",company:"IT Services Company",location:"Bangalore, India",start:"May 2023",end:"",bullets:["Built REST API endpoint reducing manual data entry by 60%","Fixed 12 production bugs improving app stability for 10K users","Wrote unit tests achieving 80% code coverage for assigned modules","Won internal hackathon with ML-powered expense categorisation tool"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"Your College",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "Java", "C++", "Data Structures", "Algorithms"],tools:["Git", "MySQL", "VS Code", "Postman", "Linux"],soft:["Fast Learner", "Teamwork", "Problem Solving"]},
      certifications:[],
      projects:[{name:"Student Management System",stack:"Python, Flask, MySQL",description:"Web app for 500+ students",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t52", layout:"compact", name:"Data Analyst Fresher", category:"Fresher", color:"#0891b2", icon:"📊",
    badge:"For Freshers", tags:["SQL", "Python", "Excel"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Fresh B.Tech graduate passionate about turning data into decisions. Completed 2 data analytics internships and 5 Kaggle projects. Google Data Analytics certified.",
      experience:[{title:"Data Analytics Intern",company:"E-commerce Co",location:"Bangalore, India",start:"Jun 2023",end:"",bullets:["Built Excel dashboard tracking 20 sales KPIs reducing reporting time by 40%","Wrote SQL queries for customer segmentation across 100K+ records","Created Power BI reports presented to senior management","Identified ₹2L/month savings through shipping cost analysis"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"Your University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "SQL", "Statistics", "Data Visualization"],tools:["Excel", "Power BI", "Pandas", "MySQL", "Google Analytics"],soft:["Quick Learner", "Detail-Oriented", "Communication"]},
      certifications:[{name:"Google Data Analytics Certificate",issuer:"Google",year:"2022"}],
      projects:[{name:"Sales Analysis Dashboard",stack:"Python, Power BI",description:"Automated reporting saving 8hrs/week",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t53", layout:"compact", name:"Frontend Developer Fresher", category:"Fresher", color:"#db2777", icon:"🎨",
    badge:"For Freshers", tags:["React", "HTML/CSS", "JS"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Fresh graduate specialising in frontend development. Built 8 personal projects. Strong in React and modern CSS. Internship experience shipping features to production users.",
      experience:[{title:"Frontend Intern",company:"Startup",location:"Bangalore, India",start:"Apr 2023",end:"",bullets:["Built 3 React components now live in production serving 5K users","Fixed 20+ UI bugs reducing user-reported issues by 30%","Improved mobile responsiveness for 15 pages increasing mobile retention by 12%","Collaborated daily with design team using Figma for pixel-perfect implementation"]}],
      education:[{degree:"B.Sc",field:"Computer Science",school:"Your College",year:"2022",gpa:"8.5"}],
      skills:{technical:["HTML5", "CSS3", "JavaScript", "React", "Git"],tools:["React", "VS Code", "Figma", "Chrome DevTools", "npm"],soft:["Attention to Detail", "Fast Learner", "Team Player"]},
      certifications:[],
      projects:[{name:"E-commerce UI Clone",stack:"React, CSS",description:"Fully responsive 20-page site",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t54", layout:"compact", name:"ML Fresher", category:"Fresher", color:"#7c3aed", icon:"🤖",
    badge:"For Freshers", tags:["Python", "ML", "Deep Learning"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"ML enthusiast with 2+ years learning through projects. Completed 3 Coursera specialisations and achieved top 15% in 2 Kaggle competitions. Strong mathematics and Python foundation.",
      experience:[{title:"ML Research Intern",company:"AI Startup",location:"Bangalore, India",start:"May 2023",end:"",bullets:["Implemented BERT-based classifier achieving 91% F1 on NLP task","Preprocessed and cleaned 500K+ record dataset for production model","Reproduced 2 research papers and presented findings to team","Built Flask API demo for internal ML prototype"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"Your University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Python", "Machine Learning", "Deep Learning", "Mathematics", "Statistics"],tools:["PyTorch", "Scikit-learn", "NumPy", "Pandas", "Google Colab"],soft:["Research Mindset", "Continuous Learning"]},
      certifications:[{name:"Deep Learning Specialization",issuer:"Coursera / Andrew Ng",year:"2022"}],
      projects:[{name:"Sentiment Classifier",stack:"PyTorch, Flask",description:"91% F1 BERT classifier",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t55", layout:"compact", name:"DevOps Fresher", category:"Fresher", color:"#059669", icon:"⚙️",
    badge:"For Freshers", tags:["Docker", "Linux", "CI/CD"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Infrastructure-minded fresh graduate with hands-on DevOps experience from 2 internships. Built CI/CD pipelines and containerised applications. Linux and Docker certified.",
      experience:[{title:"DevOps Intern",company:"Tech Company",location:"Bangalore, India",start:"Jun 2023",end:"",bullets:["Set up Jenkins CI/CD pipeline reducing manual deployment time by 70%","Containerised 5 microservices using Docker and Docker Compose","Configured Nginx reverse proxy and SSL for 3 production domains","Monitored system health using Prometheus + Grafana dashboards"]}],
      education:[{degree:"B.Tech",field:"Information Technology",school:"Your College",year:"2022",gpa:"8.5"}],
      skills:{technical:["Linux", "Docker", "Shell Scripting", "Networking", "CI/CD"],tools:["Docker", "Jenkins", "Nginx", "AWS", "Git", "Prometheus"],soft:["Problem Solving", "Documentation", "Initiative"]},
      certifications:[{name:"Docker Certified Associate",issuer:"Docker",year:"2022"}],
      projects:[{name:"Personal Portfolio Site",stack:"Docker, Nginx, Jenkins",description:"Containerised deployment with automated CI/CD",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t56", layout:"minimal", name:"Product Analyst", category:"Management", color:"#0369a1", icon:"📊",
    badge:"", tags:["SQL", "Funnels", "Metrics"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Product Analyst with 2 years driving product decisions through data. Instrumented analytics for 3 product launches and built dashboards used daily by 5 PMs.",
      experience:[{title:"Product Analyst",company:"Consumer App",location:"Bangalore, India",start:"Jun 2022",end:"",bullets:["Instrumented analytics for 3 major product launches tracking 100+ events","Built product dashboards used daily by 5 PMs and 2 VPs","Identified critical funnel drop-off reducing activation by 20%; fix drove 35% improvement","Ran 15 A/B tests with statistically rigorous methodology"]}],
      education:[{degree:"B.Tech",field:"Engineering",school:"IIT Guwahati",year:"2022",gpa:"8.5"}],
      skills:{technical:["SQL", "Product Analytics", "Funnel Analysis", "A/B Testing", "Statistics"],tools:["Amplitude", "Mixpanel", "SQL", "Looker", "Excel"],soft:["Curiosity", "Communication", "Rigour"]},
      certifications:[],
      projects:[{name:"Funnel Analysis Framework",stack:"SQL, Amplitude",description:"35% activation improvement",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t57", layout:"executive", name:"Scrum Master", category:"Management", color:"#0891b2", icon:"🔄",
    badge:"", tags:["Scrum", "Agile", "Coaching"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Certified Scrum Master with 4 years facilitating high-performing agile teams. Improved team velocity by 40% and reduced sprint spillover from 35% to 8%.",
      experience:[{title:"Scrum Master",company:"Product Company",location:"Bangalore, India",start:"Feb 2020",end:"",bullets:["Improved team velocity by 40% through better sprint planning and impediment removal","Reduced sprint spillover from 35% to 8% in 3 months","Facilitated 200+ sprint ceremonies maintaining team energy and focus","Coached 3 teams transitioning from waterfall to Scrum"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"RVCE Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Scrum", "Agile Coaching", "Facilitation", "Conflict Resolution", "Metrics"],tools:["JIRA", "Confluence", "Miro", "Slack", "Zoom"],soft:["Servant Leadership", "Facilitation", "Empathy"]},
      certifications:[{name:"Certified Scrum Master (CSM)",issuer:"Scrum Alliance",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t58", layout:"classic", name:"Supply Chain Analyst", category:"Business", color:"#065f46", icon:"🚚",
    badge:"", tags:["Supply Chain", "SQL", "Excel"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Supply Chain Analyst with 3 years optimising procurement and logistics. Reduced inventory holding cost by ₹5Cr and improved supplier on-time delivery from 71% to 94%.",
      experience:[{title:"Supply Chain Analyst",company:"FMCG Company",location:"Bangalore, India",start:"Mar 2021",end:"",bullets:["Reduced inventory holding cost by ₹5Cr through demand forecasting model","Improved supplier OTD from 71% to 94% through performance management programme","Built procurement analytics dashboard tracking 500+ SKUs","Led tender process for ₹50Cr logistics contract saving 12%"]}],
      education:[{degree:"MBA",field:"Operations",school:"Great Lakes Chennai",year:"2022",gpa:"8.5"}],
      skills:{technical:["Demand Forecasting", "Procurement", "Logistics", "SQL", "Statistical Modelling"],tools:["SAP", "Excel", "Power BI", "SQL", "Python"],soft:["Analytical Thinking", "Negotiation", "Detail-Oriented"]},
      certifications:[{name:"CSCP",issuer:"APICS",year:"2022"}],
      projects:[{name:"Demand Forecast Model",stack:"Python, Excel",description:"₹5Cr inventory cost reduction",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t59", layout:"classic", name:"Cybersecurity Analyst", category:"Security", color:"#dc2626", icon:"🔐",
    badge:"", tags:["SOC", "SIEM", "Pen Testing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Cybersecurity Analyst with 3+ years in SOC and penetration testing. Identified 500+ vulnerabilities. CEH and CompTIA Security+ certified.",
      experience:[{title:"Cybersecurity Analyst",company:"InfoSec Corp",location:"Bangalore, India",start:"Jan 2021",end:"",bullets:["Identified and remediated 500+ vulnerabilities in web apps and networks","Led incident response for 3 critical breaches limiting exposure to <4hrs","Built SIEM dashboards reducing MTTD from 48hrs to 2hrs","Conducted 20+ penetration tests for enterprise clients"]}],
      education:[{degree:"B.Tech",field:"Information Security",school:"VIT Vellore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Penetration Testing", "Vulnerability Assessment", "Incident Response", "SIEM"],tools:["Splunk", "Nessus", "Metasploit", "Burp Suite", "Wireshark"],soft:["Analytical", "Detail-Oriented", "Report Writing"]},
      certifications:[{name:"CEH (Certified Ethical Hacker)",issuer:"EC-Council",year:"2022"}],
      projects:[{name:"SIEM Dashboard",stack:"Splunk, Python",description:"MTTD reduced from 48hrs to 2hrs",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t60", layout:"minimal", name:"Technical Writer", category:"Engineering", color:"#0284c7", icon:"📝",
    badge:"", tags:["Documentation", "APIs", "Markdown"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Technical Writer with 3 years creating developer documentation and user guides. Reduced support tickets by 40% through improved documentation. Specialist in API docs and tutorials.",
      experience:[{title:"Technical Writer",company:"Dev Tools Company",location:"Bangalore, India",start:"Aug 2021",end:"",bullets:["Reduced support tickets by 40% through comprehensive documentation overhaul","Wrote API documentation for 5 SDKs used by 10K+ developers","Created onboarding tutorials improving developer activation by 25%","Built documentation site from scratch using Docusaurus"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"PES University Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Technical Writing", "API Documentation", "Information Architecture", "Markdown", "DITA"],tools:["Docusaurus", "Confluence", "Swagger", "VS Code", "GitHub"],soft:["Clarity", "Research", "User Empathy"]},
      certifications:[],
      projects:[{name:"Developer Docs Portal",stack:"Docusaurus, GitHub",description:"40% reduction in support tickets",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t61", layout:"classic", name:"Financial Analyst", category:"Finance", color:"#065f46", icon:"💹",
    badge:"", tags:["Excel", "DCF", "Financial Modelling"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Financial Analyst with 3 years in investment banking and corporate finance. Built DCF models for $500M+ M&A transactions. Expert at financial modelling and valuation.",
      experience:[{title:"Financial Analyst",company:"Investment Bank",location:"Bangalore, India",start:"Jul 2021",end:"",bullets:["Built DCF and LBO models for 5 M&A transactions totalling $500M","Created 5-year financial forecast with 94% accuracy used by Board","Automated financial reporting saving 15 hrs/month","Supported IPO preparation for ₹500Cr company"]}],
      education:[{degree:"B.Com (Hons)",field:"Finance",school:"St. Xavier's Mumbai",year:"2022",gpa:"8.5"}],
      skills:{technical:["Financial Modelling", "Valuation", "DCF", "Excel", "Capital Markets"],tools:["Excel", "Bloomberg", "FactSet", "Power BI", "PowerPoint"],soft:["Analytical Rigour", "Attention to Detail"]},
      certifications:[{name:"CFA Level 1",issuer:"CFA Institute",year:"2022"}],
      projects:[{name:"LBO Model",stack:"Excel, VBA",description:"LBO model for $200M buyout",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t62", layout:"creative", name:"UI/UX Designer", category:"Design", color:"#9333ea", icon:"🖌️",
    badge:"", tags:["Figma", "UX Research", "Prototyping"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"UI/UX Designer with 3 years creating delightful digital products. Redesigned mobile app increasing retention by 45%. Contributed to design systems used by 8 product teams.",
      experience:[{title:"UI/UX Designer",company:"Mobile App Company",location:"Bangalore, India",start:"Jan 2021",end:"",bullets:["Redesigned mobile app increasing D30 retention by 45%","Built design system with 100+ tokens and 60+ components","Conducted 40+ usability tests across iOS and Android","Improved accessibility to WCAG 2.1 AA across all new features"]}],
      education:[{degree:"B.Des",field:"Design",school:"Srishti School Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["UI Design", "UX Research", "Prototyping", "Design Systems", "Accessibility"],tools:["Figma", "ProtoPie", "Maze", "UserTesting", "Lottie"],soft:["Empathy", "Systems Thinking", "Craft"]},
      certifications:[{name:"Google UX Design Certificate",issuer:"Google",year:"2022"}],
      projects:[{name:"Mobile App Redesign",stack:"Figma, ProtoPie",description:"45% retention improvement",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t63", layout:"executive", name:"Cloud Architect", category:"Cloud", color:"#d97706", icon:"☁️",
    badge:"Senior", tags:["AWS", "GCP", "Microservices"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Cloud Architect with 6+ years designing cloud-native architectures. Migrated 200+ services saving $2M/year. AWS Solutions Architect Professional certified.",
      experience:[{title:"Cloud Architect",company:"Enterprise Solutions",location:"Bangalore, India",start:"Apr 2018",end:"",bullets:["Architected cloud migration for 200+ services saving $2M/year","Designed multi-region DR achieving 99.99% uptime SLA","Reduced cloud spend 35% through Reserved Instances and rightsizing","Led 10-engineer team on cloud-native refactoring of legacy monolith"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"IIT Delhi",year:"2022",gpa:"8.5"}],
      skills:{technical:["Cloud Architecture", "Security", "Networking", "Cost Optimisation", "IaC"],tools:["AWS", "GCP", "Terraform", "Kubernetes", "Docker", "CloudFormation"],soft:["Technical Leadership", "Strategic Thinking"]},
      certifications:[{name:"AWS Solutions Architect Professional",issuer:"Amazon",year:"2022"}],
      projects:[{name:"Multi-cloud Architecture",stack:"AWS, GCP, Terraform",description:"$2M/year savings",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t64", layout:"modern", name:"Android Developer", category:"Engineering", color:"#059669", icon:"📱",
    badge:"", tags:["Kotlin", "Android", "Jetpack"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Android Developer with 3 years shipping apps with 1M+ downloads. Expert in Kotlin, Jetpack Compose, and Android architecture patterns. Reduced app ANR rate by 80%.",
      experience:[{title:"Android Developer",company:"Mobile Startup",location:"Bangalore, India",start:"Aug 2021",end:"",bullets:["Shipped 2 apps with combined 1M+ downloads and 4.5 avg rating","Reduced ANR rate by 80% through background processing optimisation","Migrated codebase from Java to Kotlin improving dev productivity by 30%","Implemented offline-first architecture improving retention in low-connectivity regions"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"Amrita University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Kotlin", "Java", "Android Architecture", "Performance", "Testing"],tools:["Jetpack Compose", "Room", "Retrofit", "Hilt", "Firebase", "Git"],soft:["User Focus", "Quality", "Continuous Learning"]},
      certifications:[{name:"Associate Android Developer",issuer:"Google",year:"2022"}],
      projects:[{name:"Offline-first News App",stack:"Kotlin, Room, Retrofit",description:"1M+ downloads, 4.5 stars",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t65", layout:"modern", name:"iOS Developer", category:"Engineering", color:"#1e40af", icon:"🍎",
    badge:"", tags:["Swift", "SwiftUI", "Xcode"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"iOS Developer with 3 years building Swift applications for millions of iPhone users. Expert in SwiftUI and UIKit. App nominated for Apple Design Award.",
      experience:[{title:"iOS Developer",company:"Consumer App",location:"Bangalore, India",start:"Oct 2021",end:"",bullets:["Built features used by 2M+ iPhone users with 4.8 App Store rating","Reduced app launch time by 55% through startup sequence optimisation","Nominated for Apple Design Award for innovative gesture interactions","Mentored 2 junior iOS developers on Swift best practices"]}],
      education:[{degree:"B.Sc",field:"Computer Science",school:"St. Joseph's Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Swift", "Objective-C", "iOS Architecture", "Performance", "Testing"],tools:["SwiftUI", "UIKit", "Combine", "CoreData", "Instruments", "Xcode"],soft:["Craft", "Attention to Detail", "Quality"]},
      certifications:[],
      projects:[{name:"Meditation App",stack:"Swift, SwiftUI, CoreML",description:"Apple Design Award nominee",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t66", layout:"modern", name:"Technical Support Engineer", category:"Engineering", color:"#0891b2", icon:"🛠️",
    badge:"", tags:["Troubleshooting", "APIs", "Customer Success"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Technical Support Engineer with 3 years resolving complex technical issues at scale. Maintained 98% CSAT. Built knowledge base reducing ticket volume by 30%.",
      experience:[{title:"Technical Support Engineer",company:"SaaS Platform",location:"Bangalore, India",start:"Feb 2021",end:"",bullets:["Maintained 98% CSAT resolving 50+ tickets/day across 3 product lines","Built knowledge base with 200+ articles reducing ticket volume by 30%","Created diagnostic scripts reducing average resolution time by 40%","Escalated and resolved 20+ critical P1 incidents with minimal customer impact"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"RVCE Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Technical Troubleshooting", "API Debugging", "SQL", "Linux", "Customer Communication"],tools:["Zendesk", "Postman", "SQL", "Python", "JIRA", "Kibana"],soft:["Patience", "Problem Solving", "Communication"]},
      certifications:[],
      projects:[{name:"Diagnostic Automation Tool",stack:"Python, Bash",description:"40% reduction in resolution time",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t67", layout:"executive", name:"Solution Architect", category:"Engineering", color:"#1e40af", icon:"🏗️",
    badge:"", tags:["Pre-Sales", "Solutions", "Enterprise"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Solution Architect with 5 years designing enterprise software solutions. Closed $10M+ in ARR as technical pre-sales partner. Expert at translating business requirements into technical architectures.",
      experience:[{title:"Solution Architect",company:"Enterprise Software Co",location:"Bangalore, India",start:"Jan 2019",end:"",bullets:["Co-created technical solutions for $10M+ in ARR alongside sales team","Designed integrations for 10+ Fortune 500 enterprise clients","Reduced PoC-to-close cycle from 90 to 45 days through standardised demo environments","Built solution library of 50+ pre-configured architectures"]}],
      education:[{degree:"M.Tech",field:"Computer Science",school:"IIT Bombay",year:"2022",gpa:"8.5"}],
      skills:{technical:["Solution Architecture", "Pre-Sales", "Integration", "Cloud", "API Design"],tools:["AWS", "Salesforce", "MuleSoft", "PostgreSQL", "Docker"],soft:["Communication", "Technical Credibility", "Consulting"]},
      certifications:[{name:"AWS Solutions Architect",issuer:"Amazon",year:"2022"}],
      projects:[{name:"Enterprise Integration Framework",stack:"AWS, MuleSoft",description:"Reduced PoC-to-close by 50%",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t68", layout:"modern", name:"Database Administrator", category:"Engineering", color:"#7c3aed", icon:"🗄️",
    badge:"", tags:["PostgreSQL", "MySQL", "Performance"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"DBA with 5 years managing mission-critical databases. Achieved 99.99% database uptime. Reduced query time by 90% through indexing strategies and query optimisation.",
      experience:[{title:"Database Administrator",company:"Financial Services Co",location:"Bangalore, India",start:"Mar 2019",end:"",bullets:["Achieved 99.99% uptime for databases processing ₹500Cr daily transactions","Reduced average query time by 90% through indexing and query optimisation","Migrated 10TB database to cloud with zero data loss and <2hr downtime","Implemented automated backup strategy with 15-minute RPO"]}],
      education:[{degree:"B.Tech",field:"Information Technology",school:"Osmania University",year:"2022",gpa:"8.5"}],
      skills:{technical:["PostgreSQL", "MySQL", "Oracle", "Performance Tuning", "Backup & Recovery"],tools:["PostgreSQL", "MySQL", "Oracle", "AWS RDS", "Redis", "Datadog"],soft:["Precision", "Reliability", "Problem Solving"]},
      certifications:[{name:"Oracle Database Administrator Certified",issuer:"Oracle",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t69", layout:"modern", name:"Salesforce Developer", category:"Engineering", color:"#0891b2", icon:"☁️",
    badge:"", tags:["Salesforce", "Apex", "LWC"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Salesforce Developer with 3 years building CRM customisations and integrations. Automated sales workflows saving 500 hrs/month. Expert in Apex, LWC, and Salesforce integrations.",
      experience:[{title:"Salesforce Developer",company:"IT Consulting",location:"Bangalore, India",start:"Sep 2021",end:"",bullets:["Built Salesforce customisations automating sales workflows saving 500 hrs/month","Developed 15 Lightning Web Components improving sales team efficiency by 35%","Integrated Salesforce with ERP reducing data entry errors by 90%","Migrated legacy Visualforce pages to modern LWC architecture"]}],
      education:[{degree:"B.Tech",field:"IT",school:"Saveetha University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Apex", "LWC", "Salesforce Administration", "SOQL", "Integration"],tools:["Salesforce", "MuleSoft", "REST APIs", "Git", "VS Code"],soft:["Problem Solving", "Documentation", "Customer Focus"]},
      certifications:[{name:"Salesforce Platform Developer I",issuer:"Salesforce",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t70", layout:"modern", name:"Network Engineer", category:"Engineering", color:"#0284c7", icon:"🌐",
    badge:"", tags:["Networking", "Cisco", "Security"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Network Engineer with 4 years designing and managing enterprise networks. Deployed SD-WAN reducing WAN costs by 40%. CCNP certified with strong security background.",
      experience:[{title:"Network Engineer",company:"Telecom Company",location:"Bangalore, India",start:"Jul 2020",end:"",bullets:["Deployed SD-WAN across 50 branch offices reducing WAN costs by 40%","Designed and implemented zero-trust network access for 5000-user enterprise","Reduced network incidents by 60% through proactive monitoring and automation","Migrated 100% of VoIP infrastructure to cloud-based UCaaS"]}],
      education:[{degree:"B.Tech",field:"Electronics & Communication",school:"NITTE Mangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Routing & Switching", "Network Security", "SD-WAN", "VoIP", "Automation"],tools:["Cisco IOS", "Fortinet", "Palo Alto", "Wireshark", "Python", "Ansible"],soft:["Methodical", "Documentation", "On-Call"]},
      certifications:[{name:"CCNP Enterprise",issuer:"Cisco",year:"2022"}],
      projects:[{name:"SD-WAN Deployment",stack:"Cisco SD-WAN",description:"40% WAN cost reduction",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t71", layout:"modern", name:"BI Developer", category:"Data", color:"#4f46e5", icon:"📊",
    badge:"", tags:["Power BI", "DAX", "SQL"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"BI Developer with 3 years building enterprise analytics platforms. Delivered self-service BI to 300+ users. Power BI certified developer.",
      experience:[{title:"BI Developer",company:"Retail Group",location:"Bangalore, India",start:"Jan 2021",end:"",bullets:["Built Power BI solution serving 300+ daily users","Designed star-schema data model improving query speed 10x","Created 50+ DAX measures for complex business calculations","Automated refresh pipelines — 100% on-time data delivery"]}],
      education:[{degree:"B.Com",field:"Accounting",school:"Bangalore University",year:"2022",gpa:"8.5"}],
      skills:{technical:["SQL", "DAX", "Data Modelling", "Excel"],tools:["Power BI", "SSAS", "Azure", "SQL Server"],soft:["Attention to Detail", "Business Acumen"]},
      certifications:[{name:"Microsoft Power BI Data Analyst",issuer:"Microsoft",year:"2022"}],
      projects:[{name:"Retail Analytics Platform",stack:"Power BI, SQL Server",description:"Self-service BI for 300+ users",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t72", layout:"modern", name:"ServiceNow Developer", category:"Engineering", color:"#059669", icon:"🔧",
    badge:"", tags:["ServiceNow", "ITSM", "JavaScript"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"ServiceNow Developer with 3 years implementing ITSM and custom workflows. Automated 60% of IT service requests reducing resolution time by 50%. ServiceNow Certified.",
      experience:[{title:"ServiceNow Developer",company:"IT Services Company",location:"Bangalore, India",start:"Oct 2021",end:"",bullets:["Automated 60% of IT service requests saving 200 hrs/month","Reduced incident resolution time by 50% through workflow automation","Built custom portal improving employee satisfaction by 35%","Integrated ServiceNow with 5 enterprise systems via REST APIs"]}],
      education:[{degree:"B.Tech",field:"IT",school:"Jain University",year:"2022",gpa:"8.5"}],
      skills:{technical:["ServiceNow", "JavaScript", "REST APIs", "ITSM", "Workflow Design"],tools:["ServiceNow", "GlideScript", "Postman", "JIRA"],soft:["Problem Solving", "Documentation"]},
      certifications:[{name:"Certified Application Developer",issuer:"ServiceNow",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t73", layout:"classic", name:"SAP Consultant", category:"Business", color:"#d97706", icon:"🏢",
    badge:"", tags:["SAP", "ABAP", "S/4HANA"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"SAP Consultant with 5 years implementing SAP ERP for Fortune 500 clients. Led 3 full-cycle S/4HANA implementations totalling $10M in project value.",
      experience:[{title:"SAP Consultant",company:"Big 4 Firm",location:"Bangalore, India",start:"Jan 2019",end:"",bullets:["Led 3 full-cycle S/4HANA implementations — all on time and budget","Configured SAP SD and MM modules for 5,000-user global organisation","Reduced month-end close from 8 days to 2 days via SAP automation","Trained 200+ end users across 3 countries"]}],
      education:[{degree:"MBA",field:"Finance",school:"Symbiosis Pune",year:"2022",gpa:"8.5"}],
      skills:{technical:["SAP S/4HANA", "ABAP Basics", "Business Process", "Change Management"],tools:["SAP", "SAP Fiori", "Excel", "PowerPoint"],soft:["Consulting", "Communication", "Process Thinking"]},
      certifications:[{name:"SAP Certified Application Associate",issuer:"SAP",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t74", layout:"classic", name:"IT Business Analyst", category:"Business", color:"#0369a1", icon:"💼",
    badge:"", tags:["Requirements", "Agile", "BPMN"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"IT Business Analyst with 4 years bridging business and IT on digital transformation projects. Delivered 6 major system implementations. Expert in process modelling and requirements elicitation.",
      experience:[{title:"IT Business Analyst",company:"Digital Consulting",location:"Bangalore, India",start:"Mar 2020",end:"",bullets:["Delivered requirements for 6 major system implementations (avg ₹5Cr each)","Created 200+ user stories adopted directly into development sprints","Reduced scope creep by 35% through rigorous change control process","Facilitated design thinking workshops with 50+ stakeholders"]}],
      education:[{degree:"MCA",field:"Computer Applications",school:"Manipal University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Requirements Elicitation", "BPMN", "Agile", "Use Case Modelling", "SQL"],tools:["JIRA", "Confluence", "MS Visio", "Balsamiq", "SQL"],soft:["Analytical", "Communication", "Facilitation"]},
      certifications:[{name:"PMI-PBA",issuer:"PMI",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t75", layout:"creative", name:"Product Marketing Manager", category:"Marketing", color:"#e11d48", icon:"📢",
    badge:"", tags:["Go-to-Market", "Positioning", "Launch"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"PMM with 4 years bringing B2B SaaS products to market. Led 8 product launches — 3 became category leaders. Expert in positioning, messaging, and competitive intelligence.",
      experience:[{title:"Product Marketing Manager",company:"B2B SaaS",location:"Bangalore, India",start:"May 2020",end:"",bullets:["Led 8 product launches; 3 products became category leaders in 12 months","Created messaging framework adopted by 50-person sales team","Competitive win rate increased from 38% to 62% through battlecard programme","Grew product page conversion from 2.1% to 4.8%"]}],
      education:[{degree:"MBA",field:"Marketing",school:"ISB Hyderabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["Product Positioning", "Messaging", "Competitive Intelligence", "Go-to-Market", "Content"],tools:["Salesforce", "HubSpot", "Klue", "Figma", "Excel"],soft:["Strategic", "Creative", "Cross-functional"]},
      certifications:[],
      projects:[{name:"Competitive Battlecard Programme",stack:"Notion, Klue",description:"Win rate increase from 38% to 62%",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t76", layout:"modern", name:"Embedded Software Engineer", category:"Engineering", color:"#dc2626", icon:"⚡",
    badge:"", tags:["C", "Linux", "RTOS"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Embedded Software Engineer with 4 years developing firmware for industrial and automotive applications. Expert in real-time systems and low-level hardware interfacing.",
      experience:[{title:"Embedded Software Engineer",company:"Automotive Tier 1",location:"Bangalore, India",start:"Jul 2020",end:"",bullets:["Developed AUTOSAR-compliant firmware for ADAS sensor module","Reduced boot time by 35% through startup sequence optimisation","Fixed 50+ critical safety-related bugs pre-production","Ported Linux BSP for custom ARM-based industrial controller"]}],
      education:[{degree:"B.Tech",field:"Electronics",school:"NIT Calicut",year:"2022",gpa:"8.5"}],
      skills:{technical:["C", "C++", "RTOS", "Linux Kernel", "CAN/LIN"],tools:["FreeRTOS", "AUTOSAR", "GDB", "JTAG", "Python"],soft:["Precision", "Safety Mindset", "Documentation"]},
      certifications:[{name:"AUTOSAR Classic certified",issuer:"Vector",year:"2022"}],
      projects:[{name:"BSP for Industrial Controller",stack:"C, Linux",description:"Reduced boot time 35%",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t77", layout:"modern", name:"Test Automation Engineer", category:"Engineering", color:"#0891b2", icon:"🤖",
    badge:"", tags:["Selenium", "pytest", "API Testing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Test Automation Engineer with 3 years building robust test frameworks. Automated 1000+ test cases. CI integration reduces regression feedback from 3 days to 30 minutes.",
      experience:[{title:"Test Automation Engineer",company:"Product Co",location:"Bangalore, India",start:"Jun 2021",end:"",bullets:["Built automation framework with 1000+ test cases covering 85% of regression","Reduced regression feedback time from 3 days to 30 minutes via CI integration","Built API contract testing framework catching 95% of integration issues pre-release","Trained 8 manual QAs to write automated tests"]}],
      education:[{degree:"B.E.",field:"Computer Engineering",school:"Pune University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Test Automation", "API Testing", "CI/CD", "Python", "Java"],tools:["Selenium", "pytest", "RestAssured", "Jenkins", "Docker", "Allure"],soft:["Quality Mindset", "Systematic", "Mentoring"]},
      certifications:[{name:"ISTQB Certified Tester",issuer:"ISTQB",year:"2022"}],
      projects:[{name:"Test Automation Framework",stack:"Python, Selenium, Jenkins",description:"85% automation coverage",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t78", layout:"minimal", name:"HR Analytics Specialist", category:"HR", color:"#7c3aed", icon:"📊",
    badge:"", tags:["People Analytics", "SQL", "Tableau"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"HR Analytics Specialist with 3 years transforming people data into actionable insights. Built attrition model with 84% accuracy saving ₹2Cr in replacement costs.",
      experience:[{title:"HR Analytics Specialist",company:"Tech Company",location:"Bangalore, India",start:"Aug 2021",end:"",bullets:["Built attrition prediction model with 84% accuracy saving ₹2Cr/year","Created people analytics dashboard used weekly by CHRO and VPs","Analysed compensation equity across 1,500 employees identifying 12% gender pay gap","Automated monthly HR reporting saving 20 hrs/month"]}],
      education:[{degree:"MBA",field:"HR & Analytics",school:"TISS Mumbai",year:"2022",gpa:"8.5"}],
      skills:{technical:["People Analytics", "Attrition Modelling", "Compensation Analysis", "SQL", "R"],tools:["Tableau", "Power BI", "SQL", "R", "Excel", "Workday"],soft:["Data Storytelling", "Confidentiality", "Stakeholder Management"]},
      certifications:[],
      projects:[{name:"Attrition Prediction Model",stack:"Python, Tableau",description:"₹2Cr/year in retention savings",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t79", layout:"classic", name:"Logistics Manager", category:"Business", color:"#065f46", icon:"🚛",
    badge:"", tags:["Logistics", "3PL", "Warehousing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Logistics Manager with 5 years optimising last-mile delivery and warehouse operations. Reduced delivery cost by 25% and improved on-time delivery from 82% to 96%.",
      experience:[{title:"Logistics Manager",company:"E-commerce Company",location:"Bangalore, India",start:"Jan 2019",end:"",bullets:["Reduced delivery cost by 25% through route optimisation and 3PL renegotiation","Improved on-time delivery from 82% to 96% in 12 months","Managed ₹20Cr annual logistics budget across 5 warehouse locations","Implemented WMS reducing order processing time by 40%"]}],
      education:[{degree:"MBA",field:"Operations",school:"IMT Ghaziabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["Logistics", "Supply Chain", "Warehouse Management", "3PL", "Route Optimisation"],tools:["SAP", "Excel", "Power BI", "WMS (Manhattan)"],soft:["Execution", "Negotiation", "Data-Driven"]},
      certifications:[],
      projects:[{name:"Route Optimisation System",stack:"Python, Google Maps API",description:"25% delivery cost reduction",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t80", layout:"creative", name:"Brand Manager", category:"Marketing", color:"#e11d48", icon:"🎯",
    badge:"", tags:["Brand Strategy", "P&L", "Consumer Insights"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Brand Manager with 5 years managing FMCG brands with combined ₹200Cr revenue. Grew market share by 3pp and launched 2 successful product extensions.",
      experience:[{title:"Brand Manager",company:"FMCG Company",location:"Bangalore, India",start:"Jun 2019",end:"",bullets:["Grew brand market share from 12% to 15% in 2 years (₹30Cr incremental revenue)","Launched 2 product extensions both achieving ₹20Cr+ in year 1","Managed ₹50Cr annual A&P budget with 15% efficiency improvement","Led agency team of 12 across creative, media, digital, and PR"]}],
      education:[{degree:"MBA",field:"Marketing",school:"IIM Kozhikode",year:"2022",gpa:"8.5"}],
      skills:{technical:["Brand Strategy", "P&L Management", "Consumer Insights", "Campaign Management"],tools:["Nielsen", "Kantar", "Excel", "Power BI", "Tableau"],soft:["Strategic", "Creative", "Commercial Acumen"]},
      certifications:[],
      projects:[{name:"Product Extension Launch",stack:"Figma, Excel",description:"₹20Cr Year 1 revenue",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t81", layout:"classic", name:"Account Manager", category:"Business", color:"#0369a1", icon:"🤝",
    badge:"", tags:["Account Management", "Upsell", "CRM"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Account Manager with 4 years managing enterprise accounts. 130% net revenue retention. Grew portfolio from ₹5Cr to ₹20Cr ARR through systematic expansion and upselling.",
      experience:[{title:"Account Manager",company:"B2B SaaS",location:"Bangalore, India",start:"Apr 2020",end:"",bullets:["Maintained 130% net revenue retention across 40-account portfolio","Grew portfolio from ₹5Cr to ₹20Cr ARR through upselling and expansions","Saved 5 at-risk accounts generating ₹3Cr in saved ARR","Highest customer health score in team for 6 consecutive quarters"]}],
      education:[{degree:"MBA",field:"Marketing",school:"XIMB Bhubaneswar",year:"2022",gpa:"8.5"}],
      skills:{technical:["Account Management", "Revenue Growth", "Customer Success", "Negotiation"],tools:["Salesforce", "Gainsight", "LinkedIn", "Zoom", "Excel"],soft:["Relationship Building", "Commercial Acumen", "Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t82", layout:"classic", name:"Customer Success Manager", category:"Business", color:"#059669", icon:"⭐",
    badge:"", tags:["Customer Success", "Churn", "Onboarding"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Customer Success Manager with 4 years driving product adoption and retention. Maintained 95% gross retention. Reduced time-to-value from 90 days to 30 days.",
      experience:[{title:"Customer Success Manager",company:"SaaS Platform",location:"Bangalore, India",start:"Jun 2020",end:"",bullets:["Maintained 95% gross retention across 60-account book","Reduced time-to-value from 90 days to 30 days via improved onboarding","Grew 15 accounts from SMB to mid-market generating ₹2Cr additional ARR","Built health scoring model predicting churn 60 days in advance at 82% accuracy"]}],
      education:[{degree:"BBA",field:"Management",school:"Christ University Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Customer Success", "Onboarding", "Churn Management", "Product Adoption", "Training"],tools:["Gainsight", "Salesforce", "Intercom", "Mixpanel", "Excel"],soft:["Empathy", "Proactiveness", "Communication"]},
      certifications:[],
      projects:[{name:"Churn Prediction Model",stack:"Python, Gainsight",description:"82% accuracy, 60-day lead time",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t83", layout:"classic", name:"Legal Analyst", category:"Business", color:"#1e40af", icon:"⚖️",
    badge:"", tags:["Contracts", "Legal Research", "Compliance"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Legal Analyst with 3 years in corporate and technology law. Reviewed 500+ contracts. Built contract management system reducing review time by 40%.",
      experience:[{title:"Legal Analyst",company:"Tech Company",location:"Bangalore, India",start:"Sep 2021",end:"",bullets:["Reviewed 500+ commercial contracts protecting ₹100Cr+ in deal value","Built contract management system reducing review time by 40%","Led GDPR compliance programme covering 50+ data processing activities","Provided legal support for ₹50Cr Series B fundraise"]}],
      education:[{degree:"LLB",field:"Law",school:"NLSIU Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Contract Law", "Corporate Law", "IP Law", "Regulatory Compliance", "Legal Research"],tools:["ContractPodAi", "DocuSign", "Excel", "SharePoint"],soft:["Analytical", "Attention to Detail", "Communication"]},
      certifications:[],
      projects:[{name:"Contract Management System",stack:"DocuSign, SharePoint",description:"40% reduction in review time",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t84", layout:"executive", name:"IT Project Manager", category:"Management", color:"#0891b2", icon:"📋",
    badge:"", tags:["PMP", "Agile", "IT Delivery"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"IT Project Manager with 6 years delivering complex software and infrastructure projects. ₹30Cr+ portfolio with 95% on-time delivery rate. PMP and PMI-ACP certified.",
      experience:[{title:"IT Project Manager",company:"IT Consulting",location:"Bangalore, India",start:"Feb 2018",end:"",bullets:["Delivered ₹30Cr IT portfolio with 95% on-time, 97% within-budget rate","Managed 8 simultaneous projects across 3 technology domains","Reduced project risk events by 45% through proactive risk management","Built PMO function from scratch serving 50+ project managers"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"Pune University",year:"2022",gpa:"8.5"}],
      skills:{technical:["Project Management", "Risk Management", "IT Governance", "Agile", "Stakeholder Management"],tools:["MS Project", "JIRA", "Confluence", "Power BI"],soft:["Leadership", "Communication", "Delivery Focus"]},
      certifications:[{name:"PMP + PMI-ACP",issuer:"PMI",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t85", layout:"classic", name:"Procurement Manager", category:"Business", color:"#065f46", icon:"🏪",
    badge:"", tags:["Procurement", "Negotiation", "Vendor Management"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Procurement Manager with 5 years managing strategic sourcing and vendor relationships. Saved ₹15Cr over 3 years through strategic negotiations and category management.",
      experience:[{title:"Procurement Manager",company:"Manufacturing Co",location:"Bangalore, India",start:"Mar 2019",end:"",bullets:["Saved ₹15Cr over 3 years through strategic negotiations and category management","Reduced supplier base from 500 to 200 improving quality and terms","Implemented e-procurement system reducing PO cycle time by 60%","Managed ₹100Cr annual spend across 8 strategic categories"]}],
      education:[{degree:"MBA",field:"SCM",school:"IIM Lucknow",year:"2022",gpa:"8.5"}],
      skills:{technical:["Strategic Sourcing", "Negotiation", "Category Management", "Vendor Management", "Contract Law"],tools:["SAP", "Coupa", "Excel", "Power BI"],soft:["Negotiation", "Strategic Thinking", "Relationship Building"]},
      certifications:[],
      projects:[{name:"e-Procurement Implementation",stack:"Coupa, SAP",description:"60% PO cycle time reduction",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t86", layout:"minimal", name:"Training Manager", category:"HR", color:"#9333ea", icon:"🎓",
    badge:"", tags:["L&D", "Training Design", "LMS"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Training Manager with 5 years designing and delivering learning programmes. Built L&D function from scratch. 92% programme completion rate and 40% improvement in post-training performance.",
      experience:[{title:"Training Manager",company:"BPO Company",location:"Bangalore, India",start:"Jan 2019",end:"",bullets:["Built L&D function from scratch; delivered 50+ programmes in first year","Achieved 92% programme completion rate — highest in company history","Reduced new hire ramp time from 90 days to 45 days","Built LMS serving 2,000 employees with 200+ online courses"]}],
      education:[{degree:"MBA",field:"HR",school:"XLRI Jamshedpur",year:"2022",gpa:"8.5"}],
      skills:{technical:["Instructional Design", "Training Delivery", "LMS Administration", "Needs Analysis", "Facilitation"],tools:["Cornerstone", "Articulate", "Zoom", "Excel"],soft:["Teaching", "Empathy", "Continuous Improvement"]},
      certifications:[],
      projects:[{name:"Digital Learning Platform",stack:"Cornerstone LMS",description:"2,000 users, 200+ online courses",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t87", layout:"classic", name:"Relationship Manager", category:"Business", color:"#0369a1", icon:"🤝",
    badge:"", tags:["Banking", "Portfolio", "Client Advisory"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Relationship Manager with 5 years in private banking managing HNI and UHNI portfolios. ₹200Cr+ AUM. Grew portfolio from ₹80Cr to ₹200Cr through new acquisition and wallet share expansion.",
      experience:[{title:"Relationship Manager",company:"Private Bank",location:"Bangalore, India",start:"Jun 2019",end:"",bullets:["Managed ₹200Cr portfolio for 50 HNI and UHNI clients","Grew AUM from ₹80Cr to ₹200Cr in 3 years","Achieved highest cross-sell ratio in team for 4 consecutive years","Zero client attrition over 5 years through proactive service"]}],
      education:[{degree:"MBA",field:"Finance",school:"SP Jain Mumbai",year:"2022",gpa:"8.5"}],
      skills:{technical:["Wealth Management", "Financial Planning", "Relationship Management", "Portfolio Advisory"],tools:["Bloomberg", "Excel", "Salesforce", "MS Office"],soft:["Client Trust", "Financial Acumen", "Communication"]},
      certifications:[{name:"CFP (Certified Financial Planner)",issuer:"FPSB",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t88", layout:"minimal", name:"Mechanical Engineer", category:"Engineering", color:"#d97706", icon:"⚙️",
    badge:"", tags:["CAD", "FEA", "Manufacturing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Mechanical Engineer with 4 years in product design and manufacturing. Designed components saving ₹3Cr/year in material costs. Expert in SolidWorks and FEA.",
      experience:[{title:"Mechanical Engineer",company:"Auto Components Co",location:"Bangalore, India",start:"Aug 2020",end:"",bullets:["Designed 20+ components optimising material usage — ₹3Cr/year savings","Conducted FEA analysis preventing 5 potential field failures","Led DFM review reducing manufacturing cost by 15% on new product line","Managed prototype build cycle from CAD to physical testing in 6 weeks"]}],
      education:[{degree:"B.Tech",field:"Mechanical Engineering",school:"IIT Roorkee",year:"2022",gpa:"8.5"}],
      skills:{technical:["CAD", "FEA", "DFM", "GD&T", "Manufacturing Processes"],tools:["SolidWorks", "ANSYS", "AutoCAD", "CATIA", "Excel"],soft:["Engineering Rigour", "Innovation", "Attention to Detail"]},
      certifications:[],
      projects:[{name:"Lightweight Bracket Design",stack:"SolidWorks, ANSYS",description:"30% weight reduction, ₹1Cr savings",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t89", layout:"modern", name:"Civil Engineer", category:"Engineering", color:"#065f46", icon:"🏗️",
    badge:"", tags:["AutoCAD", "Structural Design", "Project Management"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Civil Engineer with 4 years on commercial and infrastructure projects. Delivered ₹50Cr+ in construction projects. Expert in structural design and site management.",
      experience:[{title:"Civil Engineer",company:"Construction Company",location:"Bangalore, India",start:"Jan 2020",end:"",bullets:["Delivered ₹50Cr commercial complex — on time, 5% under budget","Designed structural system for 15-floor building passing seismic analysis","Reduced material wastage by 12% through better quantity surveying","Supervised team of 30 workers and 5 sub-contractors"]}],
      education:[{degree:"B.Tech",field:"Civil Engineering",school:"BMS College Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Structural Design", "AutoCAD", "Project Management", "Site Supervision", "BOQ Preparation"],tools:["AutoCAD", "STAAD Pro", "MS Project", "Excel"],soft:["Execution", "Problem Solving", "Site Management"]},
      certifications:[],
      projects:[{name:"Commercial Complex Structural Design",stack:"AutoCAD, STAAD Pro",description:"₹50Cr project on-time delivery",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t90", layout:"executive", name:"Digital Transformation Consultant", category:"Business", color:"#1e40af", icon:"🔄",
    badge:"Senior", tags:["Change Management", "Digital Strategy", "ERP"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Digital Transformation Consultant with 7 years leading enterprise change. Led 5 major digital transformation programmes. Expert in change management and technology strategy.",
      experience:[{title:"Digital Transformation Consultant",company:"Big 4",location:"Bangalore, India",start:"Mar 2017",end:"",bullets:["Led 5 digital transformation programmes totalling ₹200Cr in project value","Achieved 95% user adoption on ERP implementation (vs 60% industry average)","Built change management framework now used firm-wide","Delivered AI strategy for ₹5000Cr enterprise — 3 use cases in production in year 1"]}],
      education:[{degree:"MBA",field:"Strategy",school:"IIM Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Digital Strategy", "Change Management", "ERP", "AI Strategy", "Operating Model Design"],tools:["Salesforce", "SAP", "PowerPoint", "Excel", "Visio"],soft:["Strategy", "Communication", "Execution"]},
      certifications:[{name:"Prosci ADKAR",issuer:"Prosci",year:"2022"}],
      projects:[{name:"AI Strategy Roadmap",stack:"Excel, PowerPoint",description:"3 AI use cases in production Year 1",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t91", layout:"classic", name:"Actuarial Analyst", category:"Finance", color:"#0369a1", icon:"📐",
    badge:"", tags:["Actuarial Science", "R", "Risk Modelling"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Actuarial Analyst with 3 years in life insurance and pension valuation. Passed 5 actuarial exams. Built mortality model used for ₹500Cr policy pricing.",
      experience:[{title:"Actuarial Analyst",company:"Insurance Company",location:"Bangalore, India",start:"Jul 2021",end:"",bullets:["Built mortality model used for ₹500Cr policy pricing","Reduced valuation run time from 8hrs to 45mins via parallel computing","Contributed to IFRS 17 implementation across 3 product lines","Analysed experience study covering 1M+ policyholders"]}],
      education:[{degree:"B.Sc",field:"Mathematics & Statistics",school:"IISc Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Actuarial Science", "Stochastic Modelling", "Life Insurance", "Pension Valuation"],tools:["R", "Python", "Excel", "Prophet", "SAS"],soft:["Mathematical Rigour", "Attention to Detail", "Problem Solving"]},
      certifications:[],
      projects:[{name:"Mortality Improvement Model",stack:"R, Python",description:"Used for ₹500Cr pricing",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t92", layout:"classic", name:"Investment Banking Analyst", category:"Finance", color:"#065f46", icon:"🏦",
    badge:"", tags:["M&A", "DCF", "Pitch Decks"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"IB Analyst with 2 years at bulge bracket bank. Executed 4 M&A deals totalling $300M. Expert in financial modelling, due diligence, and client presentations.",
      experience:[{title:"Investment Banking Analyst",company:"Bulge Bracket Bank",location:"Bangalore, India",start:"Jul 2022",end:"",bullets:["Executed 4 M&A transactions totalling $300M in deal value","Built 3-statement and DCF models for companies across tech and consumer sectors","Prepared pitch books and CIMs for 10+ live mandates","Conducted due diligence for $150M acquisition over 6-week sprint"]}],
      education:[{degree:"B.Tech",field:"Computer Science",school:"IIT Bombay",year:"2022",gpa:"8.5"}],
      skills:{technical:["Financial Modelling", "Valuation", "Due Diligence", "Capital Markets", "M&A"],tools:["Bloomberg", "FactSet", "Excel", "PowerPoint", "CapIQ"],soft:["Work Ethic", "Analytical", "Attention to Detail"]},
      certifications:[],
      projects:[{name:"M&A Financial Model",stack:"Excel, Bloomberg",description:"$150M acquisition model",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t93", layout:"classic", name:"Risk Manager", category:"Finance", color:"#dc2626", icon:"⚠️",
    badge:"", tags:["Risk", "Basel III", "Credit Risk"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Risk Manager with 5 years in credit, market, and operational risk at leading banks. Built risk framework for ₹2000Cr loan book. Expert in Basel III and IFRS 9.",
      experience:[{title:"Risk Manager",company:"Private Bank",location:"Bangalore, India",start:"Jan 2019",end:"",bullets:["Built credit risk framework for ₹2000Cr loan book reducing NPAs by 30%","Implemented IFRS 9 ECL model across 5 product lines","Led ICAAP for bank with ₹5000Cr balance sheet","Designed operational risk dashboard monitoring 200+ risk indicators"]}],
      education:[{degree:"MBA",field:"Finance",school:"IIM Calcutta",year:"2022",gpa:"8.5"}],
      skills:{technical:["Credit Risk", "Market Risk", "Operational Risk", "Basel III", "IFRS 9"],tools:["SAS", "Python", "Excel", "Bloomberg", "Power BI"],soft:["Risk Mindset", "Analytical", "Regulatory Knowledge"]},
      certifications:[{name:"FRM",issuer:"GARP",year:"2022"}],
      projects:[{name:"IFRS 9 ECL Model",stack:"Python, SAS",description:"30% NPA reduction",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t94", layout:"classic", name:"Insurance Specialist", category:"Finance", color:"#0891b2", icon:"🛡️",
    badge:"", tags:["Insurance", "Underwriting", "Claims"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Insurance professional with 4 years in commercial underwriting and claims management. Managed ₹100Cr+ commercial insurance portfolio with best-in-company loss ratio.",
      experience:[{title:"Insurance Underwriter",company:"General Insurance Co",location:"Bangalore, India",start:"Sep 2020",end:"",bullets:["Managed ₹100Cr commercial insurance portfolio — best loss ratio in team","Underwrote 200+ commercial risks including manufacturing and IT sectors","Reduced claims leakage by 20% through improved documentation processes","Trained team of 5 junior underwriters on risk assessment"]}],
      education:[{degree:"MBA",field:"Finance",school:"BIMTECH Greater Noida",year:"2022",gpa:"8.5"}],
      skills:{technical:["Commercial Underwriting", "Risk Assessment", "Claims Management", "Reinsurance", "Policy Wording"],tools:["Guidewire", "Excel", "Power BI", "Insurance Core Systems"],soft:["Risk Assessment", "Attention to Detail", "Negotiation"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t95", layout:"classic", name:"Compliance Officer", category:"Finance", color:"#1e40af", icon:"✅",
    badge:"", tags:["Regulatory", "KYC", "AML"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Compliance Officer with 4 years at regulated financial institutions. Led KYC/AML programme for 500K+ customers. Ensured zero regulatory sanctions in 4 years.",
      experience:[{title:"Compliance Officer",company:"NBFC",location:"Bangalore, India",start:"Mar 2020",end:"",bullets:["Led KYC/AML programme for 500K+ customers with zero regulatory sanctions","Implemented FIU reporting system processing 10,000+ transactions daily","Reduced KYC processing time from 3 days to 4 hours via automation","Managed RBI inspection — all observations closed within 30 days"]}],
      education:[{degree:"LLB",field:"Law",school:"NLSIU Bangalore",year:"2022",gpa:"8.5"}],
      skills:{technical:["AML/CFT", "KYC", "Regulatory Compliance", "Risk Assessment", "Reporting"],tools:["NICE Actimize", "Excel", "PowerPoint", "SharePoint"],soft:["Regulatory Knowledge", "Integrity", "Attention to Detail"]},
      certifications:[{name:"CAMS (Certified Anti-Money Laundering Specialist)",issuer:"ACAMS",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t96", layout:"minimal", name:"Pharmacist", category:"Other", color:"#059669", icon:"💊",
    badge:"", tags:["Pharmacy", "Clinical", "Drug Information"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Clinical Pharmacist with 3 years in hospital settings. Reviewed 50K+ prescriptions. Reduced adverse drug events by 25% through medication reconciliation programme.",
      experience:[{title:"Clinical Pharmacist",company:"Apollo Hospital",location:"Bangalore, India",start:"Jan 2021",end:"",bullets:["Reviewed 50K+ prescriptions reducing dispensing errors by 40%","Implemented medication reconciliation programme reducing ADEs by 25%","Counselled 100+ patients weekly on medication adherence and side effects","Conducted 20+ in-service pharmacist training sessions"]}],
      education:[{degree:"Pharm.D",field:"Pharmacy",school:"JSS University Mysore",year:"2022",gpa:"8.5"}],
      skills:{technical:["Clinical Pharmacy", "Drug Information", "Pharmacovigilance", "Medication Management", "Patient Counselling"],tools:["Hospital Information System", "Drug Reference Apps", "Excel"],soft:["Patient Focus", "Attention to Detail", "Communication"]},
      certifications:[],
      projects:[{name:"Medication Reconciliation Programme",stack:"HIS, Excel",description:"25% reduction in adverse drug events",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t97", layout:"minimal", name:"Medical Affairs Manager", category:"Other", color:"#0891b2", icon:"🏥",
    badge:"", tags:["Medical Affairs", "KOL", "Publications"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Medical Affairs Manager with 5 years in pharmaceutical medical affairs. Published 8 peer-reviewed papers. Built KOL engagement programme covering 100+ specialists.",
      experience:[{title:"Medical Affairs Manager",company:"Big Pharma",location:"Bangalore, India",start:"Jul 2019",end:"",bullets:["Built KOL engagement programme with 100+ specialist physicians","Published 8 peer-reviewed papers in high-impact journals","Supported 3 successful product launches with medical education programmes","Trained 50-person field medical team on product scientific data"]}],
      education:[{degree:"MD",field:"Medicine",school:"AIIMS Delhi",year:"2022",gpa:"8.5"}],
      skills:{technical:["Medical Affairs", "KOL Management", "Medical Writing", "Clinical Development", "Scientific Communication"],tools:["Veeva CRM", "PubMed", "Excel", "PowerPoint"],soft:["Scientific Credibility", "Communication", "Networking"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t98", layout:"classic", name:"ERP Consultant", category:"Business", color:"#d97706", icon:"🔄",
    badge:"", tags:["SAP", "Oracle", "Implementation"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"ERP Consultant with 5 years implementing SAP and Oracle across manufacturing, retail, and BFSI. Led 4 full-cycle implementations with zero post-go-live P1 issues.",
      experience:[{title:"ERP Consultant",company:"Systems Integrator",location:"Bangalore, India",start:"Jan 2019",end:"",bullets:["Led 4 full-cycle ERP implementations — all on time, zero P1 post go-live","Configured SAP S/4HANA for 3,000-user manufacturing client","Designed integration with 8 legacy systems using SAP PI/PO","Trained and certified 50 super users and 300 end users"]}],
      education:[{degree:"MBA",field:"Operations",school:"Symbiosis Pune",year:"2022",gpa:"8.5"}],
      skills:{technical:["SAP S/4HANA", "Oracle EBS", "Business Process Design", "Change Management", "Training"],tools:["SAP", "Oracle", "JIRA", "MS Project", "Excel"],soft:["Consulting", "Process Thinking", "Communication"]},
      certifications:[{name:"SAP Certified Application Associate",issuer:"SAP",year:"2022"}],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t99", layout:"creative", name:"E-commerce Manager", category:"Marketing", color:"#e11d48", icon:"🛒",
    badge:"", tags:["E-commerce", "Marketplace", "P&L"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"E-commerce Manager with 4 years managing online retail channels. Grew online revenue from ₹5Cr to ₹40Cr. Expert in Amazon, Flipkart, and own-site optimisation.",
      experience:[{title:"E-commerce Manager",company:"Consumer Brand",location:"Bangalore, India",start:"Apr 2020",end:"",bullets:["Grew online revenue from ₹5Cr to ₹40Cr in 3 years","Achieved #1 BSR in category on Amazon for flagship product","Reduced return rate from 18% to 7% through improved product content","Built D2C website contributing 30% of online revenue"]}],
      education:[{degree:"MBA",field:"Marketing",school:"MICA Ahmedabad",year:"2022",gpa:"8.5"}],
      skills:{technical:["E-commerce Strategy", "Marketplace Management", "P&L", "SEO", "Advertising"],tools:["Amazon Seller Central", "Flipkart Seller Hub", "Shopify", "Google Analytics", "Excel"],soft:["Commercial Acumen", "Data-Driven", "Execution"]},
      certifications:[],
      projects:[{name:"D2C Website Launch",stack:"Shopify, GA4",description:"30% of online revenue in Year 1",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t100", layout:"minimal", name:"Corporate Trainer", category:"HR", color:"#7c3aed", icon:"🎤",
    badge:"", tags:["Training", "Facilitation", "Leadership Development"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Corporate Trainer with 5 years designing and delivering leadership and technical training. Trained 3,000+ professionals. 96% participant satisfaction across all programmes.",
      experience:[{title:"Corporate Trainer",company:"Training Firm",location:"Bangalore, India",start:"Mar 2019",end:"",bullets:["Trained 3,000+ professionals across 50+ corporate clients","Achieved 96% participant satisfaction rating","Designed leadership programme — 40% of participants promoted in 12 months","Built e-learning library with 100+ modules now generating passive revenue"]}],
      education:[{degree:"MBA",field:"HR",school:"XLRI Jamshedpur",year:"2022",gpa:"8.5"}],
      skills:{technical:["Instructional Design", "Facilitation", "Leadership Development", "Coaching", "Content Creation"],tools:["Articulate 360", "Zoom", "Miro", "PowerPoint", "LMS"],soft:["Energy", "Empathy", "Content Design"]},
      certifications:[{name:"ICF Associate Certified Coach",issuer:"ICF",year:"2022"}],
      projects:[{name:"Leadership Programme",stack:"Articulate, Miro",description:"40% promotion rate",url:"github.com/you"}],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t101", layout:"classic", name:"Procurement Analyst", category:"Business", color:"#065f46", icon:"📦",
    badge:"", tags:["Spend Analysis", "Vendor", "Cost Reduction"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Procurement Analyst with a strong track record of delivering results. Skilled in Spend Analysis, Vendor with a focus on driving measurable business impact.",
      experience:[{title:"Procurement Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Spend Analysis", "Vendor"],tools:["Spend Analysis", "Vendor", "Cost Reduction"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t102", layout:"executive", name:"Change Manager", category:"Management", color:"#1e40af", icon:"🔄",
    badge:"", tags:["ADKAR", "Communication", "Stakeholders"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Change Manager with a strong track record of delivering results. Skilled in ADKAR, Communication with a focus on driving measurable business impact.",
      experience:[{title:"Change Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["ADKAR", "Communication"],tools:["ADKAR", "Communication", "Stakeholders"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t103", layout:"modern", name:"Clinical Data Analyst", category:"Data", color:"#0891b2", icon:"🏥",
    badge:"", tags:["SAS", "Clinical Trials", "CDISC"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Clinical Data Analyst with a strong track record of delivering results. Skilled in SAS, Clinical Trials with a focus on driving measurable business impact.",
      experience:[{title:"Clinical Data Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["SAS", "Clinical Trials"],tools:["SAS", "Clinical Trials", "CDISC"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t104", layout:"creative", name:"Growth Hacker", category:"Marketing", color:"#9333ea", icon:"📈",
    badge:"", tags:["Virality", "Experiments", "Funnels"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Growth Hacker with a strong track record of delivering results. Skilled in Virality, Experiments with a focus on driving measurable business impact.",
      experience:[{title:"Growth Hacker",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Virality", "Experiments"],tools:["Virality", "Experiments", "Funnels"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t105", layout:"classic", name:"Revenue Operations", category:"Business", color:"#0369a1", icon:"💰",
    badge:"", tags:["RevOps", "Salesforce", "Analytics"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Revenue Operations with a strong track record of delivering results. Skilled in RevOps, Salesforce with a focus on driving measurable business impact.",
      experience:[{title:"Revenue Operations",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["RevOps", "Salesforce"],tools:["RevOps", "Salesforce", "Analytics"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t106", layout:"executive", name:"Agile Coach", category:"Management", color:"#059669", icon:"🏃",
    badge:"", tags:["SAFe", "Coaching", "Transformation"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Agile Coach with a strong track record of delivering results. Skilled in SAFe, Coaching with a focus on driving measurable business impact.",
      experience:[{title:"Agile Coach",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["SAFe", "Coaching"],tools:["SAFe", "Coaching", "Transformation"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t107", layout:"compact", name:"Information Security Analyst", category:"Security", color:"#dc2626", icon:"🔒",
    badge:"", tags:["ISO 27001", "VAPT", "GRC"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Information Security Analyst with a strong track record of delivering results. Skilled in ISO 27001, VAPT with a focus on driving measurable business impact.",
      experience:[{title:"Information Security Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["ISO 27001", "VAPT"],tools:["ISO 27001", "VAPT", "GRC"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t108", layout:"modern", name:"Automation Engineer", category:"Engineering", color:"#7c3aed", icon:"⚙️",
    badge:"", tags:["RPA", "UiPath", "Process Mining"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Automation Engineer with a strong track record of delivering results. Skilled in RPA, UiPath with a focus on driving measurable business impact.",
      experience:[{title:"Automation Engineer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["RPA", "UiPath"],tools:["RPA", "UiPath", "Process Mining"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t109", layout:"classic", name:"Legal Tech Specialist", category:"Business", color:"#1e40af", icon:"⚖️",
    badge:"", tags:["CLM", "RegTech", "Automation"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Legal Tech Specialist with a strong track record of delivering results. Skilled in CLM, RegTech with a focus on driving measurable business impact.",
      experience:[{title:"Legal Tech Specialist",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["CLM", "RegTech"],tools:["CLM", "RegTech", "Automation"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t110", layout:"creative", name:"UX Researcher", category:"Design", color:"#e11d48", icon:"🔍",
    badge:"", tags:["User Research", "Qual/Quant", "Insights"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced UX Researcher with a strong track record of delivering results. Skilled in User Research, Qual/Quant with a focus on driving measurable business impact.",
      experience:[{title:"UX Researcher",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["User Research", "Qual/Quant"],tools:["User Research", "Qual/Quant", "Insights"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t111", layout:"creative", name:"Community Manager", category:"Marketing", color:"#be185d", icon:"👥",
    badge:"", tags:["Community", "Discord", "Engagement"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Community Manager with a strong track record of delivering results. Skilled in Community, Discord with a focus on driving measurable business impact.",
      experience:[{title:"Community Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Community", "Discord"],tools:["Community", "Discord", "Engagement"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t112", layout:"minimal", name:"Technical Recruiter", category:"HR", color:"#9333ea", icon:"🎯",
    badge:"", tags:["Tech Hiring", "Boolean", "Assessment"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Technical Recruiter with a strong track record of delivering results. Skilled in Tech Hiring, Boolean with a focus on driving measurable business impact.",
      experience:[{title:"Technical Recruiter",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Tech Hiring", "Boolean"],tools:["Tech Hiring", "Boolean", "Assessment"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t113", layout:"classic", name:"Sustainability Manager", category:"Business", color:"#065f46", icon:"🌿",
    badge:"", tags:["ESG", "Carbon", "Reporting"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Sustainability Manager with a strong track record of delivering results. Skilled in ESG, Carbon with a focus on driving measurable business impact.",
      experience:[{title:"Sustainability Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["ESG", "Carbon"],tools:["ESG", "Carbon", "Reporting"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t114", layout:"classic", name:"Customer Experience Manager", category:"Business", color:"#0891b2", icon:"⭐",
    badge:"", tags:["CX", "NPS", "Journey Mapping"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Customer Experience Manager with a strong track record of delivering results. Skilled in CX, NPS with a focus on driving measurable business impact.",
      experience:[{title:"Customer Experience Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["CX", "NPS"],tools:["CX", "NPS", "Journey Mapping"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t115", layout:"modern", name:"Healthcare Analyst", category:"Data", color:"#0369a1", icon:"🏥",
    badge:"", tags:["Healthcare Data", "SQL", "HIPAA"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Healthcare Analyst with a strong track record of delivering results. Skilled in Healthcare Data, SQL with a focus on driving measurable business impact.",
      experience:[{title:"Healthcare Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Healthcare Data", "SQL"],tools:["Healthcare Data", "SQL", "HIPAA"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t116", layout:"executive", name:"EdTech Product Manager", category:"Management", color:"#9333ea", icon:"📚",
    badge:"", tags:["EdTech", "Engagement", "Content"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced EdTech Product Manager with a strong track record of delivering results. Skilled in EdTech, Engagement with a focus on driving measurable business impact.",
      experience:[{title:"EdTech Product Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["EdTech", "Engagement"],tools:["EdTech", "Engagement", "Content"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t117", layout:"modern", name:"FinTech Analyst", category:"Finance", color:"#0284c7", icon:"💳",
    badge:"", tags:["Payments", "Open Banking", "Regulation"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced FinTech Analyst with a strong track record of delivering results. Skilled in Payments, Open Banking with a focus on driving measurable business impact.",
      experience:[{title:"FinTech Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Payments", "Open Banking"],tools:["Payments", "Open Banking", "Regulation"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t118", layout:"modern", name:"Retail Analyst", category:"Data", color:"#ea580c", icon:"🛍️",
    badge:"", tags:["Retail Analytics", "Category", "Planogram"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Retail Analyst with a strong track record of delivering results. Skilled in Retail Analytics, Category with a focus on driving measurable business impact.",
      experience:[{title:"Retail Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Retail Analytics", "Category"],tools:["Retail Analytics", "Category", "Planogram"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t119", layout:"modern", name:"Sports Analyst", category:"Data", color:"#059669", icon:"⚽",
    badge:"", tags:["Sports Analytics", "Python", "StatsBomb"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Sports Analyst with a strong track record of delivering results. Skilled in Sports Analytics, Python with a focus on driving measurable business impact.",
      experience:[{title:"Sports Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Sports Analytics", "Python"],tools:["Sports Analytics", "Python", "StatsBomb"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t120", layout:"modern", name:"Geospatial Analyst", category:"Data", color:"#0891b2", icon:"🗺️",
    badge:"", tags:["GIS", "QGIS", "Spatial Data"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Geospatial Analyst with a strong track record of delivering results. Skilled in GIS, QGIS with a focus on driving measurable business impact.",
      experience:[{title:"Geospatial Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["GIS", "QGIS"],tools:["GIS", "QGIS", "Spatial Data"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t121", layout:"modern", name:"IoT Engineer", category:"Engineering", color:"#d97706", icon:"📡",
    badge:"", tags:["MQTT", "IoT", "Edge Computing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced IoT Engineer with a strong track record of delivering results. Skilled in MQTT, IoT with a focus on driving measurable business impact.",
      experience:[{title:"IoT Engineer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["MQTT", "IoT"],tools:["MQTT", "IoT", "Edge Computing"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t122", layout:"modern", name:"AR/VR Developer", category:"Engineering", color:"#7c3aed", icon:"🥽",
    badge:"", tags:["Unity", "ARKit", "XR"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced AR/VR Developer with a strong track record of delivering results. Skilled in Unity, ARKit with a focus on driving measurable business impact.",
      experience:[{title:"AR/VR Developer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Unity", "ARKit"],tools:["Unity", "ARKit", "XR"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t123", layout:"modern", name:"Robotics Engineer", category:"Engineering", color:"#1e40af", icon:"🤖",
    badge:"", tags:["ROS", "Python", "Control Systems"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Robotics Engineer with a strong track record of delivering results. Skilled in ROS, Python with a focus on driving measurable business impact.",
      experience:[{title:"Robotics Engineer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["ROS", "Python"],tools:["ROS", "Python", "Control Systems"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t124", layout:"modern", name:"Bioinformatics Analyst", category:"Data", color:"#0369a1", icon:"🧬",
    badge:"", tags:["Genomics", "Python", "R"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Bioinformatics Analyst with a strong track record of delivering results. Skilled in Genomics, Python with a focus on driving measurable business impact.",
      experience:[{title:"Bioinformatics Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Genomics", "Python"],tools:["Genomics", "Python", "R"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t125", layout:"classic", name:"Renewable Energy Analyst", category:"Business", color:"#065f46", icon:"⚡",
    badge:"", tags:["Solar", "Energy Analytics", "GIS"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Renewable Energy Analyst with a strong track record of delivering results. Skilled in Solar, Energy Analytics with a focus on driving measurable business impact.",
      experience:[{title:"Renewable Energy Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Solar", "Energy Analytics"],tools:["Solar", "Energy Analytics", "GIS"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t126", layout:"classic", name:"Real Estate Analyst", category:"Finance", color:"#d97706", icon:"🏢",
    badge:"", tags:["Valuation", "DCF", "CRE"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Real Estate Analyst with a strong track record of delivering results. Skilled in Valuation, DCF with a focus on driving measurable business impact.",
      experience:[{title:"Real Estate Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Valuation", "DCF"],tools:["Valuation", "DCF", "CRE"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t127", layout:"minimal", name:"E-learning Designer", category:"HR", color:"#9333ea", icon:"🎓",
    badge:"", tags:["Articulate", "SCORM", "Instructional Design"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced E-learning Designer with a strong track record of delivering results. Skilled in Articulate, SCORM with a focus on driving measurable business impact.",
      experience:[{title:"E-learning Designer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Articulate", "SCORM"],tools:["Articulate", "SCORM", "Instructional Design"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t128", layout:"minimal", name:"Talent Development Manager", category:"HR", color:"#7c3aed", icon:"📈",
    badge:"", tags:["Leadership Dev", "Succession", "Coaching"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Talent Development Manager with a strong track record of delivering results. Skilled in Leadership Dev, Succession with a focus on driving measurable business impact.",
      experience:[{title:"Talent Development Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Leadership Dev", "Succession"],tools:["Leadership Dev", "Succession", "Coaching"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t129", layout:"classic", name:"Internal Auditor", category:"Finance", color:"#1e40af", icon:"✅",
    badge:"", tags:["Risk-Based Audit", "Controls", "SOX"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Internal Auditor with a strong track record of delivering results. Skilled in Risk-Based Audit, Controls with a focus on driving measurable business impact.",
      experience:[{title:"Internal Auditor",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Risk-Based Audit", "Controls"],tools:["Risk-Based Audit", "Controls", "SOX"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t130", layout:"classic", name:"Treasury Analyst", category:"Finance", color:"#065f46", icon:"🏦",
    badge:"", tags:["Cash Management", "FX", "Derivatives"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Treasury Analyst with a strong track record of delivering results. Skilled in Cash Management, FX with a focus on driving measurable business impact.",
      experience:[{title:"Treasury Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Cash Management", "FX"],tools:["Cash Management", "FX", "Derivatives"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t131", layout:"classic", name:"Retail Banking Relationship Manager", category:"Finance", color:"#0891b2", icon:"🤝",
    badge:"", tags:["Banking", "SME", "Lending"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Retail Banking Relationship Manager with a strong track record of delivering results. Skilled in Banking, SME with a focus on driving measurable business impact.",
      experience:[{title:"Retail Banking Relationship Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Banking", "SME"],tools:["Banking", "SME", "Lending"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t132", layout:"classic", name:"Insurance Underwriter", category:"Finance", color:"#0284c7", icon:"📋",
    badge:"", tags:["Risk Assessment", "Underwriting", "Commercial"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Insurance Underwriter with a strong track record of delivering results. Skilled in Risk Assessment, Underwriting with a focus on driving measurable business impact.",
      experience:[{title:"Insurance Underwriter",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Risk Assessment", "Underwriting"],tools:["Risk Assessment", "Underwriting", "Commercial"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t133", layout:"classic", name:"Vendor Manager", category:"Business", color:"#ea580c", icon:"🤝",
    badge:"", tags:["Vendor Management", "SLAs", "Contracts"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Vendor Manager with a strong track record of delivering results. Skilled in Vendor Management, SLAs with a focus on driving measurable business impact.",
      experience:[{title:"Vendor Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Vendor Management", "SLAs"],tools:["Vendor Management", "SLAs", "Contracts"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t134", layout:"classic", name:"IT Auditor", category:"Business", color:"#1e40af", icon:"🔍",
    badge:"", tags:["CISA", "IT Controls", "Risk"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced IT Auditor with a strong track record of delivering results. Skilled in CISA, IT Controls with a focus on driving measurable business impact.",
      experience:[{title:"IT Auditor",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["CISA", "IT Controls"],tools:["CISA", "IT Controls", "Risk"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t135", layout:"classic", name:"Environmental Analyst", category:"Business", color:"#065f46", icon:"🌍",
    badge:"", tags:["EHS", "Compliance", "Carbon Footprint"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Environmental Analyst with a strong track record of delivering results. Skilled in EHS, Compliance with a focus on driving measurable business impact.",
      experience:[{title:"Environmental Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["EHS", "Compliance"],tools:["EHS", "Compliance", "Carbon Footprint"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t136", layout:"minimal", name:"Academic Researcher", category:"Other", color:"#9333ea", icon:"🔬",
    badge:"", tags:["Research Methods", "Publication", "Grant Writing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Academic Researcher with a strong track record of delivering results. Skilled in Research Methods, Publication with a focus on driving measurable business impact.",
      experience:[{title:"Academic Researcher",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Research Methods", "Publication"],tools:["Research Methods", "Publication", "Grant Writing"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t137", layout:"creative", name:"Journalist/Content Writer", category:"Marketing", color:"#be185d", icon:"✍️",
    badge:"", tags:["Writing", "Research", "Storytelling"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Journalist/Content Writer with a strong track record of delivering results. Skilled in Writing, Research with a focus on driving measurable business impact.",
      experience:[{title:"Journalist/Content Writer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Writing", "Research"],tools:["Writing", "Research", "Storytelling"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t138", layout:"creative", name:"Event Manager", category:"Marketing", color:"#e11d48", icon:"🎪",
    badge:"", tags:["Events", "Logistics", "Vendor Management"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Event Manager with a strong track record of delivering results. Skilled in Events, Logistics with a focus on driving measurable business impact.",
      experience:[{title:"Event Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Events", "Logistics"],tools:["Events", "Logistics", "Vendor Management"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t139", layout:"creative", name:"PR Manager", category:"Marketing", color:"#9333ea", icon:"📰",
    badge:"", tags:["Media Relations", "Crisis Comms", "Brand PR"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced PR Manager with a strong track record of delivering results. Skilled in Media Relations, Crisis Comms with a focus on driving measurable business impact.",
      experience:[{title:"PR Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Media Relations", "Crisis Comms"],tools:["Media Relations", "Crisis Comms", "Brand PR"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t140", layout:"creative", name:"Video Producer", category:"Design", color:"#dc2626", icon:"🎬",
    badge:"", tags:["Video Production", "Editing", "YouTube"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Video Producer with a strong track record of delivering results. Skilled in Video Production, Editing with a focus on driving measurable business impact.",
      experience:[{title:"Video Producer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Video Production", "Editing"],tools:["Video Production", "Editing", "YouTube"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t141", layout:"creative", name:"Podcast Producer", category:"Marketing", color:"#7c3aed", icon:"🎙️",
    badge:"", tags:["Audio Production", "Content", "Distribution"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Podcast Producer with a strong track record of delivering results. Skilled in Audio Production, Content with a focus on driving measurable business impact.",
      experience:[{title:"Podcast Producer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Audio Production", "Content"],tools:["Audio Production", "Content", "Distribution"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t142", layout:"creative", name:"Photojournalist", category:"Design", color:"#ea580c", icon:"📸",
    badge:"", tags:["Photography", "Visual Storytelling", "Editing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Photojournalist with a strong track record of delivering results. Skilled in Photography, Visual Storytelling with a focus on driving measurable business impact.",
      experience:[{title:"Photojournalist",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Photography", "Visual Storytelling"],tools:["Photography", "Visual Storytelling", "Editing"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t143", layout:"creative", name:"Interior Designer", category:"Design", color:"#be185d", icon:"🏠",
    badge:"", tags:["AutoCAD", "Space Planning", "3D Rendering"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Interior Designer with a strong track record of delivering results. Skilled in AutoCAD, Space Planning with a focus on driving measurable business impact.",
      experience:[{title:"Interior Designer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["AutoCAD", "Space Planning"],tools:["AutoCAD", "Space Planning", "3D Rendering"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t144", layout:"creative", name:"Fashion Designer", category:"Design", color:"#e11d48", icon:"👗",
    badge:"", tags:["Textile", "Pattern Making", "Fashion Tech"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Fashion Designer with a strong track record of delivering results. Skilled in Textile, Pattern Making with a focus on driving measurable business impact.",
      experience:[{title:"Fashion Designer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Textile", "Pattern Making"],tools:["Textile", "Pattern Making", "Fashion Tech"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t145", layout:"creative", name:"Industrial Designer", category:"Design", color:"#d97706", icon:"🏭",
    badge:"", tags:["Product Design", "CAD", "Manufacturing"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Industrial Designer with a strong track record of delivering results. Skilled in Product Design, CAD with a focus on driving measurable business impact.",
      experience:[{title:"Industrial Designer",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Product Design", "CAD"],tools:["Product Design", "CAD", "Manufacturing"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t146", layout:"modern", name:"Architect", category:"Engineering", color:"#0284c7", icon:"🏛️",
    badge:"", tags:["AutoCAD", "Revit", "BIM"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Architect with a strong track record of delivering results. Skilled in AutoCAD, Revit with a focus on driving measurable business impact.",
      experience:[{title:"Architect",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["AutoCAD", "Revit"],tools:["AutoCAD", "Revit", "BIM"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t147", layout:"classic", name:"Urban Planner", category:"Business", color:"#065f46", icon:"🏙️",
    badge:"", tags:["GIS", "Land Use", "Policy"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Urban Planner with a strong track record of delivering results. Skilled in GIS, Land Use with a focus on driving measurable business impact.",
      experience:[{title:"Urban Planner",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["GIS", "Land Use"],tools:["GIS", "Land Use", "Policy"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t148", layout:"classic", name:"Aviation Analyst", category:"Business", color:"#0369a1", icon:"✈️",
    badge:"", tags:["Aviation", "Revenue Management", "OTP"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Aviation Analyst with a strong track record of delivering results. Skilled in Aviation, Revenue Management with a focus on driving measurable business impact.",
      experience:[{title:"Aviation Analyst",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Aviation", "Revenue Management"],tools:["Aviation", "Revenue Management", "OTP"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t149", layout:"classic", name:"Sports Manager", category:"Business", color:"#059669", icon:"🏆",
    badge:"", tags:["Sports Business", "Sponsorship", "Events"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Sports Manager with a strong track record of delivering results. Skilled in Sports Business, Sponsorship with a focus on driving measurable business impact.",
      experience:[{title:"Sports Manager",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Sports Business", "Sponsorship"],tools:["Sports Business", "Sponsorship", "Events"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  },
  {
    id:"t150", layout:"executive", name:"Startup Founder", category:"Management", color:"#dc2626", icon:"🚀",
    badge:"Trending", tags:["Entrepreneurship", "Fundraising", "0→1"],
    resume:{
      personal:{name:"Your Name",email:"you@email.com",phone:"+91 98765 43210",location:"Bangalore, India",linkedin:"linkedin.com/in/yourname",portfolio:""},
      summary:"Experienced Startup Founder with a strong track record of delivering results. Skilled in Entrepreneurship, Fundraising with a focus on driving measurable business impact.",
      experience:[{title:"Startup Founder",company:"Your Company",location:"Bangalore, India",start:"Jan 2022",end:"",bullets:["Delivered key project outcomes exceeding targets by 20%","Led cross-functional team to implement strategic initiative","Improved core process metrics by 30% through systematic analysis","Recognised as top performer for 3 consecutive quarters"]}],
      education:[{degree:"Bachelor's Degree",field:"Relevant Field",school:"Your University",year:"2020",gpa:"8.0"}],
      skills:{technical:["Entrepreneurship", "Fundraising"],tools:["Entrepreneurship", "Fundraising", "0→1"],soft:["Communication","Leadership","Problem Solving"]},
      certifications:[],
      projects:[],
      languages:[{lang:"English",level:"Fluent"}]
    }
  }
];

// Helper: get templates by category
export const TEMPLATES_BY_CAT = RESUME_TEMPLATES.reduce((acc, t) => {
  if (!acc[t.category]) acc[t.category] = [];
  acc[t.category].push(t);
  return acc;
}, {});

export const TEMPLATE_CATEGORIES = ["All", ...Object.keys(TEMPLATES_BY_CAT)];
