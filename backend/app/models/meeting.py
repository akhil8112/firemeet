from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

# Association table for Many-to-Many between Meeting and Participant
meeting_participants = Table(
    'meeting_participants',
    Base.metadata,
    Column('meeting_id', Integer, ForeignKey('meetings.id'), primary_key=True),
    Column('participant_id', Integer, ForeignKey('participants.id'), primary_key=True)
)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    duration = Column(Integer)  # duration in minutes or seconds
    
    # Relationships
    participants = relationship("Participant", secondary=meeting_participants, back_populates="meetings")
    transcript_segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan")
    summary = relationship("Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    
    # Relationships
    meetings = relationship("Meeting", secondary=meeting_participants, back_populates="participants")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    speaker = Column(String, index=True)
    timestamp = Column(Integer)  # store as seconds or milliseconds
    text = Column(Text)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="transcript_segments")

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), unique=True)
    overview = Column(Text)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="summary")
    topics = relationship("Topic", back_populates="summary", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    summary_id = Column(Integer, ForeignKey("summaries.id"))
    name = Column(String)
    
    # Relationships
    summary = relationship("Summary", back_populates="topics")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    description = Column(String)
    assigned_to = Column(String)  # Could also be a ForeignKey to Participant
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")
