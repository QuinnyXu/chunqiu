import urllib.request, urllib.parse, json, sys, time, os, re
UA={"User-Agent":"ChunqiuResearchBot/0.1 (xkxuqian research; low rate)"}
def get(url):
    for k in range(8):
        try:
            return urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=60).read().decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(10*(k+1)); continue
            if e.code==404: return None
            raise
        except (urllib.error.URLError, TimeoutError, ConnectionError, OSError):
            time.sleep(15*(k+1)); continue
    raise RuntimeError("fail "+url)
def api(params):
    return json.loads(get("https://zh.wikisource.org/w/api.php?"+urllib.parse.urlencode(params)))
def listsub(root):
    r=api({"action":"query","list":"allpages","apprefix":root+"/","aplimit":"500","format":"json"})
    return [p["title"] for p in r["query"]["allpages"]]
def raw(title):
    return get("https://zh.wikisource.org/w/index.php?title="+urllib.parse.quote(title)+"&action=raw")
if __name__=="__main__":
    mode=sys.argv[1]
    if mode=="list":
        for root in sys.argv[2:]:
            print(root, listsub(root)); time.sleep(3)
    elif mode=="fetch":
        out=sys.argv[2]; os.makedirs(out,exist_ok=True)
        for t in sys.argv[3:]:
            fn=os.path.join(out,t.replace("/","__")+".txt")
            if os.path.exists(fn): continue
            r=raw(t); 
            if r is None: print("404",t); continue
            open(fn,"w",encoding="utf-8").write(r); print(t,len(r)); time.sleep(2)
