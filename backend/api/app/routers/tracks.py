"""Tracks API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
from dependencies import get_db

# pylint: disable=invalid-name

router = APIRouter(prefix="/api/users/{user_id}/tracks", tags=["tracks"])


@router.get("/{track_id}", response_model=schemas.Track)
def read_user_track(
    user_id: int,
    track_id: int,
    db: Session = Depends(get_db),
):
    """Get a track for a user"""
    track = crud.get_user_track(db, track_id=track_id, user_id=user_id)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")
    return track


@router.get("/", response_model=list[schemas.Track])
def read_user_tracks(
    user_id: int, db: Session = Depends(get_db), skip: int = 0, limit: int = 100
):
    """Get multiple tracks for a user"""
    tracks = crud.get_user_tracks(db, user_id=user_id, skip=skip, limit=limit)
    return tracks


@router.post("/", response_model=schemas.Track)
def create_track_for_user(
    user_id: int,
    algorithm_id: int,
    track: schemas.TrackCreate,
    db: Session = Depends(get_db),
):
    """Create a new track for a user"""
    return crud.create_user_track(
        db=db, track=track, user_id=user_id, algorithm_id=algorithm_id
    )


@router.delete("/{track_id}", response_model=schemas.Track)
def delete_user_track(track_id: int, user_id: int, db: Session = Depends(get_db)):
    """Delete a user's track"""
    db_track = crud.delete_user_track(db, track_id=track_id, user_id=user_id)
    if db_track is None:
        raise HTTPException(status_code=404, detail="Track not found")
    return db_track
