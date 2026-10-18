import csv,sys,datetime,io
LED=r"C:\Users\xkxuq\Documents\Starup\Creative Writing\chunqiu\data\incoming\r62_beiliao\_ledger.csv"
row=sys.argv[1:]  # 类别,拟ID,年_前,篇,事,主件,涉件
rows=list(csv.reader(open(LED,encoding='utf-8')))
for r in rows[1:]:
    if len(r)>1 and (r[1]==row[1] or (r[2]==row[2] and r[3]==row[3] and r[4]==row[4])):
        print('PRE-EXISTING',r); sys.exit(1)
ts=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
full=row+['登','Sophia·r62-Q',ts]
buf=io.StringIO(); csv.writer(buf,lineterminator='\n').writerow(full)
raw=open(LED,encoding='utf-8').read()
with open(LED,'a',encoding='utf-8') as f:
    if not raw.endswith('\n'): f.write('\n')
    f.write(buf.getvalue())
rows=list(csv.reader(open(LED,encoding='utf-8')))
mine=[i for i,r in enumerate(rows) if r[1]==row[1]]
print('after:',len(rows),'rows; my id at',mine)
for i,r in enumerate(rows):
    if r[1]==row[1] and i<mine[-1]: print('CONFLICT earlier',r)
