from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import SocialMediaType
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
class UserCreate(UserBase):
    password: str
class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True
class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None
class OrganizationCreate(OrganizationBase):
    pass
class Organization(OrganizationBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True
class SocialMediaBase(BaseModel):
    platform: SocialMediaType
    account_name: str
class SocialMediaCreate(SocialMediaBase):
    access_token: str
    organization_id: int
class SocialMedia(SocialMediaBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True
class PostBase(BaseModel):
    content: str
    social_media_id: int
    scheduled_time: Optional[datetime]
class PostCreate(PostBase):
    pass
class Post(PostBase):
    id: int
    author_id: int
    status: str
    published_time: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True