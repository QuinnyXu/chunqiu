import re,sys,glob
def clean(s):
    s=re.sub(r'\{\{YL\|([^|}]*)\|[^}]*\}\}',r'\1',s)
    s=re.sub(r'\{\{\*\|[^}]*\}\}','',s)
    return s
for f in glob.glob('*.txt'):
    if f.startswith('clean_'): continue
    t=open(f,encoding='utf-8').read()
    open('clean_'+f,'w',encoding='utf-8').write(clean(t))
