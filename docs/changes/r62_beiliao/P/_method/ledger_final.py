# r62-P 交时书终态：每 ID 一行，逐行追加（登前重读、登后再读）
import csv, io, datetime
L="../../_ledger.csv"
ROWS=[
 ["来源","T012","-645","管子·小称","《管子·小称》来源行","P","","终态：已用（P 件交；见 P/sources_new.csv，引文 Q721 挂 E073）"],
 ["人物","P_QINGFENG","-548","襄公二十五年","庆封","P","Q（若挂之，依 P 之行）","终态：已用（P 件交；见 P/people_new.csv）"],
 ["人物","P_TANGJIANG","-548","襄公二十五年","棠姜（东郭姜）","P","","终态：已用（P 件交；见 P/people_new.csv）"],
 ["人物","P_KANZHI","-481","哀公十四年","阚止（子我）","P","","终态：已用（P 件交；见 P/people_new.csv）"],
 ["地点","L_SALAN","-554","襄公十九年","灑藍","P","","终态：只入地望之单（P/CHANGES §六），未立 places 行"],
 ["地点","L_PUSHUI","-468","哀公二十七年","濮","P","","终态：只入地望之单（P/CHANGES §六），未立 places 行"],
]
for row in ROWS:
    before=list(csv.DictReader(open(L,encoding="utf-8",newline="")))
    prior=[r for r in before if r["拟ID"]==row[1] and r["登记者"]!="Sophia·r62-P"]
    if prior: print("★先于己者：",prior)
    buf=io.StringIO(); csv.writer(buf,lineterminator="\n").writerow(row+["Sophia·r62-P",datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    raw=open(L,encoding="utf-8",newline="").read()
    with open(L,"a",encoding="utf-8",newline="") as f:
        if raw and not raw.endswith("\n"): f.write("\n")
        f.write(buf.getvalue())
    after=list(csv.DictReader(open(L,encoding="utf-8",newline="")))
    print(row[1],"登后行数",len(after))
