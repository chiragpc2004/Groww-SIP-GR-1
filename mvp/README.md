# GR-1: SIP Recovery Assistant (MVP)

Helps a first-time SIP investor act on a failed or at-risk instalment: pay, skip, lower the amount, move the date, or cancel knowingly. Sample data only. Not affiliated with Groww. Not investment advice.

Live: https://nextleap-groww-mvp.vercel.app (demo at `#demo`, quality report at `#quality`)

## How it works

| Layer | File | What it does |
|---|---|---|
| Rules engine | `rules.js` | Plain code. Computes every date, deadline and option from Groww's published rules (`groww_sip_rules.md`). Runs in the browser and on the server. |
| Wellbeing gate | `api/answer.js` | Runs first. Messages about distress, serious illness or a death (including follow-ups in the same chat) get a fixed, caring reply with a helpline (Tele-MANAS 14416). No AI is used and no SIP actions are suggested. |
| Policy gate | `api/answer.js` | Declines requests for fund picks or predictions in code, before any AI call. |
| AI explainer | `api/answer.js` | Drafts an answer from the engine's facts only. Groq first (`openai/gpt-oss-120b`, then `gpt-oss-20b`, waiting out per-minute limits), then Gemini. |
| Checks | `api/answer.js` | 5 code checks: no fund names or advice, no predictions or urgency, only verified rules, dates and amounts match, cancelling explained. Then an AI reviewer checks facts and neutrality. Any failure shows a safe fallback built from the rules. |
| Golden set | `eval/golden.json` | 32 cases: core, Hinglish or messy, adversarial, unverified rules, hardship, user-test questions and wellbeing. Run from the **Quality report**. |
| Eval history | `eval/runs/`, `eval/CORRECTIONS.md` | Every run's results and what was changed after each. `eval/last_run.json` is the run shown on the Quality report. |
| App | `index.html` | Native-style mobile app (phone frame on desktop, full screen on phones, installable): GR-1 alert and card, confirm sheets for each action, cancel flow, chat with visible checks, and a toggle to compare with today's app. |

## Deploy (Vercel)

Import this repo as a new project, set **Root Directory** to `mvp`, and add `GROQ_API_KEY` and/or `GEMINI_API_KEY`.

Optional settings: `GROQ_MODELS` (comma-separated fallback chain), `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`, `RATE_LIMIT_PER_HOUR` (chat, default 40 per person) and `RATE_LIMIT_EVAL_PER_HOUR` (eval runs, default 150).

A full eval run makes about 60 model calls. Progress is saved in the browser, so **Continue** picks up where a run stopped and **Start over** runs every case fresh. If a case fails to get an answer, the page shows the HTTP status and each provider's reason.
