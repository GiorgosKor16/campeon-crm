# CAMPEON CRM - Quick Start Guide

## 🚀 Frontend Setup (5 minutes)

### 1. Install Dependencies
```bash
cd "C:\Users\GiorgosKorifidis\Downloads\CAMPEON CRM PROJECT"
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The frontend will be available at **http://localhost:3000**

---

## 🔧 Backend Setup (5 minutes)

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at **http://localhost:8000**

---

## 📋 API Endpoints

### Offers
- `POST /api/offers` - Create new offer
- `GET /api/offers` - List all offers
- `GET /api/offers/{id}` - Get specific offer
- `PUT /api/offers/{id}` - Update offer
- `DELETE /api/offers/{id}` - Delete offer

### Translations
- `POST /api/offers/{id}/translations` - Add translations
- `GET /api/offers/{id}/translations` - Get translations

### JSON Generation
- `GET /api/offers/{id}/json` - Generate complete JSON with all currencies and translations

---

## 🗄️ Database

**Development**: SQLite (automatic, no setup needed)
- File: `backend/casino_crm.db`

**Switch to PostgreSQL**: Edit `backend/.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/casino_crm
```

---

## 📱 Using the Application

### 1. Casino Team Tab (Purple)
- Enter offer details (name, bonus %, min deposit EUR, wagering multiplier)
- Click "Create Offer"
- Offer is automatically converted to all currencies

### 2. Translation Team Tab (Green)
- Select an offer from dropdown
- Add translations in: EN, DE, FR, ES, IT, PT
- Click "Add Translations"

### 3. Optimization Team Tab (Blue)
- Select an offer from dropdown
- Click "Generate JSON"
- View complete JSON with all currencies and translations
- Copy to clipboard

---

## ✅ Testing the Workflow

1. **Start both servers** (frontend + backend)
2. **Create an offer** via Casino Team form
3. **Add translations** via Translation Team form
4. **Generate JSON** via Optimization Team tab
5. **Copy the JSON** for deployment

---

## 🐛 Troubleshooting

### Frontend errors?
```bash
npm install
npm run dev
```

### Backend errors?
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

### Database issues?
- Delete `backend/casino_crm.db` to reset
- Backend will recreate it on next startup

### Port already in use?
- Frontend: `npm run dev -- -p 3001`
- Backend: `uvicorn main:app --port 8001`

---

## 🚢 Next Steps

1. **Test locally** with SQLite
2. **Set up Render PostgreSQL** (see DATABASE_SETUP.md)
3. **Deploy frontend** to Vercel
4. **Deploy backend** to Render or similar

Enjoy! 🎉
