from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum
class SocialMediaType(str, enum.Enum):
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    THREADS = "threads"
    TIKTOK = "tiktok"

user_organization = Table(
    'user_organization',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('organization_id', Integer, ForeignKey('organizations.id'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships
    organizations = relationship("Organization", secondary=user_organization, back_populates="users")
    owned_organizations = relationship("Organization", back_populates="owner")
    social_media_accounts = relationship("SocialMedia", back_populates="user")
    posts = relationship("Post", back_populates="author")

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships
    owner = relationship("User", back_populates="owned_organizations")
    users = relationship("User", secondary=user_organization, back_populates="organizations")
    social_media_accounts = relationship("SocialMedia", back_populates="organization")

class SocialMedia(Base):
    __tablename__ = "social_media"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(SQLEnum(SocialMediaType))
    account_name = Column(String)
    access_token = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships
    user = relationship("User", back_populates="social_media_accounts")
    organization = relationship("Organization", back_populates="social_media_accounts")
    posts = relationship("Post", back_populates="social_media")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    social_media_id = Column(Integer, ForeignKey("social_media.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String)  # draft, scheduled, published
    scheduled_time = Column(DateTime(timezone=True))
    published_time = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships
    social_media = relationship("SocialMedia", back_populates="posts")
    author = relationship("User", back_populates="posts")