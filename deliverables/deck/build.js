// NL_Groww deck: 10 slides, 20 x 11.25 in (1920 x 1080), site design language, min font 22pt
const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require('/root/.claude/skills/synced/3c5d8808-b87b-4278-a4e7-030c151135ea_18579bcd-97b7-4582-975a-b0372a94a26f/pptx/scripts/apply_theme.js');

// Groww-style dark theme: near-black page, raised dark cards, light text, mint green and blue-violet accents
const K = { page: '121212', card: '1E1F22', panel: '0F2E26', panelLine: '1F5244', tableHead: '26282C', head: 'F2F3F5', ink: 'D3D5DA', muted: 'A3A6B0', line: '303238', line2: '41444B', white: 'FFFFFF', dark: '0B1210',
  green: '00D09C', greenInk: '2FDBAE', greenSoft: '0F2E26', pen: '8C9BFF', penSoft: '1E2240', amber: 'FFB547', amberSoft: '2E2414', grey: '4A4D55' };
const THEME = { name: 'Keep SIP Active', headFontFace: 'Manrope', bodyFontFace: 'Inter',
  colors: { dk1: K.page, lt1: K.head, dk2: K.card, lt2: K.ink, accent1: K.green, accent2: K.pen, accent3: K.amber, accent4: K.muted, accent5: K.line2, accent6: K.greenInk, hlink: K.pen, folHlink: K.pen } };
const HF = 'Inter', BF = 'Inter';
const MIN = 22;
const LINKS = {
  mvp: 'https://nextleap-groww-mvp.vercel.app/#demo',
  quality: 'https://nextleap-groww-mvp.vercel.app/#quality',
  engine: 'https://nextleap-groww-sip-discovery-engine.vercel.app',
  prd: 'https://docs.google.com/document/d/15IkRaFvojVCPeecSs3dqd1-j4UgmtxaIYOWaZnHi8Oo/edit?usp=sharing',
  tests: 'https://docs.google.com/document/d/18nbQ8Xvh_sbkxC9EhYv-Wqeaj-e0BbLrAZPBxjckaUg/edit?usp=sharing',
  evidence: 'https://docs.google.com/document/d/1rOa15ajC9i40yp3Z6H8mM2E17BNe3hbAsPHTqn2Xvtg/edit?usp=sharing',
  amfi: 'https://www.angelone.in/news/mutual-funds/sip-stoppage-ratio-falls-for-5th-straight-month-to-78-53-in-september-2026',
};
const IMG = f => path.join('/home/claude/deck/img', f);
const NAV = ['Metric', 'Discovery', 'Research', 'Segment', 'Problem', 'Solution', 'MVP', 'Testing', 'Metrics', 'Risks'];

const pres = new pptxgen();
pres.defineLayout({ name: 'HD', width: 20, height: 11.25 });
pres.layout = 'HD';
pres.theme = { headFontFace: HF, bodyFontFace: BF };
pres.title = 'NL_Groww';

function check(o) { if ((o.fontSize || 0) < MIN) throw new Error('font below 22: ' + JSON.stringify(o).slice(0, 120)); }
function T(s, text, x, y, w, h, o = {}) {
  const opt = { x, y, w, h, fontFace: BF, fontSize: 22, color: K.ink, margin: 0, valign: 'top', isTextBox: true, ...o };
  check(opt);
  if (Array.isArray(text)) text.forEach(r => r.options && r.options.fontSize && check(r.options));
  s.addText(text, opt);
}
function box(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: o.r ?? 0.16, fill: { color: o.fill || K.card },
    line: { color: o.line || K.line, width: o.lw ?? 1.25, dashType: o.dash || 'solid' },
    ...(o.flat ? {} : {}) });
}
function pill(s, text, x, y, w, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: o.h || 0.46, rectRadius: 0.23, fill: { color: o.fill || K.greenSoft }, line: { color: o.line || o.fill || K.greenSoft, width: 1 } });
  T(s, text, x, y, w, o.h || 0.46, { fontSize: o.size || 22, bold: true, color: o.color || K.greenInk, align: 'center', valign: 'middle' });
}
function chrome(i, title, sub) {
  const s = pres.addSlide();
  s.background = { color: K.page };
  // brand row, as on the site header
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 0.32, w: 0.46, h: 0.46, rectRadius: 0.1, fill: { color: K.green }, line: { color: K.green } });
  s.addText('↗', { x: 0.5, y: 0.32, w: 0.46, h: 0.46, fontSize: 22, bold: true, color: K.dark, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  T(s, [{ text: 'Keep SIP Active', options: { bold: true, color: K.head, fontFace: HF } }, { text: '   GR-1 concept for Groww', options: { color: K.muted } }], 1.1, 0.32, 9, 0.46, { valign: 'middle' });
  T(s, `${String(i + 1).padStart(2, '0')}  ·  ${['Business metric decomposition', 'Discovery engine findings', 'User research', 'Chosen target segment', 'Root cause and problem definition', 'Solution rationale', 'MVP', 'User testing', 'Success metrics', 'Risks and limitations'][i]}`,
    10, 0.32, 9.5, 0.46, { align: 'right', valign: 'middle', bold: true, color: K.greenInk });
  T(s, title, 0.5, 0.88, 19, 1.4, { fontFace: HF, fontSize: 40, bold: true, color: K.head, valign: 'top', lineSpacingMultiple: 0.95 });
  T(s, sub, 0.5, 2.38, 19, 0.45, { fontSize: 24, color: K.muted, valign: 'middle' });
  // section nav, as on the site's top nav
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 11.04, w: 19, h: 0, line: { color: K.line, width: 1 } });
  const nw = 19 / NAV.length;
  NAV.forEach((n, k) => {
    const on = k === i;
    // Groww-style tabs: the active one in green with a green underline
    if (on) s.addShape(pres.shapes.RECTANGLE, { x: 0.5 + k * nw + 0.25, y: 10.98, w: nw - 0.5, h: 0.06, fill: { color: K.green }, line: { color: K.green, width: 0 } });
    T(s, n, 0.5 + k * nw, 10.45, nw, 0.5, { align: 'center', valign: 'middle', bold: on, color: on ? K.greenInk : K.muted });
  });
  return s;
}
function link(s, text, url, x, y, w, o = {}) {
  T(s, [{ text: text + '  ↗', options: { hyperlink: { url }, color: K.pen, bold: true, underline: { style: 'sng' } } }], x, y, w, o.h || 0.42, { valign: 'middle', ...o });
}
function img(s, f, x, y, h) { const w = h * 796 / 1720; s.addImage({ path: IMG(f), x, y, w, h }); return w; }

/* ---------- 1. Business metric decomposition ---------- */
{
  const s = chrome(0, 'A SIP stops counting as active the month a payment goes unpaid, even if the investor never chose to stop',
    'Goal: more first-time investors still active at month 12. The tree shows every way a SIP drops out.');
  // root
  box(s, 0.5, 3.05, 12.6, 1.25, { fill: K.panel, line: K.panelLine });
  T(s, [{ text: '12-month SIP continuation  =  ', options: { bold: true, color: K.white, fontFace: HF, fontSize: 26 } },
    { text: 'first-time SIPs with a paid instalment in the 30 days before month 12  ÷  first-time SIPs started', options: { color: 'E6E7EB' } }], 0.8, 3.05, 12.1, 1.25, { valign: 'middle' });
  // three paths
  const P = [
    ['Investor cancels', 'A chosen stop: a break, a tight month, returns', true],
    ['Auto-cancel', '3 skipped, missed or failed instalments in a row cancel the SIP', true],
    ['Unpaid failure', 'Last instalment failed and was never paid, so the SIP is inactive', true],
  ];
  P.forEach(([h, d], k) => { const x = 0.5 + k * 4.3; box(s, x, 4.75, 4.0, 2.15);
    T(s, h, x + 0.25, 4.9, 3.5, 0.45, { fontFace: HF, fontSize: 26, bold: true, color: K.head });
    T(s, d, x + 0.25, 5.4, 3.5, 1.4, { color: K.ink }); });
  // moments feeding the paths
  T(s, 'Where each path starts, in the app', 0.5, 7.15, 12.6, 0.42, { bold: true, color: K.head });
  const M = [['A payment fails', 'Targeted'], ['Money is tight', 'Targeted'], ['Fund blocks a skip', 'Targeted'], ['Needs a break', 'Targeted'], ['Worried about returns', 'Out of scope'], ['Fund house halts SIP', 'Out of scope']];
  M.forEach(([m, t], k) => { const col = k % 3, row = Math.floor(k / 3), x = 0.5 + col * 4.3, y = 7.7 + row * 1.25; const on = t === 'Targeted';
    box(s, x, y, 4.0, 1.05, { fill: on ? K.greenSoft : K.card, line: on ? K.green : K.line2, dash: on ? 'solid' : 'dash', lw: on ? 1.75 : 1.25 });
    T(s, [{ text: (on ? '✓  ' : '–  ') + m, options: { bold: true, color: K.head } }, { text: '\n' + t, options: { color: on ? K.greenInk : K.muted } }], x + 0.2, y + 0.08, 3.7, 0.95, { valign: 'middle' }); });
  // market check
  box(s, 13.5, 3.05, 6.0, 7.1);
  T(s, 'Market check: India, Sept 2026', 13.8, 3.25, 5.5, 0.45, { bold: true, color: K.greenInk });
  const st = [['49.68 lakh', 'SIPs stopped or matured'], ['63.26 lakh', 'new SIPs in the same month'], ['78.5%', 'stoppage ratio'], ['₹32,490 cr', 'monthly SIP inflows']];
  st.forEach(([n, l], k) => { const y = 3.8 + k * 1.28;
    T(s, n, 13.8, y, 5.5, 0.6, { fontFace: HF, fontSize: 40, bold: true, color: K.head });
    T(s, l, 13.8, y + 0.62, 5.5, 0.5, { color: K.ink }); });
  T(s, 'AMFI data via Angel One, 13 Oct 2026', 13.8, 9.0, 5.5, 0.42, { color: K.muted });
  link(s, 'AMFI September report', LINKS.amfi, 13.8, 9.5, 5.5);
}

/* ---------- 2. Discovery engine ---------- */
{
  const s = chrome(1, 'Investors stop SIPs about 9 times as often as they skip or lower them, and a third of stops happen at moments a product can reach',
    'An AI engine read 7,600 public posts and coded the action and main reason in 219 first-person accounts.');
  // pipeline
  const F = [['7,600', 'posts collected'], ['2,586', 'about SIPs'], ['443', 'about stopping'], ['344', 'with a clear reason'], ['219', 'first-person accounts']];
  F.forEach(([n, l], k) => { const x = 0.5 + k * 2.55; box(s, x, 3.05, 2.3, 1.55, { fill: k === 4 ? K.panel : K.card, line: k === 4 ? K.panelLine : K.line });
    T(s, n, x + 0.2, 3.15, 2.0, 0.65, { fontFace: HF, fontSize: 34, bold: true, color: k === 4 ? K.white : K.head });
    T(s, l, x + 0.2, 3.8, 2.0, 0.75, { color: k === 4 ? 'E6E7EB' : K.ink });
    if (k < 4) T(s, '→', x + 2.3, 3.5, 0.25, 0.6, { fontSize: 24, color: K.muted, align: 'center' }); });
  T(s, 'Play Store 3,845 · YouTube 1,569 · Reddit 1,664 · other 522', 0.5, 4.75, 12.6, 0.42, { color: K.muted });
  // chart
  box(s, 0.5, 5.3, 12.6, 4.9);
  T(s, 'Main reason per stop moment, % of 188 (live site areas overlap)', 0.8, 5.45, 12.1, 0.45, { bold: true, color: K.head });
  const cats = ['Worried about returns', 'In scope: unsure what stopping does', 'Redemption, cancel delays', 'In scope: money tight this month', 'Fund house halted SIP', 'In scope: needs a break', 'Market fall', 'In scope: autopay failed'];
  const vals = [26, 15, 12, 9, 9, 8, 6, 4];
  s.addChart(pres.charts.BAR, [{ name: 'Share', labels: cats, values: vals }], { x: 0.7, y: 5.95, w: 12.2, h: 4.15, barDir: 'bar', catAxisOrientation: 'maxMin',
    chartColors: [K.grey, K.pen, K.grey, K.pen, K.grey, K.pen, K.grey, K.pen], invertedColors: [K.grey], barGapWidthPct: 45,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0"%"', dataLabelFontSize: 22, dataLabelColor: K.head, dataLabelFontFace: '+mn-lt',
    catAxisLabelFontSize: 22, catAxisLabelColor: K.ink, catAxisLabelFontFace: '+mn-lt', valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    catAxisLineShow: false, showLegend: false, valAxisMaxVal: 30, catAxisLabelFrequency: 1 });
  // right column
  box(s, 13.5, 3.05, 6.0, 1.95, { fill: K.panel, line: K.panelLine });
  T(s, '92 vs 10', 13.8, 3.12, 5.5, 0.95, { fontFace: HF, fontSize: 56, bold: true, color: K.white });
  T(s, 'stopped outright vs skipped, paused or lowered', 13.8, 4.08, 5.5, 0.8, { color: 'E6E7EB' });
  box(s, 13.5, 5.2, 6.0, 1.75, { fill: K.penSoft, line: '3A4280' });
  T(s, [{ text: 'In scope: about 35%', options: { bold: true, color: K.pen, fontSize: 26, fontFace: HF } }, { text: '\nBlue bars, 66 of 188: moments the card acts on or explains', options: { color: K.ink } }], 13.8, 5.3, 5.5, 1.6);
  box(s, 13.5, 7.15, 6.0, 2.5);
  T(s, [{ text: 'How it works', options: { bold: true, color: K.head } },
    { text: '\nScrapers → keyword filter → an LLM codes each post\'s action, reason and who acted. Blind check on 20 hand-labelled posts: action 75%, reason 60%.', options: { color: K.ink } }], 13.75, 7.25, 5.55, 2.35);
  link(s, 'Try it: ask or code a post', LINKS.engine, 13.5, 9.75, 6.0);
}

/* ---------- 3. User research ---------- */
{
  const s = chrome(2, 'Interviews show people miss the lighter options at the moment of risk, and a friend\'s advice decides what they do',
    '6 interviews with first-time Groww investors aged 22–28 (P1–P6): failed payments, doubts and tight months.');
  const S = [['4 of 6', 'had a failed payment, and ignored or misread the alert'], ['4 of 6', 'didn\'t know they could skip one instalment'], ['3 of 6', 'were unsure what cancelling does to money already invested'], ['6 of 6', 'settled their doubt by asking a friend or family member']];
  S.forEach(([n, l], k) => { const y = 3.05 + k * 1.75; box(s, 0.5, y, 5.6, 1.55);
    T(s, n, 0.8, y + 0.1, 5.0, 0.75, { fontFace: HF, fontSize: 40, bold: true, color: K.head });
    T(s, l, 0.8, y + 0.8, 5.1, 0.7, { color: K.ink }); });
  const rows = [
    ['P1', '₹10k', 'Once, left it', 'Stopped that month', 'Roommate'],
    ['P2', '₹10k', 'Never', 'Lets the payment fail', 'Colleague'],
    ['P3', '₹1k', '2, stipend late', 'Thought skip = cancel', 'Friend'],
    ['P4', '₹5k', 'Never', 'Would lower the amount', 'Brother'],
    ['P5', '₹1.5k', 'Once, SMS unclear', 'Thought skip = cancel', 'Senior'],
    ['P6', '₹2k', 'Often, salary late', 'Cancelled the SIP', 'Friend'],
  ];
  const hdr = ['', 'SIP', 'Failed payment', 'In a tight month', 'Who decided'].map(t => ({ text: t, options: { bold: true, color: K.muted, fill: { color: K.tableHead } } }));
  const body = rows.map(r => r.map((t, j) => ({ text: t, options: { bold: j === 0, color: j === 0 ? K.greenInk : K.head } })));
  s.addTable([hdr, ...body], { x: 6.4, y: 3.05, w: 13.1, colW: [0.8, 1.3, 3.6, 4.6, 2.8], fontFace: BF, fontSize: 22, color: K.head,
    fill: { color: K.card }, border: { type: 'solid', color: K.line, pt: 1 }, rowH: 0.62, margin: [0.06, 0.15, 0.06, 0.15], valign: 'middle' });
  box(s, 6.4, 7.6, 6.4, 2.55);
  T(s, [{ text: '✓ Confirmed the engine', options: { bold: true, color: K.greenInk, fontFace: HF, fontSize: 24 } },
    { text: '\nPeople stop rather than adjust: 92 vs 10 in posts, and 4 of 6 here didn\'t know a skip existed.', options: { color: K.ink } }], 6.7, 7.75, 5.9, 2.3);
  box(s, 13.1, 7.6, 6.4, 2.55, { fill: K.amberSoft, line: '6B5222' });
  T(s, [{ text: '! Challenged the engine', options: { bold: true, color: K.amber, fontFace: HF, fontSize: 24 } },
    { text: '\nFailed payments: 4% of posts, but 4 of 6 interviewees. Online they read as app bugs, so we kept the moment.', options: { color: K.ink } }], 13.4, 7.75, 5.9, 2.3);
}

/* ---------- 4. Segment ---------- */
{
  const s = chrome(3, 'We target first-year investors whose pay arrives late or unevenly, because their SIPs fail without them choosing to stop',
    'Three groups showed up across the engine and the interviews. One loses SIPs to moments the app can fix today.');
  const G = [
    ['TARGET', 'First SIP, uneven pay', 'Stipends, late salaries (P3, P5, P6)', ['Autopay fails when pay is late', 'Tight months lead to a full stop', 'Least aware of skip, lower and move date'], 'Highest product-fixable churn, and churn they never chose', true],
    ['NOT SELECTED', 'First SIP, steady salary', 'Salary on a fixed date (P1, P2, P4)', ['Rarely fail; an odd tight month', 'Mostly know what cancel does', 'Same card helps, less urgent'], 'Lower risk: helped, but not the reason to build', false],
    ['NOT SELECTED', 'Returns-anxious stoppers', 'Stop after the first red number', ['26% of stops, the largest group', 'Ask “should I switch or stop?”', 'Only fixes: explanation or advice'], 'Out of scope: GR-1 can\'t give investment advice', false],
  ];
  G.forEach(([tag, h, who, bul, why, on], k) => { const x = 0.5 + k * 6.4, w = 6.0;
    box(s, x, 3.05, w, 5.25, { fill: on ? K.greenSoft : K.card, line: on ? K.green : K.line, lw: on ? 2 : 1.25 });
    pill(s, (on ? '✓ ' : '') + tag, x + 0.3, 3.3, on ? 1.9 : 2.6, { fill: on ? K.green : K.tableHead, line: on ? K.green : K.line2, color: on ? K.dark : K.muted });
    T(s, h, x + 0.3, 3.95, w - 0.6, 0.55, { fontFace: HF, fontSize: 30, bold: true, color: K.head });
    T(s, who, x + 0.3, 4.5, w - 0.6, 0.45, { color: K.muted });
    T(s, bul.map((b, j) => ({ text: b, options: { bullet: { indent: 18 }, breakLine: j < bul.length - 1 } })), x + 0.3, 5.1, w - 0.6, 1.7, { color: K.ink, paraSpaceAfter: 4 });
    T(s, why, x + 0.3, 7.0, w - 0.6, 1.2, { bold: true, color: on ? K.greenInk : K.ink }); });
  box(s, 0.5, 8.55, 19, 1.6);
  T(s, 'Who exactly', 0.8, 8.7, 3, 0.42, { bold: true, color: K.greenInk });
  const D = [['22–28', 'early-career, salary or stipend'], ['First 12 months', 'of their first Groww SIP'], ['₹500–₹10,000', 'a month'], ['No set goal', 'started on a friend\'s tip']];
  D.forEach(([n, l], k) => { const x = 0.8 + k * 4.7; T(s, n, x, 9.1, 4.5, 0.5, { fontFace: HF, fontSize: 28, bold: true, color: K.head }); T(s, l, x, 9.6, 4.5, 0.45, { color: K.ink }); });
}

/* ---------- 5. Root cause ---------- */
{
  const s = chrome(4, 'The options to keep a SIP alive already exist, but nothing in the app surfaces them when a SIP is at risk',
    'How the problem took shape, from metric to interviews, and what people do today instead.');
  // how the thinking evolved
  const E = [['Business metric', 'Active SIP at month 12'], ['Product outcome', 'Failures fixed; skip, not cancel'], ['AI discovery', 'Stops beat skips 9 to 1; a third reachable'], ['Primary research', 'Options unknown, payments failing'], ['Problem', 'SIPs lost that nobody chose to stop']];
  E.forEach(([h, d], k) => { const x = 0.5 + k * 3.85, last = k === 4; box(s, x, 3.05, 3.55, 1.55, { fill: last ? K.panel : K.card, line: last ? K.panelLine : K.line });
    T(s, h, x + 0.2, 3.13, 3.2, 0.42, { bold: true, color: K.greenInk });
    T(s, d, x + 0.2, 3.55, 3.2, 1.0, { color: K.head });
    if (!last) T(s, '→', x + 3.55, 3.55, 0.3, 0.5, { color: K.muted, align: 'center', fontSize: 24 }); });
  box(s, 0.5, 4.8, 19, 1.0, { fill: K.panel, line: K.panelLine });
  T(s, [{ text: 'Problem: ', options: { bold: true, color: K.green, fontFace: HF } }, { text: 'first-time investors on uneven pay lose SIPs they never chose to stop, because the right option is invisible when the SIP is at risk.', options: { color: K.white } }],
    0.85, 4.8, 18.3, 1.0, { fontSize: 24, valign: 'middle' });
  // root causes
  const C = [['1', 'The alert explains nothing', 'P5 misread it; P6 stopped reading.'],
    ['2', 'Help sits behind one icon', 'GR-1 doesn\'t know this SIP is at risk.'],
    ['3', 'Narrow windows in the rules', 'Skip by 2 days before; 3 misses cancel.']];
  T(s, 'Root causes', 0.5, 6.0, 6, 0.42, { bold: true, color: K.head, fontFace: HF, fontSize: 24 });
  C.forEach(([n, h, d], k) => { const y = 6.5 + k * 1.24; box(s, 0.5, y, 7.0, 1.12);
    s.addShape(pres.shapes.OVAL, { x: 0.72, y: y + 0.26, w: 0.56, h: 0.56, fill: { color: K.green }, line: { color: K.green } });
    T(s, n, 0.72, y + 0.26, 0.56, 0.56, { bold: true, color: K.dark, align: 'center', valign: 'middle', fontSize: 24 });
    T(s, [{ text: h, options: { bold: true, color: K.head } }, { text: '\n' + d, options: { color: K.ink } }], 1.5, y + 0.1, 5.9, 0.95); });
  // workarounds
  T(s, 'What people do today', 7.8, 6.0, 5.5, 0.42, { bold: true, color: K.head, fontFace: HF, fontSize: 24 });
  box(s, 7.8, 6.5, 5.6, 3.6);
  const Wk = ['Ask a friend, whose answer decides (6 of 6)', 'Let the payment fail and hope next month works (P1, P2)', 'Cancel now, “restart later” (P6, still not back)'];
  T(s, Wk.map((t, j) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: j < Wk.length - 1 } })), 8.05, 6.65, 5.15, 3.35, { color: K.ink, paraSpaceAfter: 8 });
  // why it matters
  T(s, 'Why solve it', 13.7, 6.0, 5.8, 0.42, { bold: true, color: K.head, fontFace: HF, fontSize: 24 });
  box(s, 13.7, 6.5, 5.8, 1.72);
  T(s, [{ text: 'For users  ', options: { bold: true, color: K.greenInk } }, { text: 'keep the habit through a bad month, and know what each choice does to their money', options: { color: K.ink } }], 13.95, 6.6, 5.35, 1.55);
  box(s, 13.7, 8.38, 5.8, 1.72);
  T(s, [{ text: 'For Groww  ', options: { bold: true, color: K.pen } }, { text: 'unchosen churn is the cheapest to win back, using an AI it already runs', options: { color: K.ink } }], 13.95, 8.48, 5.35, 1.55);
}

/* ---------- 6. Solution rationale ---------- */
{
  const s = chrome(5, 'Of four approaches, only bringing GR-1 to the at-risk moment fixes awareness and timing together, with an AI Groww already has',
    'Each option judged on: does it reach the moment, show the right action for this SIP, and fit Groww\'s rules?');
  const H = ['Approach', 'Reaches the moment', 'Right action', 'Fits the rules', 'Effort', 'Verdict'];
  const R = [
    ['Clearer failure SMS', '✓ Yes', '× No action', '✓ Yes', 'Low', '× Alerts get ignored'],
    ['Education content', '× Only if sought out', '× Generic', '✓ Yes', 'Low', '× Not a product fix'],
    ['New multi-month pause', '– Only at cancel', '– Partly', '× Not in Groww', 'High', '× Skip exists'],
    ['GR-1 in the moment', '✓ Every entry point', '✓ Ranked for it', '✓ Rules engine', 'Med', '✓ Chosen'],
  ];
  const hdr = H.map(t => ({ text: t, options: { bold: true, color: K.muted, fill: { color: K.tableHead } } }));
  const body = R.map((r, i) => r.map((t, j) => ({ text: t, options: { bold: j === 0 || (i === 3 && j === 5), color: i === 3 ? K.head : K.ink, fill: { color: i === 3 ? K.greenSoft : K.card } } })));
  s.addTable([hdr, ...body], { x: 0.5, y: 3.05, w: 19, colW: [4.2, 3.4, 3.2, 3.0, 1.4, 3.8], fontFace: BF, fontSize: 22, border: { type: 'solid', color: K.line, pt: 1 }, rowH: 0.72, margin: [0.06, 0.15, 0.06, 0.15], valign: 'middle' });
  T(s, 'One card, four ways in: only the action it leads with changes', 0.5, 6.95, 12, 0.45, { bold: true, color: K.head, fontFace: HF, fontSize: 26 });
  const W = [['A payment fails', 'Pay now, by the pay-by date'], ['Money is tight', 'Skip or lower, while it still counts'], ['Skip blocked', 'Lower or move the date'], ['Taps Cancel', 'Skip a month; cancel still 2 taps']];
  W.forEach(([a, b], k) => { const x = 0.5 + k * 3.25; box(s, x, 7.55, 3.0, 2.6);
    T(s, a, x + 0.25, 7.7, 2.6, 0.5, { bold: true, color: K.head, fontSize: 24 });
    T(s, '↓', x + 0.25, 8.45, 2.6, 0.4, { color: K.muted });
    T(s, b, x + 0.25, 8.9, 2.6, 1.2, { color: K.greenInk, bold: true }); });
  box(s, 13.6, 7.55, 5.9, 2.6, { fill: K.panel, line: K.panelLine });
  T(s, [{ text: 'Guardrails by design', options: { bold: true, color: K.green, fontFace: HF, fontSize: 24 } },
    { text: '\nCancel stays two taps.\nNo fund names, no stop-or-stay.\nIn hardship, stopping is valid.\nDistress gets a helpline, not a pitch.', options: { color: K.white } }], 13.9, 7.7, 5.4, 2.4);
}

/* ---------- 7. MVP ---------- */
{
  const s = chrome(6, 'The live MVP opens one GR-1 card at every risk moment: rules decide the options, and AI answers are checked before they show',
    'Deployed on sample SIP data, today\'s app vs GR-1 for all four moments, labelled “not investment advice”.');
  const shots = [['alert_failed.png', '1  Alert opens GR-1'], ['gr1_failed.png', '2  Missed 2 of 3'], ['gr1_tight.png', '3  Tight: skip leads'], ['confirm_skip.png', '4  Confirmed']];
  shots.forEach(([f, l], k) => { const x = 0.5 + k * 3.05; img(s, f, x, 3.05, 5.95); T(s, l, x, 9.12, 2.85, 0.5, { color: K.head, bold: true }); });
  box(s, 12.9, 3.05, 6.6, 3.7);
  T(s, 'Where AI earns its place', 13.2, 3.18, 6.1, 0.45, { bold: true, color: K.head, fontFace: HF, fontSize: 24 });
  T(s, [{ text: 'Rules set every option and date. AI reads what people type (“stipend late”, Hinglish) and picks the option that fits.', options: { color: K.ink } },
    { text: '\nWithout AI: a fixed FAQ that can\'t read a situation or spot hardship.', options: { color: K.amber, bold: true } }, { text: '\nEach answer passes 5 code checks and an AI reviewer, or a safe reply shows.', options: { color: K.muted } }], 13.2, 3.66, 6.1, 3.05, { paraSpaceAfter: 0 });
  box(s, 12.9, 6.95, 6.6, 3.2);
  T(s, 'Pass rate per eval run, %', 13.2, 7.05, 6.1, 0.45, { bold: true, color: K.head });
  s.addChart(pres.charts.LINE, [{ name: 'Pass rate', labels: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'], values: [73, 58, 77, 85, 96, 93, 94] }], { x: 13.0, y: 7.45, w: 6.4, h: 2.0,
    chartColors: [K.pen], lineSize: 3, lineDataSymbol: 'circle', lineDataSymbolSize: 9, showValue: true, dataLabelPosition: 't', dataLabelFormatCode: '0', dataLabelFontSize: 22, dataLabelColor: K.head, dataLabelFontFace: '+mn-lt',
    catAxisLabelFontSize: 22, catAxisLabelColor: K.muted, catAxisLabelFontFace: '+mn-lt', valAxisHidden: true, valAxisMinVal: 40, valAxisMaxVal: 110, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false });
  T(s, '0 unsafe answers in all 7 runs', 13.2, 9.5, 6.1, 0.42, { bold: true, color: K.greenInk });
  link(s, 'Live MVP', LINKS.mvp, 0.5, 9.85, 2.6, { h: 0.36 });
  link(s, 'Quality report', LINKS.quality, 3.3, 9.85, 3.4, { h: 0.36 });
}

/* ---------- 8. User testing ---------- */
{
  const s = chrome(7, 'All 3 testers chose a way to keep their SIP over cancelling, and their feedback shipped as 3 changes the same day',
    'Sessions with P1, P6 and P2 on the live MVP, 6 Nov, each on the moment that matched their own story.');
  const P = [['P1', 'Investing ₹10k; one failed payment', 'Chose: Skip this month', '“It gives me alternatives instead of making me think I have to cancel my SIP.”'],
    ['P6', 'Had cancelled his ₹2k SIP', 'Chose: Move the date, or Lower', '“I might not have stopped my SIP if I knew I could change the date.”'],
    ['P2', 'Investing ₹10k; never missed', 'Chose: a one-month break', '“Someone who is new to investing might think that stopping the SIP means getting their money back.”']];
  P.forEach(([p, who, c, q], k) => { const x = 0.5 + k * 4.2, w = 3.95; box(s, x, 3.05, w, 7.1, { fill: k === 1 ? K.panel : K.card, line: k === 1 ? K.panelLine : K.line });
    const dk = k === 1;
    T(s, p, x + 0.3, 3.25, w - 0.6, 0.6, { fontFace: HF, fontSize: 36, bold: true, color: dk ? K.green : K.greenInk });
    T(s, who, x + 0.3, 3.9, w - 0.6, 0.8, { color: dk ? 'E6E7EB' : K.muted });
    pill(s, c, x + 0.3, 4.8, w - 0.6, { h: 0.8, fill: dk ? K.green : K.greenSoft, color: dk ? K.dark : K.greenInk, size: 22 });
    T(s, q, x + 0.3, 5.9, w - 0.6, 3.2, { fontFace: HF, fontSize: 26, bold: true, color: dk ? K.white : K.head });
    T(s, 'Tested: ' + ['tight month, failed payment', 'failed payment, date, lower', 'needs a break, cancel'][k], x + 0.3, 9.1, w - 0.6, 0.9, { color: dk ? 'C9CBD3' : K.muted }); });
  const H = [['H2', 'Pick a non-cancel option', '3 of 3'], ['H3', 'Know money stays put', '3 of 3'], ['H5', 'Trust needs neutrality', '3 of 3'], ['H1', 'Find it unprompted', 'Not tested']];
  box(s, 13.2, 3.05, 6.3, 3.5);
  T(s, 'Hypotheses', 13.5, 3.15, 5.8, 0.45, { bold: true, color: K.head, fontFace: HF, fontSize: 24 });
  H.forEach(([h, t, r], k) => { const y = 3.68 + k * 0.7;
    T(s, [{ text: h + '  ', options: { bold: true, color: K.greenInk } }, { text: t, options: { color: K.ink } }], 13.5, y, 4.3, 0.6);
    T(s, r, 17.55, y, 1.8, 0.6, { bold: true, color: r === 'Not tested' ? K.muted : K.head, align: 'right' }); });
  box(s, 13.2, 6.75, 6.3, 1.65, { fill: K.greenSoft, line: K.green });
  T(s, [{ text: 'Shipped the same day', options: { bold: true, color: K.greenInk } },
    { text: '\n✓ Confirmation after every change\n✓ When the SIP continues after a skip\n✓ A break worded as a one-month skip', options: { color: K.head } }], 13.45, 6.82, 5.9, 1.55);
  box(s, 13.2, 8.6, 6.3, 1.55, { fill: K.penSoft, line: '3A4280' });
  T(s, [{ text: 'Next iteration', options: { bold: true, color: K.pen } },
    { text: '\nLower for a few months, then remind\nWin back cancelled SIPs', options: { color: K.head } }], 13.45, 8.67, 5.9, 1.45);
}

/* ---------- 9. Success metrics ---------- */
{
  const s = chrome(8, 'Success means more first-year SIPs paid in month 12, with no rise in time to cancel or in people feeling pushed',
    'One north star, leading signals that move within weeks, and guardrails that must not break.');
  box(s, 0.5, 3.05, 19, 1.4, { fill: K.panel, line: K.panelLine });
  T(s, [{ text: 'North star  ', options: { bold: true, color: K.green, fontFace: HF, fontSize: 28 } }, { text: 'share of first-time investors with a paid SIP instalment in the 30 days before their 12-month mark, by start-month cohort', options: { color: K.white, fontSize: 24 } }], 0.85, 3.05, 18.3, 1.4, { valign: 'middle' });
  const cols = [
    ['Leading', K.pen, [['At-risk card reach', 'opened within 2 days of risk'], ['Failure recovery', 'paid, skipped or edited in 7 days'], ['Auto-cancel rate', 'SIPs lost to 3 misses, per 100'], ['Cancel-flow alternative', 'Cancel taps ending in skip or edit']]],
    ['Guardrails', K.amber, [['Time to cancel', 'median seconds, must not rise'], ['Felt pressured', '“Did this feel pushy?” stays low'], ['Hardship stops', 'people in hardship can still stop'], ['Redemptions in 90 days', 'kept in, but leave anyway']]],
    ['AI quality', K.greenInk, [['Safety pass', '100%: no advice or urgency'], ['Facts pass', 'at least 90% on the golden set'], ['Live fallback rate', 'answers swapped for a safe one'], ['Unsafe answers shown', 'target 0']]],
  ];
  cols.forEach(([h, c, items], k) => { const x = 0.5 + k * 6.4, w = 6.0; box(s, x, 4.7, w, 5.45);
    T(s, h, x + 0.3, 4.85, w - 0.6, 0.5, { bold: true, color: c, fontFace: HF, fontSize: 26 });
    items.forEach(([n, d], j) => { const y = 5.45 + j * 1.17;
      T(s, [{ text: n, options: { bold: true, color: K.head } }, { text: '\n' + d, options: { color: K.ink } }], x + 0.3, y, w - 0.6, 1.1); }); });
}

/* ---------- 10. Risks ---------- */
{
  const s = chrome(9, 'The biggest risks are advice, wrong dates and keeping people in who should stop, and each one has a guard built in',
    'Failure modes, how the design limits them, how it would roll out, and what this case study could not test.');
  const R = [['Reads as investment advice', 'Code declines fund and stop/stay asks; 5 checks + AI reviewer; never names a fund'],
    ['States a wrong date or rule', 'Every date comes from the rules engine; unconfirmed rules get “couldn\'t confirm”'],
    ['Keeps in people who should stop', 'Hardship detected; stopping treated as valid; cancel stays two taps'],
    ['Feels like a retention trick', 'No urgency words; cancel shown with the options; “felt pressured” guardrail']];
  const hdr = ['Risk', 'Guard in the design'].map(t => ({ text: t, options: { bold: true, color: K.muted, fill: { color: K.tableHead } } }));
  const body = R.map(r => [{ text: r[0], options: { bold: true, color: K.head } }, { text: r[1], options: { color: K.ink } }]);
  s.addTable([hdr, ...body], { x: 0.5, y: 3.05, w: 11.0, colW: [4.0, 7.0], fontFace: BF, fontSize: 22, fill: { color: K.card }, border: { type: 'solid', color: K.line, pt: 1 }, rowH: 0.95, margin: [0.08, 0.15, 0.08, 0.15], valign: 'middle' });
  box(s, 0.5, 8.15, 11.0, 2.0, { fill: K.amberSoft, line: '6B5222' });
  T(s, [{ text: 'Limitations  ', options: { bold: true, color: K.amber } }, { text: 'Sample data only. 3 tests, interviewer-led, so discovery and timing weren\'t measured. Public posts over-represent complaints. Returns-driven stops (26%) left out of scope.', options: { color: K.head } }], 0.8, 8.25, 10.4, 1.8, { valign: 'middle' });
  box(s, 11.8, 3.05, 7.7, 4.9);
  T(s, 'Rollout', 12.1, 3.2, 7.2, 0.45, { bold: true, color: K.head, fontFace: HF, fontSize: 24 });
  const Ph = [['Phase 1', 'Failed payments only: clearest trigger, A/B on recovery rate'], ['Phase 2', 'Add the tight-month heads-up and blocked-skip card'], ['Phase 3', 'Cancel flow, and GR-1 in the header knows SIP state']];
  Ph.forEach(([p, d], k) => { const y = 3.8 + k * 1.35; pill(s, p, 12.1, y, 1.6, { fill: K.penSoft, color: K.pen, line: '3A4280' }); T(s, d, 13.9, y - 0.05, 5.4, 1.2, { color: K.ink }); });
  box(s, 11.8, 8.15, 7.7, 2.0);
  T(s, 'Supporting work', 12.1, 8.22, 7.2, 0.4, { bold: true, color: K.head });
  link(s, 'Live MVP', LINKS.mvp, 12.1, 8.66, 3.4, { h: 0.4 }); link(s, 'Discovery engine', LINKS.engine, 15.7, 8.66, 3.6, { h: 0.4 });
  link(s, 'AI Evidence Log', LINKS.evidence, 12.1, 9.12, 3.4, { h: 0.4 }); link(s, 'Quality report', LINKS.quality, 15.7, 9.12, 3.6, { h: 0.4 });
  link(s, 'PRD', LINKS.prd, 12.1, 9.58, 3.4, { h: 0.4 }); link(s, 'User test kit', LINKS.tests, 15.7, 9.58, 3.6, { h: 0.4 });
}

(async () => {
  const out = '/home/claude/deck/NL_Groww.pptx';
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('written', out);
})();
