from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from pydantic import BaseModel, Field

from app.db import engine, Base, SessionLocal
from app.models import Process

app = FastAPI(title="Process Portal")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_schema():
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        cols = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='processes'")).fetchall()
        colnames = {c[0] for c in cols}
        if "diagram_json" not in colnames:
            conn.execute(text("ALTER TABLE processes ADD COLUMN diagram_json TEXT DEFAULT ''"))

class ProcessCreate(BaseModel):
    process_key: str = Field(min_length=3, max_length=64)
    name: str
    trigger: str = ""
    outcome: str = ""
    description: str = ""

class DiagramUpdate(BaseModel):
    diagram_json: str

@app.on_event("startup")
def startup():
    ensure_schema()

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/processes")
def list_processes(db: Session = Depends(get_db)):
    rows = db.execute(select(Process).order_by(Process.name)).scalars().all()
    return [
        {
            "id": p.id,
            "process_key": p.process_key,
            "name": p.name,
            "trigger": p.trigger,
            "outcome": p.outcome
        } for p in rows
    ]

@app.get("/processes/options")
def process_options(db: Session = Depends(get_db)):
    rows = db.execute(select(Process).order_by(Process.name)).scalars().all()
    return [{"id": p.id, "name": p.name, "process_key": p.process_key} for p in rows]

@app.post("/processes")
def create_process(payload: ProcessCreate, db: Session = Depends(get_db)):
    existing = db.execute(select(Process).where(Process.process_key == payload.process_key)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="process_key already exists")

    p = Process(
        process_key=payload.process_key,
        name=payload.name,
        trigger=payload.trigger,
        outcome=payload.outcome,
        description=payload.description,
        diagram_json=""
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id}

@app.get("/processes/{process_id}")
def get_process(process_id: int, db: Session = Depends(get_db)):
    p = db.get(Process, process_id)
    if not p:
        raise HTTPException(status_code=404, detail="process not found")
    return {
        "id": p.id,
        "process_key": p.process_key,
        "name": p.name,
        "description": p.description,
        "trigger": p.trigger,
        "outcome": p.outcome,
        "diagram_json": p.diagram_json or ""
    }

@app.put("/processes/{process_id}/diagram")
def update_diagram(process_id: int, payload: DiagramUpdate, db: Session = Depends(get_db)):
    p = db.get(Process, process_id)
    if not p:
        raise HTTPException(status_code=404, detail="process not found")
    p.diagram_json = payload.diagram_json
    db.commit()
    return {"ok": True}
