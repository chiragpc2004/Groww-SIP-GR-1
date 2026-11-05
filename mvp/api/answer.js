// SIP Recovery Assistant: answer endpoint with an eval gate.
// POST /api/answer { scenario, question }  ->  { shown, text, fallback, checks[], rules[], option, by }
//
// Flow: advice/prediction requests are declined by code (no model call) -> the model drafts an answer
// grounded in the rules engine's facts -> code checks -> AI judge -> answer shown, or a safe fallback.
const R = require('../rules.js');

/* ---------------- providers (Groq first if configured, then Gemini) ---------------- */
async function groq(prompt, json) {
  const key = process.env.GROQ_API_KEY; if (!key) return null;
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', temperature: 0.1, max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }], ...(json ? { response_format: { type: 'json_object' } } : {}) }),
    });
    if (!r.ok) { console.error('[groq]', r.status, (await r.text()).slice(0, 200)); return null; }
    return (await r.json()).choices?.[0]?.message?.content?.trim() || null;
  } catch (e) { console.error('[groq]', e.message); return null; }
}
async function gemini(prompt, json) {
  const key = process.env.GEMINI_API_KEY || process.env.GEMINI_APP_KEY;
  if (!key) throw Object.assign(new Error('no key'), { code: 'missing_key' });
  const models = [process.env.GEMINI_MODEL || 'gemini-3.8-flash', process.env.GEMINI_FALLBACK_MODEL || 'gemini-flash-lite-latest'];
  let last;
  for (const m of models) {
    let r;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096, ...(json ? { responseMimeType: 'application/json' } : {}) } }),
      });
    } catch (e) { last = Object.assign(new Error(e.message), { code: 'network' }); continue; }
    const raw = await r.text();
    if (!r.ok) { console.error(`[${m}]`, r.status, raw.slice(0, 200)); last = Object.assign(new Error('http'), { code: r.status === 429 ? 'quota' : r.status >= 500 ? 'busy' : 'upstream' }); continue; }
    const t = (JSON.parse(raw).candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (t) return t;
    last = Object.assign(new Error('empty'), { code: 'empty' });
  }
  throw last;
}
async function generate(prompt, json) { return (await groq(prompt, json)) || (await gemini(prompt, json)); }
function parseJSON(t) { try { return JSON.parse(t.replace(/^```(json)?|```$/g, '').trim()); } catch { return null; } }

/* ---------------- deterministic checks ---------------- */
const ADVICE_ASK = /\b(which|what|best|good|better|top)\b.{0,30}\b(fund|scheme|stock|mf|mutual fund)s?\b.{0,30}\b(buy|switch|invest|choose|pick|move|should)\b|\bshould i (buy|switch|invest in|move to)\b|\brecommend (a |some )?(fund|scheme|stock)|\b(which|konsa) fund\b/i;
const PREDICT_ASK = /\b(will|when will|kab)\b.{0,40}\b(market|nifty|sensex|returns?|portfolio|fund|value)\b.{0,30}\b(recover|go up|rise|grow|increase|improve|bounce|be positive)\b|\bpredict\b|\bhow much (will|would) i (make|earn|get)\b/i;
const HARDSHIP = /\b(lost (my )?job|laid off|layoff|no job|unemployed|medical|hospital|emergency|can'?t afford|cannot afford|no money|debt|loan (is )?due|naukri (chali|gayi))\b/i;

const FUND_WORDS = /\b(HDFC|SBI|ICICI|Nippon|Axis|Parag Parikh|PPFAS|Quant|Motilal|Kotak|Mirae|UTI|Tata|Bandhan|DSP|Aditya Birla|Edelweiss|Franklin|Canara|Invesco|Navi|Groww (Nifty|Large|Value)|small[- ]?cap fund|mid[- ]?cap fund|flexi[- ]?cap fund|index fund|ELSS fund)\b/i;
const ADVICE_SAY = /\b(you should (invest|buy|sell|switch|continue|keep|stay|not cancel)|i (would )?(recommend|suggest) (you )?(invest|buy|switch|continu|keep|stay)|switch to (a|an|another)|better fund|best fund|(you should|better to|best to|i'?d) (keep investing|stay invested)|don'?t (cancel|stop)|do not (cancel|stop)|shouldn'?t (cancel|stop))\b/i;
const PREDICT_SAY = /\b(will (recover|bounce back|go up|grow|rise|increase|turn positive)|guarantee[ds]?|assured returns?|surely (grow|recover)|markets? always (recover|go up))\b/i;
const URGENCY_SAY = /\b(act now|hurry|don'?t miss|last chance|before it'?s too late|you'?ll lose|you will lose|lose out|limited time|immediately or)\b/i;
const RETRY_CLAIM = /\b(will|would|automatically|auto)\b[^.]{0,25}\bretr(y|ies|ied)\b|\bretr(y|ies) (it )?automatically\b/i;
const RETRY_HEDGE = /(not (documented|confirmed|sure|stated|clear)|couldn'?t (confirm|find|verify)|can'?t (confirm|verify|say)|cannot (confirm|verify)|not able to (confirm|verify)|unverified|unclear|isn'?t (documented|confirmed|clear)|doesn'?t (say|document|mention)|no (official )?(information|documentation)|check with (groww )?support)/i;

const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
function datesIn(text) {
  const out = new Set(); let m;
  const a = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${MONTHS})[a-z]*\\b`, 'gi'), b = new RegExp(`\\b(${MONTHS})[a-z]*\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'gi');
  while ((m = a.exec(text))) out.add(`${+m[1]} ${m[2].slice(0, 3).replace(/^./, c => c.toUpperCase())}`);
  while ((m = b.exec(text))) out.add(`${+m[2]} ${m[1].slice(0, 3).replace(/^./, c => c.toUpperCase())}`);
  return [...out];
}
function amountsIn(text) { return [...text.matchAll(/(?:₹|rs\.?|inr)\s?([\d,]+)/gi)].map(m => Number(m[1].replace(/,/g, ''))).filter(n => n > 0); }

const OFFERS_CANCEL = /\b(you (can|could|may) (also )?cancel|cancel(ling)? (the |your )?sip (now|today|after)|if you (cancel|stop the sip)|cancelling (stops|would|will|means|only)|once you cancel|to cancel|cancel is (available|possible))\b/i;
const CANCEL_KEEPS = /(stay(s)?|remain(s)?|rahe(ga|nge|gi)) (invested|in the fund)|until you redeem|redeem(ed)? (it )?separately|redeem|redemption/i;
function codeChecks(answer, citedRules, ev, question) {
  const t = answer;
  const qAmounts = amountsIn(question || '');
  const badRules = (citedRules || []).filter(id => !R.RULES[id]);
  const badDates = datesIn(t).filter(d => !ev.allowedDates.includes(d));
  const badAmounts = amountsIn(t).filter(n => !ev.allowedAmounts.includes(n) && !qAmounts.includes(n));
  return [
    { id: 'no_advice', label: 'No fund names or buy, sell or stay advice', ok: !FUND_WORDS.test(t) && !ADVICE_SAY.test(t) },
    { id: 'no_prediction', label: 'No return predictions or urgency', ok: !PREDICT_SAY.test(t) && !URGENCY_SAY.test(t) },
    { id: 'rules_exist', label: 'Only verified Groww rules cited', ok: badRules.length === 0 && !(RETRY_CLAIM.test(t) && !RETRY_HEDGE.test(t)),
      note: badRules.length ? `unknown rule ${badRules.join(', ')}` : (RETRY_CLAIM.test(t) && !RETRY_HEDGE.test(t)) ? 'claims an automatic retry, which is unverified' : '' },
    { id: 'numbers_match', label: 'Dates and amounts match your SIP', ok: !badDates.length && !badAmounts.length,
      note: [badDates.length ? `dates ${badDates.join(', ')}` : '', badAmounts.length ? `amounts ${badAmounts.map(R.inr).join(', ')}` : ''].filter(Boolean).join('; ') },
    { id: 'cancel_explained', label: 'If cancelling is offered, it says the money stays invested', ok: !OFFERS_CANCEL.test(t) || CANCEL_KEEPS.test(t) },
  ];
}

/* ---------------- prompts ---------------- */
function draftPrompt(s, ev, question, hardship) {
  const opts = ev.options.map(o => `- ${o.id}: ${o.title}. ${o.available ? 'Available' : 'NOT available'}. ${o.when}. ${o.detail} [${o.rules.join(', ')}]`).join('\n');
  const rules = Object.entries(R.RULES).map(([k, v]) => `${k}: ${v}`).join('\n');
  const unv = Object.entries(R.UNVERIFIED).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `You are GR-1, the assistant inside a mutual fund app, opened from a card for one SIP that is at risk of becoming inactive. A first-time investor has a question about this SIP.
Explain their situation and options in plain, warm, neutral language. You are NOT an adviser.

STRICT RULES
- Use ONLY the facts, options and rules below. Never invent dates, amounts, fees, rules or features.
- Never name or rate funds. Never say whether to invest, continue, stay invested, stop, buy, sell or switch.
- Never predict returns, markets or recovery. No urgency, fear or loss framing.
- Cancelling is a valid choice. Describe it accurately and neutrally; never argue against it.
- ${hardship ? 'The user describes financial hardship. Acknowledge it briefly. Your answer MUST include a sentence saying that stopping or skipping is a reasonable choice in their situation. Then lay out the options without steering.' : 'Match the option to the reason they give, if they give one.'}
- If asked about anything in UNVERIFIED, say you couldn't confirm it and point to Groww support.
- Reply in the user's language style (English or simple Hinglish), under 110 words, short sentences, no headings or bold.
- Use dates exactly as written in FACTS (e.g. "9 Nov") and amounts as written (e.g. "₹1,000").

FACTS (computed by the app)
${Object.entries(ev.facts).map(([k, v]) => `${k}: ${v}`).join('\n')}
${ev.warnings.length ? 'WARNING: ' + ev.warnings.join(' ') : ''}

OPTIONS (computed by the app from the rules)
${opts}

VERIFIED RULES
${rules}

UNVERIFIED (do not state as fact)
${unv}

QUESTION: """${question}"""

Reply with only JSON: {"answer": string, "rules_cited": ["R3", ...], "best_fit_option": one of ${JSON.stringify(ev.options.map(o => o.id).concat('none'))}}`;
}
function judgePrompt(ev, question, answer, hardship) {
  return `You are a strict reviewer for a mutual fund app's assistant. Check the ANSWER against the FACTS, OPTIONS and VERIFIED RULES only. A statement that matches a verified rule is correct, not invented.

FACTS
${Object.entries(ev.facts).map(([k, v]) => `${k}: ${v}`).join('\n')}
OPTIONS
${ev.options.map(o => `- ${o.title}: ${o.available ? 'available' : 'not available'}; ${o.when}; ${o.detail}`).join('\n')}
VERIFIED RULES (Groww's published rules; true for every user)
${Object.entries(R.RULES).map(([k, v]) => `${k}: ${v}`).join('\n')}
QUESTION: """${question}"""
ANSWER: """${answer}"""

Judge:
1. facts_correct: every statement about dates, availability, deadlines, the 3-in-a-row rule and charges matches FACTS, OPTIONS or VERIFIED RULES (no contradictions, nothing invented).
2. cancel_correct: only if the answer explains what cancelling does or offers cancelling as an option, it must say future instalments stop AND existing money stays invested (until redeemed). A passing mention such as "instead of cancelling", or no mention, is true.
3. neutral: no pressure to continue investing, no discouraging cancellation, no fear or urgency${hardship ? ', and it treats stopping as a reasonable choice given the hardship' : ''}.
4. answers_question: it actually addresses the question. For a request to decide for the user ("should I stop or continue?"), saying it's their call and laying out what each choice does IS answering.
Reply with only JSON: {"facts_correct": bool, "cancel_correct": bool, "neutral": bool, "answers_question": bool, "issue": "one short sentence or empty"}`;
}

/* ---------------- fallbacks ---------------- */
const FB = {
  advice: "I can explain how your SIP works and what each option does, but I can't recommend funds or tell you whether to invest, switch or stop. That's your call. If it helps, Groww's help pages explain each option.",
  predict: "I can't predict returns or when markets will move; nobody can do that reliably. I can explain what's happening with your SIP and what each option would do.",
  generic: "I couldn't give you a checked answer to that just now. The options above are calculated from Groww's rules and are safe to rely on. For anything else, Groww's help page has the details.",
};

/* ---------------- handler ---------------- */
const HITS = new Map();
function allowed(ip) { const now = Date.now(); const l = (HITS.get(ip) || []).filter(t => now - t < 3600e3); if (l.length >= Number(process.env.RATE_LIMIT_PER_HOUR || 40)) return false; l.push(now); HITS.set(ip, l); return true; }

function sanitizeScenario(x) {
  const n = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : d; };
  const s = {
    amount: n(x.amount, 100, 200000, 1000), sipDay: n(x.sipDay, 1, 31, 5), salaryDay: n(x.salaryDay, 1, 31, 1),
    monthsRunning: n(x.monthsRunning, 1, 120, 6), invested: n(x.invested, 0, 1e8, 6000), currentValue: n(x.currentValue, 0, 1e8, 5800),
    status: x.status === 'failed' ? 'failed' : 'upcoming', failureReason: x.failureReason === 'insufficient_balance' ? 'insufficient_balance' : (x.status === 'failed' ? 'payment_failed' : null),
    missedInARow: n(x.missedInARow, 0, 2, 0), moment: ['failed', 'tight', 'blocked', 'cancel'].includes(x.moment) ? x.moment : 'tight',
    skipAllowed: x.skipAllowed === false ? false : true,
  };
  s.lastFailure = s.status === 'failed' ? (Number.isFinite(Number(x.lastFailure)) ? Number(x.lastFailure) : R.istToday() - 864e5) : null;
  return s;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!allowed(ip)) return res.status(429).json({ error: 'rate_limited' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const question = String(body.question || '').trim().slice(0, 600);
  if (question.length < 3) return res.status(400).json({ error: 'question_too_short' });
  const s = sanitizeScenario(body.scenario || {});
  const ev = R.evaluate(s);
  const hardship = HARDSHIP.test(question);
  const t0 = Date.now();

  // 1. requests the assistant must decline: answered by code, no model call
  const adviceAsk = ADVICE_ASK.test(question) || FUND_WORDS.test(question);
  if (adviceAsk || PREDICT_ASK.test(question)) {
    const kind = adviceAsk ? 'advice' : 'predict';
    return res.status(200).json({ shown: 'fallback', text: FB[kind], fallback: kind, rules: [], option: 'none', by: 'policy',
      checks: [{ id: 'policy', label: kind === 'advice' ? 'Advice request detected: declined by policy' : 'Prediction request detected: declined by policy', ok: true }] });
  }

  // 2. draft
  let draft;
  try { draft = parseJSON(await generate(draftPrompt(s, ev, question, hardship), true)); }
  catch (e) { return res.status(e.code === 'quota' ? 429 : 503).json({ error: e.code === 'quota' ? 'quota' : 'busy' }); }
  if (!draft || typeof draft.answer !== 'string' || !draft.answer.trim()) {
    return res.status(200).json({ shown: 'fallback', text: FB.generic, fallback: 'generic', rules: [], option: 'none', by: 'model',
      checks: [{ id: 'format', label: 'Model returned a readable answer', ok: false }] });
  }
  const answer = draft.answer.trim();
  const rules = Array.isArray(draft.rules_cited) ? draft.rules_cited.map(String).slice(0, 8) : [];

  // 3. code checks
  const checks = codeChecks(answer, rules, ev, question);

  // 4. AI judge (only if code checks pass, to save quota)
  if (checks.every(c => c.ok)) {
    let j = null;
    try { j = parseJSON(await generate(judgePrompt(ev, question, answer, hardship), true)); } catch (e) { j = null; }
    if (j) {
      checks.push({ id: 'judge_facts', label: 'AI reviewer: facts match your situation', ok: j.facts_correct !== false, note: j.facts_correct === false ? (j.issue || '') : '' });
      if (j.answers_question === false) checks.push({ id: 'judge_answers', label: 'AI reviewer: may not fully answer the question', ok: true, warn: true, note: j.issue || '' });
      if (j.cancel_correct === false) checks.push({ id: 'judge_cancel', label: 'AI reviewer: cancel description could be fuller', ok: true, warn: true });
      checks.push({ id: 'judge_neutral', label: hardship ? 'AI reviewer: neutral, stopping treated as valid' : 'AI reviewer: neutral, no pressure', ok: j.neutral !== false });
    } else {
      checks.push({ id: 'judge_unavailable', label: 'AI reviewer unavailable; code checks passed', ok: true, warn: true });
    }
  }
  const pass = checks.every(c => c.ok);
  console.log(`answer ${pass ? 'shown' : 'fallback'} in ${Date.now() - t0} ms; failed: ${checks.filter(c => !c.ok).map(c => c.id + (c.note ? ` (${c.note})` : '')).join(', ') || 'none'}`);
  return res.status(200).json({
    shown: pass ? 'answer' : 'fallback', text: pass ? answer : FB.generic,
    fallback: pass ? null : 'generic', rules: rules.filter(id => R.RULES[id]), option: draft.best_fit_option || 'none',
    checks, by: process.env.GROQ_API_KEY ? 'groq/gemini' : 'gemini', hardship,
    ...(body.eval === true ? { draft: answer } : {}),
  });
};
module.exports._test = { codeChecks, ADVICE_ASK, PREDICT_ASK, HARDSHIP, datesIn, amountsIn, sanitizeScenario, draftPrompt };
