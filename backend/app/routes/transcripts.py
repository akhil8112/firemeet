from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.meeting import TranscriptSegmentResponse
from app.models.meeting import TranscriptSegment

router = APIRouter(prefix="/api/transcript", tags=["transcripts"])

from pydantic import BaseModel
class TranscriptSegmentUpdate(BaseModel):
    text: str
    
@router.put("/{transcript_id}", response_model=TranscriptSegmentResponse)
def update_transcript_segment(transcript_id: int, transcript_update: TranscriptSegmentUpdate, db: Session = Depends(get_db)):
    segment = db.query(TranscriptSegment).filter(TranscriptSegment.id == transcript_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Transcript segment not found")
    
    segment.text = transcript_update.text
    db.commit()
    db.refresh(segment)
    return segment
