from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.meeting import ActionItemUpdate, ActionItemResponse
from app.services import meeting_service

router = APIRouter(prefix="/api/actions", tags=["actions"])

@router.put("/{action_id}", response_model=ActionItemResponse)
def update_action_item(action_id: int, action_update: ActionItemUpdate, db: Session = Depends(get_db)):
    updated_action = meeting_service.update_action_item(db, action_id, action_update)
    if updated_action is None:
        raise HTTPException(status_code=404, detail="Action Item not found")
    return updated_action

@router.delete("/{action_id}")
def delete_action_item(action_id: int, db: Session = Depends(get_db)):
    success = meeting_service.delete_action_item(db, action_id)
    if not success:
        raise HTTPException(status_code=404, detail="Action Item not found")
    return {"message": "Action Item deleted successfully"}
