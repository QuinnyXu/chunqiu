# r62-P 登簿：登前重读、一次只追加一行（open(...,'a')）、登后再读核先后。
# 用法：python ledger_add.py 类别 拟ID 年_前 篇 事 主件 涉件 状态
import csv, sys, datetime, io
L="../../_ledger.csv"
row=sys.argv[1:9]
assert len(row)==8
def read():
    return list(csv.DictReader(open(L,encoding="utf-8",newline="")))
before=read()
for r in before:
    if r["拟ID"]==row[1] or (r["年_前"]==row[2] and r["篇"]==row[3] and r["事"]==row[4] and r["类别"]=="事目"):
        print("登前已有：",dict(r)); sys.exit(3)
now=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
buf=io.StringIO(); csv.writer(buf,lineterminator="\n").writerow(row+["Sophia·r62-P",now])
raw=open(L,encoding="utf-8",newline="").read()
with open(L,"a",encoding="utf-8",newline="") as f:
    if raw and not raw.endswith("\n"): f.write("\n")
    f.write(buf.getvalue())
after=read()
mine=[i for i,r in enumerate(after) if r["拟ID"]==row[1] and r["登记者"]=="Sophia·r62-P"]
prior=[i for i,r in enumerate(after) if (r["拟ID"]==row[1]) and r["登记者"]!="Sophia·r62-P" and i<mine[-1]]
print("登后行数",len(after),"己行序",mine,"先于己之同ID",prior)
