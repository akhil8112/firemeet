from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Participants ---
class ParticipantBase(BaseModel):
    name: str

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase):
    id: int
    class Config:
        from_attributes = True

# --- Transcript Segments ---
class TranscriptSegmentBase(BaseModel):
    speaker: str
    timestamp: int
    text: str

class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass

class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: int
    meeting_id: int
    class Config:
        from_attributes = True

# --- Action Items ---
class ActionItemBase(BaseModel):
    description: str
    assigned_to: str
    is_completed: bool = False

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    is_completed: Optional[bool] = None

class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int
    class Config:
        from_attributes = True

# --- Topics & Summary ---
class TopicBase(BaseModel):
    name: str

class TopicResponse(TopicBase):
    id: int
    class Config:
        from_attributes = True

class SummaryBase(BaseModel):
    overview: str

class SummaryResponse(SummaryBase):
    id: int
    meeting_id: int
    topics: List[TopicResponse] = []
    class Config:
        from_attributes = True

# --- Meetings ---
class MeetingBase(BaseModel):
    title: str
    date: datetime
    duration: int

class MeetingCreate(MeetingBase):
    participant_names: List[str] = []

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[int] = None

class MeetingResponse(MeetingBase):
    id: int
    participants: List[ParticipantResponse] = []
    class Config:
        from_attributes = True

class MeetingDetailResponse(MeetingResponse):
    transcript_segments: List[TranscriptSegmentResponse] = []
    summary: Optional[SummaryResponse] = None
    action_items: List[ActionItemResponse] = []
