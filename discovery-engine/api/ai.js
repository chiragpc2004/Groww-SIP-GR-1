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
  const key = process.env.GEMINI_API_KEY || process.env.GEMINI_APP_KEY;   // accepts either spelling
  if (!key) throw Object.assign(new Error('GEMINI_API_KEY is not set in Vercel'), { code: 'missing_key' });
  const models = [process.env.GEMINI_MODEL || 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastErr;
  for (const model of models) for (let attempt = 0; attempt < 2; attempt++) {
    let r;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          // High cap: newer Flash models spend part of the output budget on hidden "thinking".
          generationConfig: { temperature: 0.2, maxOutputTokens: 8192, ...(json ? { responseMimeType: 'application/json' } : {}) },
        }),
      });
    } catch (e) {
      lastErr = Object.assign(new Error(`network: ${e.message}`), { code: 'network' }); break;
    }
    const raw = await r.text();
    if (!r.ok) {
      console.error(`[${model}] HTTP ${r.status}: ${raw.slice(0, 400)}`);
      if (r.status === 429) throw Object.assign(new Error('quota'), { code: 'quota' });
      if (r.status === 400 && /API key/i.test(raw)) throw Object.assign(new Error('bad key'), { code: 'bad_key' });
      if (r.status === 403) throw Object.assign(new Error('key not allowed'), { code: 'bad_key' });
      if (r.status === 503 || r.status === 500) {             // overloaded: wait, retry once, then next model
        lastErr = Object.assign(new Error('busy'), { code: 'model_busy' });
        if (attempt === 0) { await new Promise(t => setTimeout(t, 2000)); continue; }
        break;
      }
      lastErr = Object.assign(new Error(`HTTP ${r.status}`), { code: r.status === 404 ? 'model_not_found' : 'upstream_' + r.status });
      break;                                      // try the next model
    }
    const body = JSON.parse(raw);
    const cand = body.candidates?.[0];
    const text = (cand?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (text) return text;
    console.error(`[${model}] empty reply, finishReason=${cand?.finishReason}, block=${body.promptFeedback?.blockReason}`);
    lastErr = Object.assign(new Error('empty'), { code: 'empty_' + (cand?.finishReason || body.promptFeedback?.blockReason || 'unknown') });
    break;
  }
  throw lastErr || Object.assign(new Error('no model'), { code: 'model_not_found' });
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
    console.error('AI call failed:', e.code, e.message);
    if (e.code === 'quota') return res.status(429).json({ error: 'quota' });
    return res.status(502).json({ error: 'upstream_error', reason: e.code || 'unknown' });
  }
};
