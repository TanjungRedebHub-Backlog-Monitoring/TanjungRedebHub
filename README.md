# SPX Backlog Monitoring Dashboard (Auto-Sync Version)

Versi ini pakai backend kecil (Node.js + Express) supaya data yang diupload admin
langsung tersimpan di server dan otomatis kelihatan oleh semua user — tanpa perlu
download-replace-commit manual lagi.

## Struktur
```
├── server.js        <- backend Express (serve dashboard + API)
├── package.json
├── .gitignore
└── public/
    └── index.html   <- dashboard (frontend)
```

## Setelah di-push ke GitHub & connect ke Railway

Ada 2 hal WAJIB yang perlu di-setting di Railway (sekali saja):

### 1. Set Environment Variable ADMIN_PASSWORD
Di Railway → buka project kamu → tab **Variables** → klik **New Variable**:
- Name: `ADMIN_PASSWORD`
- Value: (password rahasia pilihan kamu, contoh: `spx-tanjungredeb-2026`)

Tanpa ini, endpoint upload akan selalu menolak (error 500).

### 2. Tambahkan Volume supaya data tidak hilang saat redeploy
Di Railway → tab **Settings** → scroll ke bagian **Volumes** → klik **New Volume**:
- Mount path: `/data`

Lalu di tab **Variables**, tambahkan lagi:
- Name: `DATA_DIR`
- Value: `/data`

Tanpa Volume, data yang sudah diupload akan HILANG setiap kali Railway redeploy
(misalnya setiap kamu push perubahan baru ke GitHub).

## Cara pakai sehari-hari

1. Buka `https://domain-kamu.up.railway.app/?admin=1`
2. Upload file export FMS (.xlsx)
3. Masukkan password admin (yang di-set di step 1 di atas)
4. Klik **Simpan ke Server**
5. Selesai — semua user yang buka domain (tanpa `?admin=1`) langsung lihat data terbaru

## Development lokal (opsional)
```bash
npm install
ADMIN_PASSWORD=test123 npm start
```
Buka `http://localhost:3000`

<!-- trigger redeploy -->
