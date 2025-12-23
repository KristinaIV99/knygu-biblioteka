# 🎯 Frontend + Backend Setup Guide

## Kas padaryta:

### ✅ Backend (Docker)
- **Lokacija**: `D:\SERVER\MANO_PROGRAMOS\KNYGA\`
- **Docker**: Veikia su CORS palaikymu
- **API**: `http://localhost:5123/api/...`

### ✅ Frontend (Static HTML)
- **Failas**: `index.html` (static HTML, ne Jinja2)
- **Config**: `static/js/config.js` - backend URL konfigūracija
- **GitHub ready**: Pasiruošęs deployment'ui

---

## 🚀 Kaip naudoti DABAR (lokaliai):

### 1. Paleisti Backend (Docker)
```bash
cd D:\SERVER\MANO_PROGRAMOS\KNYGA
docker-compose up -d
```

### 2. Atidaryti Frontend
Tiesiog atidaryk failą naršyklėje:
```
D:\MANO_PROGRAMOS\KNYGA\index.html
```

Arba paleisk simple HTTP serverį:
```bash
cd D:\MANO_PROGRAMOS\KNYGA
python -m http.server 8000
```

Tada atsidaryk: `http://localhost:8000`

---

## 📤 Frontend Deployment į GitHub Pages

### 1. Sukurti frontend branch
```bash
cd D:\MANO_PROGRAMOS\KNYGA

# Sukurti naują orphan branch frontend'ui
git checkout --orphan frontend

# Išvalyti visus failus
git rm -rf .

# Nukopijuoti tik frontend failus
cp index.html .
cp -r static .
cp .gitignore .

# Commit
git add .
git commit -m "Frontend static files"

# Push į GitHub
git push origin frontend
```

### 2. Aktyvuoti GitHub Pages
1. Eik į https://github.com/KristinaIV99/knygu-biblioteka
2. **Settings** → **Pages**
3. **Source**: Deploy from branch
4. **Branch**: `frontend` → `/ (root)` → Save
5. Po kelių minučių frontend bus pasiekiamas:
   `https://kristinaiv99.github.io/knygu-biblioteka/`

### 3. Atnaujinti backend URL
Kai deploy'ini į GitHub Pages, atnaujink `static/js/config.js`:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5123'  // Local development
    : 'http://YOUR_SERVER_IP:5123'; // Production backend URL
```

---

## 🐳 Backend Deployment

### Variantas 1: Local (tavo PC)
```bash
cd D:\SERVER\MANO_PROGRAMOS\KNYGA
docker-compose up -d
```

**Problema**: Tavo kompiuteris turi būti įjungtas ir prieinamas iš interneto.

### Variantas 2: Railway (NEMOKAMAS!)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd D:\SERVER\MANO_PROGRAMOS\KNYGA
railway init
railway up

# Gauti URL
railway open
```

Railway duos tau URL, pvz.: `https://knygu-biblioteka-production.up.railway.app`

Tada atnaujink `static/js/config.js`:
```javascript
const API_BASE_URL = 'https://knygu-biblioteka-production.up.railway.app';
```

---

## 🔄 Workflow

### Lokaliai testuoti:
1. Backend: `docker-compose up -d`
2. Frontend: Atsidaryk `index.html`
3. Viskas veiks lokaliai!

### Production:
1. **Frontend** → GitHub Pages (nemokamas, greitas)
2. **Backend** → Railway / Render / kitas serveris
3. Atnaujink `config.js` su production backend URL
4. Commit ir push `frontend` branch

---

## ⚡ Trumpai

**Dabar:**
- Frontend: `D:\MANO_PROGRAMOS\KNYGA\index.html`
- Backend: Docker `D:\SERVER\MANO_PROGRAMOS\KNYGA\`
- API: `http://localhost:5123`

**Kai nori internete:**
- Frontend → GitHub Pages (deploy `frontend` branch)
- Backend → Railway.app (deploy Docker)
- Update `config.js` su production URL

---

## 💡 Geriausia strategija

1. **Dabar testuok lokaliai** - Backend Docker + Frontend index.html
2. **Kai viskas veikia** - Deploy backend į Railway (10 min)
3. **Tada deploy frontend** - Push į GitHub Pages (5 min)
4. **Atnaujink config.js** - Su Railway URL
5. **PROFIT!** 🎉

Programa veiks internete, frontend nemokamas (GitHub Pages), backend nemokamas (Railway free tier)!

---

## 🆘 Help

**Frontend nerodo knygų?**
- Tikrink ar backend veikia: `http://localhost:5123/api/books`
- Tikrink Browser Console (F12) ar nėra CORS errorų
- Tikrink `config.js` ar teisingas URL

**CORS error?**
- Backend turi `flask-cors` - jau įdiegta! ✅
- Perkrauk Docker: `docker-compose up -d --build`

**GitHub Pages neveikia?**
- Palaukite 2-5 minutes po deployment
- Tikrinkite Settings → Pages ar aktyvuota

Good luck! 🚀
