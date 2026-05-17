from pydantic import BaseModel, Field


class CandidateCreate(BaseModel):
    name: str = Field(..., min_length=1)
    experience: str
    resume: str = Field(..., min_length=10)


class AnalysisResult(BaseModel):
    score: int
    recommendation: str
    badge: str
    matched: list[str]
    exp_bonus: int


class CandidateResponse(BaseModel):
    id: int
    name: str
    experience: str
    resume: str
    added: str
    score: int
    recommendation: str
    badge: str
    matched_skills: list[str]
    exp_bonus: int


class AnalyzeResponse(BaseModel):
    id: int
    name: str
    experience: str
    resume: str
    added: str
    score: int
    recommendation: str
    badge: str
    matched_skills: list[str]
    exp_bonus: int


class DeleteResponse(BaseModel):
    message: str
    remaining: int
