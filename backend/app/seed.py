import json
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Process, Step, Tool, StepTool

SEED_PATH = Path("/app/seed/osticket_processes.json")

def seed_if_empty(db: Session) -> None:
    existing = db.scalar(select(Process.id).limit(1))
    if existing:
        return

    data = json.loads(SEED_PATH.read_text(encoding="utf-8"))

    tools_by_key: dict[str, Tool] = {}
    for t in data.get("tools", []):
        tool = Tool(tool_key=t["tool_key"], name=t["name"], purpose=t.get("purpose", ""))
        db.add(tool)
        db.flush()
        tools_by_key[tool.tool_key] = tool

    for p in data.get("processes", []):
        proc = Process(
            process_key=p["process_key"],
            name=p["name"],
            description=p.get("description", ""),
            trigger=p.get("trigger", ""),
            outcome=p.get("outcome", "")
        )
        db.add(proc)
        db.flush()

        for i, s in enumerate(p.get("steps", []), start=1):
            step = Step(
                process_id=proc.id,
                step_order=i,
                title=s["title"],
                details=s.get("details", ""),
                artifact_of_record=s.get("artifact_of_record", "")
            )
            db.add(step)
            db.flush()

            for u in s.get("tools", []):
                tool = tools_by_key[u["tool_key"]]
                db.add(StepTool(step_id=step.id, tool_id=tool.id, usage=u.get("usage", "")))

    db.commit()
