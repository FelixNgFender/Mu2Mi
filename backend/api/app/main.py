"""
[summary] Main file for the API.
[information] Path operations to define the API endpoints.
    @author: Felix Nguyen
    @email: ngthinh302@gmail.com
    @create: 2023-7-4
"""


from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine

# TODO: Change to Alembic for DB initialization and migrations
# pylint: disable=invalid-name

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Create a dependency
def get_db():
    """Get a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """Get a user by ID"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.get("/api/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get multiple users"""
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.post("/api/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.delete("/api/users/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user"""
    db_user = crud.delete_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.get("/api/users/{user_id}/tracks/{track_id}", response_model=schemas.Track)
def read_user_track(user_id: int, track_id: int, db: Session = Depends(get_db)):
    """Get a track for a user"""
    track = crud.get_user_track(db, track_id=track_id, user_id=user_id)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")
    return track


@app.get("/api/users/{user_id}/tracks/", response_model=list[schemas.Track])
def read_user_tracks(
    user_id: int, db: Session = Depends(get_db), skip: int = 0, limit: int = 100
):
    """Get multiple tracks for a user"""
    tracks = crud.get_user_tracks(db, user_id=user_id, skip=skip, limit=limit)
    return tracks


@app.post("/api/users/{user_id}/tracks/", response_model=schemas.Track)
def create_track_for_user(
    user_id: int, track: schemas.TrackCreate, db: Session = Depends(get_db)
):
    """Create a new track for a user"""
    return crud.create_user_track(db=db, track=track, user_id=user_id)


@app.delete("/api/users/{user_id}/tracks/{track_id}", response_model=schemas.Track)
def delete_user_track(track_id: int, user_id: int, db: Session = Depends(get_db)):
    """Delete a user's track"""
    db_track = crud.delete_user_track(db, track_id=track_id, user_id=user_id)
    if db_track is None:
        raise HTTPException(status_code=404, detail="Track not found")
    return db_track
