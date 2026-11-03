# Golden set — how to label (do this BEFORE seeing the engine's labels)

Open `golden_set_blind.csv` (Google Sheets is fine). For each of the 20 rows, fill the four columns.

## your_relevant (Y/N)
Y if the text is about someone (themselves, or someone they advise) continuing, pausing, reducing, stopping or redeeming a SIP / mutual fund investment. N otherwise.

## your_action — pick one
| Code | Meaning |
|---|---|
| stopped | Cancelled / stopped the SIP |
| redeemed | Withdrew money from the fund |
| paused | Paused or skipped an instalment |
| reduced | Lowered the SIP amount |
| considering | Thinking about stopping/pausing, asking whether to |
| want_pause | Wants a pause/skip/date-change option they can't find or use |
| involuntary | SIP stopped without the user choosing (failed, auto-cancelled, fund house halted) |
| continued | Kept going despite doubt |
| na | None of these |

## your_primary_reason — pick the ONE main reason
| Code | Meaning |
|---|---|
| PERF | Returns look poor / value below invested / "not working" |
| MARKET | Market fall or timing the market is the stated reason |
| CONFUSION | Doesn't understand how SIP / stop / redeem / exit load / tax works |
| CASH | Money is tight: job loss, emergency, loan, wedding, irregular income |
| PAUSE_UX | Wants flexibility (pause, skip, change date/amount) the app doesn't give |
| TECH | App / mandate / payment / redemption failure |
| TRUST | Lost trust in the platform (plans, folio changes, NRI rules) |
| SWITCH | Moving to another fund or asset |
| COST | Regular → direct, expense ratio, commissions |
| GOAL_DONE | Reached a goal / needed the money for a planned purchase |
| AMC_RULE | Fund house or regulator stopped the SIP |
| CHECKING | Over-checking / anxiety from looking too often |
| NA | Not relevant |

## your_first_timer (Y/N/?)
Y only if the text makes clear this is their first SIP or they started recently (≈ under 2 years) as a new investor. ? if you can't tell.

When done, upload the filled CSV back to the chat. Agreement per field gets computed against the engine's sealed labels.
