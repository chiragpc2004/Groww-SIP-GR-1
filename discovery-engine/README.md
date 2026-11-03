# SIP Discovery Engine — deploy guide

Files:
- `index.html` — the page
- `api/ai.js` — server function that calls Gemini (your key stays on the server)
- `data/engine_data.json` — the coded evidence
- `package.json`

## 1. Get a Gemini API key (free)
1. Go to Google AI Studio (aistudio.google.com) and sign in with a Google account.
2. Click **Get API key** → **Create API key**. Copy it somewhere safe.
3. Note the free-tier limits shown there for the Flash model.

## 2. Put the folder on GitHub
1. Sign up or sign in at github.com.
2. Click **+** (top right) → **New repository**. Name it `sip-discovery-engine`. Keep it **Private** is fine. Click **Create repository**.
3. On the new repo page, click **uploading an existing file**.
4. (Uploading is covered in the main README.)
5. Click **Commit changes**.

## 3. Deploy on Vercel
1. Go to vercel.com → **Sign up** → **Continue with GitHub**.
2. Click **Add New…** → **Project** → **Import** next to `sip-discovery-engine`.
3. Leave Framework Preset as **Other**. Open **Environment Variables** and add:
   - Name `GEMINI_API_KEY`, value: your key
4. Click **Deploy**. After about a minute you get a link like `sip-discovery-engine.vercel.app`.

## 4. Test it
Open the link, click **Ask**, then **Code it**. Both should show a **Live** tag and a green check.
If you see the saved example instead, open Vercel → your project → **Logs** and look for the error line.

## Optional settings (Vercel → Settings → Environment Variables, then Redeploy)
- `GEMINI_MODEL` — main model (default `gemini-3.8-flash`)
- `GEMINI_FALLBACK_MODEL` — used when the main model is busy or out of quota (default `gemini-flash-lite-latest`)
- `RATE_LIMIT_PER_HOUR` — requests per visitor per hour (default 20)

To update the page later: upload the changed file to GitHub. Vercel redeploys automatically.
