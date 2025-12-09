# 🚀 CAMPEON CRM - Ready to Go!

## ✅ System Status

Both frontend and backend are now **RUNNING**!

- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:8000 (FastAPI)
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Database**: SQLite (casino_crm.db)

---

## 📱 How to Use

### 1. Open the Application
Go to **http://localhost:3000** in your browser

### 2. Create a Bonus (Casino Team)
1. Click the **RED** tab labeled "🎰 CASINO TEAM"
2. Fill in the form:
   - **Bonus Template ID**: e.g., "Black Friday: Casino Reload 200%"
   - **Bonus Type**: Select "Cash Bonus"
   - **Schedule**: Set dates (e.g., 2025-11-21 to 2025-11-28)
   - **Bonus Rules**: 
     - Bonus %: 200
     - Wagering x: 15
     - Trigger Type: Reload
     - Valid For: 7d
   - **Currency Amounts**: The table shows 20 currencies
     - Edit min/max amounts as needed
3. Click **"✅ Create Bonus Template"**
4. ✅ You should see a success message!

### 3. Add Translations (Translation Team)
1. Click the **GREEN** tab labeled "🌍 TRANSLATION TEAM"
2. Select the bonus you just created from the dropdown
3. Fill in translation details:
   - **Language**: en (English)
   - **Currency**: GBP (British Pounds)
   - **Name**: "200% Casino Reload up to £300 with wagering x15"
   - **Description**: "Minimum Deposit: £25"
4. Click "Add Translation"
5. Repeat for other languages/currencies

### 4. Generate JSON (Optimization Team)
1. Click the **BLUE** tab labeled "📊 OPTIMIZATION TEAM"
2. Select your bonus template from the dropdown
3. Click "Generate JSON"
4. The JSON appears with all:
   - Schedule information
   - Trigger details with all translations
   - Config settings with currency conversions
5. Click "Copy to Clipboard" or download

---

## 🔌 API Endpoints (For Developers)

### View API Documentation
Open: **http://localhost:8000/docs**

This shows all endpoints with:
- Request/response examples
- Try it out button
- Full parameter documentation

### Create Bonus Template
```bash
curl -X POST http://localhost:8000/api/bonus-templates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "Test Bonus",
    "percentage": 100,
    "wagering_multiplier": 20,
    "schedule_type": "period",
    "schedule_from": "2025-11-21T10:00",
    "schedule_to": "2025-11-28T22:59",
    "trigger_type": "reload",
    "trigger_iterations": 3,
    "trigger_duration": "7d",
    "minimum_amount": {"EUR": 20, "USD": 20},
    "maximum_amount": {"EUR": 200, "USD": 200},
    "minimum_stake_to_wager": {"*": 0.5},
    "maximum_stake_to_wager": {"*": 5},
    "maximum_withdraw": {"*": 3},
    "category": "GAMES",
    "provider": "SYSTEM",
    "brand": "SYSTEM",
    "bonus_type": "cash"
  }'
```

### Add Translation
```bash
curl -X POST http://localhost:8000/api/bonus-templates/Test%20Bonus/translations \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "currency": "USD",
    "name": "100% Reload up to $200",
    "description": "Minimum Deposit: $20"
  }'
```

### Generate JSON
```bash
curl http://localhost:8000/api/bonus-templates/Test%20Bonus/json | jq .
```

### List All Bonuses
```bash
curl http://localhost:8000/api/bonus-templates
```

---

## 📁 Data Location

Your database is stored at:
```
C:\Users\GiorgosKorifidis\Downloads\CAMPEON CRM PROJECT\backend\casino_crm.db
```

To backup:
```bash
cp backend/casino_crm.db backend/casino_crm_backup.db
```

To reset (delete all data):
```bash
rm backend/casino_crm.db
# Restart backend - new database will be created
```

---

## 🎨 UI Guide

### Three Color-Coded Tabs

| Tab | Color | Purpose |
|-----|-------|---------|
| Casino Team | 🔴 Red | Input bonus data |
| Translation Team | 🟢 Green | Manage translations |
| Optimization Team | 🔵 Blue | Generate & export JSON |

### Form Sections

**Casino Team Form:**
- 📋 Basic Information (ID, type)
- 📅 Schedule (dates & times)
- ⚙️ Bonus Rules (%, wagering, triggers)
- 💱 Currency Amounts (20 currencies)

---

## ⚡ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next field |
| `Shift+Tab` | Move to previous field |
| `Enter` | Submit form |
| `Esc` | Close dialog (if applicable) |

---

## 🔍 Troubleshooting

### Frontend not loading (http://localhost:3000)
```bash
# Check if Next.js is running
# Terminal 1 (if not already running):
cd "C:\Users\GiorgosKorifidis\Downloads\CAMPEON CRM PROJECT"
npm run dev
```

### Backend not responding (http://localhost:8000)
```bash
# Check if FastAPI is running
# Terminal 2 (if not already running):
cd "C:\Users\GiorgosKorifidis\Downloads\CAMPEON CRM PROJECT\backend"
uvicorn main:app --port 8000 --host 0.0.0.0
```

### Database error
```bash
# Delete corrupted database and restart
rm backend/casino_crm.db

# Restart backend - creates fresh database
```

### Port already in use
```bash
# Find and kill process on port 3000
Get-Process | Where-Object {$_.MainWindowTitle -like "*next*"} | Stop-Process -Force

# Find and kill process on port 8000
Get-Process | Where-Object {$_.Path -like "*python*"} | Stop-Process -Force
```

---

## 📊 What Happens Behind the Scenes

1. **You fill form** → React component validates input
2. **You click Submit** → Axios sends POST to backend API
3. **Backend receives** → FastAPI validates with Pydantic
4. **Data stored** → SQLAlchemy saves to SQLite database
5. **Translations added** → Stored separately for flexibility
6. **JSON generated** → Service merges all data + translations
7. **Output shown** → Formatted JSON with all conversions

---

## 🚀 Next Steps

### Test the Full Workflow
1. Create a bonus template
2. Add 3-5 translations
3. Generate JSON
4. Verify it matches your expected format

### Customize as Needed
- Change currency conversion rates in `backend/services/currency_service.py`
- Add more languages in the same file
- Modify form fields in `src/components/CasinoTeamForm.tsx`
- Update JSON structure in `backend/services/json_generator.py`

### Deploy to Production
- Push to GitHub
- Deploy frontend to Vercel
- Deploy backend to Render or Hetzner
- Switch database to PostgreSQL

---

## 📞 System Terminals

Keep both terminals open:

**Terminal 1 - Frontend:**
```
npm run dev
# http://localhost:3000
```

**Terminal 2 - Backend:**
```
cd backend
uvicorn main:app --port 8000 --host 0.0.0.0
# http://localhost:8000
# http://localhost:8000/docs
```

---

## ✨ You're All Set!

The CAMPEON CRM system is **fully operational** and ready to transform your bonus management workflow from "ugly Excel" to a professional, beautiful, and scalable platform.

**Enjoy! 🎉**
