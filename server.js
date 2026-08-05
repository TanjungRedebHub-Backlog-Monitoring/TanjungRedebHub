const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '30mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// DATA_DIR should point to a Railway Volume mount path in production
// (e.g. set env var DATA_DIR=/data and attach a Volume there),
// otherwise it falls back to a local folder for development.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DATA_FILE = path.join(DATA_DIR, 'records.json');

function readStore() {
  if (!fs.existsSync(DATA_FILE)) {
    return { records: [], updatedAt: null, fileName: null };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read data file:', err);
    return { records: [], updatedAt: null, fileName: null };
  }
}

// ---------- API ----------
app.get('/api/data', (req, res) => {
  res.json(readStore());
});

app.post('/api/upload', (req, res) => {
  const { password, records, fileName } = req.body || {};

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD belum diset di server (env var).' });
  }
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Password admin salah.' });
  }
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Format data tidak valid.' });
  }

  const payload = {
    records,
    updatedAt: new Date().toISOString(),
    fileName: fileName || null,
  };

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to write data file:', err);
    return res.status(500).json({ error: 'Gagal menyimpan data di server.' });
  }

  res.json({ ok: true, count: records.length, updatedAt: payload.updatedAt });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Fallback: serve the SPA index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SPX Backlog Dashboard server running on port ${PORT}`);
  console.log(`Data stored at: ${DATA_FILE}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('WARNING: ADMIN_PASSWORD env var is not set. Uploads will always fail until you set it.');
  }
});
