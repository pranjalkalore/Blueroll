# BlueRoll – Bluetooth Attendance (Vercel-ready)

## Deploy (5 minutes)
1. Upload this folder to GitHub, then **Import** it in Vercel (Framework preset: *Other*).
2. **Create a database (required!)** Vercel project → **Storage** → *Create / Connect* → **Upstash Redis** (free) → connect to this project. Vercel adds the env vars automatically. (Without a database, Vercel's servers cannot share attendance data, and the app will show a red "Database not connected" banner.)
3. Project → Settings → Environment Variables → add `TEACHER_PASSCODE` = your own secret.
4. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect.
5. Open `https://YOUR-APP.vercel.app/api/health` – you should see `"ok":true,"persistent":true`.

## Run locally
`npm install` then `npm run dev` → http://localhost:3000 (uses in-memory data; teacher passcode `teacher123`).

## Using it
- Teacher: `/teacher` → passcode → Start attendance. Put your phone's Bluetooth on and advertise the shown beacon name (nRF Connect → Advertiser → Complete Local Name).
- Student: `/student` → name + roll → **Enable Bluetooth & permissions** → **Scan & mark attendance** → pick the beacon.
- No beacon? Untick "Require Bluetooth"; students use the 4-digit class code.

## Notes
Browsers can't advertise Bluetooth, only scan, hence the beacon. Web Bluetooth works in Chrome/Edge (Android, Windows, Mac, Linux, ChromeOS) over HTTPS, not iOS Safari.
