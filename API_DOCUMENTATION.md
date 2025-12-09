# CAMPEON CRM API Documentation

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: Your deployed backend URL

---

## Authentication
Currently none (will be added later). All endpoints are public.

---

## Endpoints

### 1. Health Check
Check if API is running.

```http
GET /health
```

**Response (200 OK)**:
```json
{
  "status": "ok",
  "service": "CAMPEON CRM API"
}
```

---

### 2. Create Offer
Create a new casino offer with automatic currency conversions.

```http
POST /api/offers
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Black Friday Reload 200%",
  "offer_type": "reload",
  "bonus_percentage": 200,
  "min_deposit_eur": 20,
  "wagering_multiplier": 35,
  "description": "Reload your account with 200% bonus up to €300"
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "name": "Black Friday Reload 200%",
  "offer_type": "reload",
  "bonus_percentage": 200,
  "min_deposit_eur": 20,
  "wagering_multiplier": 35,
  "description": "Reload your account with 200% bonus up to €300",
  "currency_conversions": {
    "USD": 22,
    "GBP": 17.5,
    "EUR": 20,
    "CAD": 30,
    "AUD": 33,
    "BRL": 110
  },
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

**Field Descriptions**:
- `name` (string): Offer display name
- `offer_type` (string): Type - `deposit`, `reload`, `loyalty`, `cashback`, `free_spins`
- `bonus_percentage` (float): Bonus percentage (e.g., 200 for 200%)
- `min_deposit_eur` (float): Minimum deposit in EUR (base currency)
- `wagering_multiplier` (float): Wagering requirement multiplier (e.g., 35x)
- `description` (string, optional): Full offer description
- `currency_conversions` (object): Auto-calculated minimum deposits in other currencies

---

### 3. List All Offers
Get all created offers with pagination.

```http
GET /api/offers?skip=0&limit=100
```

**Query Parameters**:
- `skip` (int, default: 0): Number of offers to skip
- `limit` (int, default: 100): Maximum offers to return

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Black Friday Reload 200%",
    "offer_type": "reload",
    "bonus_percentage": 200,
    "min_deposit_eur": 20,
    "wagering_multiplier": 35,
    "description": "Reload your account with 200% bonus up to €300",
    "currency_conversions": {
      "USD": 22,
      "GBP": 17.5,
      "EUR": 20,
      "CAD": 30,
      "AUD": 33,
      "BRL": 110
    },
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    ...
  }
]
```

---

### 4. Get Specific Offer
Retrieve a single offer by ID.

```http
GET /api/offers/{id}
```

**URL Parameters**:
- `id` (int): Offer ID

**Response (200 OK)**:
```json
{
  "id": 1,
  "name": "Black Friday Reload 200%",
  "offer_type": "reload",
  "bonus_percentage": 200,
  "min_deposit_eur": 20,
  "wagering_multiplier": 35,
  "description": "Reload your account with 200% bonus up to €300",
  "currency_conversions": {
    "USD": 22,
    "GBP": 17.5,
    "EUR": 20,
    "CAD": 30,
    "AUD": 33,
    "BRL": 110
  },
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

**Errors**:
- `404 Not Found`: If offer doesn't exist

---

### 5. Update Offer
Modify an existing offer.

```http
PUT /api/offers/{id}
Content-Type: application/json
```

**URL Parameters**:
- `id` (int): Offer ID

**Request Body**: Same as Create Offer

**Response (200 OK)**: Updated offer object

**Note**: If `min_deposit_eur` changes, `currency_conversions` are automatically recalculated.

---

### 6. Delete Offer
Remove an offer and all its translations.

```http
DELETE /api/offers/{id}
```

**URL Parameters**:
- `id` (int): Offer ID

**Response (204 No Content)**: Empty (success)

---

### 7. Add Translations
Add multi-language translations for an offer.

```http
POST /api/offers/{id}/translations
Content-Type: application/json
```

**URL Parameters**:
- `id` (int): Offer ID

**Request Body**:
```json
{
  "translations": [
    {
      "language": "en",
      "offer_name": "Black Friday Reload 200%",
      "offer_description": "Reload your account with 200% bonus up to €300"
    },
    {
      "language": "de",
      "offer_name": "Black Friday Reload 200%",
      "offer_description": "Laden Sie Ihr Konto mit 200% Bonus bis zu €300 auf"
    },
    {
      "language": "fr",
      "offer_name": "Black Friday Reload 200%",
      "offer_description": "Rechargez votre compte avec 200% de bonus jusqu'à €300"
    }
  ]
}
```

**Supported Languages**:
- `en` - English
- `de` - German
- `fr` - French
- `es` - Spanish
- `it` - Italian
- `pt` - Portuguese

**Response (201 Created)**:
```json
{
  "message": "Translations added successfully"
}
```

---

### 8. Get Translations
Retrieve all translations for an offer.

```http
GET /api/offers/{id}/translations
```

**URL Parameters**:
- `id` (int): Offer ID

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "offer_id": 1,
    "language": "en",
    "offer_name": "Black Friday Reload 200%",
    "offer_description": "Reload your account with 200% bonus up to €300",
    "created_at": "2024-01-15T10:35:00",
    "updated_at": "2024-01-15T10:35:00"
  },
  {
    "id": 2,
    "offer_id": 1,
    "language": "de",
    "offer_name": "Black Friday Reload 200%",
    "offer_description": "Laden Sie Ihr Konto mit 200% Bonus bis zu €300 auf",
    "created_at": "2024-01-15T10:35:00",
    "updated_at": "2024-01-15T10:35:00"
  }
]
```

---

### 9. Generate Complete JSON
Generate final JSON export with all currencies and translations merged.

```http
GET /api/offers/{id}/json
```

**URL Parameters**:
- `id` (int): Offer ID

**Response (200 OK)**:
```json
{
  "offer_id": 1,
  "offer_name": "Black Friday Reload 200%",
  "offer_type": "reload",
  "bonus_percentage": 200,
  "wagering_multiplier": 35,
  "min_deposits": {
    "USD": 22,
    "GBP": 17.5,
    "EUR": 20,
    "CAD": 30,
    "AUD": 33,
    "NZD": 36,
    "JPY": 3200,
    "CHF": 18.4,
    "SEK": 230,
    "NOK": 236,
    "DKK": 149,
    "PLN": 86,
    "CZK": 480,
    "HUF": 7800,
    "RON": 99.4,
    "BGN": 39.2,
    "HRK": 150.6,
    "BRL": 110,
    "MXN": 400,
    "ZAR": 400
  },
  "translations": {
    "en": {
      "name": "Black Friday Reload 200%",
      "description": "Reload your account with 200% bonus up to €300"
    },
    "de": {
      "name": "Black Friday Reload 200%",
      "description": "Laden Sie Ihr Konto mit 200% Bonus bis zu €300 auf"
    },
    "fr": {
      "name": "Black Friday Reload 200%",
      "description": "Rechargez votre compte avec 200% de bonus jusqu'à €300"
    }
  },
  "generated_at": "2024-01-15T10:40:00"
}
```

This is the **final export format** used for deployment.

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message description"
}
```

**Common Status Codes**:
- `200 OK`: Request successful
- `201 Created`: Resource created
- `204 No Content`: Deletion successful
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

---

## Usage Examples

### Complete Workflow

#### 1. Create Offer
```bash
curl -X POST http://localhost:8000/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Year Bonus",
    "offer_type": "deposit",
    "bonus_percentage": 100,
    "min_deposit_eur": 25,
    "wagering_multiplier": 40,
    "description": "Double your deposit on New Year!"
  }'
```

#### 2. Add Translations
```bash
curl -X POST http://localhost:8000/api/offers/1/translations \
  -H "Content-Type: application/json" \
  -d '{
    "translations": [
      {
        "language": "en",
        "offer_name": "New Year Bonus",
        "offer_description": "Double your deposit on New Year!"
      },
      {
        "language": "de",
        "offer_name": "Neujahrsbonus",
        "offer_description": "Verdoppeln Sie Ihre Einzahlung zum Neujahr!"
      }
    ]
  }'
```

#### 3. Generate JSON
```bash
curl http://localhost:8000/api/offers/1/json
```

---

## Frontend Integration

The React components use **Axios** for API calls:

```javascript
// Create offer
const response = await axios.post('http://localhost:8000/api/offers', offerData);

// Get offers
const offers = await axios.get('http://localhost:8000/api/offers');

// Generate JSON
const json = await axios.get(`http://localhost:8000/api/offers/${offerId}/json`);
```

---

## Rate Limiting
None currently (will be added in production).

---

## CORS
Enabled for `localhost:3000` (frontend dev server).

To add more origins, edit `backend/main.py`:
```python
allow_origins=["http://localhost:3000", "https://yourdomain.com"],
```

---

## Compression
All responses are automatically gzip-compressed if larger than 1KB.

---

## Questions?
See QUICK_START.md for setup instructions.
