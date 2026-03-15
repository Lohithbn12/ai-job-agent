from playwright.sync_api import sync_playwright
import time
import random


def auto_apply(job_links, email, password):

    with sync_playwright() as p:

        print("Starting browser...")

        browser = p.chromium.launch(
            headless=False,
            slow_mo=500
        )

        page = browser.new_page()

        # -------------------------
        # LOGIN TO LINKEDIN
        # -------------------------

        print("Opening LinkedIn login page")

        page.goto("https://www.linkedin.com/login")

        time.sleep(2)

        page.fill("#username", email)
        page.fill("#password", password)

        page.click("button[type='submit']")

        print("Logging in...")

        time.sleep(8)

        print("Login successful")

        # -------------------------
        # LOOP THROUGH JOBS
        # -------------------------

        for job in job_links:

            try:

                print("\nOpening job:", job)

                page.goto(job)

                time.sleep(random.randint(4, 7))

                # Check for Easy Apply
                easy_apply = page.locator("button:has-text('Easy Apply')")

                if easy_apply.count() == 0:

                    print("Easy Apply not available")
                    continue

                print("Easy Apply found")

                easy_apply.first.click()

                time.sleep(3)

                # -------------------------
                # HANDLE MULTI STEP FORMS
                # -------------------------

                while True:

                    time.sleep(2)

                    # Submit button
                    submit_btn = page.locator("button:has-text('Submit application')")

                    if submit_btn.count() > 0:

                        submit_btn.first.click()

                        print("Application submitted")

                        time.sleep(3)

                        break

                    # Next button
                    next_btn = page.locator("button:has-text('Next')")

                    if next_btn.count() > 0:

                        next_btn.first.click()

                        print("Next step")

                        time.sleep(2)

                        continue

                    # Review button
                    review_btn = page.locator("button:has-text('Review')")

                    if review_btn.count() > 0:

                        review_btn.first.click()

                        print("Review step")

                        time.sleep(2)

                        continue

                    # If nothing found
                    print("Unknown step - skipping job")

                    close_btn = page.locator("button[aria-label='Dismiss']")

                    if close_btn.count() > 0:
                        close_btn.first.click()

                    break

            except Exception as e:

                print("Error applying to job:", e)

                try:
                    page.locator("button[aria-label='Dismiss']").click()
                except:
                    pass

        print("\nAll jobs processed")

        browser.close()