"""In-memory candidate storage."""
from datetime import date
from analyzer import analyze_resume

_candidates: list[dict] = [
{
"id": 1,
"name": "Ayesha Khan",
"experience": "4",
"resume": "Python FastAPI REST API SQL Docker Git machine learning tensorflow",
"added": "2025-05-10",
},

{
"id": 2,
"name": "Bilal Raza",
"experience": "1",
"resume": "HTML CSS JavaScript React nodejs typescript git",
"added": "2025-05-11",
},

{
"id": 3,
"name": "Sara Ahmed",
"experience": "2",
"resume": "Python django SQL api git",
"added": "2025-05-13",
},
]
_next_id = 10

def _to_response(candidate: dict)-> dict:
 analysis = analyze_resume(candidate["resume"], candidate["experience"])
 return {
 "id": candidate["id"],
 "name": candidate["name"],
 "experience": candidate["experience"],
 "resume": candidate["resume"],
 "added": candidate["added"],
 "score": analysis["score"],
 "recommendation": analysis["recommendation"],
 "badge": analysis["badge"],
 "matched_skills": analysis["matched"],
 "exp_bonus": analysis["exp_bonus"],
}

def get_all() -> list[dict]:
 return [_to_response(c) for c in _candidates]

def add(name: str, experience: str, resume: str) -> dict:
 global _next_id
 candidate = {
 "id": _next_id,
 "name": name.strip(),
 "experience": experience.strip(),
 "resume": resume.strip(),
 "added": date.today().isoformat(),

}

 _candidates.insert(0, candidate)
 _next_id += 1
 return _to_response(candidate)

def delete(candidate_id: int) -> bool:
 global _candidates
 before = len(_candidates)
 _candidates = [c for c in _candidates if c["id"] != candidate_id]
 return len(_candidates) < before

def count() -> int:
 return len(_candidates) 