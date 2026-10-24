# FLOO Production Monitoring v1.2

Stack: Node.js/Express, React Vite, Tailwind CSS, SweetAlert2, Google Sign-In.

## Setup
1. `npm install` (root)
2. `npm run install:all`
3. Copy `server/.env.example` to `server/.env`.
4. Fill `GOOGLE_CLIENT_ID`, `ALLOWED_EMAILS`, `SESSION_SECRET` (random 32+ characters), and `GOOGLE_SERVICE_ACCOUNT_JSON` (single-line JSON).
5. Share all 3 Google Sheets with the service account's `client_email` as **Viewer**.
6. Google Cloud OAuth client must be of type **Web application**, with Authorized JavaScript origin `http://localhost:5173`.
7. `npm run dev`; visit http://localhost:5173.

**Important**: Google login and Google Sheets service-account credentials are different. No credentials are bundled. Do not commit `.env` to Git.

## Current limitations
- Source data parser currently assumes consistent columns A:O across all 3 sources. Validate column mapping for TikTok and WA before production.
- Google Sheets formatting is read through `effectiveFormat.backgroundColor` and mapped using approximate color thresholds; verify actual shades and merged cells.
- Item completion without payet is determined from setor jahit; with payet from setor payet. Items that require payet but have not reached the payet column may be misclassified. Add explicit model configuration for production use.
- Report print uses browser print dialog. For best results choose Save as PDF.
- Live integration has not been tested with Google credentials; validate with real Sheets before trusting counts.
- A service account may not have access to all Sheets until shared.
- Deploy behind HTTPS, set NODE_ENV=production, and set CLIENT_ORIGIN to actual HTTPS domain.
