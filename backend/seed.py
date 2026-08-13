from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.meeting import Meeting, Participant, TranscriptSegment, Summary, Topic, ActionItem

# Re-create all tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()

def create_seed_data():
    participants = ["Sarah", "John", "Mike", "Emily", "David", "Jessica"]
    db_participants = []
    
    for p in participants:
        db_p = Participant(name=p)
        db.add(db_p)
        db_participants.append(db_p)
    db.commit()
    
    meetings_data = [
        ("Product Strategy Meeting", 45, ["Sarah", "John", "Mike", "Emily", "David"]),
        ("Sprint Planning", 32, ["John", "Mike", "David", "Emily", "Sarah", "Jessica"]),
        ("Client Discovery Call", 60, ["Sarah", "Jessica"]),
        ("Marketing Review", 40, ["Emily", "David", "Sarah", "John"]),
        ("Engineering Architecture", 55, ["Mike", "John", "David"]),
        ("Weekly Team Sync", 30, participants),
        ("Q3 Business Review", 90, ["Sarah", "Emily", "Mike"]),
        ("Hiring Discussion", 45, ["Jessica", "Sarah", "John"])
    ]
    
    now = datetime.utcnow()
    
    for i, (title, duration, attendees) in enumerate(meetings_data):
        meeting_date = now - timedelta(days=i)
        
        # Create Meeting
        m = Meeting(title=title, duration=duration, date=meeting_date)
        for att in attendees:
            p = next((p for p in db_participants if p.name == att), None)
            if p:
                m.participants.append(p)
        db.add(m)
        db.commit()
        db.refresh(m)
        
        # Create Transcript Segments
        segments = [
            (attendees[0], 0, f"Welcome everyone. Let's start the {title}."),
            (attendees[1 % len(attendees)], 15, "Thanks. I've prepared some notes for this."),
            (attendees[2 % len(attendees)], 35, "I want to highlight a few key points."),
            (attendees[0], 60, "Let's summarize our action items.")
        ]
        
        for speaker, ts, text in segments:
            db.add(TranscriptSegment(meeting_id=m.id, speaker=speaker, timestamp=ts, text=text))
            
        # Create Summary
        summary = Summary(meeting_id=m.id, overview=f"The team discussed the main objectives for the {title}.")
        db.add(summary)
        db.commit()
        db.refresh(summary)
        
        # Create Topics
        db.add(Topic(summary_id=summary.id, name="Introductions"))
        db.add(Topic(summary_id=summary.id, name="Main Discussion"))
        db.add(Topic(summary_id=summary.id, name="Next Steps"))
        
        # Create Action Items
        db.add(ActionItem(meeting_id=m.id, description=f"Prepare documents for {title}", assigned_to=attendees[0], is_completed=False))
        db.add(ActionItem(meeting_id=m.id, description=f"Schedule follow-up", assigned_to=attendees[1 % len(attendees)], is_completed=True))
        
        db.commit()

create_seed_data()
print("Seed data successfully added.")
