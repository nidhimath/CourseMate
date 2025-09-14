# Course data and prerequisite information
COURSE_WEBSITES = {
    # CS Core Courses
    "CS61A": "https://cs61a.org",
    "CS61B": "https://sp25.datastructur.es/",
    "CS61C": "https://cs61c.org/fa25/",
    "CS70": "https://www.eecs70.org/",
    
    # CS Software Courses
    "CS160": "https://inst.eecs.berkeley.edu/~cs160/",
    "CS161": "https://sp25.cs161.org/",
    "CS162": "https://cs162.org/",
    "CS164": "https://berkeley-cs164-sp25.github.io/",
    "CS168": "https://sp25.cs168.io/",
    "CS169": "https://saasbook.info/videos",
    
    # CS Theory Courses
    "CS170": "https://cs170.org/",
    "CS172": "https://www.avishaytal.org/cs-172-computability-and-complexity",
    "CS174": "https://people.eecs.berkeley.edu/~jordan/courses/174-spring02/notes.html",
    "CS176": "https://inst.eecs.berkeley.edu/~cs176/",
    "CS191": "https://inst.eecs.berkeley.edu/~cs191/",
    
    # CS Hardware Course
    "CS152": "https://tree.yuantsy.com/Course2/docs/CS152/",
    
    # CS Applications Courses
    "CS184": "https://cs184.eecs.berkeley.edu/su25/",
    "CS186": "https://cs186berkeley.net/notes/",
    "CS188": "https://inst.eecs.berkeley.edu/~cs188/fa25/",
    "CS189": "https://people.eecs.berkeley.edu/~jrs/papers/machlearn.pdf",
    
    # EE Required Foundation
    "EECS16A": "https://eecs16a.org/",
    "EECS16B": "https://eecs16b.org/",
    
    # EE Signals Courses
    "EECS120": "https://ee120-course-staff.github.io/",
    "EECS123": "https://sites.google.com/berkeley.edu/ee123-sp25/home",
    "EECS126": "https://github.com/PKUFlyingPig/EECS126/tree/master",
    "EECS127": "https://inst.eecs.berkeley.edu/~ee127/sp21/livebook/",
    "EECS145B": "https://inst.eecs.berkeley.edu/~ee145b/",
    "EECS122": "https://kevinfall.com/ucbpage/EE122/",
    
    # EE Robotics Courses
    "EECS144": "https://ptolemy.berkeley.edu/projects/embedded/eecsx44/lectures/index.html",
    "EECS145L": "https://inst.eecs.berkeley.edu/~ee145l/",
    "EECS149": "https://ptolemy.berkeley.edu/books/leeseshia/releases/LeeSeshia_DigitalV2_3.pdf",
    "EECS106A": "https://ucb-ee106.github.io/eecs106a-fa23site/",
    "EECS106B": "https://ucb-ee106.github.io/106b-sp24site/",
    "EECS128": "https://aditya-sengupta.github.io/notes/eec128.pdf",
    "EECS192": "https://inst.eecs.berkeley.edu/~ee192/",
    
    # EE Circuits Courses
    "EECS105": "https://inst.eecs.berkeley.edu/~ee105/",
    "EECS140": "http://www.infocobuild.com/education/audio-video-courses/electronics/ee140-spring2014-berkeley.html",
    "EECS142": "https://rfic.eecs.berkeley.edu/courses/ee142/lectures.html",
    
    # EE Power Courses
    "EECS108": "https://inst.eecs.berkeley.edu/~ee108/",
    "EECS113": "https://inst.eecs.berkeley.edu/~ee113/",
    "EECS137A": "https://www.keithmoffat.com/intrepslecturenotes",
    "EECS137B": "https://www.keithmoffat.com/intrepslecturenotes",
    
    # EE Devices Courses
    "EECS130": "https://www.youtube.com/playlist?list=PLZHcIYJIAiQiw-2BsC79s96H_VCcKR8xu",
    "EECS134": "https://inst.eecs.berkeley.edu/~ee134/",
    "EECS143": "https://inst.eecs.berkeley.edu/~ee143/",
    "EECS147": "https://people.eecs.berkeley.edu/~pister/147fa16/index.htm",
    
    # EE Optics Courses
    "EECS118": "https://inst.eecs.berkeley.edu/~ee118/",
    
    # Physics courses
    "Physics7B": "https://jshen13.github.io/static/physics7b_sg-33dfad7cd5fd60fe588f34c106b1044b.pdf",
}

# Prerequisite graph
PREREQ_GRAPH = {
    # CS Core Courses
    "CS61A": [],
    "CS61B": ["CS61A"],
    "CS61C": ["CS61A"],
    "CS70": ["CS61A"],
    
    # CS Software Courses
    "CS160": ["CS61B"],
    "CS161": ["CS61C", "CS70"],
    "CS162": ["CS61C", "CS70"],
    "CS164": ["CS61B", "CS61C"],
    "CS168": ["CS61B"],
    "CS169": ["CS61B", "CS61C"],
    
    # CS Theory Courses
    "CS170": ["CS61B", "CS70"],
    "CS172": ["CS170"],
    "CS174": ["CS170"],
    "CS176": ["CS170", "CS188", "EECS126"],
    "CS191": ["CS170", "Physics7B"],
    
    # CS Hardware Course
    "CS152": ["CS61C", "EECS16B"],
    
    # CS Applications Courses
    "CS184": ["CS61B"],
    "CS186": ["CS61B", "CS61C"],
    "CS188": ["CS61B", "CS70", "CS170"],
    "CS189": ["CS188"],

    # EE Required Foundation
    "EECS16A": [],
    "EECS16B": ["EECS16A"],
    
    # EE Signals Courses
    "EECS120": ["EECS16B"],
    "EECS123": ["EECS120"],
    "EECS126": ["EECS16B", "CS70"],
    "EECS127": ["EECS16B", "CS70"],
    "EECS145B": ["EECS120"],
    "EECS122": ["CS70"],
    
    # EE Robotics Courses
    "EECS144": ["EECS16B"],
    "EECS145L": [],
    "EECS149": ["EECS16B"],
    "EECS106A": ["EECS16B", "CS61B", "CS61A"],
    "EECS106B": ["EECS106A"],
    "EECS128": ["EECS16B", "EECS120"],
    "EECS192": ["CS61C", "EECS16B", "EECS120"],
    
    # EE Circuits Courses
    "EECS105": ["EECS16B"],
    "EECS140": ["EECS105"],
    "EECS142": ["EECS140", "EECS120"],
    
    # EE Power Courses
    "EECS108": ["EECS16B"],
    "EECS113": ["EECS108", "EECS105", "Physics7B"],
    "EECS137A": ["EECS16B", "Physics7B"],
    "EECS137B": ["EECS137A"],
    
    # EE Devices Courses
    "EECS130": ["EECS16B", "EECS105"],
    "EECS134": ["EECS16B"],
    "EECS143": ["EECS16B", "Physics7B"],
    "EECS147": ["EECS16B", "Physics7B"],
    
    # EE Optics Courses
    "EECS118": ["EECS16B", "Physics7B"],
}

# Course categories for better organization
COURSE_CATEGORIES = {
    "CS Core": ["CS61A", "CS61B", "CS61C", "CS70"],
    "CS Software": ["CS160", "CS161", "CS162", "CS164", "CS168", "CS169"],
    "CS Theory": ["CS170", "CS172", "CS174", "CS176", "CS191"],
    "CS Hardware": ["CS152"],
    "CS Applications": ["CS184", "CS186", "CS188", "CS189"],
    "EE Foundation": ["EECS16A", "EECS16B"],
    "EE Signals": ["EECS120", "EECS123", "EECS126", "EECS127", "EECS145B", "EECS122"],
    "EE Robotics": ["EECS144", "EECS145L", "EECS149", "EECS106A", "EECS106B", "EECS128", "EECS192"],
    "EE Circuits": ["EECS105", "EECS140", "EECS142"],
    "EE Power": ["EECS108", "EECS113", "EECS137A", "EECS137B"],
    "EE Devices": ["EECS130", "EECS134", "EECS143", "EECS147"],
    "EE Optics": ["EECS118"],
    "Physics": ["Physics7B"]
}

def get_course_info(course_code):
    """Get course information including website and prerequisites"""
    return {
        "code": course_code,
        "website": COURSE_WEBSITES.get(course_code, ""),
        "prerequisites": PREREQ_GRAPH.get(course_code, []),
        "category": get_course_category(course_code)
    }

def get_course_category(course_code):
    """Get the category for a course"""
    for category, courses in COURSE_CATEGORIES.items():
        if course_code in courses:
            return category
    return "Other"

def get_all_courses():
    """Get all available courses"""
    return list(COURSE_WEBSITES.keys())

def can_take_course(course_code, completed_courses):
    """Check if a student can take a course based on completed prerequisites"""
    prerequisites = PREREQ_GRAPH.get(course_code, [])
    return all(prereq in completed_courses for prereq in prerequisites)

def get_available_courses(completed_courses):
    """Get all courses that can be taken based on completed courses"""
    available = []
    for course in get_all_courses():
        if course not in completed_courses and can_take_course(course, completed_courses):
            available.append(course)
    return available

def get_missing_prerequisites(course_code, completed_courses):
    """Get missing prerequisites for a course"""
    prerequisites = PREREQ_GRAPH.get(course_code, [])
    return [prereq for prereq in prerequisites if prereq not in completed_courses]
