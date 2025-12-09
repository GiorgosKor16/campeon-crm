"""
JSON Generator - Transforms bonus template data into the final JSON output format
matching the config.json structure with all translations and currency conversions.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from database.models import BonusTemplate, BonusTranslation
from services.currency_service import (
    LANGUAGE_CURRENCY_VARIANTS,
    LANGUAGES,
    convert_eur_to_currency,
    CURRENCY_REFERENCE
)


def generate_bonus_json(template_id: str, db: Session) -> Optional[Dict[str, Any]]:
    """
    Generate complete bonus JSON from template and translations.
    Matches the structure of config.json.
    """

    # Fetch template
    template = db.query(BonusTemplate).filter(
        BonusTemplate.id == template_id
    ).first()

    if not template:
        return None

    # Fetch all translations
    translations = db.query(BonusTranslation).filter(
        BonusTranslation.template_id == template_id
    ).all()

    # Build translation dictionaries
    trigger_name = template.trigger_name or {}
    trigger_description = template.trigger_description or {}

    # Add translations to dictionaries
    for trans in translations:
        key = f"{trans.currency}_{trans.language}" if trans.currency else trans.language
        trigger_name[key] = trans.name
        trigger_description[key] = trans.description

    # Build minimum amounts with currency conversions
    minimum_amount = template.minimum_amount or {}
    if '*' not in minimum_amount and 'EUR' in minimum_amount:
        minimum_amount['*'] = minimum_amount['EUR']

    # Build maximum amounts with currency conversions
    maximum_amount = template.maximum_amount or {}
    if '*' not in maximum_amount and 'EUR' in maximum_amount:
        maximum_amount['*'] = maximum_amount['EUR']

    # Build stake limits
    minimum_stake = template.minimum_stake_to_wager or {'*': 0.5}
    maximum_stake = template.maximum_stake_to_wager or {'*': 5}
    maximum_withdraw = template.maximum_withdraw or {'*': 3}

    # Ensure all have '*' key
    if '*' not in minimum_stake:
        minimum_stake['*'] = 0.5
    if '*' not in maximum_stake:
        maximum_stake['*'] = 5
    if '*' not in maximum_withdraw:
        maximum_withdraw['*'] = 3

    # Build the complete JSON structure matching config.json
    bonus_json = {
        "id": template.id,
        "schedule": {
            "type": template.schedule_type,
            "from": template.schedule_from,
            "to": template.schedule_to
        },
        "trigger": {
            "name": trigger_name,
            "description": trigger_description,
            "minimumAmount": minimum_amount,
            "iterations": template.trigger_iterations,
            "type": template.trigger_type,
            "duration": template.trigger_duration
        },
        "config": {
            "minimumStakeToWager": minimum_stake,
            "maximumStakeToWager": maximum_stake,
            "compensateOverspending": template.compensate_overspending,
            "maximumAmount": maximum_amount,
            "percentage": template.percentage,
            "wageringMultiplier": template.wagering_multiplier,
            "includeAmountOnTargetWagerCalculation": template.include_amount_on_target_wager,
            "capCalculationAmountToMaximumBonus": template.cap_calculation_to_maximum,
            "type": template.bonus_type,
            "withdrawActive": template.withdraw_active,
            "category": template.category,
            "provider": template.provider,
            "brand": template.brand,
            "maximumWithdraw": maximum_withdraw
        }
    }

    return bonus_json


def generate_bonus_json_with_currencies(template_id: str, db: Session) -> Optional[Dict[str, Any]]:
    """
    Generate bonus JSON with automatic currency conversions.
    For each base EUR value, creates entries for all supported currencies.
    """

    base_json = generate_bonus_json(template_id, db)
    if not base_json:
        return None

    # Get template for detailed info
    template = db.query(BonusTemplate).filter(
        BonusTemplate.id == template_id
    ).first()

    # Start with base JSON
    extended_json = base_json.copy()

    # Get EUR base values
    eur_min_amount = base_json["trigger"]["minimumAmount"].get("EUR", 25)
    eur_max_amount = base_json["config"]["maximumAmount"].get("EUR", 300)
    eur_min_stake = base_json["config"]["minimumStakeToWager"].get("*", 0.5)
    eur_max_stake = base_json["config"]["maximumStakeToWager"].get("*", 5)

    # Convert to all currencies
    for currency in CURRENCY_REFERENCE.keys():
        if currency == "EUR":
            continue

        # Convert amounts
        min_converted = convert_eur_to_currency(eur_min_amount, currency)
        max_converted = convert_eur_to_currency(eur_max_amount, currency)

        # Add to minimumAmount
        extended_json["trigger"]["minimumAmount"][currency] = min_converted

        # Add to maximumAmount
        extended_json["config"]["maximumAmount"][currency] = max_converted

    return extended_json


def format_bonus_json_for_output(bonus_json: Dict[str, Any], pretty: bool = True) -> str:
    """Format bonus JSON as string for output"""
    import json
    if pretty:
        return json.dumps(bonus_json, indent=2, ensure_ascii=False)
    else:
        return json.dumps(bonus_json, ensure_ascii=False)
