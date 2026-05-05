# Stable Pricing Configuration Guide

## Overview
The Admin Panel now supports storing multi-currency pricing tables that can be applied to all bonus configurations. These stable prices are stored in the database and can be managed through an intuitive interface.

## Features

### 1. **Load Default Pricing** 📊
Instantly load the pre-configured stable pricing tables with 21 currencies:

**Currencies Supported:**
- EUR, USD, CAD, AUD, BRL, NOK, NZD, CLP, MXN, GBP, PLN, PEN, ZAR, CHF, NGN, JPY, AZN, TRY, KZT, RUB, UZS

**Default Pricing Tables (6 tables):**

| Table | EUR | USD | GBP | BRL | NOK | JPY | RUB | UZS | Other Currencies |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|------------------|
| Table 1 | 0.10 | 0.10 | 0.10 | 0.10 | 1.00 | 20.00 | 8 | 800 | See below |
| Table 2 | 0.12 | 0.12 | 0.12 | 0.12 | 1.20 | 24 | 9.6 | 960 | +20% |
| Table 3 | 0.20 | 0.20 | 0.20 | 0.20 | 2.00 | 40 | 16 | 1600 | +100% |
| Table 4 | 0.25 | 0.25 | 0.25 | 0.25 | 2.50 | 50 | 20 | 2000 | +150% |
| Table 5 | 0.30 | 0.30 | 0.30 | 0.30 | 3.00 | 60 | 24 | 2400 | +200% |
| Table 6 | 0.60 | 0.60 | 0.60 | 0.60 | 6.00 | 120 | 48 | 4800 | +400% |

**How to use:**
1. Go to Admin Panel
2. Select a Provider (PRAGMATIC or BETSOFT)
3. Click **"📊 Load Default Pricing"**
4. Review the loaded tables in the Cost, Amounts, Stakes, or Withdrawals sections
5. Click **"✓ Save Configuration"** to store in the database

---

### 2. **Import Custom Data** 📥
Upload your own pricing tables using tab-separated values (TSV) format.

**Format:**
```
EUR	USD	GBP	CAD	...
0.10	0.10	0.10	0.10	...
0.20	0.20	0.20	0.20	...
0.50	0.50	0.50	0.50	...
```

**Steps:**
1. Click **"📥 Import Custom Data"**
2. Paste your tab-separated data into the modal
3. Click **"✓ Import"**
4. Tables will be created and displayed in the Cost section
5. Save to database

**Excel to TSV conversion:**
- Copy your table from Excel
- Paste into the import modal
- Excel automatically converts to tab-separated format

---

### 3. **Add/Remove Currencies per Table** ➕➖

Each pricing table supports adding or removing individual currencies:

**Add Currency:**
1. Open a pricing table
2. Click the **"+ Add Currency"** button
3. Select an unused currency from the dropdown
4. Enter the value

**Remove Currency:**
1. Click the **✕** button next to any currency
2. The currency is immediately removed from that table

**Note:** Currencies removed stay available for other tables.

---

### 4. **Add/Remove Pricing Tables** 📋

**Add a new pricing table:**
1. Click **"+ Add Pricing Table"** at the top of any section
2. New table is created with default values
3. Customize currency values as needed

**Remove a pricing table:**
1. Click the **✕** button on the table's header (only if 2+ tables exist)
2. Table is deleted

---

### 5. **Manage Across Different Sections** 🔄

The Admin Panel lets you configure separate pricing tables for:

- **💰 Cost** - Price per player receiving this bonus (EUR cost)
- **💵 Amounts** - Minimum and Maximum bonus amounts by currency
- **🎯 Stakes** - Minimum and Maximum stake/bet amounts
- **🏦 Withdrawals** - Maximum withdrawal limits

Each section can have multiple pricing tables sorted by EUR value.

---

## Database Structure

Pricing data is stored as JSON in SQLite:

```json
{
  "provider": "PRAGMATIC",
  "cost": [
    {
      "id": "1",
      "name": "Table 1",
      "values": {
        "EUR": 0.10,
        "USD": 0.10,
        "GBP": 0.10,
        ...
      }
    },
    ...
  ],
  "maximum_amount": [...],
  "minimum_amount": [...],
  "minimum_stake_to_wager": [...],
  "maximum_stake_to_wager": [...],
  "maximum_withdraw": [...]
}
```

---

## Complete Default Pricing Table

### Table 1 (Lowest - EUR 0.10 cost)
- EUR: 0.10 | USD: 0.10 | CAD: 0.10 | AUD: 0.10 | BRL: 0.10
- NOK: 1.00 | NZD: 0.10 | CLP: 25.00 | MXN: 0.50 | GBP: 0.10
- PLN: 0.40 | PEN: 0.10 | ZAR: 1.50 | CHF: 0.10 | NGN: 40
- JPY: 20.00 | AZN: 0.20 | TRY: 1.00 | KZT: 40 | RUB: 8 | UZS: 800

### Table 2 (+20% adjustment)
- EUR: 0.12 | USD: 0.12 | CAD: 0.12 | AUD: 0.12 | BRL: 0.12
- NOK: 1.20 | NZD: 0.12 | CLP: 30 | MXN: 0.60 | GBP: 0.12
- PLN: 0.48 | PEN: 0.12 | ZAR: 1.8 | CHF: 0.12 | NGN: 48
- JPY: 24 | AZN: 0.24 | TRY: 1.2 | KZT: 48 | RUB: 9.6 | UZS: 960

### Table 3 (+100% adjustment)
- EUR: 0.20 | USD: 0.20 | CAD: 0.20 | AUD: 0.20 | BRL: 0.20
- NOK: 2.00 | NZD: 0.20 | CLP: 50 | MXN: 1.00 | GBP: 0.20
- PLN: 0.80 | PEN: 0.20 | ZAR: 3.00 | CHF: 0.20 | NGN: 80
- JPY: 40 | AZN: 0.40 | TRY: 2.00 | KZT: 80 | RUB: 16 | UZS: 1600

### Table 4 (+150% adjustment)
- EUR: 0.25 | USD: 0.25 | CAD: 0.25 | AUD: 0.25 | BRL: 0.25
- NOK: 2.50 | NZD: 0.25 | CLP: 65 | MXN: 1.25 | GBP: 0.25
- PLN: 1.00 | PEN: 0.25 | ZAR: 3.75 | CHF: 0.25 | NGN: 100
- JPY: 50 | AZN: 0.50 | TRY: 2.50 | KZT: 100 | RUB: 20 | UZS: 2000

### Table 5 (+200% adjustment)
- EUR: 0.30 | USD: 0.30 | CAD: 0.30 | AUD: 0.30 | BRL: 0.30
- NOK: 3.00 | NZD: 0.30 | CLP: 75 | MXN: 1.50 | GBP: 0.30
- PLN: 1.20 | PEN: 0.30 | ZAR: 4.50 | CHF: 0.30 | NGN: 120
- JPY: 60 | AZN: 0.60 | TRY: 3.00 | KZT: 120 | RUB: 24 | UZS: 2400

### Table 6 (Highest - +400% adjustment)
- EUR: 0.60 | USD: 0.60 | CAD: 0.60 | AUD: 0.60 | BRL: 0.60
- NOK: 6.00 | NZD: 0.60 | CLP: 150 | MXN: 3.00 | GBP: 0.60
- PLN: 2.40 | PEN: 0.60 | ZAR: 9.00 | CHF: 0.60 | NGN: 240
- JPY: 120 | AZN: 1.20 | TRY: 6.00 | KZT: 240 | RUB: 48 | UZS: 4800

---

## Workflow Examples

### Example 1: Quick Setup with Defaults
1. Go to Admin Panel → Select PRAGMATIC
2. Click **"📊 Load Default Pricing"** ← Done! All 6 tables loaded
3. Review tables in each section
4. Click **"✓ Save Configuration"**
5. Tables now available for all PRAGMATIC bonuses

### Example 2: Custom Tier-Based Pricing
1. Click **"📥 Import Custom Data"**
2. Paste your custom CSV/TSV data
3. Tables auto-populate with your values
4. Adjust individual currencies using the UI
5. Save to database

### Example 3: Add/Remove Currencies
1. Open a pricing table
2. Click **✕** next to NGN (Nigerian Naira) to remove
3. Click **"+ Add Currency"** to add CHF (Swiss Franc)
4. Tables now have different currencies
5. Save to apply changes

---

## API Endpoints Used

- **GET** `/api/stable-config/{provider}` - Fetch saved config
- **POST** `/api/stable-config` - Save/update config
- **Schema**: `StableConfigCreate` / `StableConfigResponse` in backend

---

## Tips & Best Practices

✅ **DO:**
- Load default pricing as a starting point
- Keep high-tier tables for VIP bonuses
- Use consistent currency across all tables
- Test with a single provider first
- Save frequently

❌ **DON'T:**
- Remove all currencies from a table (add one first)
- Mix different pricing logics in one table
- Create too many tables (6-8 is optimal)
- Forget to save after modifications
- Change values after bonuses are live (may affect calculations)

---

## Troubleshooting

**Q: Import failed with "Invalid format"**
- A: Check headers and data match. Each row must have same column count.

**Q: Can't add more currencies**
- A: All 21 currencies already in table. Remove one first.

**Q: Data not saving**
- A: Check provider is selected. Ensure at least 1 table exists in Cost section.

**Q: Tables show in wrong order**
- A: Tables auto-sort by EUR value. This is normal.

---

## Next Steps

Once pricing is configured:
1. Create bonuses in the **Create** tab
2. Bonuses will reference these stable pricing tables
3. Currency conversions happen automatically
4. Analytics dashboard will show cost per player

