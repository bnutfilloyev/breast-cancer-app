# Breast Cancer Detection Platform – Client Presentation Script

## 1. Kirish (2 daqiqa)
- **Maʼsuliyat va muammo**: Radiologiya boʻyicha skrining jarayonida vaqt va aniqlik muammolari.
- **Taklifimiz**: Multi-view mammografiya uchun sunʼiy intellekt yordamchisi, mavjud klinik ish jarayoniga integratsiyalashgan.
- **Agenda**: Platforma arxitekturasi → Model natijalari → Ish jarayoni demosi → Monitoring va roadmap → Savollar.

## 2. Platforma panoramasi (3 daqiqa)
- `docs/idef0_system_flow.svg` ni ko‘rsatib, A1–A4 bloklari orqali asosiy funksional oqimni tushuntiring.
- Kirish (suratlar + bemor maʼlumotlari) → YOLO11L inferensiyasi → Maʼlumotlar bazasi va fayl boshqaruvi → Dashboard va reportlar.
- `docs/system_deployment.svg` bilan komponentlar joylashuvi: Next.js frontend, FastAPI backend, YOLO servis, PostgreSQL, fayl storage, observability.

## 3. Klinik foydalanuvchi safari (4 daqiqa)
- `docs/system_sequence.svg` asosida ketma-ketlik: klinitsist suratni yuklaydi, tizim 6 bosqichda natija qaytaradi.
- Dashboard demo skript:
  1. `frontend` dagi `npm run dev` ishga tushgan deb faraz qiling.
  2. Bemor profiliga kirib, so‘nggi tahlillar ro‘yhatini ko‘rsatish.
  3. Yangi multi-view yuklash (`/upload-multi`), yuklashdan so‘ng real-time natijalar.
  4. Natijalarni PDF/JSON ga eksport qilish (`/analyses/{id}` sahifasi).
- `docs/analysis_state.svg` bilan tahlil holatlari (Pending → Processing → Completed/Failed → Archived) ni tushuntiring.

## 4. Maʼlumotlar va MLOps pipeline (3 daqiqa)
- `docs/data_pipeline.svg` – manbadan (PACS, DICOM) to monitoringgacha bo‘lgan data lifecycle.
- `docs/monitoring_stack.svg` – 24 soatlik monitoring/QA sikli: log ingest, drift detection, radiolog feedback, retrain trigger.
- `FUTURE_PLAN.md` dagi qisqa muddatli ishlar: klinik pilot, monitoring, threshold tuning.

## 5. Model natijalari va `runs/` tahlili (5 daqiqa)
- `train3_model_report.ipynb` dan grafiklarni ekranga chiqaring: metrikalar, loss kurvalari, konfuzion matritsa.
- `runs/detect` katalogi natijalari:
  - `train3` va `train3 (2)` eng yuqori mAP@50 = 0.2889, mAP@50-95 = 0.1477 (86-epoch).
  - `train2` va `train5` pastroq natijalar – label sifatini audit qilish kerak.
  - Snapshotlar (best.pt, last.pt) registryga tartib bilan joylashtirilganligini ayting.
- Malignant sinfi recalli 0.4173 (3-epoch) dan 0.3084 (final) gacha pasaygani – sinf balansini yaxshilash zarur.
- Taqdim etiladigan keyingi qadamlar: augmentatsiya, threshold tuning, ensemble.

## 6. Security & Compliance (2 daqiqa)
- Fayl validatsiyasi (`backend/app/file_manager.py`), SHA-256 hash va thumbnail generatsiyasi.
- Audit log (`models.AuditLog`) – kelajakda WORM storage va SIEM integratsiyasi.
- HIPAA/GDPR uchun rejalashtirilgan ishlar (`FUTURE_PLAN.md` 5-bo‘lim).

## 7. Roadmap va tavsiyalar (3 daqiqa)
- `FUTURE_PLAN.md` dagi jadvalni konspekt qiling: qisqa, o‘rta, uzoq muddat maqsadlari.
- Metriklar paneli va risk/mitigatsiya.
- Resurslar: ML engineer, MLOps, Radiology champion, Compliance officer.

## 8. Q&A va keyingi bosqichlar (2 daqiqa)
- Demo taklifi: 2 haftalik klinik pilot, 1 oy ichida feedback sessiyasi.
- Shartnoma bosqichi: SLA talablari, licensing modeli, maʼlumot xavfsizligi.

## 9. Ilovalar
- `README.md` – texnik sozlash va ishlatish qo‘llanmasi.
- `FUTURE_PLAN.md` – batafsil roadmap.
- `docs/*.svg` & `docs/*.png` – grafiklar.
- `train3_model_report.ipynb` – model analitikasi.
- `runs/detect/*` – tarixiy o‘qitish natijalari.

**Taqdimotdan oldingi tayyorgarlik:**
- Diagramma va grafiklarni slidelarga joylang.
- Demo maʼlumotlari uchun sinov suratlari tayyorlab qo‘ying.
- Savollar ro‘yxatini oldindan tuzing (model verifikatsiyasi, compliance, integratsiya talablari).
