# FLOO v1.3 — Full-stack modular refactor

Frontend React tidak menggunakan MVC klasik; pendekatan yang digunakan adalah pages (views), components, hooks (state/controller), services (API), dan utils. Backend tetap Express MVC.

## Instalasi
1. Ekstrak ZIP ke folder baru.
2. Salin `server/.env` lama secara lokal (jangan dibagikan).
3. `npm install` lalu `npm run install:all` dan `npm run dev`.
4. Untuk OAuth Sheets, ikuti `server/README-MVC.md`.

Tidak ada secret atau token di ZIP. Tidak ada perubahan terhadap spreadsheet sumber.

## Perlu validasi sebelum produksi
Mapping kolom, warna ungu/oranye, dan kebutuhan payet per model harus diperiksa dengan data asli. Mode Testing OAuth dengan scope Sheets mungkin membuat refresh token berlaku singkat.
