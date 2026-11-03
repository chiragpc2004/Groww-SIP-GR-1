// Server-side AI endpoint. The Gemini key stays here, never in the page.
// POST /api/ai  { mode: "ask", question }  ->  { text }
// POST /api/ai  { mode: "code", post }     ->  { result }
const DATA = require('../data/engine_data.json');

const SRC = { play_store: 'Play Store', app_store: 'App Store', reddit_post: 'Reddit', reddit_comment: 'Reddit', tradingqna: 'TradingQ&A', youtube: 'YouTube' };
const CODES = ['PERF', 'MARKET', 'CONFUSION', 'CASH', 'PAUSE_UX', 'TECH', 'TRUST', 'SWITCH', 'COST', 'GOAL_DONE', 'AMC_RULE', 'CHECKING', 'NA'];
const POOL = DATA.items.filter(i => ['self', 'asker', 'prestart'].includes(i.a));
const EVIDENCE = POOL.map(i => `#${i.e} [${SRC[i.s]}; ${i.ac}; ${i.r}; ${i.f.includes('FIRST') ? 'new investor' : ''}] ${i.t}`).join('\n');

// Best-effort per-visitor limit (resets when the server instance restarts).
const HITS = new Map();
const LIMIT = Number(process.env.RATE_LIMIT_PER_HOUR || 20);
function allowed(ip) {
  const now = Date.now(), hour = 3600e3;
  const list = (HITS.get(ip) || []).filter(t => now - t < hour);
  if (list.length >= LIMIT) return false;
  list.push(now); HITS.set(ip, list); return true;
}

function askPrompt(q) {
  return `You are a product researcher analysing public Indian investor posts about SIPs. Answer the question using ONLY the evidence posts below.
Rules: cite posts inline as [#id] for every claim; group findings into at most 3 numbered patterns; say plainly where evidence is thin; never recommend funds, stocks, or whether anyone should invest, stop or continue; no predictions. Under 200 words. Plain text, no markdown headings or bold.

QUESTION: ${q}

EVIDENCE (${POOL.length} posts):
${EVIDENCE}`;
}
function codePrompt(t) {
  return `Code this investor post about SIPs. Reply with only JSON: {"relevant":true|false,"speaker":"self"|"advice"|"info"|"na","action":"stopped"|"redeemed"|"paused"|"reduced"|"considering"|"want_pause"|"involuntary"|"continued"|"na","primary_reason":one of ${JSON.stringify(CODES)},"secondary_reasons":[codes],"first_timer":"yes"|"no"|"unclear","influenced_by":"social_media"|"friends_family"|"none"|"unclear","checks_or_looks_at":short phrase or null,"unmet_need":one short sentence,"confidence":0-1}
Codebook: PERF=returns look poor or value below invested; MARKET=market fall or timing; CONFUSION=doesn't understand how SIP, stop, redeem, exit load or tax work; CASH=money tight, job loss, emergency, loan; PAUSE_UX=wants skip, pause, date or amount change; TECH=app, mandate, payment or redemption failure; TRUST=lost trust in platform; SWITCH=moving to another fund or asset; COST=regular to direct, fees; GOAL_DONE=goal reached or needed the money; AMC_RULE=fund house or regulator halted SIP; CHECKING=over-checking. first_timer is "yes" only if the post says it's their first SIP or they started recently. Lower confidence for sarcasm, ambiguity or very short text.

POST:
"""${t}"""`;
}

async function gemini(prompt, json) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error('GEMINI_API_KEY is not set'), { status: 500 });
  const models = [process.env.GEMINI_MODEL || 'gemini-2.5-flash', 'gemini-flash-latest'];
  let last;
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1200, ...(json ? { responseMimeType: 'application/json' } : {}) },
      }),
    });
    if (r.status === 404) { last = 'model_not_found'; continue; }   // try the alias
    if (r.status === 429) throw Object.assign(new Error('quota'), { status: 429 });
    if (!r.ok) throw Object.assign(new Error(`upstream ${r.status}: ${(await r.text()).slice(0, 300)}`), { status: 502 });
    const body = await r.json();
    const text = (body.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!text) throw Object.assign(new Error('empty'), { status: 502 });
    return text;
  }
  throw Object.assign(new Error(last || 'no model'), { status: 502 });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!allowed(ip)) return res.status(429).json({ error: 'rate_limited' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  try {
    if (body.mode === 'ask') {
      const q = String(body.question || '').trim().slice(0, 500);
      if (q.length < 5) return res.status(400).json({ error: 'question_too_short' });
      return res.status(200).json({ text: await gemini(askPrompt(q), false) });
    }
    if (body.mode === 'code') {
      const t = String(body.post || '').trim().slice(0, 2000);
      if (t.length < 15) return res.status(400).json({ error: 'post_too_short' });
      const raw = await gemini(codePrompt(t), true);
      let result;
      try { result = JSON.parse(raw.replace(/^```(json)?|```$/g, '').trim()); }
      catch { return res.status(502).json({ error: 'invalid_json' }); }
      return res.status(200).json({ result });
    }
    return res.status(400).json({ error: 'unknown_mode' });
  } catch (e) {
    console.error(e.message);
    return res.status(e.status === 429 ? 429 : 502).json({ error: e.status === 429 ? 'quota' : 'upstream_error' });
  }
};
