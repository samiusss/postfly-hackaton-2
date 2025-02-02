from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
router = APIRouter()
@router.post("/", response_model=schemas.SocialMedia)
def create_social_media(
        social_media: schemas.SocialMediaCreate,
        db: Session = Depends(get_db),
        current_user_id: int = 1  # TODO: Replace with actual auth
):
    db_social = models.SocialMedia(
        **social_media.dict(),
        user_id=current_user_id
    )
    db.add(db_social)
    db.commit()
    db.refresh(db_social)
    return db_social
@router.get("/", response_model=List[schemas.SocialMedia])
def read_social_media_accounts(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    accounts = db.query(models.SocialMedia).offset(skip).limit(limit).all()
    return accounts
@router.get("/{account_id}", response_model=schemas.SocialMedia)
def read_social_media_account(account_id: int, db: Session = Depends(get_db)):
    db_account = db.query(models.SocialMedia).filter(models.SocialMedia.id == account_id).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Social media account not found")
    return db_account