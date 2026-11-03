import pandas as pd
from collections import Counter
e=pd.read_csv('exit_items.csv')
rows=[]
for line in open('codes_all.txt'):
    p=line.split(); eid=int(p[0]); actor,action=p[1],p[2]; codes=p[3:]
    flags=[c for c in codes if c in('FIRST','VARIABLE','RESTART','MISSED3','MANUAL','INFLUENCED')]
    reasons=[c for c in codes if c not in flags]
    rows.append(dict(eid=eid,m_actor=actor,m_action=action,m_primary=reasons[0] if reasons else 'NA',
                     m_reasons=';'.join(reasons),m_flags=';'.join(flags)))
m=e.merge(pd.DataFrame(rows),on='eid')
m.to_csv('exit_coded.csv',index=False)
rel=m[m.m_primary!='NA']
print('model-relevant',len(rel),'of',len(m))
fp=rel[rel.m_actor.isin(['self','asker','prestart'])]
print('first-person',len(fp))
print('\nPrimary reason, first-person:'); print(fp.m_primary.value_counts())
allr=Counter(r for s in fp.m_reasons for r in s.split(';'))
print('\nAny-mention reason, first-person:',allr.most_common())
print('\nActions first-person:'); print(fp.m_action.value_counts())
print('\nFIRST flagged:',fp.m_flags.str.contains('FIRST').sum())
print(fp[fp.m_flags.str.contains('FIRST')].m_reasons.value_counts())
print('\nINFLUENCED:',m.m_flags.str.contains('INFLUENCED').sum())
print('\nBy source x primary (first-person, excl AMC_RULE):')
x=fp[fp.m_primary!='AMC_RULE']
print(pd.crosstab(x.m_primary,x.source))
print('\nadvice/commentary reasons:'); print(rel[rel.m_actor.isin(['advice','commentary'])].m_primary.value_counts())
