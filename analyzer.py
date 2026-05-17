"""Resume analysis logic."""

SKILL_WEIGHTS = {
    "python": {"points": 20, "label": "Python"},
    "fastapi": {"points": 20, "label": "FastAPI"},
    "javascript": {"points": 10, "label": "JavaScript"},
    "react": {"points": 10, "label": "React"},
    "html": {"points": 5, "label": "HTML"},
    "css": {"points": 5, "label": "CSS"},
    "sql": {"points": 15, "label": "SQL"},
    "api": {"points": 15, "label": "REST API"},
    "docker": {"points": 15, "label": "Docker"},
    "git": {"points": 10, "label": "Git"},
    "machine": {"points": 20, "label": "Machine Learning"},
    "tensorflow": {"points": 15, "label": "TensorFlow"},
    "django": {"points": 15, "label": "Django"},
    "nodejs": {"points": 10, "label": "Node.js"},
    "typescript": {"points": 10, "label": "TypeScript"},
}

MAX_SCORE = sum(v["points"] for v in SKILL_WEIGHTS.values())


def analyze_resume(resume_text: str, experience: str) -> dict:
    lower = resume_text.lower()
    matched = []
    raw = 0
    for key, val in SKILL_WEIGHTS.items():
        if key in lower:
            matched.append(val["label"])
            raw += val["points"]

    exp_years = int(experience) if str(experience).strip().isdigit() else 0
    exp_bonus = 0
    if exp_years >= 5:
        exp_bonus = 15
    elif exp_years >= 3:
        exp_bonus = 10
    elif exp_years >= 1:
        exp_bonus = 5

    total_raw = raw + exp_bonus
    score = min(100, round((total_raw / (MAX_SCORE + 15)) * 100))

    if score >= 75:
        recommendation, badge = "Highly Recommended", "success"
    elif score >= 50:
        recommendation, badge = "Recommended", "info"
    elif score >= 30:
        recommendation, badge = "Consider", "warning"
    else:
        recommendation, badge = "Not Recommended", "danger"

    return {
        "score": score,
        "recommendation": recommendation,
        "badge": badge,
        "matched": matched,
        "exp_bonus": exp_bonus,
    }
