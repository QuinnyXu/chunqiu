# r62-P 取电子本（维基文库 action=raw）。用法：python fetch_p.py  （于本目录跑，存入 diben/）
import urllib.request, urllib.parse, time, sys
pages = {
 "zuo_xuangong.txt":"春秋左氏傳/宣公",
 "zuo_chenggong.txt":"春秋左氏傳/成公",
 "zuo_xianggong.txt":"春秋左氏傳/襄公",
 "zuo_xianggong25.txt":"春秋左氏傳/襄公/襄公廿五年",
 "zuo_zhaogong.txt":"春秋左氏傳/昭公",
 "zuo_aigong.txt":"春秋左氏傳/哀公",
 "guanzi_xiaocheng.txt":"管子/小稱",
}
for fn,t in pages.items():
    url="https://zh.wikisource.org/w/index.php?title="+urllib.parse.quote(t)+"&action=raw"
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 research"})
    try:
        s=urllib.request.urlopen(req,timeout=60).read().decode("utf-8")
    except Exception as e:
        print(fn,"ERR",e); continue
    open("diben/"+fn,"w",encoding="utf-8").write(s)
    print(fn,len(s)); time.sleep(1)
# 补（2026-10-17）：襄公廿五年为子页「春秋左氏傳/襄公/廿五年」；《管子·小稱》页名「管子/第32篇小稱」——见 fetch_p2.py
