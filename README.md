# Ko'krak bezi saratonini aniqlash platformasi

FastAPI backend va Next.js frontend birgalikda ishlaydi: foydalanuvchi to'liq ko'rinish to'plamini yoki bitta shubhali rasmini yuklaydi, sun'iy intellekt esa BI-RADS yorliqlari asosida topilmalarni baholaydi.

## Loyiha tuzilmasi

- `breast_cancer_detection_yolo11l_1280/` – tayyorlangan model og'irlik fayllari (`best.pt`, `last.pt`).
- `backend/` – tasvirlarni qabul qilib, model yordamida natija qaytaruvchi FastAPI xizmati.
- `frontend/` – to'rtta rasmni yuklash va natijalarni ko'rish uchun Next.js boshqaruv paneli.

## Backend (FastAPI)

### O'rnatish

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Sozlamalar

Ixtiyoriy muhit o'zgaruvchilari:

| O'zgaruvchi | Standart qiymat | Izoh |
| --- | --- | --- |
| `MODEL_WEIGHTS_PATH` | `breast_cancer_detection_yolo11l_1280/weights/best.pt` | Model og'irlik fayliga to'liq yo'l. |
| `MODEL_DEVICE` | `cpu` | In'ferentsiya uchun qurilma (`cpu`, `cuda:0` va hokazo). |
| `MODEL_CONFIDENCE` | `0.25` | Minimal ishonchlilik chegarasi. |
| `MODEL_IMGSZ` | `1280` | Tasvir o'lchami ( `auto` deb qoldirilsa, modelning o'zi tanlaydi). |
| `MODEL_IOU` | `0.40` | NMS uchun IoU chegarasi. |
| `MODEL_AUGMENT` | `0` | Test vaqtida augmentatsiyani yoqish (`1/true` bo'lsa faollashadi). |
| `DATABASE_URL` | `sqlite:///./app.db` | SQLModel bazasining ulanish manzili (standart holatda lokal SQLite). |

### Xizmatni ishga tushirish

```bash
uvicorn app.main:app --reload --port 8000
```

### Endpointlar

- `POST /infer/multi` – `top`, `bottom`, `left`, `right` maydonlari bo'yicha to'rtta rasmni qabul qilib, koordinatalar va BI-RADS yorliqlarini qaytaradi.
- `POST /infer/single` – `image` maydoni orqali bitta rasmni tahlil qiladi.
- `POST /infer` – avvalgi versiya bilan mos keluvchi ko'p-ko'rinishli tahlil.
- `GET /health` – xizmatning ishlayotganini tekshirish uchun oddiy so'rov.
- `POST /patients` – yangi bemor profilini yaratadi.
- `GET /patients` – barcha bemorlar ro'yxatini qaytaradi (so'nggi tahlil sanalari bilan).
- `GET /patients/{patient_id}` – tanlangan bemor haqidagi batafsil ma'lumot va tahlil tarixini taqdim etadi.
- `PATCH /patients/{patient_id}` – mavjud bemor ma'lumotlarini yangilaydi.

## Frontend (Next.js)

### O'rnatish

```bash
cd frontend
npm install
cp .env.local.example .env.local  # kerak bo'lsa NEXT_PUBLIC_API_BASE_URL qiymatini o'zgartiring
npm run dev
```

Ilovani http://localhost:3000 manzilida ko'rish mumkin.

### Asosiy imkoniyatlar

- Ikki rejim: "Full study" (4 ta rasm) va "Quick check" (1 ta rasm) o'rtasida bir zumda almashish.
- Har bir ko'rinish uchun drag-and-drop qo'llab-quvvatlashi, asinxron yuklash va animatsiyali UI.
- BI-RADS yorliqlari va ishonchlilik ko'rsatkichlari bo'yicha vizual qoplamalar.
- Dinamik statistika paneli: ko'rinishlar bo'yicha eng faol hududlar va BI-RADS taqsimoti.
- Qorong'i fonli, klinik monitorlar uchun moslangan, framer-motion animatsiyalari bilan boyitilgan dizayn.
- Bemorlar reyestri, tahlil tarixi va BI-RADS trend grafigi orqali longitudinal monitoring.

## Backend va frontendni birga ishga tushirish

1. Backendni ishga tushiring (`uvicorn ...`).
2. Frontendni ishga tushiring (`npm run dev`).
3. Rejimni tanlang (to'liq tekshiruv yoki tezkor tekshiruv), tasvir(lar)ni yuklang va "Run analysis" tugmasini bosing.

## Docker yordamida ishlatish

```bash
docker compose up --build -d
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

Talab tugagach, konteynerlarni to'xtatish:

```bash
docker compose down
```

> Birinchi marta yig'ishda model og'irliklari va PyTorch kutubxonalari yuklanishi uchun biroz vaqt ketishi mumkin.

## Qo'shimcha eslatmalar

- Agar yangi og'irlik fayllari bo'lsa, ularni `breast_cancer_detection_yolo11l_1280/weights/` papkasiga joylashtiring yoki `MODEL_WEIGHTS_PATH` ni o'zgartiring.
- `MODEL_CONFIDENCE`, `MODEL_IOU`, `MODEL_IMGSZ` va `MODEL_AUGMENT` yordamida natijalarni yanada moslashtirish mumkin.
- Ma'lumotlar standartda `app.db` SQLite faylida saqlanadi; `DATABASE_URL` orqali tashqi PostgreSQL/MySQL bilan ishlash mumkin.
- Ishlab chiqarish muhitiga chiqarishdan oldin autentifikatsiya va jurnal yuritishni qo'shish tavsiya etiladi.
