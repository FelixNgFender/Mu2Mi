"""Pydantic schemas for API operations, used for data validation, conversion, and documentation."""


from datetime import datetime
from pydantic import BaseModel

# pylint: disable=too-few-public-methods


class TrackBase(BaseModel):
    """Common track attributes when creating/reading tracks"""

    name: str
    created_at: datetime | None = None
    tempo: int
    vocal_track_url: str | None = None
    accompaniment_track_url: str | None = None
    bass_track_url: str | None = None
    drum_track_url: str | None = None
    guitar_track_url: str | None = None
    piano_track_url: str | None = None
    midi_vocal_url: str | None = None
    midi_accompaniment_url: str | None = None
    midi_bass_url: str | None = None
    midi_drum_url: str | None = None
    midi_guitar_url: str | None = None
    midi_piano_url: str | None = None


class TrackCreate(TrackBase):
    """Attributes that won't be sent from the API when reading a track"""

    # pylint: disable=unnecessary-pass
    pass


class Track(TrackBase):
    """Attributes that will be sent from the API when reading a track"""

    id: int
    algorithm_id: int
    user_id: int

    class Config:
        """Provide configuration for Pydantic model"""

        orm_mode = True


class UserBase(BaseModel):
    """Common user attributes when creating/reading users"""

    username: str
    email: str
    created_at: datetime | None = None


class UserCreate(UserBase):
    """Attributes that won't be sent from the API when reading a user"""

    password: str


class User(UserBase):
    """Attributes that will be sent from the API when reading a user"""

    id: int
    tracks: list[Track] = []

    class Config:
        """Provide configuration for Pydantic model"""

        orm_mode = True


class SplittingAlgorithmBase(BaseModel):
    """Common splitting algorithm attributes when creating/reading splitting algorithms"""

    name: str
    url: str


class SplittingAlgorithmCreate(SplittingAlgorithmBase):
    """Attributes that won't be sent from the API when reading a splitting algorithm"""

    # pylint: disable=unnecessary-pass
    pass


class SplittingAlgorithm(SplittingAlgorithmBase):
    """Attributes that will be sent from the API when reading a splitting algorithm"""

    id: int

    class Config:
        """Provide configuration for Pydantic model"""

        orm_mode = True
