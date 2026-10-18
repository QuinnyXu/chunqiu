# r62-R 登簿：一次只追加一行；登前重读、登后再读（§六十八）
import csv, sys, os, datetime
L = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_ledger.csv")
def rows():
    with open(L, encoding="utf-8", newline="") as f: return list(csv.reader(f))
def reg(cat, pid, yr, pian, shi, zhu="R", she="", st="登"):
    before = rows()
    for r in before[1:]:
        if r[1] == pid and pid and not r[7].startswith("撤") and r[8] != "Sophia·r62-R":
            print("冲突：同 ID 已登于先", r); return False
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(L, "a", encoding="utf-8", newline="") as f:
        csv.writer(f, lineterminator="\n").writerow([cat, pid, yr, pian, shi, zhu, she, st, "Sophia·r62-R", now])
    after = rows()
    mine = len(after) - 1
    for i, r in enumerate(after[1:mine], 1):
        if r[1] == pid and r[8] != "Sophia·r62-R":
            print("登后见先者同 ID：", r, "→ 己行当书撤"); return False
    print("登：", after[mine]); return True
if __name__ == "__main__":
    reg(*sys.argv[1:])
