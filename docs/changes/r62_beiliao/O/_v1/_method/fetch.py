import urllib.request, urllib.parse, time, sys
for t in sys.argv[1:]:
    url="https://zh.wikisource.org/w/index.php?title="+urllib.parse.quote(t)+"&action=raw"
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 research"})
    try:
        s=urllib.request.urlopen(req,timeout=60).read().decode("utf-8")
        open(t.replace('/','_')+".txt","w",encoding="utf-8").write(s); print(t,len(s))
    except Exception as e: print(t,'ERR',e)
    time.sleep(1)
