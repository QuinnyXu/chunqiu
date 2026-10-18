# r62-P 续命：L_SALAN、L_PUSHUI 改「立行而坐标留空」之终态（逐行追加）
import csv, io, datetime
L="../../_ledger.csv"
for row in [["地点","L_SALAN","-554","襄公十九年","灑藍","P","","终态（续命，裁二百四十一 四3）：立 places 行而坐标留空（P/places_new.csv）；E384 落点"],
            ["地点","L_PUSHUI","-468","哀公二十七年","濮","P","","终态（续命，裁二百四十一 四3）：立 places 行而坐标留空（P/places_new.csv）；E389 落点"]]:
    before=list(csv.DictReader(open(L,encoding="utf-8",newline="")))
    if [r for r in before if r["拟ID"]==row[1] and r["登记者"]!="Sophia·r62-P"]: print("★他人先登",row[1])
    buf=io.StringIO(); csv.writer(buf,lineterminator="\n").writerow(row+["Sophia·r62-P",datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    raw=open(L,encoding="utf-8",newline="").read()
    with open(L,"a",encoding="utf-8",newline="") as f:
        if raw and not raw.endswith("\n"): f.write("\n")
        f.write(buf.getvalue())
    print(row[1],"登后行数",len(list(csv.DictReader(open(L,encoding="utf-8",newline="")))))
