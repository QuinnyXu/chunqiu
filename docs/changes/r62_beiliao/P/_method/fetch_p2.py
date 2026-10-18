# r62-P 补取：襄公廿五年子页；检索《管子·小稱》页名
import urllib.request, urllib.parse, json
def raw(t):
    url="https://zh.wikisource.org/w/index.php?title="+urllib.parse.quote(t)+"&action=raw"
    return urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 research"}),timeout=60).read().decode("utf-8")
s=raw("春秋左氏傳/襄公/廿五年"); open("diben/zuo_xianggong25.txt","w",encoding="utf-8").write(s); print("x25",len(s))
q="https://zh.wikisource.org/w/api.php?action=query&list=prefixsearch&pssearch="+urllib.parse.quote("管子/")+"&pslimit=100&format=json"
j=json.loads(urllib.request.urlopen(urllib.request.Request(q,headers={"User-Agent":"Mozilla/5.0 research"}),timeout=60).read())
for p in j["query"]["prefixsearch"]: print(p["title"])
