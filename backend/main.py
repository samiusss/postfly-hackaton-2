from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import users, organizations, posts, social_media
app = FastAPI(title="Postflyr")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["organizations"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(social_media.router, prefix="/api/social-media", tags=["social-media"])
@app.get("/")
async def root():
    return {"message": "Welcome to Social Media Manager API"}

