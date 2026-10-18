# -*- coding: utf-8 -*-
# 来源标记：Sophia·r62-O，2026-10-17；登记共用号簿之助手：登前重读、一次只追加一行、登后再读
import csv, sys, datetime, os
LED = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '_ledger.csv')
row = sys.argv[1:]  # 类别,拟ID,年_前,篇,事,主件,涉件,状态
assert len(row) == 8
before = list(csv.reader(open(LED, encoding='utf-8')))
for r in before[1:]:
    if r[1] == row[1] and r[7] != '撤' and not (r[8] == 'Sophia·r62-O' and row[7].startswith('终态')):
        print('已有同 ID 在先：', r); sys.exit(3)
ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
with open(LED, 'a', encoding='utf-8', newline='') as f:
    csv.writer(f, lineterminator=chr(10)).writerow(row[:8] + ['Sophia·r62-O', ts])
after = list(csv.reader(open(LED, encoding='utf-8')))
mine = [i for i, r in enumerate(after) if r[1] == row[1] and r[8] == 'Sophia·r62-O' and r[9] == ts]
earlier = [r for i, r in enumerate(after[1:], 1) if i < mine[0] and r[7] != '撤' and (r[1] == row[1] or (r[2] == row[2] and r[3] == row[3] and r[4] == row[4]))]
print('登后再读：共', len(after) - 1, '行；己行在第', mine[0], '行；在先之同事／同 ID：', earlier or '无')
