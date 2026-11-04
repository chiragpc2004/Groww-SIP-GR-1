# SIP Recovery Assistant (MVP)

Helps a first-time SIP investor act on a failed or at-risk instalment: pay, skip, lower the amount, move the date, or cancel knowingly. Dummy data only; not investment advice.

## How it works

| Layer | File | What it does |
|---|---|---|
| Rules engine | `rules.js` | Plain code. Computes every date, deadline and option from Groww's published rules (`groww_sip_rules.md`). Runs in the browser and on the server. |
| AI explainer | `api/answer.js` | Drafts an answer from the engine's facts only (Groq first if `GROQ_API_KEY` is set, then Gemini). |
| Eval gate | `api/answer.js` | Declines fund-pick and prediction requests by code; then code checks (no fund names or advice, no predictions or urgency, only verified rules, dates and amounts must match) and an AI reviewer (facts, cancel described correctly, neutral). Any failure shows a safe fallback. |
| Golden set | `eval/golden.json` | 26 cases: core, messy/Hinglish, adversarial, unverified-rule and hardship. Run from the **Quality report** tab. |
| App | `index.html` | Native-style mobile app (phone frame on desktop, full screen on phones, installable): SIP list, SIP details with "missed X of 3", options sheet, cancel flow, assistant chat with visible checks. Quality report at `#quality`. |

## Deploy (Vercel)

Import this repo as a new project, set **Root Directory** to `mvp`, and add `GEMINI_API_KEY` (and optionally `GROQ_API_KEY`). Optional: `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`, `GROQ_MODEL`, `RATE_LIMIT_PER_HOUR` (default 40).

Running all 26 eval cases uses about 40 model calls. On Gemini's free tier (about 5 requests a minute) the page pauses and retries, so a full run can take 10 minutes or more; with a Groq key it's much faster.
