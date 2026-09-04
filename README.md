# 📱 Instagram Freebie Bot mit Double Opt-In

Ein automatisiertes System für Instagram, das:
- 🤖 Automatisch auf dein Codewort reagiert
- 📝 Mit Double Opt-In Formular Adressen sammelt
- 🎁 Automatisch Freebies (PDFs, Links, etc.) ausliefert
- 📊 Alle Leads verwaltet und exportiert

---

## 🎯 Wie es funktioniert

```
1. Nutzer schreibt "FREEBIE" 💬
   ↓
2. Bot antwortet automatisch mit Formular-Link 🤖
   ↓
3. Nutzer füllt Adresse aus + akzeptiert Datenschutz ✓
   ↓
4. Freebie wird sofort freigeschaltet 🎁
   ↓
5. Adresse wird in deiner Datenbank gespeichert 💾
```

---

## 🚀 Installation & Setup

### 1. **Voraussetzungen**
- Node.js 16+ installiert
- Instagram Business Account
- Meta/Facebook Developer Account

### 2. **Repository klonen & Abhängigkeiten installieren**

```bash
npm install
cd frontend && npm install && cd ..
```

### 3. **Umgebungsvariablen setzen**

Erstelle eine `.env` Datei im Root-Verzeichnis:

```bash
cp .env.example .env
```

Dann bearbeite `.env`:

```env
# Instagram API Credentials
INSTAGRAM_ACCESS_TOKEN=your_token_here
INSTAGRAM_VERIFY_TOKEN=your_verify_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id

# Server
PORT=5000
FORM_URL=http://localhost:3000
```

### 4. **Meta Graph API Credentials abrufen**

1. Gehe zu [Meta Developers](https://developers.facebook.com/)
2. Erstelle eine neue App → "Business" Typ
3. Füge "Instagram" als Produkt hinzu
4. Gehe zu **Settings → Basic** → Kopiere App ID & App Secret
5. Gehe zu **Messenger → Settings** → Generate Token für dein Instagram Business Account
6. Nutze den Token als `INSTAGRAM_ACCESS_TOKEN`
7. Erstelle einen `INSTAGRAM_VERIFY_TOKEN` (beliebiger String, z.B. `my_voice_is_my_password`)

---

## 📖 Verwendung

### **Local Development**

```bash
npm run dev
```

Startet automatisch:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### **Production**

```bash
npm run build
npm run start
```

---

## 🎮 Admin Dashboard

Öffne: **http://localhost:3000**

### **Keywords verwalten:**
1. Gib ein Keyword ein (z.B. "FREEBIE", "COACHING", "EBOOK")
2. Lade dein Freebie-Link ein (Google Drive, Dropbox, etc.)
3. Nutzer die dieses Keyword auf Instagram schreiben, bekommen es automatisch!

### **Leads exportieren:**
- Gehe zum Tab "Leads"
- Klick "Als CSV exportieren"
- Alle Adressen sind jetzt in einer Datei!

---

## 🔗 Webhook Einrichtung

Damit Instagram Nachrichten an deinen Bot sendet:

1. Gehe zu **Instagram App → Messenger → Webhooks**
2. Setze deine Webhook URL: `https://deine-domain.com/api/instagram/webhook`
3. Verify Token: derselbe wie in der `.env` Datei
4. Abonniere folgende Events:
   - `messages`
   - `messaging_postbacks`
   - `messaging_optins`

> **Wichtig:** Du brauchst ein öffentliches HTTPS-Zertifikat! Lokal funktioniert es nicht mit `http://localhost`.

---

## 📊 Datenbankstruktur

### `keywords` Tabelle
```
id | keyword  | freebie_link | freebie_name  | created_at
1  | FREEBIE  | https://...  | Mein E-Book   | 2024-01-01
```

### `leads` Tabelle
```
id | name    | email          | address            | city   | zip | keyword | status | optin2_date
1  | Max M.  | max@mail.com   | Musterstr. 123     | Berlin | 10115 | FREEBIE | confirmed | 2024-01-15
```

---

## 🔒 Datenschutz & DSGVO

✅ **Double Opt-In:** Zwei bestätigungen erforderlich
✅ **CSV Export:** Für deine Aufzeichnungen
✅ **Keine automatische Verarbeitung:** Nur bestätigte Leads
✅ **Abmelde-Funktion:** Nutzer können sich jederzeit abmelden

---

## 🛠️ Troubleshooting

### Webhook funktioniert nicht
- Überprüfe, dass deine URL öffentlich & HTTPS ist
- Verify Token muss exakt mit `.env` übereinstimmen
- Logs anschauen: `node backend/server.js`

### Keine Leads werden gespeichert
- Überprüfe Access Token in `.env`
- Stelle sicher, dass das Formular erreichbar ist
- Check Browser Console auf Fehler

### Freebie-Link wird nicht angezeigt
- Überprüfe, dass die URL in Admin-Panel korrekt ist
- Link muss öffentlich erreichbar sein

---

## 📁 Projektstruktur

```
.
├── backend/
│   └── server.js           # Express API
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML
│   └── src/
│       ├── App.js
│       ├── pages/
│       │   ├── Dashboard.js      # Admin Panel
│       │   └── OptInForm.js      # Formular für Nutzer
│       └── App.css
├── package.json
├── .env.example
└── freebie.db              # SQLite Datenbank (auto-erstellt)
```

---

## 🚀 Deployment

### Vercel / Netlify
```bash
npm run build
# Frontend lies im frontend/build Ordner
```

### Heroku
```bash
heroku create your-app
git push heroku main
heroku config:set INSTAGRAM_ACCESS_TOKEN=...
```

---

## 📝 Lizenz

MIT © Marianne Hämmerle

---

**Fragen?** Gerne Feedback oder Issues erstellen! 💚
