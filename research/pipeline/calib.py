import pandas as pd, re
m=pd.read_csv('exit_coded.csv').fillna('')
mp={'H1_expectation_negative_returns':'PERF','H3_cashflow_affordability':'CASH','H4_autopay_mandate_tech':'TECH',
    'H5_pause_resume':'PAUSE_UX','H7_comparison_switching':'SWITCH','N_market_fall_trigger':'MARKET'}
rel=m[m.m_primary!='NA']
print('Lexicon vs model, on',len(rel),'model-relevant exit items')
for lx,mc in mp.items():
    L=rel.causes.str.contains(lx); M=rel.m_reasons.str.contains(mc)
    tp=(L&M).sum(); prec=tp/max(L.sum(),1); rec=tp/max(M.sum(),1)
    print(f"{mc:9s} lexicon={L.sum():3d} model={M.sum():3d} precision={prec:.0%} recall={rec:.0%}")
print('model NA but lexicon exit-signal (false relevance):',(m.m_primary=='NA').sum(),'of',len(m))
d=pd.read_csv('tagged_lexicon.csv').fillna('')
T=d.text.str.lower()
pats={
 'compares_to_FD_RD':r"\bfd\b|fixed deposit|\brd\b|recurring deposit|ppf",
 'expects_fixed_return':r"guarantee|fixed return|assured|expected (return|\d+ ?%)|\b1[25] ?% (return|cagr)",
 'value_below_invested':r"(current|present) value.{0,40}(less|lower|below)|less than (what i )?invested|below (my )?invest|in loss|in red|negative (return|xirr)",
 'xirr_returns_confusion':r"xirr|absolute return|cagr.{0,30}(confus|differen|mean)|what is xirr|returns shown",
 'checks_daily':r"every ?day|daily|each day|every morning",
 'stop_vs_redeem_confusion':r"(stop|cancel|band).{0,40}(redeem|withdraw|nikal|money back|paisa)|(redeem|withdraw).{0,40}(stop|cancel) (the )?sip|invested reh|amount.{0,20}(rahega|milega)",
 'wants_flexibility':r"pause|skip|change (the )?(sip )?date|reduce (the )?(sip )?amount|modify",
 'asks_others_should_i':r"should i (stop|continue|pause|cancel|redeem|exit|switch)|kya karu|kya kare|what should i do",
 'influenced_youtube_social':r"youtube|youtuber|reel|instagram|finfluencer|influencer",
 'influenced_friend_family':r"(friend|colleague|cousin|uncle|father|dad|mom|parents|relative)s?\b.{0,30}(told|said|suggest|recommend|advis|made me|started)",
 'salary_mention':r"salary|in-?hand|\blpa\b|ctc",
 'variable_income':r"freelanc|self[- ]employed|business income|irregular income|gig work",
 'student':r"\bstudent\b|college|pocket money|stipend",
 'emergency_fund':r"emergency fund",
 'goal_mention':r"\bgoal\b|retirement|house|wedding|marriage|child|education|car\b",
}
print('\nFull SIP corpus (n=%d) pattern prevalence by source:'%len(d))
rows=[]
for k,p in pats.items():
    hit=T.str.contains(p,regex=True)
    rows.append([k,hit.sum()]+[hit[d.source==s].sum() for s in ['play_store','reddit_post','reddit_comment','youtube','tradingqna']])
print(pd.DataFrame(rows,columns=['pattern','all','PS','RP','RC','YT','TQ']).to_string(index=False))
