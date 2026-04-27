from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectCreate(BaseModel):
    title: str
    niche: Optional[str] = None
    platform: Optional[str] = None
    content_type: Optional[str] = None

class ProjectOut(BaseModel):
    id: int
    user_id: int
    title: str
    niche: Optional[str]
    platform: Optional[str]
    content_type: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True