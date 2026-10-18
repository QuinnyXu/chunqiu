import sys,re
duke,yr=sys.argv[1],sys.argv[2]
L=open(f'diben/春秋左氏傳__{duke}.txt',encoding='utf-8').read().split('\n')
out=False
for i,l in enumerate(L,1):
    if l.startswith('==') and not l.startswith('==='):
        out = (l.strip('=')==f'{duke}{yr}')
    if out and l.strip(): print(i,l)
