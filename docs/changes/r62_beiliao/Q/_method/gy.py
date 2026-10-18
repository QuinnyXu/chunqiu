import sys,re
def clean(s):
    # strip {{*|...}} with nesting
    out=[];i=0;depth=0
    while i<len(s):
        if s.startswith('{{*|',i) and depth==0:
            depth=1;i+=4;continue
        if depth>0:
            if s.startswith('{{',i): depth+=1;i+=2;continue
            if s.startswith('}}',i): depth-=1;i+=2;continue
            i+=1;continue
        out.append(s[i]);i+=1
    return ''.join(out)
if __name__=='__main__':
    f,a,b=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
    L=open(f,encoding='utf-8').read().split('\n')
    for i in range(a,b+1):
        if L[i-1].strip(): print(i,clean(L[i-1]))
