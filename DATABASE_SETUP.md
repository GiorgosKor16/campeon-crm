# CAMPEON CRM - Database Setup Guide

## Phase 1: Local Development (SQLite)

No setup required! SQLite is built into Python.

**File location**: `backend/casino_crm.db`

**To reset**: Simply delete the file and restart the backend.

---

## Phase 2: Cloud Database (Render - Free Tier)

### Why Render?
- ✅ Free tier with 256MB RAM
- ✅ PostgreSQL included
- ✅ 90 day inactivity limit (acceptable for testing)
- ✅ Easy to upgrade later
- ✅ $0/month cost

### Setup Steps

#### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub or Google
- Verify email

#### 2. Create PostgreSQL Database
1. Click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `campeon-crm-db`
   - **Database**: `casino_crm`
   - **User**: `postgres` (default)
   - **Region**: Choose closest to you
   - **Plan**: Free (256MB)
4. Click "Create Database"

#### 3. Get Connection String
After creation, Render shows the **Internal Database URL** (or External if needed):
```
postgresql://user:password@host:5432/database_name
```

#### 4. Update Backend .env
Replace `backend/.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/casino_crm
```

#### 5. Test Connection
```bash
# Install PostgreSQL driver (already in requirements.txt)
pip install psycopg2-binary

# Start backend
uvicorn main:app --reload
```

Backend will automatically create all tables on startup.

---

## Phase 3: Production Database (Hetzner)

### Why Hetzner?
- 💰 $3-5/month for VPS with PostgreSQL
- 🚀 Better performance than free tier
- 📈 Unlimited scalability
- 🌍 Multiple data center locations
- 🔒 Full control over infrastructure

### Setup Steps (Later)

1. **Create Hetzner Account** at https://www.hetzner.com
2. **Create Cloud Server** (Ubuntu 22.04 LTS)
3. **Install PostgreSQL** on server
4. **Update DATABASE_URL** in production .env
5. **Deploy backend** to same server or separate service

---

## Migration: SQLite → PostgreSQL

### Automatic (Recommended)
Simply change the `DATABASE_URL` and restart. SQLAlchemy will:
1. Create all tables
2. Database is now empty (fresh start)

### With Data Migration (Advanced)
If you need to preserve data:

```python
# backup_sqlite.py - Export SQLite data
import sqlite3
import json

conn = sqlite3.connect('backend/casino_crm.db')
cursor = conn.cursor()

cursor.execute('SELECT * FROM offers')
offers = cursor.fetchall()

with open('offers_backup.json', 'w') as f:
    json.dump([dict(offer) for offer in offers], f)

conn.close()
print("✅ Backup created: offers_backup.json")
```

Then import to PostgreSQL after creation.

---

## Environment Variables Cheat Sheet

### SQLite (Default - Development)
```
DATABASE_URL=sqlite:///./casino_crm.db
```

### PostgreSQL (Render - Testing)
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

### PostgreSQL (Hetzner - Production)
```
DATABASE_URL=postgresql://username:password@your-hetzner-ip:5432/casino_crm
```

---

## Checking Database Status

### SQLite
```bash
# File exists?
ls -la backend/casino_crm.db

# Size?
du -h backend/casino_crm.db
```

### PostgreSQL (Render)
1. Go to Render dashboard
2. Select your database
3. View connection info and usage stats

---

## Troubleshooting

### "Connection refused"
- Check DATABASE_URL is correct
- Ensure backend can reach the database
- Check firewall/security groups

### "Database does not exist"
- Database will be created automatically on first run
- If not: use `psql` to create manually

### "Table does not exist"
- Delete `backend/casino_crm.db` (SQLite) to reset
- For PostgreSQL: backend recreates on startup automatically

---

## Cost Summary

| Phase | Service | Cost | Use Case |
|-------|---------|------|----------|
| 1 | SQLite (local) | $0 | Development & testing |
| 2 | Render (free) | $0 | Cloud testing (90 day limit) |
| 3 | Hetzner | $3-5/mo | Production deployment |

---

## Next Steps

1. ✅ **Local Testing**: Use SQLite (already working)
2. ⏭️ **Ready for production?** Set up Render PostgreSQL
3. ⏭️ **Scale up?** Migrate to Hetzner

See QUICK_START.md for running the application!
