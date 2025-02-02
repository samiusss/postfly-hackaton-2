from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
router = APIRouter()
@router.post("/", response_model=schemas.Organization)
def create_organization(
        organization: schemas.OrganizationCreate,
        db: Session = Depends(get_db),
        current_user_id: int = 1  # TODO: Replace with actual auth
):
    db_org = models.Organization(
        **organization.dict(),
        owner_id=current_user_id
    )
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org
@router.get("/", response_model=List[schemas.Organization])
def read_organizations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    organizations = db.query(models.Organization).offset(skip).limit(limit).all()
    return organizations
@router.get("/{org_id}", response_model=schemas.Organization)
def read_organization(org_id: int, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if db_org is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db_org