# CareVault — SIH 2026

## Fixed working version
Frontend: HTML + CSS + Vanilla JavaScript
Backend: Node.js + Express.js
Database: MongoDB + Mongoose

### Access
- No public doctor registration.
- Only hospital admin can create doctor accounts.
- Only active registered staff can access the application.
- Login uses Staff ID + Password + CAPTCHA.
- Admin can activate/deactivate doctors.

### Hospital admin
Set these in `backend/.env`:
`ADMIN_STAFF_ID=76062`
`ADMIN_PASSWORD=Abhinav@1234`

### Run manually
Open CMD:
```
cd backend
npm install
copy .env.example .env
npm start
```
Then another CMD:
```
cd frontend
python -m http.server 5500
```
Open `http://localhost:5500`.

### Easy Windows start
Double-click `START_CAREVAULT.bat`. On first run, it creates `.env`; verify it, then run the file again.

### Troubleshooting
If the browser says `Failed to fetch` on every tab, the Node/Express backend is not reachable. Check the backend terminal first. It must say:
`API running on http://localhost:5000`
Then open `http://localhost:5000/api/health` and confirm it returns JSON with `ok: true`.

If the backend closes immediately, read its terminal error. Common causes are MongoDB not running or missing `.env`.

### Security
Passwords are bcrypt-hashed; sessions use HttpOnly JWT cookies; patient records use AES-256-GCM encryption at rest; routes use role-based authorization, Helmet and rate limiting. For real patient data, add HTTPS, MFA, key management/KMS, CSRF protection, secure backups and applicable healthcare/privacy compliance.


## Simplified local run
The backend now serves the frontend itself. You do NOT need Python, Live Server, or http-server. Start Node from `backend` and open `http://localhost:5000`.
