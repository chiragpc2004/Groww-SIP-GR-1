import pandas as pd, re, html
df=pd.read_csv('raw_items.csv')
df['text']=df.text.astype(str).map(html.unescape)
SIP=r"\bsips?\b|systematic investment|mutual ?funds?|\bmfs?\b|\bnav\b|\bxirr\b|autopay|auto ?pay|mandate|e-?mandate|instal+ment|\bsip ?date|lump ?sum|index fund|small ?cap|mid ?cap|flexi ?cap|elss|\bredeem|redemption|\bfolio\b|\bamc\b|step[- ]?up|direct plan|regular plan|rupee cost"
# Groww-app reviews that are only about stocks/F&O/IPO/login with no MF mention are dropped by requiring SIP terms
rel=df.text.str.contains(SIP,flags=re.I,regex=True)
# drop obvious stock-trading-only items even if they say 'MF' tangentially? keep; downstream tags handle it
df['relevant_kw']=rel
print(df.groupby('source').relevant_kw.agg(['sum','count']))
out=df[rel].copy()
out['len']=out.text.str.len()
out=out[out.len>=25]
out.to_csv('sip_items.csv',index=False)
print(len(out))
