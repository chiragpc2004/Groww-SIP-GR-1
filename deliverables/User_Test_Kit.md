# GR-1 User Test Kit

Nov 5, 2026 · GR-1 concept for Groww

## Goal

The test checks one thing: when a SIP is at risk, does GR-1 in the moment lead people to a choice that keeps the SIP active, without pushing them? Each tester tries the same 4 moments in today's app first, then with GR-1, so each person is their own comparison.

| # | Hypothesis | Holds if |
| --- | --- | --- |
| H1 | People notice the at-risk card without being told where to look | 3 of 3 open GR-1 from the alert, flag or banner within 30 s |
| H2 | Ranked actions lead to a non-cancel choice when one fits | At least 2 of 3 pick Pay Now, Skip, Lower or Move date in the failed and tight moments |
| H3 | People understand that cancelling keeps the money invested | 3 of 3 say it back in their own words after the cancel moment |
| H4 | People understand the Pay Now window | 3 of 3 can say the last day Pay Now counts the instalment as paid |
| H5 | The AI answer is trusted and feels neutral | Average 4 or more out of 5 on trust; nobody reports feeling pushed |

## Setup

Each session takes 25 minutes, run on a call or in person, with the tester on their own phone or laptop.

| Tester | Profile from interviews | When |
| --- | --- | --- |
| P1 | Investing ₹10k (autopay on the 7th); one failed payment after a trip and card dues | 6 Nov |
| P6 | Stopped a ₹2k SIP after repeated failures; salary lands 2nd–5th, debit on the 3rd | 6 Nov |
| P2 | Investing ₹10k; never missed; unsure how redemption works | 7 Nov |

- **Link:** [nextleap-groww-mvp.vercel.app/#demo](https://nextleap-groww-mvp.vercel.app/#demo). On a phone, the demo shows only the phone screen; on a laptop, the guide and notes sit beside it. Ask testers to ignore the side panels.
- **Order:** today's app first, then GR-1, for every moment. The same order for all three keeps the comparison fair; mention in the deck that learning from round one may help round two.
- **Before the call:** open the link yourself to wake the server. Don't run the eval suite that morning, so the AI quota is free for testers.
- **Recording:** ask before recording. In notes and the deck, use P1, P6 and P2 only, never names.
- **Consent line to read:** "This is a concept I built for a course, not the real Groww app. No real money or account is used. You can stop at any time, and I'll only share notes without your name."

## Script

Read the prompts word for word, so all three testers hear the same thing. After a prompt, stay quiet; when they get stuck, ask "What would you do next?" rather than pointing.

**Intro (2 min).** "Imagine this is your Groww app and you have one SIP. I'll describe a situation, and you do what you'd really do. There are no wrong answers. Please think out loud."

For each moment: pick it from **Demo moments** (the button on the phone screen), set **Today's app**, give the prompt, then switch to **With GR-1** and give the same prompt again.

1. **A payment fails (5 min).** "Your SIP payment of ₹1,000 failed yesterday because your account was short. What do you do?"
   - Follow-up: "Is your SIP still running? Until when can you fix this so the instalment counts?"
2. **Money is short before the debit (5 min).** "Your ₹10,000 SIP goes out on the 10th, and this month you have a big credit card bill. What do you do?"
   - Follow-up: "Does skipping this month cost you anything?"
3. **The fund blocks skipping (4 min).** "You try to skip this month's instalment. See what happens and tell me what you'd do."
4. **Needs a break (5 min).** "You want to stop investing for a few months. Go ahead."
   - Follow-up: "If you cancel, what happens to the ₹21,300 you've already invested?"
   - In the GR-1 round, ask them to type one real question into **Tell GR-1 what's going on**, in their own words.

**Wrap-up (4 min).**

- "Which version would you rather have when something goes wrong, and why?"
- "How much did you trust GR-1's answer, from 1 to 5?"
- "Did anything feel like it was pushing you to keep investing?"
- "What would you change?"

## What to watch for

In the GR-1 round, a moment counts as a success when the tester reaches the right outcome without a hint. Note any hint you had to give.

| Moment | Success in the GR-1 round | Watch for |
| --- | --- | --- |
| A payment fails | Opens GR-1 from the alert or flag, picks Pay Now, names the pay-by date | Do they think the SIP is already cancelled? Do they look for Pay Now under one-time investment? |
| Money is short | Chooses Skip or Lower this month instead of letting the debit fail | Do they know a skip has a deadline? Do they worry that skipping is a penalty? |
| The fund blocks skipping | Picks Lower the amount or Move the date, not Cancel | In today's app, does Cancel look like the only way out? |
| Needs a break | Says the money stays invested; skips, or cancels knowing what it does | Do they feel blocked from cancelling? Cancel must still be reachable in 2 taps |
| Own question to GR-1 | Gets a checked answer they find useful | What they ask, whether a fallback shows, and how they react to it |

Across all moments, also note:

- Time from the start of a moment to the first tap in GR-1
- Words of doubt or distrust ("is this real?", "why is it telling me this?")
- Anything that reads as pressure to keep investing. This is the most important finding to catch, because the design promises neutrality

## Notes sheet

Fill one row per tester per moment during the session, in the cells below. Put a quote, not a summary, in the last column.

| Tester | Moment | Today's app: what they did | GR-1: what they chose | Hint needed? | Seconds to first GR-1 tap | Best quote |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | A payment fails | Real life: saw the notification and did nothing; the next month went through | Asked about retry vs skip: retry if she has money, skip if not; wants both explained and to decide herself | No | Not timed | "Currently, when a payment fails, I don't really know what I'm supposed to do." |
| P1 | Money is short | Real life: thought about stopping for a couple of months during a trip and card dues; didn't cancel | Would skip instead of cancelling; called Skip the most useful option | Yes: asked when to skip; understood once told "by the 5th" | Not timed | "Instead of saying two days before, just tell me the last date to skip." |
| P1 | Fund blocks skipping | Not tested | Not tested |  |  |  |
| P1 | Needs a break | Not tested in the flow; already knew cancelling keeps the money invested | Not tested |  |  | "It gives me alternatives instead of making me think I have to cancel my SIP." |
| P6 | A payment fails | Real life: ignored failure alerts after a while; didn't know he could pay manually | Looked at the options and would pick Move the date | No | Not timed | "I might not have stopped my SIP if I knew I could change the date." |
| P6 | Money is short | Real life: stopped the SIP for home expenses and saving for a bike | Would lower ₹2,000 to ₹1,000 for 2–3 months instead of cancelling; skip only if he has nothing | No | Not timed | "I can continue the habit without putting too much pressure on myself." |
| P6 | Fund blocks skipping | Not tested | Not tested |  |  |  |
| P6 | Needs a break | Real life: cancelled 4–5 months ago; thought the only choices were continue or cancel | Would restart through GR-1 if it shows the amount and date and confirms the setup | No | Not timed | "I didn't really want to stop investing, but the fixed date and amount made it difficult." |
| P2 | A payment fails | Never had a failure | Not tested |  |  |  |
| P2 | Money is short | Would let the payment fail rather than cancel | Not tested |  |  |  |
| P2 | Fund blocks skipping | Not tested | Not tested |  |  |  |
| P2 | Needs a break | Real life: considered moving the money to a savings account; continued on a colleague's advice | Read "Needs a break" as a temporary stop; would use it for a month or two over cancelling; said the money stays invested and redeeming is separate | No | Not timed | "Someone who is new to investing might think that stopping the SIP means getting their money back." |

| Tester | Own question to GR-1 | Answer or fallback | Trust (1–5) | Felt pushed? | Prefers | Would change |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | None typed. On negative returns: wants it explained simply, without saying "everything is fine" or guaranteeing returns | Not run live | Not scored | No; "It can explain both, but I should be able to decide" | GR-1: "I would definitely prefer seeing these options rather than just getting a payment failure notification" | Make the skip deadline a clear date; show when the next instalment happens; notify before the debit date |
| P6 | None typed | Not run live | Not scored | No; "Maybe it can suggest a date, but I should confirm it" | GR-1: "It addresses the exact problem I had" | Confirm every change with the new date and next deduction; remember the original amount and remind him after a few months on a lower amount |
| P2 | "Is my investment value good or bad?" (posed by the interviewer) | Not run live | Not scored | No; "I wouldn't want it to just convince me to keep investing" | GR-1: "I'd rather understand my options first" | Show when the next deduction happens after a break; explain where redeem is and any charges; keep it short, few financial terms |

## Results

All 3 testers picked a way to keep the SIP running over cancelling: P1 Skip, P6 Move the date or Lower, P2 a one-month break. P6, who had cancelled, said he might not have stopped if he had known he could change the date. The sessions were interviews built around GR-1 screens, not the scripted side-by-side run, so discovery (H1), timing and trust scores were not measured.

| # | Hypothesis | Result | Evidence |
| --- | --- | --- | --- |
| H1 | People notice the at-risk card unprompted | Not tested | The interviewer showed each tester the screen |
| H2 | Ranked actions lead to a non-cancel choice | Held, 3 of 3 | P1 Skip; P6 Move the date, or Lower ("Would you use this instead of cancelling?" "Yes, most likely"); P2 a break of a month or two ("It feels less permanent") |
| H3 | Cancelling keeps the money invested is understood | Held, 3 of 3 | All three said it unprompted. Gaps: P2 isn't sure how to redeem; P6 has never used redeem and is unsure about early-withdrawal charges |
| H4 | The Pay Now window is understood | Not tested directly | The same risk showed up for skipping: P1 asked for "the last date to skip" instead of "two days before". GR-1 already shows exact dates ("Request by 7 Nov to skip 10 Nov") |
| H5 | The answer is trusted and feels neutral | Not scored; condition confirmed 3 of 3 | P1 "I should be able to decide"; P6 "it can suggest a date, but I should confirm it"; P2 "I wouldn't want it to just convince me to keep investing" |

**Changes this suggests**

| Finding | Who | Change | Where |
| --- | --- | --- | --- |
| Show the next deduction date after a skip or break | P1, P2 | Add "Your SIP continues on \[date\]" to Skip and to the break card | MVP, before 9 Nov |
| After a change, confirm it worked | P6 | Show a confirmation with the new date or amount and the next deduction | MVP, before 9 Nov |
| "Needs a break" reads as a pause | P2 | The card must say plainly that a break is a one-month skip, and when the SIP continues | MVP copy, before 9 Nov |
| Show the skip deadline as a date | P1 | Already done ("Request by 7 Nov"); quote in the deck as validated | Deck |
| Suggest the new date, let the user confirm | P6 | Already how Move the date works; quote in the deck | Deck |
| A heads-up before the debit, not only after failure | P1 | Validates the "money is short" trigger | Deck |
| Lower the amount for a few months, then remind | P6 | Not a Groww feature today; next step | PRD next steps |
| Discontinued users might restart with flexibility | P6 | Reactivation as a follow-on opportunity | PRD next steps |
| How to redeem, and any charges | P2, P6 | Add to the golden set; exit loads vary by fund, so GR-1 should say so and link the fund's details | Eval |
| "Is my value good or bad?" and XIRR | P1, P2 | Add to the golden set as a neutrality case; returns explanations are outside the at-risk moments, so note as a possible extension | Eval, PRD next steps |

## After the tests

Send me the filled sheet, or paste your notes, by the evening of 7 Nov; the deck and Evidence Log are built on 8 Nov.

1. Score each hypothesis H1–H5 as held, partly held or did not hold, with the count (for example "2 of 3").
2. Pick the 2 strongest quotes for the deck: one that shows the problem in today's app and one that shows the change with GR-1.
3. Every confusion or sign of pressure becomes a change. Fix the small ones before 9 Nov; log the rest as next steps in the PRD.
4. Add each tester's own question to the golden set if it isn't covered yet, so the eval grows from real wording.
5. In the Evidence Log, record the 3 sessions as the user-test source, with dates and P-codes, and any design change they caused.
