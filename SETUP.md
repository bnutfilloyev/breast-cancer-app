# Loyihani ishga tushirish qo'llanmasi

## Backend o'rnatish

### 1. Virtual environment yaratish

```bash
cd backend
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. Dependencies o'rnatish

```bash
pip install -r requirements.txt
```

### 3. Environment sozlash

```bash
cp .env.example .env
```

`.env` faylini tahrirlang:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/breast_cancer
```

### 4. Database yaratish (Docker)

```bash
# Loyiha root directory'da
docker-compose up -d postgres redis
```

### 5. Database migratsiyalari

```bash
# Birinchi migratsiya
alembic revision --autogenerate -m "Initial tables"

# Migratsiyani qo'llash
alembic upgrade head
```

### 6. Backend ishga tushirish

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend: http://localhost:8000
API Docs: http://localhost:8000/docs

## Frontend o'rnatish

### 1. Dependencies o'rnatish

```bash
cd frontend
npm install
```

**Muhim:** Agar xatolik bo'lsa, `package.json` ni tekshiring va qayta urinib ko'ring:

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Development server

```bash
npm run dev
```

Frontend: http://localhost:3000

## Docker bilan to'liq ishga tushirish

Eng oson usul - Docker Compose:

```bash
# Barcha xizmatlarni ishga tushirish
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f

# To'xtatish
docker-compose down

# Volume bilan birga to'xtatish
docker-compose down -v
```

Xizmatlar:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Muammolarni hal qilish

### Backend xatoliklari

1. **Database connection error**
```bash
# PostgreSQL ishga tushganini tekshiring
docker ps | grep postgres

# Connectionni tekshiring
docker exec -it breast_cancer_db psql -U postgres -d breast_cancer
```

2. **Model weights not found**
```bash
# Model faylini tekshiring
ls -la breast_cancer_detection_yolo11l_1280/weights/best.pt
```

3. **Import errors**
```bash
# Virtual environmentni qayta faollashtiring
deactivate
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend xatoliklari

1. **Module not found**
```bash
# Node modulesni qayta o'rnatish
rm -rf node_modules package-lock.json
npm install
```

2. **API connection error**
```bash
# Backend ishga tushganini tekshiring
curl http://localhost:8000/health

# .env.local yaratish (agar kerak bo'lsa)
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
```

3. **TypeScript errors**
```bash
# TypeScript cache tozalash
rm -rf .next
npm run build
```

### Docker xatoliklari

1. **Port already in use**
```bash
# Portni band qilgan processni topish
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL

# Process to'xtatish
kill -9 <PID>
```

2. **Volume issues**
```bash
# Volumelarni tozalash
docker-compose down -v
docker volume prune

# Qayta ishga tushirish
docker-compose up -d
```

3. **Build errors**
```bash
# Buildni qayta ishga tushirish
docker-compose build --no-cache
docker-compose up -d
```

## Ishlab chiqish uchun tayyorlash

### Backend

1. `.env` faylini production uchun sozlang:
```env
DEBUG=false
DATABASE_URL=postgresql+asyncpg://user:password@prod-host:5432/database
SECRET_KEY=<generate-strong-secret-key>
CORS_ORIGINS=https://your-domain.com
LOG_LEVEL=WARNING
```

2. Gunicorn bilan ishlatish:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend

1. Build yaratish:
```bash
npm run build
```

2. Production server:
```bash
npm start
```

3. Environment variables:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

## Database backup

```bash
# Backup yaratish
docker exec breast_cancer_db pg_dump -U postgres breast_cancer > backup.sql

# Backup qaytarish
docker exec -i breast_cancer_db psql -U postgres breast_cancer < backup.sql
```

## Monitoring

### Logs

```bash
# Backend logs
docker logs breast_cancer_backend -f

# Frontend logs
docker logs breast_cancer_frontend -f

# Database logs
docker logs breast_cancer_db -f
```

### Health checks

```bash
# Backend health
curl http://localhost:8000/health

# PostgreSQL health
docker exec breast_cancer_db pg_isready -U postgres

# Redis health
docker exec breast_cancer_redis redis-cli ping
```
