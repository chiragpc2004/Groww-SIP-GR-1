# NL_Groww — First-time SIP continuation

Product fellowship graduation project. Goal: raise the share of first-time mutual fund investors who still have an active SIP 12 months after starting.

Independent student case study built on public posts. Not affiliated with Groww. Not investment advice.

## Folders

| Folder | What's in it |
|---|---|
| `discovery-engine/` | The deployed discovery engine (Vercel app). See its own README for setup. |
| `research/scraping/` | `scrape.py`, the one script that collected 7,600 public posts (Play Store, App Store, Reddit archives, YouTube, TradingQ&A). |
| `research/pipeline/` | Filtering, keyword tagging, AI coding results (`codes_all.txt`), analysis and opportunity scoring. |
| `research/data/` | Raw and processed datasets. `exit_coded.csv` is the final coded set (443 posts). |
| `research/golden-set/` | 20 posts hand-labelled blind, the engine's labels, the comparison, and the codebook. |
| `research/interviews/` | 6 user interviews, anonymised as P1–P6. |
| `mvp/` | The AI-native MVP (to be added). |

## Rebuilding the analysis

From `research/pipeline/`, with the CSVs from `research/data/` copied alongside:

```
python filter.py     # raw_items.csv -> sip_items.csv
python tagger.py     # keyword tags -> tagged_lexicon.csv
python analyze.py    # merges AI codes -> exit_coded.csv
python opp.py        # opportunity scores -> opportunities.json
python calib.py      # keyword vs AI agreement
```

## Deploying on Vercel

Each app lives in its own folder, so one repo can hold several Vercel projects. When importing, set **Root Directory** to the app's folder (`discovery-engine` now, `mvp` later).
