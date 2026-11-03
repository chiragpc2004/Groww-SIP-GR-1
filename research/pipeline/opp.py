import pandas as pd, json
m=pd.read_csv('exit_coded.csv',keep_default_na=False)
rel=m[m.m_primary!='NA']; fp=rel[rel.m_actor.isin(['self','asker','prestart'])]
OPP={
 'O1 First red number read as "SIP isn\'t working"':['PERF','MARKET'],
 'O2 Mechanics confusion: stop vs pause vs redeem':['CONFUSION'],
 'O3 Cash squeeze with only all-or-nothing options':['CASH','PAUSE_UX','GOAL_DONE'],
 'O4 Transaction failures erode trust':['TECH','TRUST'],
 'O5 Fund-switching and cost optimisation':['SWITCH','COST'],
 'O6 Fund-house / regulatory suspensions':['AMC_RULE'],
}
fix={'O1':4,'O2':5,'O3':5,'O4':3,'O5':1,'O6':1}   # can product act without fund advice / FOMO? (1-5, judgement)
lever={'O1':'B: cancel / redeem','O2':'B: cancel / redeem (wrong action)','O3':'B: pause→C: 3 missed = auto-cancel',
       'O4':'C: involuntary + B','O5':'Often re-enters (D) — low metric impact','O6':'C: involuntary, not addressable'}
rows=[]
for name,codes in OPP.items():
    k=name[:2]
    hit=fp[fp.m_reasons.apply(lambda s:any(c in s.split(';') for c in codes))]
    exits=hit.m_action.isin(['stopped','redeemed','paused','reduced','skipped','involuntary']).mean()
    first=hit.m_flags.str.contains('FIRST').sum()
    rows.append(dict(id=k,opportunity=name,mentions=len(hit),share=round(len(hit)/len(fp)*100),
        first_timer_items=int(first),acted_share=round(exits*100),fixability=fix[k],lever=lever[k],
        sources=hit.source.value_counts().to_dict()))
o=pd.DataFrame(rows)
o['score']=(o.share/ o.share.max()*0.35 + o.first_timer_items/o.first_timer_items.max()*0.25 + o.fixability/5*0.4).round(2)
o=o.sort_values('score',ascending=False)
print(o[['id','mentions','share','first_timer_items','acted_share','fixability','score']].to_string(index=False))
o.to_json('opportunities.json',orient='records',indent=1)
print(len(fp),'first-person items')
