import re
from utils.roles import ROLES_DB

# Only lines/phrases containing these words can be roles
ROLE_INDICATORS = {
    "analyst", "engineer", "developer", "scientist", "manager",
    "designer", "architect", "consultant", "specialist", "administrator",
    "director", "lead", "intern", "associate", "coordinator",
    "programmer", "devops", "fullstack", "frontend", "backend",
    "researcher", "modeler", "strategist", "executive", "officer",
    "trainee", "graduate", "apprentice"
}


def extract_roles(resume_text):
    text_lower = resume_text.lower()

    # 1. Match against expanded ROLES_DB — most reliable
    db_roles = [role for role in ROLES_DB if role.lower() in text_lower]

    # 2. Dynamic extraction — only if it contains a role indicator
    dynamic_roles = _extract_from_sections(resume_text)

    # 3. Merge, deduplicate
    all_roles = list(set(db_roles + dynamic_roles))
    all_roles = [r.strip() for r in all_roles if len(r.strip()) > 2]

    return sorted(all_roles)


def _extract_from_sections(resume_text):
    roles = []

    # Objective/Summary patterns
    title_patterns = [
        r'(?:worked as|working as|role as|position as|currently a)\s+(?:a\s+)?([A-Za-z\s]{3,40}?)(?:\s+at|\s+in|\.|,|$)',
        r'(?:seeking|looking for|applying for)\s+(?:a\s+)?([A-Za-z\s]{3,40}?)\s+(?:role|position|job|opportunity)',
        r'(?:i am a|i\'m a|as an?|experienced as)\s+([A-Za-z\s]{3,40}?)\s+(?:with|who|having|at)',
    ]

    for pattern in title_patterns:
        matches = re.findall(pattern, resume_text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            match = match.strip().lower()
            if _is_valid_role(match):
                roles.append(match)

    # Experience section titles
    roles += _extract_experience_titles(resume_text)

    return list(set(roles))


def _extract_experience_titles(resume_text):
    titles = []

    exp_pattern = re.compile(
        r'(experience|work history|employment)[:\s\n]+(.*?)(?=\n[A-Z][A-Z\s]{3,}:|\Z)',
        re.IGNORECASE | re.DOTALL
    )

    match = exp_pattern.search(resume_text)
    if not match:
        return titles

    section = match.group(2)
    lines = section.split('\n')

    for line in lines:
        line = line.strip()

        if not line:
            continue
        if re.search(r'\d{4}', line):        # skip lines with years/dates
            continue
        if line.isupper():                    # skip ALL CAPS (company names)
            continue
        if len(line.split()) > 6:             # skip long description lines
            continue
        if len(line) < 4:
            continue

        line_lower = line.lower()
        if _is_valid_role(line_lower):
            titles.append(line_lower)

    return titles


def _is_valid_role(text):
    """Must contain a role indicator word to be considered a role."""
    if not text or len(text) < 4:
        return False
    if len(text.split()) > 6:
        return False

    # Must have at least one role indicator word
    has_indicator = any(indicator in text for indicator in ROLE_INDICATORS)
    if not has_indicator:
        return False

    # Skip noise phrases even if they contain indicator words
    NOISE_PHRASES = {
        "team lead", "leads", "leading", "responsible for",
        "working with", "experience with", "knowledge of"
    }
    if text in NOISE_PHRASES:
        return False

    return True


def _is_noise(text):
    NOISE_WORDS = {
        "and", "the", "with", "a", "an", "my", "our",
        "team", "company", "organization", "department",
        "responsible", "duties", "time", "hands",
        "enterprise", "certificates", "good", "strong"
    }
    return text.lower().strip() in NOISE_WORDS