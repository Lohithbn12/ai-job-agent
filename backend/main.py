from fastapi import FastAPI, UploadFile, File, Body
import shutil
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from fastapi.middleware.cors import CORSMiddleware

from resume_parser.parser import extract_text_from_pdf
from resume_parser.skill_extractor import extract_skills
from resume_parser.role_extractor import extract_roles
from resume_parser.course_extractor import extract_courses

from indeed_scraper import collect_indeed_jobs
from naukri_scraper import collect_naukri_jobs


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_text_from_pdf(file_location)
    skills = extract_skills(resume_text)
    roles = extract_roles(resume_text)
    courses = extract_courses(resume_text)

    print(f"Parsed: roles={roles} skills={skills[:5]}")

    return {
        "filename": file.filename,
        "skills": skills,
        "roles": roles,
        "courses": courses,
    }


@app.post("/search-jobs/")
def search_jobs(data: dict = Body(...)):
    keywords        = data.get("keywords", [])
    experience_level = data.get("experience_level", "0-1")
    location        = data.get("location", "")
    sources         = data.get("sources", ["indeed", "naukri"])  # which sites to search

    print(f"Searching | keywords: {keywords} | exp: {experience_level} | loc: {location} | sources: {sources}")

    all_jobs = []

    # Run scrapers in parallel so they don't wait for each other
    tasks = {}
    with ThreadPoolExecutor(max_workers=2) as executor:
        if "indeed" in sources:
            tasks["indeed"] = executor.submit(
                collect_indeed_jobs, keywords, experience_level, location
            )
        if "naukri" in sources:
            tasks["naukri"] = executor.submit(
                collect_naukri_jobs, keywords, experience_level, location
            )

        for source, future in tasks.items():
            try:
                jobs = future.result(timeout=120)
                all_jobs.extend(jobs)
                print(f"{source}: {len(jobs)} jobs")
            except Exception as e:
                print(f"{source} error: {e}")

    return {
        "jobs": all_jobs,
        "total": len(all_jobs),
        "by_source": {
            "indeed": len([j for j in all_jobs if j.get("source") == "Indeed"]),
            "naukri": len([j for j in all_jobs if j.get("source") == "Naukri"]),
        }
    }
