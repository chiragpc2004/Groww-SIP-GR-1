# NL_Groww: Keep SIP Active

PM fellowship graduation project. Goal: raise the share of first-time mutual fund investors on Groww who still have an active SIP 12 months after starting.

The finding: many SIPs stop by accident. A salary comes in late, a payment fails, and three misses in a row cancel the SIP. The lighter options (skip a month, pay less, move the date) already exist, but people find them too late. The concept, **GR-1**, puts Groww's AI assistant at the front of the app at that moment: it explains what happened, shows every option with the best fit first, and leaves the decision to the user.

Independent student case study built on public posts and sample data. Not affiliated with or endorsed by Groww. Not investment advice.

## Live links

| | |
| --- | --- |
| MVP (GR-1 concept) | https://nextleap-groww-mvp.vercel.app |
| MVP quality report and eval | https://nextleap-groww-mvp.vercel.app/#quality |
| AI discovery engine | https://nextleap-groww-sip-discovery-engine.vercel.app |

The deck, PRD, AI Evidence Log and user test kit are in [`deliverables/`](deliverables), with links to the shared copies in its [README](deliverables/README.md).

## Results at a glance

- **Discovery:** 7,600 public posts → 2,586 about SIPs → 443 about stopping → 219 first-person stories, coded by AI and checked against 20 hand-labelled posts.
- **Research:** 6 interviews (P1–P6) and 3 user tests on the live MVP.
- **MVP eval:** 32 test questions; the latest run (run 7) passed 30 of 32, with 0 unsafe answers in all 7 runs. Every run and correction is in [`mvp/eval`](mvp/eval).

## Folders

| Folder | What's in it |
|---|---|
| [`mvp/`](mvp) | The GR-1 MVP: rules engine, AI answer pipeline with code checks and an AI reviewer, the golden set and every eval run. See its [README](mvp/README.md). |
| [`discovery-engine/`](discovery-engine) | The AI discovery engine app. See its [README](discovery-engine/README.md). |
| [`deliverables/`](deliverables) | Deck (PDF and PPTX, plus the script that builds it), PRD, AI Evidence Log, user test kit. |
| `research/scraping/` | `scrape.py`, the script that collected the 7,600 public posts (Play Store, App Store, Reddit archives, YouTube, TradingQ&A). |
| `research/pipeline/` | Filtering, keyword tagging, AI coding results (`codes_all.txt`), analysis and opportunity scoring. |
| `research/data/` | Raw and processed datasets. `exit_coded.csv` is the final coded set (443 posts). |
| `research/golden-set/` | 20 posts hand-labelled blind, the engine's labels, the comparison and the codebook. |
| `research/interviews/` | The 6 interviews, anonymised as P1–P6. |

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

Each app lives in its own folder, so this one repo holds two Vercel projects. When importing, set **Root Directory** to `mvp` or `discovery-engine`, then add the API keys listed in that app's README. Keys stay on the server and are never in the repo.
