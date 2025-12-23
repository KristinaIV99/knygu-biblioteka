# 📚 Knygų Biblioteka

Paprasta Flask aplikacija namų knygų kolekcijai valdyti.

## ✨ Funkcijos

- 🔍 Greita paieška
- ✓ Skaitymo statusas
- ⭐ Įvertinimas (1-5 žvaigždutės)
- 📅 Skaitymo datos
- 📤 Paskolinimo sekimas
- 🌍 Kalba (LT/SV/EN)
- 👫 Savininkas (Kristina/Darius)
- ⚠️ Dublikatų tikrinimas
- 💾 Backup/Export/Import

## 🚀 Paleidimas

```bash
# 1. Įdiegti Flask
pip install flask

# 2. Paleisti
python3 app.py
```

Adresas: http://localhost:5123

### Per PM2

```bash
pm2 start ecosystem.config.js
pm2 save
```

## 📱 Prieiga per Tailscale

```bash
tailscale ip -4
# Telefone: http://[IP]:5123
```

## 📁 Struktūra

```
knygu-biblioteka/
├── app.py              # Flask serveris
├── books.json          # Duomenys
├── templates/index.html
├── backups/            # Automatiniai backup'ai
└── ecosystem.config.js # PM2 config
```
