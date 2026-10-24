# FLOO Production Monitoring — MVC Refactor + OAuth Google Sheets

Frontend React dipertahankan dari paket v1.2. Backend dipisah menjadi routes, controllers, services, middleware, utils, config. Data tetap hanya dibaca (readonly).

## Cara pemasangan
1. **Backup folder proyek lama**, terutama `server/.env`. Jangan menyalin `.env` ke chat atau Git.
2. Ekstrak ZIP ini. Salin nilai dari `.env` lama ke `server/.env` baru, tambahkan `GOOGLE_CLIENT_SECRET` (yang sudah dibuat), serta ID spreadsheet. `GOOGLE_SERVICE_ACCOUNT_JSON` **tidak dipakai**.
3. Google Cloud > Google Auth Platform > Clients > `floo-monitoring` > **Authorized redirect URIs** > tambahkan `http://localhost:4000/auth/google/callback` lalu Save. Origin `http://localhost:5173` tetap ada.
4. Google Auth Platform > Data Access: pastikan scope Google Sheets (`.../auth/spreadsheets.readonly`) tersedia jika perlu. Jika app masih Testing, tambahkan email ke **Audience > Test users**. Perlu diingat refresh token app External Testing dengan scope non-basic dapat kedaluwarsa setelah sekitar 7 hari; untuk penggunaan jangka panjang selesaikan konfigurasi publikasi/verification sesuai kebutuhan.
5. Terminal 1: `cd server`, `npm install`, `npm run authorize:sheets`. Buka URL yang muncul di terminal, pilih akun yang punya akses spreadsheet, setujui akses. Salin `GOOGLE_REFRESH_TOKEN=...` dari terminal ke `server/.env` secara lokal. **Jangan bagikan token**.
6. Terminal 1: `npm run dev`. Terminal 2: `cd client`, `npm install`, `npm run dev`.
7. Buka `http://localhost:5173`, login, cek `/api/orders?month=2026-10` setelah login. Jika ada peringatan, periksa nama tab, izin spreadsheet, dan env.

## Struktur
- `server/index.js`: entrypoint
- `server/src/app.js`: Express middleware dan routes
- `server/src/routes`: endpoint
- `server/src/controllers`: HTTP request/response
- `server/src/services`: Google OAuth Sheets client dan pembacaan data
- `server/src/utils/orders.js`: parsing tanggal, warna, status dan pesanan
- `server/src/middleware/auth.js`: JWT cookie auth
- `server/scripts/authorize-sheets.js`: otorisasi satu kali untuk refresh token

## Catatan keamanan
- Jangan commit `.env`, token, secret, atau JSON credential.
- Google OAuth login ID token **bukan** izin untuk membaca Google Sheets; keduanya berbeda.
- Script otorisasi menggunakan port lokal 4000. Tutup backend yang memakai port itu saat menjalankan script.
- OAuth refresh token hanya disimpan di `server/.env`; browser tidak menerima token.
- Saat deployment, pastikan cookie HTTPS, origin dan proxy dikonfigurasi sesuai domain. Proses otorisasi dijalankan lokal sekali; pindahkan refresh token secara aman ke secret environment deployment.
