# Ko'krak bezi saratonini aniqlash platformasi

FastAPI backend va Next.js frontend asosida qurilgan platforma to'rtta mammografiya ko'rinishini yoki bitta shubhali suratni qabul qilib, YOLO11L modeli yordamida BI-RADS yorliqlari bo'yicha ko'rsatkichlar ishlab chiqadi. Ushbu hujjat loyiha taqdimoti uchun tayyorlangan bo'lib, arxitektura, model natijalari va ishga tushirish bo'yicha to'liq ma'lumotni jamlaydi.

## 1. Tezkor taqdimot
- **Maqsad**: radiolog va onkologlar uchun avtomatlashtirilgan saraton skriningi, klinik qarorlarni tezlashtirish.
- **Asosiy imkoniyatlar**: bemor boshqaruvi, ko'p-ko'rinishli va yakka rasm inferensiyasi, JSON/PDF eksport, statistik kuzatuv.
- **Texnologiyalar**: FastAPI + SQLModel + PostgreSQL, YOLO11L modeli, Next.js 14 (App Router), TanStack Query, Tailwind CSS.
- **Hujjatlar**: model tahlili (`train3_model_report.ipynb`), IDEF0 funksional diagramma (`docs/idef0_system_flow.mmd`), IDEF1X ma'lumotlar modeli (`docs/idef1x_data_model.mmd`).

## 2. Tizim arxitekturasi

### 2.1 IDEF0 funksional diagrammasi
`docs/idef0_system_flow.mmd` faylidan foydalanib asosiy ish oqimini mermaid orqali ko'rish mumkin. Diagramma quyidagi vazifalarni aks ettiradi:

1. **A1 – Acquire & Validate Imaging Inputs**: bemor ma'lumotlari va mammografiya suratlarini qabul qilish, fayl formatini tekshirish.
2. **A2 – Run YOLO11L Inference Pipeline**: `backend/app/model_service.py` dagi `InferenceService` modeli yordamida deteksiyani bajarish.
3. **A3 – Persist Findings & Generate Reports**: `crud.py` orqali SQLModelga yozish, fayllarni `file_manager.py` bilan saqlash, JSON/PDF eksportlarini yaratish.
4. **A4 – Present Insights & System Metrics**: Next.js boshqaruv paneli (`frontend/src/app/(dashboard)`) natijalarni, trendlarni va tizim holatini taqdim etadi.

Diagrammada kiruvchi ma'lumotlar (suratlar, bemorlar), boshqaruv elementlari (klinik protokollar, thresholdlar), chiqishlar (hisobotlar, panel) va mexanizmlar (FastAPI, YOLO11L, SQLModel, Next.js) alohida belgilangan.

### 2.2 IDEF1X ma'lumotlar modeli
`docs/idef1x_data_model.mmd` faylidagi mermaid ER diagrammasi quyidagilarni ko'rsatadi:

- `patients`, `analyses`, `analysis_images`, `audit_logs` jadvallari va ularning atributlari.
- `patients` → `analyses` va `analyses` → `analysis_images` o'rtasidagi 1:N bog'lanishlar.
- Audit log strukturasining turli entitilar uchun kengaytirilishi.

Model `backend/app/models.py` faylida SQLModel yordamida e'lon qilingan bo'lib, har bir jadval uchun CRUD amallari `backend/app/crud.py` dagi funksiyalar orqali amalga oshiriladi.

## 3. Model tahlili (`train3`)

### 3.1 Notebook va fayllar
- `train3_model_report.ipynb` — `train3/` papkasidagi `results.csv`, `args.yaml` va tasvirlarni tahlil qiluvchi Jupyter notebook.
- `train3/weights/{best.pt,last.pt}` — inferensiya uchun tayyor og'irliklar.
- `train3/results.csv` — 100 epochlik mashg'ulot metrikalari.

Notebookda quyidagilar mavjud:
- Epochlar bo'yicha metrikalar (precision, recall, mAP@50, mAP@50-95) va yo'qotish grafiklari.
- Konfuzion matritsalar, validatsiya natijalari, mashg'ulot batch namunalarining vizualizatsiyasi.
- `args.yaml` asosida trening konfiguratsiyasi (imgsz=1280, mosaic augmentatsiyasi yoqilgan va hokazo).

### 3.2 Natijalar xulosasi
- **Eng yuqori precision**: 0.8239 (19-epoch).
- **Eng yuqori recall**: 0.4173 (3-epoch, dastlabki o'qitish) — balanslash zarurligini ko'rsatadi.
- **Eng yuqori mAP@50**: 0.2889 (86-epoch).
- **Eng yuqori mAP@50-95**: 0.1477 (86-epoch) — yuqori tasvir aniqligi bo'lsa-da, ma'lumotlar to'plami kengayishiga ehtiyoj bor.
- So'nggi epoch (100) da metrikalar barqarorlashgan: precision 0.3758, recall 0.3084, mAP@50 0.2719.
- Validatsiya yo'qotishlari (box 1.9898, cls 2.7741, dfl 2.0438) — overfittingga barqarorlik kuzatiladi, ammo malign sinfda qo'shimcha augmentatsiya talab qilinadi.

**Keyingi tavsiyalar**: sinflar balansini yaxshilash, thresholdlarni klinik ekspertiza bilan moslashtirish, TTA (test-time augmentation) yoki ensambllash orqali mAP@50-95 ko'rsatkichlarini oshirish.

## 4. Backend (FastAPI)

- **Ilova kirish nuqtasi**: `backend/app/main.py`. FastAPI app, CORS, middleware (`middleware.py`), `init_db()`.
- **Model yuklash**: `model_service.py` dagi `InferenceService` single-ton sifatida (`get_inference_service`). Og'irlik yo'li avtomatik `train3/weights/best.pt` ga ulanadi.
- **Ma'lumotlar bazasi**: `database.py` — PostgreSQL async engine (`create_async_engine`), sync engine (`create_engine`) va tranzaksion kontekstlar.
- **Entitylar**: `models.py` (`Patient`, `Analysis`, `AnalysisImage`, `AuditLog`), ularning Pydantic shemalari `schemas.py` da.
- **Fayl boshqaruvi**: `file_manager.py` — yuklangan fayllarni xeshlash, tuzilmaga joylash, thumbnail yaratish.
- **CRUD va statistikalar**: `crud.py` — bemorlar, tahlillar, tasvirlar, statistik agregatlar, trend va qidiruv metodlari.
- **API endpointlar**: 
  - `/infer/multi`, `/infer/single` — asinxron fayl qabul qilish, inferensiya, yozib qo'yish, JSON javob (`InferenceResponse`).
  - `/patients`, `/analyses` CRUD, `/export/analyses/{id}/{json|pdf}`, `/statistics`, `/statistics/trends`, `/statistics/findings`, `/search`.
  - `/health` tizim holati.

### 4.1 Muhit sozlamalari
`backend/app/config.py` `pydantic-settings` yordamida quyidagilarni boshqaradi (standart qiymatlar):

| O'zgaruvchi | Izoh |
| --- | --- |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/breast_cancer` |
| `MODEL_WEIGHTS_PATH` | YOLO11L og'irliklari yo'li (standart `train3/weights/best.pt`) |
| `MODEL_CONFIDENCE`, `MODEL_IOU`, `MODEL_IMGSZ` | Inferensiya thresholdlari |
| `UPLOAD_DIR` | Standart `uploads/`, strukturasi `images/`, `thumbnails/`, `temp/` |
| `CORS_ORIGINS` | `*` (prezentatsiya uchun mos) |

### 4.2 Ishga tushirish
```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Docker varianti: `docker compose up backend --build` (docker-compose.yml).

## 5. Frontend (Next.js dashboard)

- **Struktura**: `frontend/src/app/(dashboard)` ichida sahifalar (`dashboard`, `patients`, `analyses`, `upload`, `statistics`). Yagona layout va mavzu `providers` orqali.
- **Service qatlam**: `frontend/src/services/*.ts` — axios `httpClient` (`lib/http.ts`) bilan backend REST endpointlariga murojaat.
- **Holat boshqaruvi**: TanStack Query (`useAnalysesList`, `useStatisticsOverview`, `useSystemStatus`) kechiktirilgan revalidatsiya bilan.
- **Komponentlar**: dashboard kartalari (`components/dashboard/StatsCard`), tezkor harakatlar (`QuickActions`), trend grafigi (`PatientChart`), natija ko'rish komponentlari (`components/analyses/*`).
- **Tillash**: UI elementlari o'zbek tiliga moslashtirilgan, karusel animatsiyalar uchun `framer-motion` qo'llanilgan.

### 5.1 Ishga tushirish
```
cd frontend
npm install
npm run dev
```
Muvofiqlashtirish uchun `.env.local` faylida `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.

### 5.2 Build
```
npm run build
npm run start
```

## 6. Docker orkestratsiyasi
`docker-compose.yml` fayli backend (FastAPI), frontend (Next.js) va ehtiyoj bo'yicha Postgres konteynerini ishga tushirish uchun ishlatiladi.

```
docker compose up --build -d
# Backend: http://localhost:8000
# Frontend: http://localhost:3000

docker compose down
```

## 7. Test va monitoring
- **Backend unittests**: `cd backend && pytest` (`tests/` katalogi orqali). Mock yordamida API qatlamini tekshirish.
- **Logging**: `backend/app/logger.py` `logs/app.log` faylini yaratadi, so'rovlar `LoggingMiddleware` orqali kuzatiladi.
- **Kelajakdagi kengaytmalar**: autentifikatsiya, rolga asoslangan kirish, real vaqt monitoring paneli, CI/CD pipeline.

## 8. Taqdimot uchun tavsiyalar
1. **Live demo**: Docker yordamida backend va frontendni ishga tushirib, `upload` sahifasida namunaviy surat yuklang.
2. **Model natijasi**: `train3_model_report.ipynb` dagi grafiklarni slides-ga eksport qiling, mAP@50-95 ko'rsatkichlarni izohlab bering.
3. **Arxitektura**: IDEF0 va IDEF1X diagrammalarini mermaid renderer yordamida (VSCode, draw.io yoki mermaid.live) tasvir sifatida eksport qiling.
4. **Kelajak rejasi**: balanslangan dataset, klinik validatsiya, HIPAA/GDPRga mos audit loglar.

---

Ushbu README mijozga platformani to'liq taqdim etish, demo tayyorlash va keyingi bosqichlarni belgilash uchun mo'ljallangan.
