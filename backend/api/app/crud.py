"""CRUD utilities for interacting with the database"""
from sqlalchemy.orm import Session

from . import models, schemas

# pylint: disable=invalid-name


def get_user(db: Session, user_id: int):
    """Get a user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    """Get a user by email"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Get multiple users"""
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    """Create a new user"""
    # TODO: Implement real password hashing
    fake_password_hash = user.password + "notreallyhashed"
    db_user = models.User(
        username=user.username, email=user.email, password_hash=fake_password_hash
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    """Delete a user"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    db.delete(db_user)
    db.commit()
    return db_user


def get_user_track(db: Session, track_id: int, user_id: int):
    """Get a track for a user"""
    return (
        db.query(models.Track)
        .filter(models.Track.id == track_id, models.Track.user_id == user_id)
        .first()
    )


def get_user_tracks(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get multiple tracks for a user"""
    return (
        db.query(models.Track)
        .filter(models.Track.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_user_track(
    db: Session, track: schemas.TrackCreate, user_id: int, algorithm_id: int
):
    """Create a new track for a user"""
    db_item = models.Track(**track.dict(), user_id=user_id, algorithm_id=algorithm_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_user_track(db: Session, track_id: int, user_id: int):
    """Delete a track for a user"""
    db_item = (
        db.query(models.Track)
        .filter(models.Track.id == track_id, models.Track.user_id == user_id)
        .first()
    )
    if db_item is None:
        return None
    db.delete(db_item)
    db.commit()
    return db_item


def get_algorithm(db: Session, algorithm_id: int):
    """Get a splitting algorithm by ID"""
    return (
        db.query(models.SplittingAlgorithm)
        .filter(models.SplittingAlgorithm.id == algorithm_id)
        .first()
    )


def get_algorithms(db: Session, skip: int = 0, limit: int = 100):
    """Get multiple splitting algorithms"""
    return db.query(models.SplittingAlgorithm).offset(skip).limit(limit).all()
