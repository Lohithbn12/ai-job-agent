from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
import random
import re

EXPERIENCE_FILTERS = {
    "0-1":  "entry_level",
    "1-3":  "entry_level",
    "3-5":  "mid_level",
    "5-10": "senior_level",
    "10+":  "senior_level",
    "internship": "internship",
    "entry":  "entry_level",
    "mid":    "mid_level",
    "senior": "senior_level",
}

COUNTRY_DOMAINS = {
    "india": "in.indeed.com",
    "uk": "uk.indeed.com",
    "united kingdom": "uk.indeed.com",
    "canada": "ca.indeed.com",
    "australia": "au.indeed.com",
    "germany": "de.indeed.com",
    "france": "fr.indeed.com",
    "singapore": "sg.indeed.com",
    "uae": "ae.indeed.com",
    "united arab emirates": "ae.indeed.com",
}

# Maps user experience range → (min_years, max_years) for post-filter
EXP_RANGE = {
    "0-1":  (0, 1),
    "1-3":  (1, 3),
    "3-5":  (3, 5),
    "5-10": (5, 10),
    "10+":  (10, 99),
}


def collect_indeed_jobs(keywords, experience_level="0-1", location=""):
    jobs = []
    exp_filter = EXPERIENCE_FILTERS.get(experience_level, "entry_level")
    exp_range  = EXP_RANGE.get(experience_level)

    clean_keywords = _clean_keywords(keywords)
    print(f"[Indeed] Keywords: {clean_keywords} | Exp: {experience_level} | Location: {location}")

    base_domain = "www.indeed.com"
    loc_param = ""
    if location:
        loc_lower = location.lower()
        for country_key, domain in COUNTRY_DOMAINS.items():
            if country_key in loc_lower:
                base_domain = domain
                break
        loc_param = location.replace(" ", "+")

    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)
    chrome_options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )
    driver.execute_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )

    try:
        for keyword in clean_keywords:
            print(f"[Indeed] Searching: '{keyword}' on {base_domain}")

            search_url = (
                f"https://{base_domain}/jobs"
                f"?q={keyword.replace(' ', '+')}"
                f"&explvl={exp_filter}&sort=date"
            )
            if loc_param:
                search_url += f"&l={loc_param}"

            driver.get(search_url)
            time.sleep(random.uniform(4, 6))

            title_check = driver.title
            print(f"  Page: {title_check}")

            if "Blocked" in title_check or "Just a moment" in title_check:
                time.sleep(10)
                driver.get(search_url)
                time.sleep(5)
                if "Blocked" in driver.title or "Just a moment" in driver.title:
                    print(f"  ❌ Blocked — skipping")
                    continue

            cards = driver.find_elements(By.CSS_SELECTOR, ".job_seen_beacon")
            if not cards:
                cards = driver.find_elements(By.CSS_SELECTOR, "[data-jk]")

            print(f"  Cards: {len(cards)}")
            if not cards:
                continue

            for card in cards[:15]:  # scrape more, filter down after
                try:
                    # Title
                    title = ""
                    for sel in ["h2.jobTitle span[title]", "h2.jobTitle span", "a.jcs-JobTitle span"]:
                        try:
                            el = card.find_element(By.CSS_SELECTOR, sel)
                            title = el.get_attribute("title") or el.text.strip()
                            if title:
                                break
                        except:
                            continue

                    # Company
                    company = ""
                    for sel in ["[data-testid='company-name']", ".companyName"]:
                        try:
                            company = card.find_element(By.CSS_SELECTOR, sel).text.strip()
                            if company:
                                break
                        except:
                            continue

                    # Location
                    loc = ""
                    for sel in ["[data-testid='text-location']", ".companyLocation"]:
                        try:
                            loc = card.find_element(By.CSS_SELECTOR, sel).text.strip()
                            if loc:
                                break
                        except:
                            continue

                    # Salary
                    salary = ""
                    for sel in [
                        "[data-testid='attribute_snippet_testid']",
                        ".salary-snippet-container",
                        ".salaryOnly",
                        "[class*='SalarySnippet']",
                        "[class*='salary']",
                    ]:
                        try:
                            el = card.find_element(By.CSS_SELECTOR, sel)
                            text = el.text.strip()
                            if text and any(c in text for c in ["$", "₹", "£", "€", "year", "hour", "month", "per"]):
                                salary = text
                                break
                        except:
                            continue

                    if not salary:
                        try:
                            for meta in card.find_elements(By.CSS_SELECTOR, ".metadata, li"):
                                t = meta.text.strip()
                                if t and any(c in t for c in ["$", "₹", "£", "LPA", "lakh", "k per"]):
                                    salary = t
                                    break
                        except:
                            pass

                    # Snippet text — used for experience filtering
                    snippet = ""
                    try:
                        snippet = card.text.lower()
                    except:
                        pass

                    # Apply link
                    link = ""
                    try:
                        a_el = card.find_element(By.CSS_SELECTOR, "a.jcs-JobTitle, h2.jobTitle a")
                        jk = a_el.get_attribute("data-jk")
                        if jk:
                            link = f"https://{base_domain}/viewjob?jk={jk}"
                        else:
                            href = a_el.get_attribute("href") or ""
                            link = href.split("?")[0] if href else ""
                    except:
                        pass

                    easy_apply = False
                    try:
                        easy_apply = "easily apply" in snippet
                    except:
                        pass

                    if not title or not link:
                        continue

                    # ── Post-scrape experience filter ──────────────────────
                    # Extract years mentioned in the card snippet
                    # e.g. "5+ years", "3-5 years", "minimum 2 years"
                    if exp_range:
                        mentioned = _extract_years_from_text(snippet)
                        if mentioned is not None:
                            min_req, max_req = mentioned
                            user_min, user_max = exp_range
                            # Reject if job requires MORE experience than user's max
                            # or if job requires MUCH LESS than user's min (more than 2yr gap)
                            if min_req > user_max:
                                print(f"  ⛔ Filtered out: '{title}' requires {min_req}+ yrs, user wants {user_min}-{user_max}")
                                continue
                            if max_req is not None and max_req < user_min - 1:
                                print(f"  ⛔ Filtered out: '{title}' requires ≤{max_req} yrs, user wants {user_min}-{user_max}")
                                continue

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": loc,
                        "salary": salary,
                        "experience_level": experience_level,
                        "apply_link": link,
                        "easy_apply": easy_apply,
                        "source": "Indeed",
                    })
                    print(f"  ✅ {title} @ {company}")

                except Exception as e:
                    print(f"  Card error: {e}")
                    continue

            time.sleep(random.uniform(2, 4))

    finally:
        driver.quit()

    print(f"[Indeed] Total after filtering: {len(jobs)} jobs")
    return jobs


def _extract_years_from_text(text):
    """
    Extract experience requirement from job card text.
    Returns (min_years, max_years) or None if not mentioned.

    Handles patterns like:
    - "5+ years"
    - "3-5 years"
    - "minimum 2 years"
    - "at least 3 years"
    - "1 to 3 years"
    - "5 years of experience"
    """
    text = text.lower()

    # Pattern: "X+ years" or "X or more years"
    m = re.search(r'(\d+)\s*\+\s*years?', text)
    if m:
        n = int(m.group(1))
        return (n, 99)

    # Pattern: "X-Y years" or "X to Y years"
    m = re.search(r'(\d+)\s*(?:-|to)\s*(\d+)\s*years?', text)
    if m:
        return (int(m.group(1)), int(m.group(2)))

    # Pattern: "minimum/at least/over X years"
    m = re.search(r'(?:minimum|at least|over|more than)\s+(\d+)\s*years?', text)
    if m:
        n = int(m.group(1))
        return (n, 99)

    # Pattern: "X years of experience" (single number)
    m = re.search(r'(\d+)\s+years?\s+(?:of\s+)?(?:experience|exp)', text)
    if m:
        n = int(m.group(1))
        return (n, n)

    return None  # no experience mentioned — don't filter


def _clean_keywords(keywords):
    VALID = [
        "analyst", "engineer", "developer", "scientist", "manager",
        "designer", "architect", "consultant", "specialist", "intern",
        "data", "software", "machine learning", "frontend", "backend",
        "fullstack", "devops", "cloud", "python", "java", "power bi",
        "business", "product", "project", "network", "security", "ai", "ml"
    ]
    cleaned, seen = [], set()
    for kw in keywords:
        kw = kw.replace("\n", " ").strip()
        kw_lower = kw.lower()
        if kw_lower in seen:
            continue
        if len(kw.split()) == 1 and kw_lower in {
            "time", "hands", "enterprise", "team", "good",
            "strong", "experience", "knowledge", "skills"
        }:
            continue
        if not any(v in kw_lower for v in VALID):
            continue
        cleaned.append(kw)
        seen.add(kw_lower)
    return cleaned if cleaned else ["data analyst"]
