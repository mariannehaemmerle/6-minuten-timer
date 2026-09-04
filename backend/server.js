require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite Database
const db = new sqlite3.Database('freebie.db', (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Verbunden mit SQLite');
});

// Tabellen erstellen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY,
    keyword TEXT UNIQUE NOT NULL,
    freebie_link TEXT,
    freebie_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY,
    instagram_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT,
    zip_code TEXT,
    phone TEXT,
    optin1_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    optin2_date DATETIME,
    keyword_used TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// ========== API ENDPOINTS ==========

// 1. KEYWORDS VERWALTEN
app.get('/api/keywords', (req, res) => {
  db.all('SELECT * FROM keywords', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows || []);
  });
});

app.post('/api/keywords', (req, res) => {
  const { keyword, freebie_link, freebie_name } = req.body;
  db.run(
    'INSERT INTO keywords (keyword, freebie_link, freebie_name) VALUES (?, ?, ?)',
    [keyword.toUpperCase(), freebie_link, freebie_name],
    (err) => {
      if (err) res.status(500).json({ error: 'Keyword existiert bereits oder Fehler' });
      else res.json({ success: true, message: 'Keyword hinzugefügt' });
    }
  );
});

app.delete('/api/keywords/:id', (req, res) => {
  db.run('DELETE FROM keywords WHERE id = ?', [req.params.id], (err) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

// 2. LEADS VERWALTEN
app.get('/api/leads', (req, res) => {
  db.all('SELECT * FROM leads ORDER BY created_at DESC', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows || []);
  });
});

app.post('/api/leads', (req, res) => {
  const { name, email, address, city, zip_code, phone, keyword_used, instagram_id } = req.body;

  db.run(
    `INSERT INTO leads (name, email, address, city, zip_code, phone, keyword_used, instagram_id, optin2_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'confirmed')`,
    [name, email, address, city, zip_code, phone || '', keyword_used, instagram_id || ''],
    (err) => {
      if (err) {
        res.status(500).json({ error: 'Fehler beim Speichern' });
      } else {
        res.json({ success: true, message: 'Lead gespeichert!' });
      }
    }
  );
});

// 3. INSTAGRAM WEBHOOK (für Meta Graph API)
app.post('/api/instagram/webhook', async (req, res) => {
  const { entry } = req.body;

  if (!entry) return res.status(400).json({ error: 'Invalid payload' });

  entry.forEach(async (e) => {
    const messaging_events = e.messaging || [];

    messaging_events.forEach(async (msg) => {
      const sender = msg.sender.id;
      const text = msg.message?.text?.toUpperCase() || '';

      // Keyword checken
      db.get('SELECT * FROM keywords WHERE keyword = ?', [text], async (err, keyword) => {
        if (keyword) {
          // Automatische Antwort senden
          const formLink = `${process.env.FORM_URL || 'http://localhost:3000'}/form?keyword=${text}&ig=${sender}`;

          try {
            await sendInstagramMessage(
              sender,
              `🎉 Glückwunsch! Du hast "${text}" geschrieben!\n\nHier geht's zu deinem Freebie:\n${formLink}\n\nBitte füll das Formular aus (Double Opt-In) und dein Freebie wird sofort freigeschaltet! 🎁`
            );
          } catch (error) {
            console.error('Fehler beim Senden:', error.message);
          }
        }
      });
    });
  });

  res.status(200).send('ok');
});

// Webhook Verify (für Meta)
app.get('/api/instagram/webhook', (req, res) => {
  const verify_token = process.env.INSTAGRAM_VERIFY_TOKEN || 'dein_verify_token';
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (token === verify_token) {
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 4. FORMULAR DATEN
app.post('/api/form-submit', (req, res) => {
  const { name, email, address, city, zip_code, phone, keyword, instagram_id } = req.body;

  db.run(
    `INSERT INTO leads (name, email, address, city, zip_code, phone, keyword_used, instagram_id, optin2_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'confirmed')`,
    [name, email, address, city, zip_code, phone || '', keyword || '', instagram_id || ''],
    (err) => {
      if (err) {
        res.status(500).json({ error: 'Fehler beim Speichern' });
      } else {
        // Freebie Link abrufen
        db.get('SELECT freebie_link FROM keywords WHERE keyword = ?', [keyword], (err, row) => {
          res.json({
            success: true,
            message: 'Herzlichen Glückwunsch! Hier ist dein Freebie:',
            freebie_link: row?.freebie_link || 'https://example.com/freebie'
          });
        });
      }
    }
  );
});

// 5. EXPORT LEADS (CSV)
app.get('/api/export-csv', (req, res) => {
  db.all('SELECT * FROM leads WHERE status = "confirmed"', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const csv = 'Name,Email,Adresse,Stadt,PLZ,Telefon,Keyword,Datum\n' +
      rows.map(r => `"${r.name}","${r.email}","${r.address}","${r.city}","${r.zip_code}","${r.phone}","${r.keyword_used}","${r.optin2_date}"`).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  });
});

// Instagram Message Senden (Helper)
async function sendInstagramMessage(recipient, message) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    throw new Error('INSTAGRAM_ACCESS_TOKEN nicht gesetzt');
  }

  await axios.post(
    `https://graph.instagram.com/v18.0/me/messages`,
    {
      recipient: { id: recipient },
      message: { text: message }
    },
    {
      params: { access_token: token }
    }
  );
}

// Server starten
app.listen(port, () => {
  console.log(`🚀 Server läuft auf http://localhost:${port}`);
  console.log(`📧 Webhook URL: http://localhost:${port}/api/instagram/webhook`);
});
