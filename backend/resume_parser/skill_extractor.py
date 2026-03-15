import re
from utils.skills import SKILLS_DB

# Only accept skills that match these technical indicators
TECH_INDICATORS = {
    # Languages
    "python", "sql", "r", "java", "scala", "spark", "api", "c++", "c#",
    "javascript", "typescript", "bash", "pyspark", "go",
    # Cloud / Infra
    "aws", "gcp", "azure", "docker", "git", "linux", "kubernetes", "terraform",
    # Data / ML
    "pandas", "numpy", "scikit", "tensor", "torch", "keras", "xgboost",
    "tableau", "power bi", "excel", "looker", "plotly", "matplotlib", "seaborn",
    "mysql", "postgres", "mongo", "redis", "hadoop", "kafka", "airflow",
    "flask", "django", "fastapi", "react", "node",
    "regression", "classification", "clustering", "nlp", "opencv",
    "analysis", "modeling", "statistics", "visualization", "forecasting",
    "learning", "mining", "processing", "engineering", "testing",
    "dynamodb", "oracle", "snowflake", "redshift", "bigquery", "databricks",
    "hypothesis", "pca", "random forest", "gradient", "neural", "deep",
    "wrangling", "pipeline", "etl", "eda", "a/b",
    # Tools
    "jupyter", "colab", "github", "gitlab", "jira", "confluence",
}

# Words that are definitely NOT skills — reject anything matching these
NOISE_WORDS = {
    "and", "the", "with", "using", "etc", "other", "including", "such as",
    "experience", "knowledge", "proficient", "familiar", "working", "good",
    "strong", "ability", "understanding", "hands", "time", "enterprise",
    "team", "work", "use", "used", "well", "also", "basic", "advanced",
    "excellent", "extensive", "various", "multiple", "draining", "enabling",
    "fast", "drill", "learn", "present", "city", "university", "bangalore",
    "certificates", "academic", "project", "aether", "dynamics", "maturity",
    "ratings", "reliability", "across", "bengaluru", "communication",
    "leadership", "teamwork", "problem", "solving", "critical", "thinking",
    "responsibilities", "objective", "summary", "education", "languages",
    "hobbies", "interests", "references", "profile", "contact",
}


def extract_skills(resume_text):
    text_lower = resume_text.lower()

    # 1. Match against SKILLS_DB — most reliable
    db_skills = [
        skill for skill in SKILLS_DB
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower)
    ]

    # 2. Extract from skills sections dynamically
    dynamic_skills = _extract_from_sections(resume_text)

    # 3. Merge, deduplicate, clean
    all_skills = list(dict.fromkeys(db_skills + dynamic_skills))  # preserve order, dedupe
    all_skills = [s.strip() for s in all_skills if _is_valid_skill(s)]

    return sorted(all_skills)


def _extract_from_sections(resume_text):
    skills = []

    section_pattern = re.compile(
        r'(?:technical\s+)?skills?[:\s\n]+(.*?)(?=\n[A-Z][A-Za-z\s]{2,}:|\Z)',
        re.IGNORECASE | re.DOTALL
    )

    matches = section_pattern.findall(resume_text)

    for section_content in matches:
        # Split by common delimiters
        raw_items = re.split(r'[,|\•\-\n/●▪·]+', section_content)

        for item in raw_items:
            item = item.strip().lower()
            # Remove trailing punctuation
            item = re.sub(r'[.;:]+$', '', item).strip()

            if 2 <= len(item) <= 35 and _is_valid_skill(item):
                skills.append(item)

    return skills


def _is_valid_skill(text):
    """Return True only if text looks like a real technical skill."""
    text = text.lower().strip()

    # Too short or too long
    if len(text) < 2 or len(text) > 40:
        return False

    # Too many words — likely a sentence fragment
    if len(text.split()) > 4:
        return False

    # Exact noise word match
    if text in NOISE_WORDS:
        return False

    # Contains a noise word as the whole skill
    words = text.split()
    if len(words) == 1 and words[0] in NOISE_WORDS:
        return False

    # Must match SKILLS_DB or contain a known tech indicator
    from utils.skills import SKILLS_DB
    if any(s.lower() == text for s in SKILLS_DB):
        return True

    if any(indicator in text for indicator in TECH_INDICATORS):
        return True

    return False
