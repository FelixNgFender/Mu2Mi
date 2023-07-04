"""
SQLAlchemy models for CRUD operations, used to define the structure and 
relationships of database tables.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from .database import Base

# pylint: disable=too-few-public-methods


class User(Base):
    """User model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    tracks = relationship("Track", back_populates="user")


class Track(Base):
    """Track model."""

    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    algorithm_id = Column(
        Integer, ForeignKey("splitting_algorithms.id"), nullable=False
    )
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())
    tempo = Column(Integer, nullable=False)
    vocal_track_url = Column(String(255))
    accompaniment_track_url = Column(String(255))
    bass_track_url = Column(String(255))
    drum_track_url = Column(String(255))
    guitar_track_url = Column(String(255))
    piano_track_url = Column(String(255))
    midi_vocal_url = Column(String(255))
    midi_accompaniment_url = Column(String(255))
    midi_bass_url = Column(String(255))
    midi_drum_url = Column(String(255))
    midi_guitar_url = Column(String(255))
    midi_piano_url = Column(String(255))

    user = relationship("User", back_populates="tracks")


class SplittingAlgorithm(Base):
    """Splitting algorithm model."""

    __tablename__ = "splitting_algorithms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(255), nullable=False)
