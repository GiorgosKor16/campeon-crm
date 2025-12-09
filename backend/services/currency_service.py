# Currency reference sheet - easily editable
# Base currency is EUR
CURRENCY_REFERENCE = {
    "EUR": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "USD": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "GBP": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "CAD": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "AUD": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "NZD": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "BRL": {"rate": 2.0, "min_deposit": 50, "max_deposit": 600},
    "NOK": {"rate": 10.0, "min_deposit": 250, "max_deposit": 3000},
    "PEN": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "CLP": {"rate": 800.0, "min_deposit": 20000, "max_deposit": 240000},
    "MXN": {"rate": 6.0, "min_deposit": 150, "max_deposit": 1800},
    "CHF": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "ZAR": {"rate": 10.0, "min_deposit": 250, "max_deposit": 300},
    "PLN": {"rate": 4.0, "min_deposit": 100, "max_deposit": 1200},
    "AZN": {"rate": 1.0, "min_deposit": 25, "max_deposit": 300},
    "TRY": {"rate": 10.0, "min_deposit": 250, "max_deposit": 3000},
    "JPY": {"rate": 150.0, "min_deposit": 3750, "max_deposit": 45000},
    "KZT": {"rate": 150.0, "min_deposit": 3750, "max_deposit": 45000},
    "RUB": {"rate": 50.0, "min_deposit": 1250, "max_deposit": 15000},
    "UZS": {"rate": 10000.0, "min_deposit": 250000, "max_deposit": 3000000},
}

LANGUAGES = [
    "en", "de", "fi", "no", "fr", "pt", "es", "it", "pl", "ru", "tr", "az"
]

LANGUAGE_CURRENCY_VARIANTS = {
    # Language: [list of currency variants for that language]
    "en": ["USD_en", "GBP_en", "AUD_en", "NZD_en", "CAD_en", "UZS_en", "NGN_en"],
    "no": ["NOK_no"],
    "pt": ["BRL_pt"],
    "pl": ["EUR_pl", "PLN_pl"],
    "es": ["CLP_es"],
    "ru": ["AZN_ru", "RUB_ru", "KZT_ru", "UZS_ru"],
    "az": ["AZN_az"],
    "tr": ["TRY_tr", "AZN_tr"],
    "fr": ["CAD_fr"],
}


def convert_eur_to_currency(eur_amount: float, currency: str) -> float:
    """Convert EUR amount to specified currency using reference sheet"""
    if currency not in CURRENCY_REFERENCE:
        return eur_amount
    rate = CURRENCY_REFERENCE[currency]["rate"]
    return round(eur_amount * rate)


def get_all_currency_conversions(eur_amount: float) -> dict:
    """Convert EUR amount to all currencies"""
    conversions = {}
    for currency in CURRENCY_REFERENCE.keys():
        conversions[currency] = convert_eur_to_currency(eur_amount, currency)
    return conversions


def get_all_currencies():
    """Get list of all supported currencies"""
    return list(CURRENCY_REFERENCE.keys())


def get_all_languages():
    """Get list of all supported languages"""
    return LANGUAGES


def get_currency_variants_for_language(language: str):
    """Get all currency variants for a specific language"""
    return LANGUAGE_CURRENCY_VARIANTS.get(language, [])
