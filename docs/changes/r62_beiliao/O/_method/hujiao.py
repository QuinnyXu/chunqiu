# -*- coding: utf-8 -*-
# 来源标记：Sophia·r62-O，2026-10-17；引文比字（维基文库底本子串）与 ctext 互校（去标点逐字比，列异）
import csv, re, os, sys, difflib
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(H, '..')
def clean(s):
    s = re.sub(r'\{\{YL\|([^|}]*)\|[^}]*\}\}', r'\1', s); s = re.sub(r'\{\{\*\|[^}]*\}\}', '', s); return s
WS = {f: clean(open(os.path.join(O, 'diben', 'wikisource', f), encoding='utf-8').read()) for f in os.listdir(os.path.join(O, 'diben', 'wikisource'))}
CT = {f: open(os.path.join(O, 'diben', 'ctext', f), encoding='utf-8').read() for f in os.listdir(os.path.join(O, 'diben', 'ctext'))}
SRCMAP = {'Z166': ('春秋左氏傳_桓公.txt', 'ctext_huan-gong-shi-san-nian.txt'), 'Z009': ('春秋左氏傳_莊公.txt', 'ctext_zhuang-gong-si-nian.txt'),
          'Z032': ('春秋左氏傳_莊公.txt', 'ctext_zhuang-gong-san-shi-nian.txt'), 'Z062': ('春秋左氏傳_宣公.txt', 'ctext_xuan-gong-si-nian.txt'),
          'Z038': ('春秋左氏傳_僖公.txt', 'ctext_xi-gong-wu-nian.txt'), 'Z167': ('春秋左氏傳_僖公.txt', 'ctext_xi-gong-er-shi-nian.txt'),
          'Z047': ('春秋左氏傳_僖公.txt', 'ctext_xi-gong-er-shi-san-nian.txt'), 'Z069': ('春秋左氏傳_僖公.txt', 'ctext_xi-gong-er-shi-qi-nian.txt'),
          'G010': ('國語_卷19.txt', 'ctext_wu-yu.txt')}
WSP = re.compile(r'\s+')
PUN = re.compile(r'[\s，。：；、？！「」『』《》（）\(\)\.．·…—\-,;:!?\'"]')
FOLD = str.maketrans({'鬬':'鬥','鬭':'鬥','於':'于','禦':'御','屍':'尸','爲':'為','谷':'穀','邧':'鄖','䢵':'鄖','衆':'眾','歎':'嘆','齋':'齊','脩':'修','飢':'饑'})
def fold(x): return x.translate(FOLD)
def check(rows):
    bad, diffs = [], []
    for r in rows:
        w, c = SRCMAP[r['source_id']]
        hay = WSP.sub('', WS[w])
        for seg in r['quote_original'].split('……'):
            if WSP.sub('', seg) not in hay: bad.append((r['id'], seg[:30]))
            # ctext 互校：去标点后，以前 6 字定位，比对等长
            s = PUN.sub('', seg); ct = PUN.sub('', CT[c])
            k, off = -1, 0
            for off in (0, 4, 8, 12):
                k = fold(ct).find(fold(s)[off:off + 8])
                if k >= 0: k -= off; break
            if k < 0: diffs.append((r['id'], '定位不得', s[:10])); continue
            if off: diffs.append((r['id'], 'ctext 缺首', s[:off]))
            s = s[off:]; k += off
            t = ct[k:k + len(s)]
            if t != s:
                sm = difflib.SequenceMatcher(None, s, t)
                for op, a1, a2, b1, b2 in sm.get_opcodes():
                    if op != 'equal': diffs.append((r['id'], op, s[max(0,a1-3):a2+3], '→ctext', t[max(0,b1-3):b2+3]))
    return bad, diffs
if __name__ == '__main__':
    rows = list(csv.DictReader(open(os.path.join(O, 'passages_new.csv'), encoding='utf-8')))
    bad, diffs = check(rows)
    print('非底本子串：', bad or '无')
    for d in diffs: print(*d)
