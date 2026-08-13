from sqlalchemy.orm import Session
from app.models.meeting import Meeting, Participant, TranscriptSegment, Summary, Topic, ActionItem
from app.schemas.meeting import MeetingCreate, MeetingUpdate, ActionItemCreate, ActionItemUpdate, TranscriptSegmentCreate

# --- Meetings ---
def get_meetings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Meeting).order_by(Meeting.date.desc()).offset(skip).limit(limit).all()

def get_meeting(db: Session, meeting_id: int):
    return db.query(Meeting).filter(Meeting.id == meeting_id).first()

def create_meeting(db: Session, meeting: MeetingCreate):
    db_meeting = Meeting(title=meeting.title, date=meeting.date, duration=meeting.duration)
    
    # Handle participants
    for name in meeting.participant_names:
        # Check if participant exists
        db_participant = db.query(Participant).filter(Participant.name == name).first()
        if not db_participant:
            db_participant = Participant(name=name)
        db_meeting.participants.append(db_participant)
        
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def update_meeting(db: Session, meeting_id: int, meeting_update: MeetingUpdate):
    db_meeting = get_meeting(db, meeting_id)
    if not db_meeting:
        return None
    
    update_data = meeting_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_meeting, key, value)
        
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def delete_meeting(db: Session, meeting_id: int):
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        db.delete(db_meeting)
        db.commit()
        return True
    return False

# --- Transcripts ---
def get_transcript(db: Session, meeting_id: int):
    return db.query(TranscriptSegment).filter(TranscriptSegment.meeting_id == meeting_id).order_by(TranscriptSegment.timestamp.asc()).all()

def add_transcript_segment(db: Session, meeting_id: int, segment: TranscriptSegmentCreate):
    db_segment = TranscriptSegment(**segment.model_dump(), meeting_id=meeting_id)
    db.add(db_segment)
    db.commit()
    db.refresh(db_segment)
    return db_segment

# --- Actions ---
def get_action_items(db: Session, meeting_id: int):
    return db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()

def create_action_item(db: Session, meeting_id: int, action: ActionItemCreate):
    db_action = ActionItem(**action.model_dump(), meeting_id=meeting_id)
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

def update_action_item(db: Session, action_id: int, action_update: ActionItemUpdate):
    db_action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if not db_action:
        return None
    
    update_data = action_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_action, key, value)
        
    db.commit()
    db.refresh(db_action)
    return db_action

def delete_action_item(db: Session, action_id: int):
    db_action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if db_action:
        db.delete(db_action)
        db.commit()
        return True
    return False

# --- Summary ---
def get_summary(db: Session, meeting_id: int):
    return db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
