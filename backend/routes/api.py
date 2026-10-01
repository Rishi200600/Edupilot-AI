from typing import Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend import db
from backend.agent.planner import generate_roadmap
from backend.models.predictor import predict_difficulty
from backend.rag.retriever import retrieve

router = APIRouter()

class RoadmapRequest(BaseModel):
    goal: str = Field(min_length=3, max_length=500)
    level: Literal["beginner", "intermediate", "advanced"] = "beginner"
    hours_per_week: float = Field(default=7, ge=1, le=60)
    duration_weeks: int | None = Field(default=None, ge=1, le=24)

class PredictRequest(BaseModel):
    hours_per_week: float = Field(ge=1, le=60)
    prior_experience: float = Field(ge=0, le=1)
    goal_complexity: float = Field(ge=0, le=1)
    duration_weeks: int = Field(ge=1, le=52)

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)

class TaskRequest(BaseModel):
    completed: bool

@router.post("/generate-roadmap")
def roadmap(request: RoadmapRequest):
    return generate_roadmap(request.goal, request.level, request.hours_per_week, request.duration_weeks)

@router.post("/predict")
def predict(request: PredictRequest):
    return predict_difficulty(request.hours_per_week, request.prior_experience, request.goal_complexity, request.duration_weeks)

@router.post("/chat")
def chat(request: ChatRequest):
    return {"reply": "I can turn a learning goal into a week-by-week plan. Tell me what you want to learn, your timeframe, and roughly how many hours you can study each week.", "resources": retrieve(request.message, limit=3), "suggestion": "Use Generate roadmap to create and track your plan."}

@router.get("/roadmaps")
def roadmaps():
    return {"roadmaps": db.list_roadmaps()}

@router.get("/roadmaps/{roadmap_id}/progress")
def progress(roadmap_id: str):
    result = db.get_progress(roadmap_id)
    if result is None: raise HTTPException(status_code=404, detail="Roadmap not found")
    total, done = len(result), sum(result.values())
    return {"completed": result, "done": done, "total": total, "percent": round(done * 100 / total) if total else 0}

@router.put("/roadmaps/{roadmap_id}/tasks/{task_id}")
def update_task(roadmap_id: str, task_id: str, request: TaskRequest):
    if not db.set_task(roadmap_id, task_id, request.completed): raise HTTPException(status_code=404, detail="Roadmap or task not found")
    return progress(roadmap_id)
