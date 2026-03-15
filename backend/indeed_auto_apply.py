import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time
import random
import os
import shutil

CHROME_PROFILE_SRC = os.path.join(
    os.path.expanduser("~"),
    "AppData", "Local", "Google", "Chrome", "User Data", "Default"
)
BOT_PROFILE_DIR = os.path.join(os.path.expanduser("~"), "indeed_bot_chrome")
BOT_PROFILE_DEFAULT = os.path.join(BOT_PROFILE_DIR, "Default")


def _setup_bot_profile():
    if os.path.exists(BOT_PROFILE_DEFAULT):
        return
    print("Setting up bot profile from your Chrome session...")
    os.makedirs(BOT_PROFILE_DEFAULT, exist_ok=True)
    for item in ["Cookies", "Network", "Local Storage", "Session Storage"]:
        src = os.path.join(CHROME_PROFILE_SRC, item)
        dst = os.path.join(BOT_PROFILE_DEFAULT, item)
        try:
            if os.path.isdir(src):
                if os.path.exists(dst):
                    shutil.rmtree(dst)
                shutil.copytree(src, dst)
            elif os.path.isfile(src):
                shutil.copy2(src, dst)
            print(f"  Copied: {item}")
        except Exception as e:
            print(f"  Skipped {item}: {e}")
    print("✅ Bot profile ready")


def indeed_auto_apply(job_links, email=None, password=None):
    if not job_links:
        print("No jobs to apply to")
        return

    _setup_bot_profile()
    applied_count = 0

    options = uc.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument(f"--user-data-dir={BOT_PROFILE_DIR}")
    options.add_argument("--profile-directory=Default")
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--disable-blink-features=AutomationControlled")

    driver = uc.Chrome(options=options, version_main=145)

    try:
        print("Checking Indeed login...")
        driver.get("https://www.indeed.com/")
        time.sleep(5)

        if not _is_logged_in(driver):
            print("⚠️  Not logged in. Log into Indeed in Chrome first, then restart.")
            driver.quit()
            return

        print("✅ Logged in to Indeed")

        for i, link in enumerate(job_links):
            print(f"\n--- Job {i+1}/{len(job_links)} ---")
            print(f"URL: {link}")

            try:
                driver.get(link)
                time.sleep(3)

                apply_btn = _find_apply_button(driver)
                if not apply_btn:
                    print("⚠️  No Easy Apply button — skipping")
                    continue

                print("✅ Clicking apply...")
                apply_btn.click()
                time.sleep(4)

                applied = _handle_apply(driver)

                if applied:
                    applied_count += 1
                    print(f"✅ Applied! ({applied_count} total)")
                else:
                    print("⚠️  Could not complete application")

                try:
                    driver.switch_to.default_content()
                    if len(driver.window_handles) > 1:
                        driver.close()
                        driver.switch_to.window(driver.window_handles[0])
                except:
                    pass

            except Exception as e:
                print(f"❌ Error: {e}")
                try:
                    driver.switch_to.default_content()
                    if len(driver.window_handles) > 1:
                        driver.close()
                        driver.switch_to.window(driver.window_handles[0])
                except:
                    pass
                continue

            time.sleep(random.uniform(2, 4))

    finally:
        try:
            driver.quit()
        except:
            pass
        print(f"\n✅ Done — applied to {applied_count}/{len(job_links)} jobs")


def _handle_apply(driver):
    """Detect what Indeed opened after clicking Apply and handle it."""
    time.sleep(2)
    current_url = driver.current_url

    # Case 1: Auth redirect
    if "auth" in current_url and "continue" in current_url:
        print("  Auth redirect — clicking Google login...")
        try:
            google_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "login-google-button"))
            )
            google_btn.click()
            time.sleep(3)
            deadline = time.time() + 30
            while time.time() < deadline:
                time.sleep(2)
                url = driver.current_url
                if "accounts.google.com" in url:
                    try:
                        accts = driver.find_elements(
                            By.CSS_SELECTOR, "[data-identifier], .K3gCSb, .aZvCDf"
                        )
                        if accts:
                            accts[0].click()
                            time.sleep(3)
                    except:
                        pass
                    continue
                if "auth" not in url and "indeed.com" in url:
                    print("  ✅ Auth complete")
                    time.sleep(3)
                    break
            else:
                print("  Auth timeout — skipping")
                return False
        except Exception as e:
            print(f"  Auth error: {e}")
            return False

    # Case 2: New tab opened
    if len(driver.window_handles) > 1:
        print("  New tab — switching")
        driver.switch_to.window(driver.window_handles[-1])
        time.sleep(3)
        result = _walk_form(driver)
        try:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
        except:
            pass
        return result

    # Case 3: Widget with iframe inside — find iframe first
    iframe = _wait_for_apply_iframe(driver, timeout=8)
    if iframe:
        print("  Apply iframe found — switching in")
        driver.switch_to.frame(iframe)
        time.sleep(2)
        result = _walk_form(driver)
        driver.switch_to.default_content()
        return result

    # Case 4: Form loaded on same page (widget rendered inline)
    # Detected by Yes/No buttons or qualification questions appearing
    print("  Checking for inline form on page...")
    result = _walk_inline_form(driver)
    return result


def _walk_inline_form(driver):
    """
    Walk the apply form that's rendered directly on the job page.
    Indeed renders this as inline content after clicking Apply —
    it shows qualification questions (Yes/No), then Continue, then Submit.
    """
    for step in range(15):
        time.sleep(2)
        print(f"  Step {step + 1}...")

        # Get all visible buttons
        try:
            all_btns = driver.find_elements(By.TAG_NAME, "button")
            visible_btns = [b for b in all_btns if b.is_displayed() and b.text.strip()]
            btn_texts = [b.text.strip() for b in visible_btns]
            print(f"  Buttons: {btn_texts[:8]}")
        except:
            visible_btns = []
            btn_texts = []

        # Check confirmation
        if _is_confirmation_page(driver):
            print("  ✅ Confirmed!")
            return True

        # Fill any form fields
        _fill_form_fields(driver)

        # Answer Yes/No qualification questions
        # Indeed shows these as labeled buttons or radio inputs
        _answer_qualification_questions(driver)

        # Try Submit
        for text in ["Submit your application", "Submit application", "Submit"]:
            if text in btn_texts:
                try:
                    btn = next(b for b in visible_btns if b.text.strip() == text)
                    print(f"  Submitting: '{text}'")
                    btn.click()
                    time.sleep(3)
                    if _is_confirmation_page(driver):
                        return True
                    break
                except:
                    continue

        # Try Continue/Next — but NOT the main page Apply now button
        clicked = False
        for text in ["Continue", "Next", "Review your application", "Review"]:
            if text in btn_texts:
                try:
                    btn = next(b for b in visible_btns if b.text.strip() == text)
                    bid = btn.get_attribute("id") or ""
                    bcls = btn.get_attribute("class") or ""
                    # Skip if it's a Google/Apple/nav button
                    if "google" in bid or "apple" in bid:
                        continue
                    # Skip Continue on auth page
                    if text == "Continue" and "auth" in driver.current_url:
                        continue
                    print(f"  Clicking: '{text}'")
                    btn.click()
                    time.sleep(2)
                    clicked = True
                    break
                except:
                    continue

        if not clicked:
            # Check if there's a widget iframe that loaded after answering questions
            iframe = _wait_for_apply_iframe(driver, timeout=3)
            if iframe:
                print("  Iframe appeared — switching in")
                driver.switch_to.frame(iframe)
                time.sleep(2)
                result = _walk_form(driver)
                driver.switch_to.default_content()
                return result

            print(f"  No actionable button at step {step+1} — stopping")
            break

    return False


def _answer_qualification_questions(driver):
    """
    Answer Yes/No qualification questions that appear in the apply form.
    These are rendered as buttons or radio inputs.
    Strategy: answer 'Yes' to all visible Yes/No questions.
    """
    try:
        # Find question containers
        # Indeed wraps each question in a fieldset or div
        questions = driver.find_elements(
            By.CSS_SELECTOR,
            "fieldset, .ia-Questions-item, [data-testid*='question']"
        )

        for q in questions:
            try:
                if not q.is_displayed():
                    continue

                # Check for Yes button
                yes_btns = q.find_elements(
                    By.XPATH, ".//button[text()='Yes'] | .//label[text()='Yes']"
                )
                for yes_btn in yes_btns:
                    if yes_btn.is_displayed():
                        try:
                            yes_btn.click()
                            time.sleep(0.3)
                        except:
                            pass
                        break

                # Check for radio Yes
                radios = q.find_elements(By.CSS_SELECTOR, "input[type='radio']")
                answered = False
                for r in radios:
                    if r.is_displayed() and not r.is_selected():
                        label = ""
                        try:
                            rid = r.get_attribute("id")
                            label_el = q.find_element(By.CSS_SELECTOR, f"label[for='{rid}']")
                            label = label_el.text.lower()
                        except:
                            pass
                        if "yes" in label or not answered:
                            try:
                                r.click()
                                answered = True
                                time.sleep(0.2)
                                break
                            except:
                                pass
            except:
                continue

    except:
        pass

    # Also handle standalone Yes/No buttons outside fieldsets
    try:
        all_btns = driver.find_elements(By.TAG_NAME, "button")
        for btn in all_btns:
            if not btn.is_displayed():
                continue
            txt = btn.text.strip()
            # Only click Yes/No if they look like qualification answers
            if txt in ["Yes", "No"]:
                cls = btn.get_attribute("class") or ""
                # Only click if not already selected/active
                if "selected" not in cls and "active" not in cls:
                    try:
                        if txt == "Yes":
                            btn.click()
                            time.sleep(0.3)
                    except:
                        pass
    except:
        pass


def _wait_for_apply_iframe(driver, timeout=8):
    """Wait for Indeed's apply iframe to load."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        time.sleep(1)
        try:
            iframes = driver.find_elements(By.TAG_NAME, "iframe")
            for iframe in iframes:
                src = (iframe.get_attribute("src") or "").lower()
                fid = (iframe.get_attribute("id") or "").lower()
                combined = src + fid

                if any(x in combined for x in [
                    "google", "recaptcha", "preload", "doubleclick"
                ]):
                    continue

                if any(x in combined for x in [
                    "smartapply", "indeedapply", "ia-apply", "apply.indeed"
                ]):
                    w = iframe.size.get("width", 0)
                    h = iframe.size.get("height", 0)
                    if w > 50 and h > 50:
                        print(f"  iframe: {src[:50]} {w}x{h}")
                        return iframe
        except:
            pass
    return None


def _walk_form(driver):
    """Walk form in current context (iframe or page)."""
    for step in range(10):
        time.sleep(2)
        print(f"  Form step {step + 1}...")

        try:
            if "auth" in driver.current_url:
                return False
        except:
            pass

        try:
            btns = driver.find_elements(By.TAG_NAME, "button")
            visible = [b.text.strip() for b in btns if b.is_displayed() and b.text.strip()]
            if visible:
                print(f"  Buttons: {visible[:6]}")
        except:
            pass

        _fill_form_fields(driver)
        _answer_qualification_questions(driver)

        if _is_confirmation_page(driver):
            return True

        for text in ["Submit your application", "Submit application", "Submit"]:
            try:
                btns = driver.find_elements(
                    By.XPATH, f"//button[contains(text(),'{text}')]"
                )
                vis = [b for b in btns if b.is_displayed()]
                if vis:
                    print(f"  Submit: '{text}'")
                    vis[0].click()
                    time.sleep(3)
                    if _is_confirmation_page(driver):
                        return True
                    break
            except:
                continue

        clicked = False
        for text in ["Continue", "Next", "Review your application", "Review"]:
            try:
                btns = driver.find_elements(
                    By.XPATH, f"//button[contains(text(),'{text}')]"
                )
                for btn in btns:
                    if not btn.is_displayed():
                        continue
                    bid = btn.get_attribute("id") or ""
                    if "google" in bid or "apple" in bid:
                        continue
                    print(f"  Next: '{text}'")
                    btn.click()
                    time.sleep(2)
                    clicked = True
                    break
                if clicked:
                    break
            except:
                continue

        if not clicked:
            print(f"  No button at step {step+1}")
            break

    return False


def _is_logged_in(driver):
    try:
        time.sleep(2)
        elements = driver.find_elements(
            By.CSS_SELECTOR,
            "[data-testid='user-account-menu'], a[href*='/myjobs'], button[aria-label*='Account']"
        )
        if elements and elements[0].is_displayed():
            return True
        profile = driver.find_elements(
            By.CSS_SELECTOR, "a[href*='/profile'], a[href*='/resume']"
        )
        if profile:
            return True
        sign_in = driver.find_elements(
            By.XPATH,
            "//a[contains(text(),'Sign in')] | //button[contains(text(),'Sign in')]"
        )
        visible_sign_in = [s for s in sign_in if s.is_displayed()]
        if not visible_sign_in and "indeed.com" in driver.current_url:
            if "auth" not in driver.current_url and "login" not in driver.current_url:
                return True
    except:
        pass
    return False


def _find_apply_button(driver):
    selectors = [
        "#indeedApplyButton",
        "button.ia-IndeedApplyButton",
        "button.indeed-apply-button",
        "[class*='IndeedApply'] button",
        "[data-testid='indeedApplyButton']",
        "button[data-indeed-apply]",
    ]
    for selector in selectors:
        try:
            btns = driver.find_elements(By.CSS_SELECTOR, selector)
            for btn in btns:
                if btn.is_displayed():
                    txt = btn.text.strip().lower()
                    if any(skip in txt for skip in [
                        "schedule", "interview", "company site", "external"
                    ]):
                        continue
                    return btn
        except:
            continue
    try:
        btns = driver.find_elements(By.TAG_NAME, "button")
        for btn in btns:
            txt = btn.text.strip().lower()
            if txt in ["apply now", "easy apply", "easily apply", "indeed apply"]:
                if btn.is_displayed():
                    return btn
    except:
        pass
    return None


def _is_confirmation_page(driver):
    signals = [
        "your application was sent",
        "application submitted",
        "successfully applied",
        "you applied",
        "application complete",
        "thanks for applying",
    ]
    try:
        body = driver.find_element(By.TAG_NAME, "body").text.lower()
        return any(s in body for s in signals)
    except:
        return False


def _fill_form_fields(driver):
    try:
        fields = driver.find_elements(
            By.CSS_SELECTOR,
            "input[name*='phone'], input[placeholder*='Phone'], input[id*='phone']"
        )
        for f in fields:
            if f.is_displayed() and not f.get_attribute("value"):
                f.send_keys("9999999999")
                print("  Filled: phone")
                break
    except:
        pass
    try:
        inputs = driver.find_elements(
            By.CSS_SELECTOR,
            "input[type='text'][required], input[type='number'][required]"
        )
        for inp in inputs:
            if inp.is_displayed() and not inp.get_attribute("value"):
                inp.send_keys("1")
    except:
        pass
    try:
        radios = driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
        for r in radios[:5]:
            if r.is_displayed() and not r.is_selected():
                r.click()
                break
    except:
        pass
    try:
        selects = driver.find_elements(By.TAG_NAME, "select")
        for s in selects:
            if s.is_displayed():
                sel = Select(s)
                if sel.first_selected_option.text in ["", "Select..."]:
                    sel.select_by_index(1)
    except:
        pass
