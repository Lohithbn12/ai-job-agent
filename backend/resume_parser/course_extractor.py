from utils.courses import COURSES_DB

def extract_courses(resume_text):

    resume_text = resume_text.lower()

    courses_found = []

    for course in COURSES_DB:
        if course in resume_text:
            courses_found.append(course)

    return list(set(courses_found))