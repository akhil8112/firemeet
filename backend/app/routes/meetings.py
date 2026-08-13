from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.meeting import (
    MeetingCreate, MeetingUpdate, MeetingResponse, MeetingDetailResponse,
    TranscriptSegmentResponse, SummaryResponse, ActionItemResponse, ActionItemCreate
)
from app.services import meeting_service

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

@router.get("", response_model=List[MeetingResponse])
def read_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return meeting_service.get_meetings(db, skip=skip, limit=limit)

@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
def read_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = meeting_service.get_meeting(db, meeting_id=meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.post("", response_model=MeetingResponse)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    return meeting_service.create_meeting(db=db, meeting=meeting)

@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: int, meeting_update: MeetingUpdate, db: Session = Depends(get_db)):
    updated_meeting = meeting_service.update_meeting(db, meeting_id, meeting_update)
    if updated_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return updated_meeting

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    success = meeting_service.delete_meeting(db, meeting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"message": "Meeting deleted successfully"}

# Transcripts
@router.get("/{meeting_id}/transcript", response_model=List[TranscriptSegmentResponse])
def read_transcript(meeting_id: int, db: Session = Depends(get_db)):
    return meeting_service.get_transcript(db, meeting_id=meeting_id)

from pydantic import BaseModel
import re

class RawTranscriptUpload(BaseModel):
    raw_text: str

@router.post("/{meeting_id}/transcript/raw")
def upload_raw_transcript(meeting_id: int, payload: RawTranscriptUpload, db: Session = Depends(get_db)):
    lines = payload.raw_text.split('\n')
    # Expected format: [00:15] John: Let's discuss...
    # Regex to match: \[(\d{2}):(\d{2})\]\s*(.*?):\s*(.*)
    pattern = re.compile(r'\[(\d{2}):(\d{2})\]\s*(.*?):\s*(.*)')
    
    from app.schemas.meeting import TranscriptSegmentCreate
    
    count = 0
    for line in lines:
        line = line.strip()
        if not line:
            continue
        match = pattern.match(line)
        if match:
            mins = int(match.group(1))
            secs = int(match.group(2))
            speaker = match.group(3).strip()
            text = match.group(4).strip()
            
            timestamp = (mins * 60) + secs
            segment = TranscriptSegmentCreate(speaker=speaker, timestamp=timestamp, text=text)
            meeting_service.add_transcript_segment(db, meeting_id, segment)
            count += 1
            
    return {"message": f"Successfully parsed and saved {count} transcript segments"}

# Summaries
@router.get("/{meeting_id}/summary", response_model=SummaryResponse)
def read_summary(meeting_id: int, db: Session = Depends(get_db)):
    summary = meeting_service.get_summary(db, meeting_id=meeting_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary

# Action Items for a meeting
@router.get("/{meeting_id}/actions", response_model=List[ActionItemResponse])
def read_action_items(meeting_id: int, db: Session = Depends(get_db)):
    return meeting_service.get_action_items(db, meeting_id=meeting_id)

@router.post("/{meeting_id}/actions", response_model=ActionItemResponse)
def create_action_item(meeting_id: int, action: ActionItemCreate, db: Session = Depends(get_db)):
    return meeting_service.create_action_item(db, meeting_id, action)
