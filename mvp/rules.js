/*
 * GR-1 SIP card: rules engine.
 * Plain code, no AI. Computes every date, deadline and option from the
 * verified Groww rules (see groww_sip_rules.md). The AI may only explain
 * what this file returns. Runs in the browser and in Node.
 */
(function (root) {
  const DAY = 864e5;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Rules the assistant may state as fact. Wording kept short for the prompt.
  const RULES = {
    R1: 'You can skip only one instalment at a time; after that date passes you can request another skip.',
    R2: 'A skip requested within 2 days of the debit does not apply to that instalment; it applies from the next one.',
    R3: 'Three skipped, missed or failed instalments in a row cancel the SIP automatically. A failed autopay counts, and so does a skip.',
    R4: 'Groww has no open-ended pause; "pause" means skipping one instalment.',
    R5: 'You can change the SIP amount or date any time; within 2 working days of the debit the change applies only to later instalments.',
    R7: 'Cancelling stops future instalments. Money already invested stays invested until you redeem it separately.',
    R8: 'You cannot cancel a SIP if the next instalment is due within 7 days.',
    R9: 'A cancellation cannot be undone; to invest again you start a new SIP.',
    R17: 'Some fund houses do not allow skipping an instalment; the app says so when you try. Changing the amount or date still works.',
    R11: 'Groww charges nothing for a failed SIP. Your bank may charge a bounce fee; the amount varies by bank.',
    R12: 'You can pay a pending SIP from Dashboard, Pending SIP Payments, Pay.',
    R13: 'Paying after the date shown counts the instalment as failed; a one-time investment in the same fund is still possible in most funds.',
    R16: 'After a low-balance autopay failure, Pay Now on the dashboard stays available for 2 working days, by UPI or net banking.',
  };
  const UNVERIFIED = {
    U1: 'Whether a failed autopay is retried automatically, and the exact wording of the failure alert.',
    U2: 'Exact bank bounce-fee amounts.',
    U3: 'Which funds do not allow skipping or one-time orders.',
  };
  const HELP = {
    skip: 'https://groww.in/help/mutual-funds/mf-sip/how-to-skip-an-sip-instalment--79',
    edit: 'https://groww.in/help/mutual-funds/mf-sip/how-to-change-sip-date-or-amount',
    cancel: 'https://groww.in/help/mutual-funds/mf-sip/how-to-cancel-my-sip',
    pay: 'https://groww.in/help/mutual-funds/mf-sip/how-do-i-pay-for-a-missed-installment-3',
    charges: 'https://groww.in/help/mutual-funds/mf-autopay/what-are-ecs-charges--96',
    fail: 'https://groww.in/help/mutual-funds/order/why-did-my-sip-installment-fail--36',
  };

  // ---------- dates (all in IST calendar days) ----------
  function istToday() {
    const d = new Date(Date.now() + 5.5 * 3600e3);          // shift to IST, then read UTC parts
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  const add = (t, n) => t + n * DAY;
  const fmt = t => { const d = new Date(t); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
  const isWeekend = t => { const w = new Date(t).getUTCDay(); return w === 0 || w === 6; };
  function addWorkingDays(t, n) { let x = t, k = 0; while (k < n) { x = add(x, 1); if (!isWeekend(x)) k++; } return x; }
  function workingDaysBetween(a, b) { let k = 0; for (let x = add(a, 1); x <= b; x = add(x, 1)) if (!isWeekend(x)) k++; return k; }
  function dayInMonth(year, month, day) {                     // clamp e.g. 31 -> 30 Nov
    const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return Date.UTC(year, month, Math.min(day, last));
  }
  function nextDateForDay(today, day, strictlyAfter) {
    const d = new Date(today);
    let t = dayInMonth(d.getUTCFullYear(), d.getUTCMonth(), day);
    if (strictlyAfter ? t <= today : t < today) t = dayInMonth(d.getUTCFullYear(), d.getUTCMonth() + 1, day);
    return t;
  }
  const inr = n => '₹' + Number(n).toLocaleString('en-IN');

  // ---------- sample scenarios (built from interview cases, dates relative to today) ----------
  function sampleScenarios(today = istToday()) {
    const d = new Date(today), dom = d.getUTCDate();
    const failedDay = new Date(add(today, -1)).getUTCDate();
    return [
      {
        id: 'failed', label: 'Stipend came late', moment: 'failed',
        who: 'Intern, ₹1,000 SIP, stipend often delayed (like P3 and P6)',
        amount: 1000, sipDay: failedDay, salaryDay: Math.min(28, failedDay + 6), monthsRunning: 7,
        invested: 6000, currentValue: 5820, status: 'failed', failureReason: 'insufficient_balance',
        lastFailure: add(today, -1), missedInARow: 2,
      },
      {
        id: 'tight', label: 'Overspent this month', moment: 'tight',
        who: 'Salaried, ₹10,000 SIP, big card bill this month (like P1)',
        amount: 10000, sipDay: new Date(add(today, 5)).getUTCDate(), salaryDay: 1, monthsRunning: 9,
        invested: 90000, currentValue: 87400, status: 'upcoming', failureReason: null,
        lastFailure: null, missedInARow: 0,
      },
      {
        id: 'blocked', label: 'Fund blocks skip', moment: 'blocked',
        who: 'Salaried, ₹5,000 SIP, short this month, fund does not allow skipping (from user reports)',
        amount: 5000, sipDay: new Date(add(today, 6)).getUTCDate(), salaryDay: 1, monthsRunning: 4,
        invested: 20000, currentValue: 19600, status: 'upcoming', failureReason: null,
        lastFailure: null, missedInARow: 0, skipAllowed: false,
      },
      {
        id: 'cancel', label: 'Needs a break', moment: 'cancel',
        who: 'Salaried, ₹2,000 SIP, home expenses, thinking of stopping (like P2 and P6)',
        amount: 2000, sipDay: new Date(add(today, 12)).getUTCDate(), salaryDay: 3, monthsRunning: 11,
        invested: 22000, currentValue: 21300, status: 'upcoming', failureReason: null,
        lastFailure: null, missedInARow: 0,
      },
    ];
  }

  // ---------- the engine ----------
  function evaluate(s, today = istToday()) {
    const facts = {}, warnings = [];
    const next = s.status === 'failed'
      ? nextDateForDay(today, s.sipDay, true)                 // the failed one has passed; next is the coming one
      : nextDateForDay(today, s.sipDay, false);
    const daysToNext = Math.round((next - today) / DAY);
    const wdToNext = workingDaysBetween(today, next);
    facts.today = fmt(today);
    facts.amount = inr(s.amount);
    facts.next_debit = fmt(next);
    facts.days_to_next_debit = daysToNext;
    facts.invested_so_far = inr(s.invested);
    facts.current_value = inr(s.currentValue);
    facts.missed_in_a_row = `${s.missedInARow} of 3`;
    facts.status = s.status === 'failed' ? `Last instalment failed on ${fmt(s.lastFailure)} (${s.failureReason === 'insufficient_balance' ? 'insufficient balance' : 'payment failed'})` : 'Active, next instalment upcoming';

    const options = [];

    // Pay now (R16, R12, R13)
    if (s.status === 'failed') {
      if (s.failureReason === 'insufficient_balance') {
        const deadline = addWorkingDays(s.lastFailure, 2);
        const open = today <= deadline;
        facts.pay_now_deadline = fmt(deadline);
        options.push({ id: 'pay', title: 'Pay the failed instalment', available: open,
          when: open ? `Pay Now is open until ${fmt(deadline)}` : `Pay Now closed on ${fmt(deadline)}; a one-time investment is still possible`,
          detail: open ? `Paying ${inr(s.amount)} now counts this month and ends the run of missed instalments.` : 'The instalment stays counted as missed.',
          rules: open ? ['R16', 'R12'] : ['R13'], help: HELP.pay });
      } else {
        options.push({ id: 'pay', title: 'Pay the pending instalment', available: true,
          when: 'From Dashboard, Pending SIP Payments', detail: 'Paying after the date shown counts as failed.', rules: ['R12', 'R13'], help: HELP.pay });
      }
    }

    // Skip next (R1, R2, R3)
    const skipCountsNow = daysToNext > 2;
    const skipTarget = skipCountsNow ? next : nextDateForDay(add(next, 1), s.sipDay, false);
    const skipWouldCancel = s.missedInARow >= 2;
    if (s.skipAllowed === false) {
      options.push({ id: 'skip', title: 'Skip an instalment', available: false, blocked: true,
        when: "This fund doesn't allow skipping", detail: 'The fund house has turned skipping off for this fund. Lowering the amount or moving the date still work.',
        rules: ['R17'], help: HELP.skip });
    } else
    options.push({ id: 'skip', title: `Skip the ${fmt(skipTarget)} instalment`, available: !skipWouldCancel, risk: skipWouldCancel,
      when: skipWouldCancel ? 'Possible, but this skip would cancel the SIP' : skipCountsNow ? `Request by ${fmt(add(next, -3))} to skip ${fmt(next)}` : `Too close to ${fmt(next)}; a skip now applies to ${fmt(skipTarget)}`,
      detail: skipWouldCancel ? `You already have ${s.missedInARow} missed in a row. A skip would be the 3rd and cancel the SIP.` : 'One instalment only. It counts toward the 3-in-a-row limit.',
      rules: skipWouldCancel ? ['R1', 'R3'] : ['R1', 'R2', 'R3'], help: HELP.skip });
    if (skipWouldCancel) warnings.push(`${s.missedInARow} instalments missed in a row: one more missed, failed or skipped instalment cancels this SIP automatically (R3).`);

    // Reduce amount (R5)
    const editCountsNow = wdToNext > 2;
    options.push({ id: 'reduce', title: 'Lower the amount', available: true,
      when: editCountsNow ? `Applies from ${fmt(next)} if changed by ${fmt(addWorkingDays(today, Math.max(0, wdToNext - 3)))}` : `Too close to ${fmt(next)}; applies from the instalment after`,
      detail: 'Keeps the SIP running at a size that fits this month.', rules: ['R5'], help: HELP.edit });

    // Move date (R5) - suggested when salary lands after the debit
    const salaryAfterDebit = s.salaryDay > s.sipDay;
    const suggestedDay = Math.min(28, s.salaryDay + 2);
    options.push({ id: 'date', title: salaryAfterDebit ? `Move the debit to the ${suggestedDay}${suffix(suggestedDay)}` : 'Change the debit date', available: true,
      when: editCountsNow ? `Applies from the next instalment if changed now` : `Applies from the instalment after ${fmt(next)}`,
      detail: salaryAfterDebit ? `Your pay usually lands on the ${s.salaryDay}${suffix(s.salaryDay)}, after the debit on the ${s.sipDay}${suffix(s.sipDay)}.` : 'Pick a date a couple of days after pay arrives.',
      rules: ['R5'], help: HELP.edit, suggested: salaryAfterDebit });
    if (salaryAfterDebit) facts.salary_vs_debit = `Pay lands on the ${s.salaryDay}${suffix(s.salaryDay)}, debit is on the ${s.sipDay}${suffix(s.sipDay)}`;

    // Pause for 1-3 months: proposed feature, not in the app today (R4)
    options.push({ id: 'pause', title: 'Pause for 1–3 months', available: true, proposed: true,
      when: 'Proposed: not in the app today',
      detail: "Instalments stop for the months you pick, then restart on their own. Paused months wouldn't count as missed.",
      rules: ['R4'], help: HELP.skip });

    // Cancel (R7, R8, R9)
    const cancelOpen = daysToNext > 7;
    options.push({ id: 'cancel', title: 'Cancel the SIP', available: cancelOpen,
      when: cancelOpen ? 'Available now' : `Locked until ${fmt(add(next, 1))} because the next instalment is within 7 days`,
      detail: `Stops future instalments. Your ${inr(s.currentValue)} stays invested until you redeem it separately. Can't be undone.`,
      rules: ['R7', 'R8', 'R9'], help: HELP.cancel });
    facts.cancel = cancelOpen ? 'Cancel is available now' : `Cancel is locked until ${fmt(add(next, 1))} (next instalment within 7 days)`;

    // dates the answer is allowed to mention
    const allowedDates = new Set([today, next, skipTarget, add(next, -3), add(next, 1)].map(fmt));
    if (facts.pay_now_deadline) allowedDates.add(facts.pay_now_deadline);
    if (s.lastFailure) allowedDates.add(fmt(s.lastFailure));
    const allowedAmounts = new Set([s.amount, s.invested, s.currentValue].map(Number));
    return { facts, options, warnings, nextTs: next, allowedDates: [...allowedDates], allowedAmounts: [...allowedAmounts] };
  }
  function suffix(n) { return (n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'); }

  const api = { RULES, UNVERIFIED, HELP, istToday, sampleScenarios, evaluate, fmt, inr, addWorkingDays };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SIPRules = api;
})(typeof window !== 'undefined' ? window : globalThis);
