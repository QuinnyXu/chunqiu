# -*- coding: utf-8 -*-
# 来源标记：Sophia·r62-Q，2026-10-17；引文比字——每条引文（以「……」分段）须为维基文库底本（剥模板后）之子串。
# 剥法：{{*|…}}（《国语》韦注，可嵌套）去之；{{YL|元年|前NNN年}} 取其首参；-{ 与 }-（维基字词转换标记）去之。
import os, re, sys
H = os.path.dirname(os.path.abspath(__file__)); DB = os.path.join(H, '..', 'diben')
def clean(s):
    out = []; i = 0; depth = 0
    while i < len(s):
        if depth == 0 and s.startswith('{{*|', i): depth = 1; i += 4; continue
        if depth > 0:
            if s.startswith('{{', i): depth += 1; i += 2; continue
            if s.startswith('}}', i): depth -= 1; i += 2; continue
            i += 1; continue
        out.append(s[i]); i += 1
    s = ''.join(out)
    s = re.sub(r'\{\{YL\|([^|}]*)\|[^}]*\}\}', r'\1', s)
    # 底本私用区字 U+F6E3 推为「無」（同页襄公二十七年「棠無咎」三处同符，r62-P 已推；本件 Q782 注书之），唯此一符
    return s.replace('-{', '').replace('}-', '').replace(chr(0xF6E3), '無')
FILES = {}
for f in os.listdir(DB):
    if f.endswith('.txt'): FILES[f] = re.sub(r'\s+', '', clean(open(os.path.join(DB, f), encoding='utf-8').read()))
SRCMAP = {'Z181': '春秋左氏傳__莊公.txt', 'Z034': '春秋左氏傳__閔公.txt', 'Z035': '春秋左氏傳__僖公.txt', 'Z068': '春秋左氏傳__僖公.txt',
          'Z134': '春秋左氏傳__文公.txt', 'Z059': '春秋左氏傳__文公.txt', 'Z182': '春秋左氏傳__文公.txt', 'Z183': '春秋左氏傳__宣公.txt',
          'Z184': '春秋左氏傳__成公.txt', 'Z089': '春秋左氏傳__成公.txt', 'Z090': '春秋左氏傳__襄公.txt', 'Z185': '春秋左氏傳__襄公.txt',
          'Z141': '春秋左氏傳__襄公.txt', 'Z142': '春秋左氏傳__襄公.txt', 'Z081': '春秋左氏傳__襄公.txt', 'Z146': '春秋左氏傳__昭公.txt',
          'Z186': '春秋左氏傳__昭公.txt', 'Z187': '春秋左氏傳__昭公.txt', 'G018': '國語__卷04.txt', 'G013': '國語__卷05.txt',
          'G009': '國語__卷14.txt'}
def check(rows):
    bad = []
    for r in rows:
        f = SRCMAP.get(r['source_id'])
        if f is None: bad.append((r['id'], '无底本之映射', r['source_id'])); continue
        for seg in r['quote_original'].split('……'):
            if re.sub(r'\s+', '', seg) not in FILES[f]: bad.append((r['id'], seg[:30]))
    return bad
PUA = re.compile('[-]')
if __name__ == '__main__':
    import csv
    sys.stdout.reconfigure(encoding='utf-8')
    rows = list(csv.DictReader(open(os.path.join(H, '..', 'passages_new.csv'), encoding='utf-8')))
    print('非底本子串：', check(rows) or '无')
