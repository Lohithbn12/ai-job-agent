from playwright.sync_api import sync_playwright
import time


# LinkedIn experience level filter codes
EXPERIENCE_FILTERS = {
    "internship": "1",
    "entry":      "2",
    "mid":        "3",
    "senior":     "4",
    "director":   "5",
    "executive":  "6"
}


def collect_easy_apply_jobs(email, password, keywords, experience_level="entry"):

    job_links = []
    exp_code = EXPERIENCE_FILTERS.get(experience_level, "2")  # default to entry

    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Login
        print("Opening LinkedIn login")
        page.goto("https://www.linkedin.com/login")
        page.wait_for_selector("#username", timeout=10000)
        page.fill("#username", email)
        page.fill("#password", password)
        page.click("button[type='submit']")
        print("Logging in...")
        page.wait_for_url("**/feed/**", timeout=15000)
        print("Login successful")

        for keyword in keywords:

            print(f"Searching: {keyword} | Experience: {experience_level}")

            # f_AL=true  → Easy Apply only
            # f_E={code} → Experience level filter
            search_url = (
                f"https://www.linkedin.com/jobs/search/"
                f"?keywords={keyword}"
                f"&f_AL=true"
                f"&f_E={exp_code}"
                f"&position=1&pageNum=0"
            )

            page.goto(search_url)

            try:
                page.wait_for_selector(
                    "ul.scaffold-layout__list-container", timeout=10000
                )
            except:
                print(f"No job list loaded for: {keyword}")
                continue

            time.sleep(3)

            # Try selectors in order — LinkedIn changes these often
            selectors = [
                "a.job-card-list__title--link",
                "a.job-card-list__title",
                "[data-job-id] a[href*='/jobs/view/']",
                "a[href*='/jobs/view/']",
            ]

            job_cards = None
            for selector in selectors:
                cards = page.locator(selector)
                if cards.count() > 0:
                    job_cards = cards
                    print(f"Selector matched: {selector} → {cards.count()} jobs")
                    break

            if not job_cards or job_cards.count() == 0:
                print(f"No cards found for: {keyword}")
                continue

            count = job_cards.count()

            for i in range(min(count, 10)):
                try:
                    link = job_cards.nth(i).get_attribute("href")

                    if link and "/jobs/view/" in link:
                        full_link = (
                            "https://www.linkedin.com" + link.split("?")[0]
                            if link.startswith("/")
                            else link.split("?")[0]
                        )
                        print(f"Collected: {full_link}")
                        job_links.append(full_link)

                except Exception as e:
                    print(f"Error on job {i}: {e}")
                    continue

        browser.close()

    unique_links = list(set(job_links))
    print(f"Total collected: {len(unique_links)}")
    return unique_links