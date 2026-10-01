from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.api import router 
import sys
import os
from . import db  
sys.path.append(os.path.dirname(os.path.abspath(__file__))) 

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
db.initialize()
app = FastAPI(title="EduPilot AI", version="1.0.0", description="Personalized learning roadmaps with AI planning, retrieval, and difficulty prediction")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "EduPilot AI"}
