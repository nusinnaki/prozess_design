# Prozess Design Portal (internal)

## Purpose
Internal process portal to document and visualize operational processes.
Processes are stored in PostgreSQL and edited via a browser UI. Diagrams are BPMN-like boxes and connectors (React Flow) stored as JSON.

## Stack
- Frontend: Next.js (App Router) + React Flow
- Backend: FastAPI
- DB: PostgreSQL (Docker container)
- Orchestration: docker compose

## Run locally
From repo root:

1) Start containers:
   docker compose -f infra/docker-compose.yml up --build

2) Frontend:
   http://localhost:3000

3) Backend health:
   curl http://localhost:8000/health

## High-level architecture
Browser -> Next.js frontend (port 3000)
Frontend -> FastAPI backend (port 8000)
Backend -> Postgres (port 5432 inside compose network)

Important networking detail:
- Browser must call: http://localhost:8000
- Frontend server-side (inside container) must call: http://backend:8000
This is handled via environment variables:
- NEXT_PUBLIC_API_BASE (browser)
- INTERNAL_API_BASE (server-side in container)

## Key folders
- frontend/
  - app/processes/page.tsx         Process list + link to create
  - app/processes/new/page.tsx     Create process form
  - app/processes/[id]/page.tsx    Process detail + diagram editor
  - app/components/DiagramEditor.tsx React Flow editor, Save writes diagram_json
  - app/components/EditableBoxNode.tsx Node UI (title, textarea, optional color)
  - lib/api.ts                     fetch wrapper (browser vs server base URLs)

- backend/
  - app/main.py                    FastAPI app, routes, schema init
  - app/models.py                  SQLAlchemy models (Process includes diagram_json)
  - app/db.py                      SQLAlchemy engine/session
  - app/seed.py                    Optional: initial seed import
  - seed/osticket_processes.json   Optional: seed dataset committed to git

- infra/
  - docker-compose.yml             Service wiring: db, backend, frontend

## Backend API (current)
- GET /health
  returns { "ok": true }

- GET /processes
  returns [{ id, process_key, name, trigger, outcome }, ...]

- POST /processes
  body: { process_key, name, trigger?, outcome?, description? }
  returns: { id }

- GET /processes/{id}
  returns { id, process_key, name, trigger, outcome, description, diagram_json, steps? }

- PUT /processes/{id}/diagram
  body: { diagram_json: string }
  stores diagram_json in DB

## Database model (current)
Primary table:
- processes
  - id (int)
  - process_key (unique, stable identifier)
  - name, trigger, outcome, description
  - diagram_json (stringified JSON: { nodes: [], edges: [] })

Optional tables (can be removed if not used):
- steps, tools, step_tools (only needed if you want relational step/tool reporting)

## Diagram JSON format
Stored in processes.diagram_json:
{
  "nodes": [
    { "id": "start", "type": "box", "position": { "x": 80, "y": 60 }, "data": { "title": "...", "text": "...", "bg": "#fff" } }
  ],
  "edges": [
    { "id": "e1", "source": "start", "target": "task1" }
  ]
}

## Common tasks for developers

### Add a new field to Process
1) Add column to backend/app/models.py Process
2) Add a small schema guard in backend startup (or add proper migrations later)
3) Expose field in GET /processes/{id}
4) Use in frontend as needed

### Change node UI (box design)
Edit:
- frontend/app/components/EditableBoxNode.tsx
This controls:
- text inputs
- textarea
- optional color

### Change editor behavior (add node types, save logic)
Edit:
- frontend/app/components/DiagramEditor.tsx

### Change seed dataset
Edit JSON:
- backend/seed/osticket_processes.json
Seeding runs only if DB is empty.

## Troubleshooting

### "ENOTFOUND backend" in frontend logs
Backend container is not running or INTERNAL_API_BASE points to a host that does not exist.
Check:
- docker compose ps
- docker compose logs backend
- infra/docker-compose.yml environment for frontend includes:
  INTERNAL_API_BASE=http://backend:8000

### Frontend shows "server-side exception" for /processes
Usually means backend fetch failed. Check:
- docker compose logs frontend --tail=200
- docker compose logs backend --tail=200

### POST /processes missing
main.py in backend does not include @app.post("/processes") or container not rebuilt.
Fix:
- update backend/app/main.py
- docker compose up --build

### DB state reset
If DB volume removed, seeded data re-imports. If not removed, seed does not run.
