# 📚 Knygų Biblioteka - Deployment Guide

## 🚀 PWA (Progressive Web App)

### Kas tai yra?
PWA leidžia įsidiegti aplikaciją kaip atskirą programą telefone ar kompiuteryje!

### Funkcionalumas:
- ✅ **Automatinis įdiegimo pranešimas** - Pasirodys iškart kai atidarai puslapį
- ✅ **Atnaujinimų pranešimai** - Automatiškai praneš, kai yra naujinys
- ✅ **Veikia offline** - Cache'ina pagrindinius failus
- ✅ **Greitas paleidimas** - Veikia kaip native app

### Kaip įdiegti?
1. Atidaryk aplikaciją naršyklėje
2. Apačioje pasirodys pranešimas **"Įdiegti programą"**
3. Paspausk **"Įdiegti"**
4. Programa bus įdiegta kaip atskira app!

### PWA Icons
Reikalingi ikonų dydžiai:
- `static/icon-192.png` (192x192px)
- `static/icon-512.png` (512x512px)

Jei neturi, gali naudoti favicon.ico arba sukurti naudojant online tools.

### Atnaujinimų sistema
Kai padarysi pakeitimus:
1. Pakeisk versiją `static/sw.js` faile:
   ```javascript
   const CACHE_NAME = 'knygu-biblioteka-v1.0.1'; // Padidink versiją
   ```
2. Kai vartotojas atsidarys puslapį, pasirodys pranešimas **"Naujas atnaujinimas!"**
3. Paspaudus **"Atnaujinti"** - programa perkraus ir atsinaujins!

---

## 🐳 Docker

### Paleisti su Docker Compose (rekomenduojama)

```bash
# Paleisti
docker-compose up -d

# Sustabdyti
docker-compose down

# Peržiūrėti logs
docker-compose logs -f

# Perkrauti po pakeitimų
docker-compose up -d --build
```

### Paleisti su Docker (be compose)

```bash
# Build image
docker build -t knygu-biblioteka .

# Run container
docker run -d \
  -p 5123:5123 \
  -v $(pwd)/books.json:/app/books.json \
  -v $(pwd)/wishlist.json:/app/wishlist.json \
  -v $(pwd)/backups:/app/backups \
  --name knygu-biblioteka \
  knygu-biblioteka

# Sustabdyti
docker stop knygu-biblioteka

# Ištrinti
docker rm knygu-biblioteka
```

### Docker Volume'ai
Svarbu! Duomenys išsaugomi per volumes:
- `books.json` - Knygų duomenys
- `wishlist.json` - Wish list
- `backups/` - Backup'ai

---

## 🌐 GitHub Pages Deployment

### 1. Sukurti GitHub repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TAVO_USERIS/knygu-biblioteka.git
git push -u origin main
```

### 2. Frontend (Static files) → GitHub Pages

GitHub Pages gali host'inti tik statinius failus (HTML, CSS, JS).
Kadangi tavo aplikacija naudoja Flask backend'ą, reikės:

**Variantas A: Backend kitur (PythonAnywhere, Heroku, Railway)**
1. Deploy backend į PythonAnywhere / Railway / Render
2. Atnaujink frontend, kad jungčiausi prie remote backend API

**Variantas B: Pilna aplikacija Docker container'yje**
1. Deploy visą Docker container'į į:
   - Railway.app (nemokamas tier)
   - Render.com (nemokamas tier)
   - Fly.io (nemokamas tier)
   - DigitalOcean / AWS / Google Cloud (mokamas)

### 3. Deployment su Railway (rekomenduojama)

Railway.app palaiko Docker ir duoda free tier!

```bash
# 1. Įdiegti Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Sukurti projektą
railway init

# 4. Deploy
railway up

# 5. Gauti URL
railway open
```

---

## 🔄 Atnaujinimų workflow

### 1. Padaryti pakeitimus
```bash
# Redaguok kodus
# ...

# Commit changes
git add .
git commit -m "Add new feature"
```

### 2. Atnaujinti PWA versiją
Pakeisk versiją `static/sw.js`:
```javascript
const CACHE_NAME = 'knygu-biblioteka-v1.0.1'; // Padidink!
```

### 3. Deploy
```bash
# Docker
docker-compose up -d --build

# arba Railway
railway up

# arba GitHub
git push origin main
```

### 4. Vartotojų pranešimas
- Kai vartotojas atsidarys puslapį, automatiškai pasirodys: **"Naujas atnaujinimas!"**
- Paspaudus **"Atnaujinti"** - programa atsinaujins!

---

## 📱 Testing PWA

### Chrome DevTools
1. F12 → Application → Service Workers
2. Tikrinti ar Service Worker užregistruotas
3. Application → Manifest - tikrinti manifest.json

### Lighthouse
1. F12 → Lighthouse
2. Run "Progressive Web App" audit
3. Turėtų būti 100% score! 🎉

### Mobile Testing
1. Deploy į serverį (pvz., Railway)
2. Atsidaryk telefone
3. Turėtum matyti "Įdiegti" pranešimą

---

## 🆘 Troubleshooting

### PWA install prompt nepasirodė?
- Tikrink ar HTTPS (PWA reikia HTTPS, išskyrus localhost)
- Išvalyk cache (Ctrl+Shift+Del)
- Atsidaryk Incognito mode

### Service Worker neveikia?
- F12 → Console - tikrink errors
- Application → Service Workers → Unregister ir perkrauk

### Docker nepaleidžia?
```bash
# Tikrink logs
docker-compose logs

# Perkrauk su fresh build
docker-compose down
docker-compose up -d --build
```

### Atnaujinimai neveikia?
- Tikrink ar pakeitei `CACHE_NAME` versiją `sw.js`
- Hard refresh (Ctrl+F5)
- Unregister service worker ir perkrauk

---

## 🎯 Pro Tips

1. **Versijų valdymas**: Visada didink versiją `sw.js` po pakeitimų!
2. **Testing**: Testuok PWA su Lighthouse
3. **Icons**: Naudok geros kokybės 512x512 ikoną
4. **Backup**: Docker volumes išsaugo duomenis, bet daryk backup'us!
5. **HTTPS**: Production'e BŪTINAI naudok HTTPS (PWA reikalauja)

---

## 📞 Support

Jei kilo problemų:
1. Tikrink `docker-compose logs`
2. Tikrink Browser Console (F12)
3. Testuok su Lighthouse audit

Good luck! 🚀
