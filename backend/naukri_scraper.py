from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
import random

# Naukri experience mapping — uses minExp/maxExp URL params
EXP_MAP = {
    "0-1":  (0, 1),
    "1-3":  (1, 3),
    "3-5":  (3, 5),
    "5-10": (5, 10),
    "10+":  (10, 20),
}


def collect_naukri_jobs(keywords, experience_level="0-1", location=""):
    jobs = []
    min_exp, max_exp = EXP_MAP.get(experience_level, (0, 1))

    clean_keywords = _clean_keywords(keywords)
    print(f"[Naukri] Keywords: {clean_keywords} | Exp: {experience_level} | Location: {location}")

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
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
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
            print(f"[Naukri] Searching: '{keyword}'")

            # Build Naukri URL
            kw_slug = keyword.replace(" ", "-").lower()
            loc_slug = location.split(",")[0].strip().replace(" ", "-").lower() if location else ""

            if loc_slug:
                search_url = (
                    f"https://www.naukri.com/{kw_slug}-jobs-in-{loc_slug}"
                    f"?experience={min_exp}&jobAge=7"
                )
            else:
                search_url = (
                    f"https://www.naukri.com/{kw_slug}-jobs"
                    f"?experience={min_exp}&jobAge=7"
                )

            print(f"  URL: {search_url}")
            driver.get(search_url)
            time.sleep(random.uniform(4, 6))

            title_check = driver.title
            print(f"  Page: {title_check}")

            # Get job cards
            cards = driver.find_elements(By.CSS_SELECTOR, ".srp-jobtuple-wrapper, article.jobTuple")
            if not cards:
                cards = driver.find_elements(By.CSS_SELECTOR, "[data-job-id], .job-container")

            print(f"  Cards: {len(cards)}")
            if not cards:
                # Try alternate selector
                cards = driver.find_elements(By.CSS_SELECTOR, ".list li, .jobCard")
                print(f"  Cards (alt): {len(cards)}")

            if not cards:
                continue

            for card in cards[:10]:
                try:
                    # Title
                    title = ""
                    for sel in [
                        "a.title",
                        ".title a",
                        "a.jobTitle",
                        "[class*='title'] a",
                        "a[title]",
                    ]:
                        try:
                            el = card.find_element(By.CSS_SELECTOR, sel)
                            title = el.get_attribute("title") or el.text.strip()
                            if title:
                                break
                        except:
                            continue

                    # Company
                    company = ""
                    for sel in [
                        "a.comp-name",
                        ".comp-name",
                        "[class*='company']",
                        ".companyInfo a",
                    ]:
                        try:
                            company = card.find_element(By.CSS_SELECTOR, sel).text.strip()
                            if company:
                                break
                        except:
                            continue

                    # Location
                    loc = ""
                    for sel in [
                        ".locWdth",
                        "[class*='location']",
                        ".location",
                        "li.location span",
                    ]:
                        try:
                            loc = card.find_element(By.CSS_SELECTOR, sel).text.strip()
                            if loc:
                                break
                        except:
                            continue

                    # Salary
                    salary = ""
                    for sel in [
                        ".sal",
                        "[class*='salary']",
                        ".salary",
                        "li.salary span",
                    ]:
                        try:
                            salary = card.find_element(By.CSS_SELECTOR, sel).text.strip()
                            if salary and salary not in ["Not disclosed", "Not Disclosed"]:
                                break
                            else:
                                salary = ""
                        except:
                            continue

                    # Apply link
                    link = ""
                    for sel in ["a.title", "a.jobTitle", "[class*='title'] a", "a[href*='naukri.com']"]:
                        try:
                            href = card.find_element(By.CSS_SELECTOR, sel).get_attribute("href") or ""
                            if "naukri.com" in href:
                                link = href
                                break
                        except:
                            continue

                    if title and link:
                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": loc,
                            "salary": salary,
                            "experience_level": experience_level,
                            "apply_link": link,
                            "easy_apply": False,
                            "source": "Naukri",
                        })
                        print(f"  ✅ {title} @ {company} | {loc} | {salary or 'No salary'}")

                except Exception as e:
                    print(f"  Card error: {e}")
                    continue

            time.sleep(random.uniform(2, 4))

    finally:
        driver.quit()

    print(f"[Naukri] Total: {len(jobs)} jobs")
    return jobs


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
        if not any(v in kw_lower for v in VALID):
            continue
        cleaned.append(kw)
        seen.add(kw_lower)
    return cleaned if cleaned else ["data analyst"]
