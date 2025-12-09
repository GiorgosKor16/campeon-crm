from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from database.database import get_db, init_db
from database.models import Offer, Translation
from api.schemas import OfferCreate, OfferResponse, TranslationsListCreate, JSONOutput
from services.currency_service import get_all_currency_conversions

router = APIRouter()

# Initialize DB on startup
init_db()

# ============= OFFERS =============


@router.post("/offers", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(offer: OfferCreate, db: Session = Depends(get_db)):
    """Create a new offer with automatic currency conversions"""
    currency_conversions = get_all_currency_conversions(offer.min_deposit_eur)

    db_offer = Offer(
        name=offer.name,
        offer_type=offer.offer_type,
        bonus_percentage=offer.bonus_percentage,
        min_deposit_eur=offer.min_deposit_eur,
        wagering_multiplier=offer.wagering_multiplier,
        description=offer.description,
        currency_conversions=currency_conversions,
    )

    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer


@router.get("/offers", response_model=List[OfferResponse])
def list_offers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all offers"""
    offers = db.query(Offer).offset(skip).limit(limit).all()
    return offers


@router.get("/offers/{offer_id}", response_model=OfferResponse)
def get_offer(offer_id: int, db: Session = Depends(get_db)):
    """Get a specific offer"""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@router.put("/offers/{offer_id}", response_model=OfferResponse)
def update_offer(offer_id: int, offer_update: OfferCreate, db: Session = Depends(get_db)):
    """Update an offer"""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer_update.min_deposit_eur != offer.min_deposit_eur:
        offer.currency_conversions = get_all_currency_conversions(
            offer_update.min_deposit_eur)

    offer.name = offer_update.name
    offer.offer_type = offer_update.offer_type
    offer.bonus_percentage = offer_update.bonus_percentage
    offer.min_deposit_eur = offer_update.min_deposit_eur
    offer.wagering_multiplier = offer_update.wagering_multiplier
    offer.description = offer_update.description
    offer.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(offer)
    return offer


@router.delete("/offers/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offer(offer_id: int, db: Session = Depends(get_db)):
    """Delete an offer"""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    db.delete(offer)
    db.commit()

# ============= TRANSLATIONS =============


@router.post("/offers/{offer_id}/translations", status_code=status.HTTP_201_CREATED)
def add_translations(offer_id: int, translations_data: TranslationsListCreate, db: Session = Depends(get_db)):
    """Add translations for an offer"""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    db.query(Translation).filter(Translation.offer_id == offer_id).delete()

    for trans in translations_data.translations:
        db_translation = Translation(
            offer_id=offer_id,
            language=trans.get("language"),
            offer_name=trans.get("offer_name"),
            offer_description=trans.get("offer_description"),
        )
        db.add(db_translation)

    db.commit()
    return {"message": "Translations added successfully"}


@router.get("/offers/{offer_id}/translations")
def get_translations(offer_id: int, db: Session = Depends(get_db)):
    """Get all translations for an offer"""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    translations = db.query(Translation).filter(
        Translation.offer_id == offer_id).all()
    return translations

# ============= JSON GENERATION =============


@router.get("/offers/{offer_id}/json", response_model=JSONOutput)
def generate_json(offer_id: int, db: Session = Depends(get_db)):
    """Generate complete JSON for an offer with all translations"""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    translations_list = db.query(Translation).filter(
        Translation.offer_id == offer_id).all()
    translations_dict = {}
    for trans in translations_list:
        translations_dict[trans.language] = {
            "name": trans.offer_name,
            "description": trans.offer_description,
        }

    min_deposits = {}
    if offer.currency_conversions:
        min_deposits = offer.currency_conversions

    return JSONOutput(
        offer_id=offer.id,
        offer_name=offer.name,
        offer_type=offer.offer_type,
        bonus_percentage=offer.bonus_percentage,
        wagering_multiplier=offer.wagering_multiplier,
        min_deposits=min_deposits,
        translations=translations_dict,
        generated_at=datetime.utcnow(),
    )
