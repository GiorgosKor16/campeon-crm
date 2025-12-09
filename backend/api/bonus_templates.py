"""
API endpoints for Bonus Templates
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database.database import get_db
from database.models import BonusTemplate, BonusTranslation
from api.schemas import BonusTemplateCreate, BonusTemplateResponse, BonusTranslationCreate, BonusJSONOutput
from services.json_generator import generate_bonus_json_with_currencies

router = APIRouter()


# ============= BONUS TEMPLATES =============

@router.post("/bonus-templates", response_model=BonusTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_bonus_template(template: BonusTemplateCreate, db: Session = Depends(get_db)):
    """Create a new bonus template"""

    # Check if template with this ID already exists
    existing = db.query(BonusTemplate).filter(
        BonusTemplate.id == template.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Template with ID '{template.id}' already exists"
        )

    # Create new template
    db_template = BonusTemplate(
        id=template.id,
        schedule_type=template.schedule_type,
        schedule_from=template.schedule_from,
        schedule_to=template.schedule_to,
        trigger_type=template.trigger_type,
        trigger_iterations=template.trigger_iterations,
        trigger_duration=template.trigger_duration,
        trigger_name=template.trigger_name,
        trigger_description=template.trigger_description,
        minimum_amount=template.minimum_amount,
        percentage=template.percentage,
        wagering_multiplier=template.wagering_multiplier,
        minimum_stake_to_wager=template.minimum_stake_to_wager,
        maximum_stake_to_wager=template.maximum_stake_to_wager,
        maximum_amount=template.maximum_amount,
        maximum_withdraw=template.maximum_withdraw,
        include_amount_on_target_wager=template.include_amount_on_target_wager,
        cap_calculation_to_maximum=template.cap_calculation_to_maximum,
        compensate_overspending=template.compensate_overspending,
        withdraw_active=template.withdraw_active,
        category=template.category,
        provider=template.provider,
        brand=template.brand,
        bonus_type=template.bonus_type,
    )

    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.get("/bonus-templates", response_model=List[BonusTemplateResponse])
def list_bonus_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all bonus templates"""
    templates = db.query(BonusTemplate).offset(skip).limit(limit).all()
    return templates


@router.get("/bonus-templates/{template_id}", response_model=BonusTemplateResponse)
def get_bonus_template(template_id: str, db: Session = Depends(get_db)):
    """Get a specific bonus template"""
    template = db.query(BonusTemplate).filter(
        BonusTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_id}' not found"
        )
    return template


@router.put("/bonus-templates/{template_id}", response_model=BonusTemplateResponse)
def update_bonus_template(template_id: str, template_update: BonusTemplateCreate, db: Session = Depends(get_db)):
    """Update a bonus template"""
    template = db.query(BonusTemplate).filter(
        BonusTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_id}' not found"
        )

    # Update fields
    for field, value in template_update.dict().items():
        setattr(template, field, value)

    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    return template


@router.delete("/bonus-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bonus_template(template_id: str, db: Session = Depends(get_db)):
    """Delete a bonus template"""
    template = db.query(BonusTemplate).filter(
        BonusTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_id}' not found"
        )

    db.delete(template)
    db.commit()
    return None


# ============= BONUS TRANSLATIONS =============

@router.post("/bonus-templates/{template_id}/translations", status_code=status.HTTP_201_CREATED)
def add_translation(template_id: str, translation: BonusTranslationCreate, db: Session = Depends(get_db)):
    """Add a translation for a bonus template"""

    # Check if template exists
    template = db.query(BonusTemplate).filter(
        BonusTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_id}' not found"
        )

    # Create translation
    db_translation = BonusTranslation(
        template_id=template_id,
        language=translation.language,
        currency=translation.currency,
        name=translation.name,
        description=translation.description,
    )

    db.add(db_translation)
    db.commit()
    db.refresh(db_translation)
    return db_translation


@router.get("/bonus-templates/{template_id}/translations", response_model=List[dict])
def get_translations(template_id: str, db: Session = Depends(get_db)):
    """Get all translations for a bonus template"""
    template = db.query(BonusTemplate).filter(
        BonusTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_id}' not found"
        )

    translations = db.query(BonusTranslation).filter(
        BonusTranslation.template_id == template_id).all()
    return translations


# ============= JSON GENERATION =============

@router.get("/bonus-templates/{template_id}/json", response_model=BonusJSONOutput)
def generate_template_json(template_id: str, db: Session = Depends(get_db)):
    """Generate the final JSON output for a bonus template with all translations and currency conversions"""

    json_output = generate_bonus_json_with_currencies(template_id, db)
    if not json_output:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_id}' not found"
        )

    return json_output
