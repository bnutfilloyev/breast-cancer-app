# Frontend – Ko'krak bezi saratonini aniqlash paneli

Next.js asosidagi ushbu ilova to'rtta klinik tasvirni yoki bitta shubhali rasmini yuklab, sun'iy intellekt natijalarini intuitiv tarzda ko'rsatadi.

## Tezkor boshlash

```bash
cd frontend
npm install
cp .env.local.example .env.local  # kerak bo'lsa NEXT_PUBLIC_API_BASE_URL qiymatini yangilang
npm run dev
```

Brauzerda http://localhost:3000 manziliga o'ting. "Run analysis" tugmasi ishlashi uchun backendning `/infer/multi` va `/infer/single` endpointlari faol bo'lishi kerak; tahlillarni bemorga biriktirish uchun esa "Patient registry" panelidan tegishli profilni tanlang yoki yangisini yarating.

## E'tiborga molik jihatlar

- Ikki rejim: **Full study** (4 ta rasm) va **Quick check** (1 ta rasm) o'rtasida bir zumda almashish.
- Drag-and-drop orqali asinxron yuklash, framer-motion animatsiyalari va gradientli card dizayni.
- Har bir ko'rinish ustida BI-RADS yorliqlari, bounding box va ishonchlilik foizlari jonli ko'rsatiladi.
- Yon panel BI-RADS taqsimoti, eng faol ko'rinish va model parametrlari bo'yicha chuqur statistikani taqdim etadi.
- Bemor reyestri, trend grafigi va har bir tahlil tarixini to'plovchi panel mavjud.

## Muhit o'zgaruvchilari

| O'zgaruvchi | Standart | Maqsad |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Backend inference xizmatining manzili. |

## Ishlab chiqarish rejimi

```bash
npm run build
npm run start
```

Agar frontend boshqa hostda joylashtirilsa, `NEXT_PUBLIC_API_BASE_URL` qiymatini moslang.

## Docker bilan ishlash

Repozitoriy ildizidagi `docker-compose.yml` frontend va backendni birgalikda ishga tushiradi:

```bash
docker compose up --build -d
```

Compose konfiguratsiyasi frontendga `http://backend:8000` manzilini uzatadi, shuning uchun qo'shimcha sozlamalarsiz ishga tushadi.
