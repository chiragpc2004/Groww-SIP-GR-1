import pandas as pd, re, json
df=pd.read_csv('sip_items.csv')
def has(p,t): return bool(re.search(p,t,re.I))

ACTION={
 'stopped': r"\b(stopped|cancel+ed|discontinued|closed|band kar (diya|di)|band kiya|band kr di)\b.{0,25}\bsips?\b|\bsips?\b.{0,25}\b(stopped|cancel+ed|discontinued|band kar (diya|di)|band ho gay)",
 'paused': r"\bpaus(e|ed|ing)\b|\bskip(ped|ping)?\b.{0,20}(instal|month|sip)",
 'reduced': r"\b(reduc(e|ed|ing)|lower(ed)?|decreas(e|ed))\b.{0,25}\b(sip|amount)",
 'redeemed': r"\b(redeem(ed)?|withdr[ae]w(n)?|withdrawal|sold (all|my) (units|mf|mutual))\b",
 'considering_stop': r"(should i|thinking (of|about)|planning to|want to|kya)\s.{0,20}\b(stop|pause|cancel|exit|band)\b|stop (my|the)? ?sips?\?|\b(continue|stop)\b.{0,15}\bor\b.{0,15}\b(stop|continue)\b",
 'started': r"\b(just|recently|newly) (started|began)|\bstarted (my )?(first )?sip|\bfirst sip\b|\bbeginner|\bnew to (investing|mutual|mf)|\bstart(ing)? (a |my )?sip\b",
 'stepped_up': r"step[- ]?up|increas(e|ed|ing) (my )?sip|top[- ]?up",
}
CAUSE={
 'H1_expectation_negative_returns': r"negative|\bin (the )?red\b|loss(es)?\b|\blosing\b|down \d+ ?%|-\d+ ?%|not (giving|getting) (any )?returns?|no returns|returns? (are|is) (low|poor|bad|zero|negative)|less than fd|fd (gives|is better)|scam|waste of (money|time)|nuksan|ghata|underperform|flat returns|xirr.{0,30}(negative|low|confus)|why.{0,20}(loss|negative)",
 'H2_no_goal_or_influenced': r"(friend|colleague|cousin|uncle|father|dad|mom|family|relative|brother|sister)s? (told|said|suggested|asked|recommend)|saw (a|on) (youtube|insta|reel|video)|finfluencer|influencer|\breels?\b|without (any )?(goal|plan|research)|don'?t know why i|no (specific )?goal|everyone (is|was) (doing|investing)|peer pressure",
 'H3_cashflow_affordability': r"salary|\bemis?\b|expenses?|cash ?flow|can'?t afford|cannot afford|money (is )?tight|tight (budget|month)|short of (money|funds)|insufficient (balance|funds)|bounce|penalt(y|ies)|charges? (deducted|levied)|lost (my )?job|job loss|laid off|layoff|unemploy|irregular income|freelanc|business income|emergency|medical|wedding|marriage|rent\b|loan",
 'H4_autopay_mandate_tech': r"auto ?pay|mandate|nach|upi autopay|debit (failed|not)|payment (failed|pending|stuck)|failed (sip|instal|payment|debit)|not (debited|deducted)|deducted twice|double (debit|deduct)|units? not (allotted|allocated|credited)|order (failed|pending)|bank (account )?(change|changed)",
 'H5_pause_resume': r"\bpaus(e|ed|ing)\b|\bresum(e|ed|ing)\b|restart(ed)?|skip(ped)? (an? )?(instal|month)|forgot to (pay|restart|resume)",
 'H6_checking_frequency': r"check(ing)? (it |my portfolio |the app |)?(every|daily|each) (day|morning|hour|week)|every day i (check|see|open)|daily check|keep checking|stop (checking|looking)|don'?t (check|look) (it |at it )?(daily|often|every)|delete the app|uninstall|forget (about )?(it|the app)|check (once|only) (a|in) (year|month|while)",
 'H7_comparison_switching': r"switch(ed|ing)? (to|from|fund)|moved? (my money |it )?(to|into) (stocks|direct equity|fd|gold|crypto|f&o|options|another)|better (fund|returns) (than|elsewhere)|my friend'?s fund|others? (are )?(getting|making)|compare[ds]?|comparison|stocks? (give|gave|giving) (more|better)|f&o|options trading|crypto",
 'H8_seeks_outside_validation': r"should i (stop|continue|pause|cancel|redeem|exit|switch|hold)|what should i do|please (help|suggest|advise|guide)|need (advice|suggestion|guidance|help)|kya karu|kya karna chahiye|is it (a )?good (time|idea) to|confused|confusion|worried|scared|panic|anxious|nervous|sleepless|tension",
 'H9_manual_payment': r"manual(ly)? (pay|payment)|pay (it )?(manually|every month)|reminder|notification to pay|forgot to pay|missed (the )?(payment|instal)",
 'N_market_fall_trigger': r"market (is |was )?(down|crash|fall|falling|fell|correction|dip|red)|crash(ed|ing)?\b|correction|bear market|nifty (down|fell|falling)|trump|tariff|war\b",
 'N_fund_choice_overload': r"which fund|too many funds|best (mutual )?fund|which mf|right fund|good fund|portfolio review|rate my portfolio|overlap|how many funds|suggest (some |a )?(fund|mf)",
 'N_app_trust_support': r"customer (care|support|service)|no response|support team|not responding|raise(d)? (a )?(ticket|complaint)|fraud|scam app|worst app|hidden charges",
 'N_tax_exit_load_rules': r"exit load|\bltcg\b|\bstcg\b|capital gains?|tax(ed|es|ation)?\b|lock[- ]?in|elss",
 'N_long_term_reassurance': r"long ?term|stay (invested|the course)|keep (investing|going|calm)|don'?t stop|never stop|continue (your|the|ur) sip|time in (the )?market|rupee cost averag|buy(ing)? (more )?(at )?(the )?(dip|low)|more units|compound",
}
CHECK={'daily':r"every ?day|daily|each day|every morning|every hour|multiple times",
       'weekly':r"every week|weekly",'rarely':r"once a (year|month)|rarely|don'?t check|forgot about|haven'?t (checked|opened)"}
SEG={
 'income_salaried': r"salar(y|ied)|\bctc\b|in-?hand|my job|corporate|office|employer|paycheck|\blpa\b",
 'income_variable': r"freelanc|business|self[- ]employed|irregular income|gig|commission|consultant|shop",
 'student_or_first_job': r"\bstudent\b|college|first job|fresher|just (started|got) (my )?(job|working)|internship|stipend|pocket money",
 'influence_social_media': r"youtube|youtuber|insta(gram)?|reels?|finfluencer|influencer|telegram",
 'influence_family_friends': r"(friend|colleague|cousin|uncle|father|dad|mom|mother|parents?|family|relative|brother|sister)s? (told|said|suggested|asked|recommend|advised|started)",
 'money_bonus_windfall': r"bonus|windfall|inheritance|gift(ed)? money|lump ?sum",
}
def age(t):
    m=re.search(r"\b(i am|i'm|im|age[: ]*|aged)\s*(\d{2})\b|\b(\d{2}) ?(y/?o|yrs? old|years old|\(?m\)?|\(?f\)?)\b",t,re.I)
    if not m: return ''
    a=int(m.group(2) or m.group(3)); return a if 16<=a<=70 else ''
def months(t):
    m=re.search(r"(\d{1,2}) ?(months?|mos?)\b",t,re.I)
    y=re.search(r"(\d{1,2}|a|one|two) ?(years?|yrs?)\b",t,re.I)
    if m: return int(m.group(1))
    if y:
        v=y.group(1).lower(); v={'a':1,'one':1,'two':2}.get(v,v); return int(v)*12
    return ''
def stage(t,acts):
    mo=months(t)
    if 'stopped' in acts or 'redeemed' in acts: return 'after_stop'
    if mo!='' and mo<=3 or has(r"just started|recently started|first sip|new to",t): return '0-3m'
    if mo!='' and mo<=6: return '3-6m'
    if mo!='' and mo<=12: return '6-12m'
    if mo!='' and mo>12: return '12m+'
    if has(r"want to start|planning to start|should i start|beginner|before (i )?start",t): return 'pre_start'
    return 'unclear'
rows=[]
for _,r in df.iterrows():
    t=r.text
    acts=[k for k,p in ACTION.items() if has(p,t)]
    causes=[k for k,p in CAUSE.items() if has(p,t)]
    chk=[k for k,p in CHECK.items() if has(p,t)]
    seg=[k for k,p in SEG.items() if has(p,t)]
    rows.append(dict(action=';'.join(acts),causes=';'.join(causes),checks=';'.join(chk),
                     segment=';'.join(seg),age=age(t),stage=stage(t,acts),
                     exit_signal=any(a in acts for a in ['stopped','paused','reduced','redeemed','considering_stop'])))
tags=pd.DataFrame(rows)
out=pd.concat([df.reset_index(drop=True),tags],axis=1)
out.to_csv('tagged_lexicon.csv',index=False)
print(out.exit_signal.sum(),'exit-signal items of',len(out))
print(out.stage.value_counts())
from collections import Counter
c=Counter(x for s in out.causes.dropna() for x in str(s).split(';') if x)
ce=Counter(x for s in out[out.exit_signal].causes.dropna() for x in str(s).split(';') if x)
for k in CAUSE: print(f"{k:35s} all={c[k]:4d} exit={ce[k]:4d}")
