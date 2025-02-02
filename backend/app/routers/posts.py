from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
router = APIRouter()
@router.post("/", response_model=schemas.Post)
def create_post(
        post: schemas.PostCreate,
        db: Session = Depends(get_db),
        current_user_id: int = 1  # TODO: Replace with actual auth
):
    db_post = models.Post(
        **post.dict(),
        author_id=current_user_id,
        status="draft"
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post
@router.get("/", response_model=List[schemas.Post])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(models.Post).offset(skip).limit(limit).all()
    return posts
@router.get("/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post