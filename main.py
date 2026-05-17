from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from models import AnalyzeResponse, CandidateCreate, CandidateResponse, DeleteResponse
from store import add, count, delete, get_all

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

app = FastAPI(title="AI HR Screening System", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/candidates", response_model=list[CandidateResponse])
def list_candidates():
    return get_all()


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_candidate(body: CandidateCreate):
    result = add(body.name, body.experience, body.resume)
    return result


@app.delete("/candidate/{candidate_id}", response_model=DeleteResponse)
def remove_candidate(candidate_id: int):
    if not delete(candidate_id):
        raise HTTPException(status_code=404, detail="Candidate not found")
    return DeleteResponse(
        message=f"Candidate {candidate_id} deleted successfully",
        remaining=count(),
    )


@app.get("/")
def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")


app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")
