from fastapi import APIRouter

router = APIRouter()

@router.get("/processes")
def list_processes():
    return []
