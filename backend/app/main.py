from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import *

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FireMeet API",
    description="Backend API for FireMeet Meeting Platform",
    version="1.0.0"
)

from app.routes import meetings_router, actions_router, transcripts_router
app.include_router(meetings_router)
app.include_router(actions_router)
app.include_router(transcripts_router)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to FireMeet API"}
