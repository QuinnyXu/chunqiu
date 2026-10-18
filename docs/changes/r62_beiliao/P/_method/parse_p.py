# r62-P 切分底本为段（公、年、经/传、段号、文）。用法：python parse_p.py → zz_p.json
import re, json
start={"宣公":608,"成公":590,"襄公":572,"昭公":541,"哀公":494}
files=[("宣公","diben/zuo_xuangong.txt"),("成公","diben/zuo_chenggong.txt"),("襄公","diben/zuo_xianggong.txt"),("昭公","diben/zuo_zhaogong.txt"),("哀公","diben/zuo_aigong.txt")]
def num(s):
    s=s.replace("元","一").replace("廿","二十")
    d={c:i+1 for i,c in enumerate("一二三四五六七八九")}
    if s=="十": return 10
    if "十" in s:
        a,b=s.split("十"); return (d[a] if a else 1)*10+(d[b] if b else 0)
    return d[s]
def lines_of(g,path):
    t=open(path,encoding="utf-8").read()
    if g=="襄公":
        sub=open("diben/zuo_xianggong25.txt",encoding="utf-8").read()
        t=t.replace("{{:春秋左氏傳/襄公/廿五年}}",sub)
    return t.splitlines()
paras=[]
for g,p in files:
    yr=None;sec=None;k=0
    for line in lines_of(g,p):
        s=line.strip()
        m=re.match(r"^==\s*(\S+?公)(\S+?)年\s*==$",s)
        if m: yr=num(m.group(2)); sec=None; continue
        if re.match(r"^==[^=]",s): yr=None; continue
        m=re.match(r"^===\s*(經|傳)\s*===",s)
        if m: sec=m.group(1); continue
        s=s.strip("　")
        if not s or yr is None: continue
        if s.startswith("{{") and sec=="經":
            s=re.sub(r"\{\{YL\|([^|]*)\|[^}]*\}\}",r"\1",s); s=re.sub(r"[{}+|]","",s)
        if s.startswith(("<","[[","----","{{","|","}}","=","*")) or s.endswith("}}"): continue
        k+=1
        paras.append({"gong":g,"year":yr,"bce":start[g]-yr+1,"sec":sec,"k":k,"text":s})
json.dump(paras,open("zz_p.json","w",encoding="utf-8"),ensure_ascii=False,indent=0)
print(len(paras))
