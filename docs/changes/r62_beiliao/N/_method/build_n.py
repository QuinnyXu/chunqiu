# -*- coding: utf-8 -*-
"""r62-N 秦之备料（蹇叔、怀嬴）之出件脚本。
来源标记：Sophia 子代理，2026-10-17，HEAD 81d3d53。只写 data/incoming/r62_beiliao/N/，不触 data/csv。
引文一律自 diben/ 切出（起止二标之间，含止标），不手抄。
"""
import csv, os, re, sys

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
ROOT = os.path.abspath(os.path.join(OUT, "..", "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")


def clean(fn):
    t = open(os.path.join(HERE, "diben", fn), encoding="utf-8").read()
    t = re.sub(r"-\{(.*?)\}-", r"\1", t)
    t = re.sub(r"\{\{\*\|[^{}]*\}\}", "", t)
    return t


ZX, ZW, GY = clean("zuo_xigong_raw.txt"), clean("zuo_wengong_raw.txt"), clean("guoyu_juan10_raw.txt")


def cut(t, a, b):
    i = t.index(a)
    j = t.index(b, i) + len(b)
    s = t[i:j]
    assert "\n" not in s, (a, s)
    return s


def hdr(t):
    with open(os.path.join(CSV, t + ".csv"), encoding="utf-8", newline="") as f:
        return next(csv.reader(f))


def rows(t):
    with open(os.path.join(CSV, t + ".csv"), encoding="utf-8", newline="") as f:
        return {r["id"]: r for r in csv.DictReader(f)}


def write(fn, table, data):
    with open(os.path.join(OUT, fn), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=hdr(table), lineterminator="\n")
        w.writeheader()
        w.writerows(data)


# ---------------- 引文 ----------------
q646 = cut(ZX, "蹇叔之子與師", "秦師遂東。")
q647 = cut(ZX, "晉大子圉為質於秦，將逃歸", "遂逃歸。")
q648 = cut(ZX, "秦伯納女五人，懷嬴與焉。奉匜", "降服而囚。")
q649 = cut(GY, "秦伯見公子曰", "唯命是聽。」")
g_a = cut(GY, "公子欲辭，司空季子曰：「同姓為兄弟。", "同姓為兄弟。")
g_b = cut(GY, "今子於子圉，道路之人也", "不亦可乎？」")
g_c = cut(GY, "乃歸女而納幣", "且逆之。")
q650 = g_a + "……" + g_b + "……" + g_c
w_a = cut(ZW, "八月，乙亥，晉襄公卒。", "難必抒矣。」")
w_b = cut(ZW, "賈季曰：「不如立公子樂。", "且為二嬖，淫也。")
q651 = w_a + w_b + "……」"
q652 = cut(ZW, "使先蔑、士會，如秦，逆公子雍。", "趙孟使殺諸郫。")

# ---------------- events ----------------
events = [
    dict(id="E352", year_bce="-638", lu_reign="鲁僖公二十二年", season_month="",
         title="晋大子圉自秦逃归，嬴氏不从亦不言",
         summary="《左传·僖公二十二年》：晋大子圉为质于秦，将逃归，问嬴氏「與子歸乎」；嬴氏对以「寡君之使婢子侍執巾櫛，以固子也。從子而歸，棄君命也。不敢從，亦不敢言」，圉遂逃归（`Q647`）。嬴氏即怀嬴，杜注「嬴氏，秦所妻子圉，懷嬴也」（杜注之说）。次年惠公卒、圉立为怀公，见 `E085`（`E085` 系年前637，其摘要追书本年逃归一节，引文 `Q083` 亦挂彼）。落点从阙：传只书「為質於秦」，不书其所居之地（照裁二百三十五 四1，不以秦都代填）。",
         place_id="", source_ids="Z046", reliability="high", category="出奔", importance="3", sort_key="30"),
    dict(id="E353", year_bce="-621", lu_reign="鲁文公六年", season_month="八月乙亥",
         title="晋襄公卒，赵孟、贾季议立长君：逆公子雍于秦，杀公子乐于郫",
         summary="《左传·文公六年》：八月乙亥，晋襄公卒；灵公少，晋人以难故欲立长君。赵孟（赵盾）主立公子雍，贾季（狐射姑）主立公子乐，以「辰嬴嬖於二君」为言；赵孟以「辰嬴賤，班在九人」「且為二嬖，淫也」驳之（赵孟之言，文本立场）（`Q651`）。遂使先蔑、士会如秦逆公子雍；贾季亦使召公子乐于陈，赵孟使杀诸郫（`Q652`）。辰嬴即怀嬴，杜注「辰嬴，懷嬴也。二君，懷公、文公也」（杜注之说）。公子雍之归与灵公之立见次年（文公七年，`Q531` 挂 `E305`）。落点从阙：议立之所传不书；郫为公子乐见杀之地，非本事之场，本件不立地点行。",
         place_id="", source_ids="Z059", reliability="high", category="内乱", importance="2", sort_key="30"),
]

# ---------------- passages ----------------
P = lambda i, e, s, q, n, t: dict(id=i, event_id=e, source_id=s, quote_original=q, modern_note=n, quote_type=t)
passages = [
    P("Q646", "E117", "Z051", q646, "《左传·僖公三十二年》：蹇叔之子在师中，蹇叔哭而送之，言晋人御师必于殽之二陵之间，「余收爾骨焉」；秦师遂东。【附】正义引《世族譜》：「或以為西乞術、白乙丙為蹇叔子……或說必妄記異聞耳」——蹇叔之子名传不书，本库不立其人。", "原文"),
    P("Q647", "E352", "Z046", q647, "《左传·僖公二十二年》：晋大子圉质秦将逃归，问嬴氏同归否；嬴氏对以受秦君之命侍之，从之则弃君命，故不从亦不泄，圉遂逃归。杜注：「嬴氏，秦所妻子圉，懷嬴也。」（`Q083` 同出此节而节略，挂 `E085`。）", "原文"),
    P("Q648", "E092", "Z047", q648, "《左传·僖公二十三年》：秦伯纳女五人于重耳，怀嬴与焉；怀嬴奉匜沃盥，重耳既而挥之，嬴怒言秦晋匹敌、何以卑我，公子惧，降服而囚。杜注：「懷嬴，子圉妻。子圉諡懷公，故號為懷嬴。」（同事《国语》之文见 `Q092`。）", "原文"),
    P("Q649", "E092", "G007", q649, "《国语·晋语四》：秦伯见公子，言此女为其「適」（韦注：「適，適妃子」），因子圉质秦时备嫔嫱、恐蒙恶名，故不以婚姻正礼致之而令与于五人；公子之辱是寡人之罪，唯命是听。", "原文"),
    P("Q650", "E092", "G007", q650, "《国语·晋语四》：公子欲辞，司空季子（胥臣）以同姓异姓之论劝之，谓公子于子圉「道路之人」；（中略子犯、子余之劝）乃归女而纳币，且逆之。正义引孔晁：「歸懷嬴，更以貴妾禮迎之也」（孔晁之说）。", "原文"),
    P("Q651", "E353", "Z059", q651, "《左传·文公六年》：晋襄公卒，晋人欲立长君；赵孟主公子雍，贾季主公子乐，以辰嬴「嬖於二君」为言，赵孟驳以辰嬴「賤，班在九人」「為二嬖，淫也」（赵孟之言，文本立场）。杜注：「辰嬴，懷嬴也。二君，懷公、文公也。」「樂，文公子。」", "言论"),
    P("Q652", "E353", "Z059", q652, "《左传·文公六年》：使先蔑、士会如秦逆公子雍；贾季亦使召公子乐于陈，赵孟使杀之于郫。", "原文"),
]

# ---------------- people ----------------
people = [dict(
    id="P_HUAIYING", name="怀嬴",
    alt_names="嬴氏（《左传·僖公二十二年》，杜注「嬴氏，秦所妻子圉，懷嬴也」）;辰嬴（《左传·文公六年》，杜注「辰嬴，懷嬴也」，注家之说·medium）",
    xing="嬴", shi="", ming="", zi="", state="秦/晋",
    role="秦女；晋太子圉质秦时之妻，后归晋公子重耳",
    active_years_bce="前638-前621",
    relations="父秦穆公（《国语·晋语四》秦伯称「寡人之適」，韦注「適，適妃子」；medium）；先妻晋太子圉（晋怀公）；后归晋公子重耳（晋文公）；子公子乐（《左传·文公六年》杜注「樂，文公子」，辰嬴即怀嬴系杜注之说）",
    notes="【名】杜注僖公二十三年「懷嬴，子圉妻。子圉諡懷公，故號為懷嬴」；《左传·文公六年》称「辰嬴」，杜注以为即怀嬴（注家之说，medium）。【所见】僖公二十二年不从子圉逃归亦不言（E352）；僖公二十三年秦伯纳女五人而与焉、奉匜沃盥（E092）；文公六年贾季、赵孟议立公子乐而及其母（E353，只被言及）。【辨】与僖公二十四年「晉侯逆夫人嬴氏」、僖公三十三年「文嬴請三帥」之文嬴非一人：杜注文嬴「秦穆公女」「晉文公始適秦，秦穆公所妻夫人，襄公嫡母」，而辰嬴赵孟谓「班在九人」。【父】《左传》只书「秦伯納女五人」，不书其为穆公之女；《国语·晋语四》秦伯称「寡人之適，此為才」，韦注「適，適妃子」，据此系穆公女（medium）；《史记·晋世家》则作「繆公以宗女五人妻重耳，故子圉妻與往」（后出层，以为宗女），二说并陈。【后世】《列女传·节义》有「晉圉懷嬴」之传（据 r62-A 秦表；本件未取原文核对）。",
    is_protagonist="0", birth_year_bce="", death_year_bce="",
    short_bio="秦女，前638（《左传·僖公二十二年》）晋太子圉自秦逃归，不从亦不泄其谋；前637（僖公二十三年）秦伯纳女五人于重耳而与焉，奉匜沃盥。")]

# ---------------- event_people ----------------
EP = lambda e, p, r, d, pr: dict(event_id=e, person_id=p, role_in_event=r, directness=d, presence=pr)
event_people = [
    EP("E352", "P_HUAIYING", "子圉之妻，不从逃归亦不言。对子圉之问「不敢從，亦不敢言」：对面之言（甲②），落点从阙依（乙）第二支，亲至", "direct", "亲至"),
    EP("E352", "P_JINHUAI", "质秦之晋大子，弃嬴氏而逃归。「謂嬴氏曰」而嬴氏「對曰」：对面之言（甲②），落点从阙，亲至", "direct", "亲至"),
    EP("E352", "P_QINMU", "嬴氏所称遣其侍子圉之「寡君」。只被言及，在场无文，相关", "indirect", "相关"),
    EP("E092", "P_HUAIYING", "与于五女之秦女，奉匜沃盥而怒。「奉匜沃盥」身体之动作、「怒曰」对公子之言（甲②）；落点雍以「乃送諸秦」之国名＋受享、见其君当之（裁二百三十五 四1），亲至", "direct", "亲至"),
    EP("E117", "P_JIANSHU", "", "", ""),  # 占位，不出（既有行，不改）
    EP("E118", "P_JIANSHU", "先轸所称「秦違蹇叔」之谋臣。只被言及，殽之役在场无文，相关", "indirect", "相关"),
    EP("E119", "P_JIANSHU", "秦伯郊次自罪「孤違蹇叔」所称之人。只被言及，在场无文，相关", "indirect", "相关"),
    EP("E353", "P_HUAIYING", "辰嬴，贾季议立之公子乐之母。只被言及（「辰嬴嬖於二君」「辰嬴賤，班在九人」），在场无文，相关；辰嬴即怀嬴依杜注文公六年「辰嬴，懷嬴也」，medium（裁二百四十一 三5 准）", "indirect", "相关"),
    EP("E353", "P_JINXIANGGONG", "其卒而议立长君之晋君。本目之本事是议立长君，襄公之卒是其前提；本事之前提之卒不入型22（裁二百四十一 三3，同 E073、E145 之理），相关", "direct", "相关"),
    EP("E353", "P_ZHAODUN", "赵孟，主立公子雍、驳贾季。落点从阙，依（乙）第二支：传书二人往复之辞，赵孟驳贾季「辰嬴賤……」，互为对者，对面之言（甲②），亲至（裁二百四十一 三2）；「使殺諸郫」系使令，不以之立", "direct", "亲至"),
    EP("E353", "P_HUSHEGU", "贾季，主立公子乐、与赵孟往复。落点从阙，依（乙）第二支：「賈季曰：不如立公子樂」与赵孟之辞往复，互为对者，对面之言（甲②），亲至（裁二百四十一 三2）；「使召」系使令，不以之立", "direct", "亲至"),
    EP("E353", "P_SHIHUI", "受使如秦逆公子雍。「使先蔑、士會如秦」：受使，其行在本事之场外，相关", "direct", "相关"),
]
event_people = [r for r in event_people if r["role_in_event"]]

# ---------------- relations ----------------
R = lambda i, a, b, t, l, rel, n: dict(id=i, person_a=a, person_b=b, rel_type=t, rel_label=l, reliability=rel, source_note=n)
relations = [
    R("R387", "P_HUAIYING", "P_JINHUAI", "婚姻", "妻（质秦时所配）", "high", "《左传·僖公二十二年》嬴氏对子圉「寡君之使婢子侍執巾櫛，以固子也」（E352）；杜注「嬴氏，秦所妻子圉，懷嬴也」"),
    R("R388", "P_HUAIYING", "P_JINWEN", "婚姻", "妻（秦伯纳女五人而与焉）", "high", "《左传·僖公二十三年》「秦伯納女五人，懷嬴與焉」（E092）；《国语·晋语四》「乃歸女而納幣，且逆之」"),
    R("R389", "P_QINMU", "P_HUAIYING", "亲属-直系", "父", "medium", "《国语·晋语四》秦伯见公子曰「寡人之適，此為才」，韦注「適，適妃子」；《左传》只书「秦伯納女五人」不书其为穆公女，故 medium；又《史记·晋世家》作「繆公以宗女五人妻重耳，故子圉妻與往」，以为宗女，与国语异，并陈"),
]

# ---------------- fixes（只许纯追加） ----------------
ppl, src = rows("people"), rows("sources")
fp = []
r = dict(ppl["P_JIANSHU"]); assert "其子与师而死焉" in r["notes"]; r["notes"] = r["notes"].replace("其子与师而死焉", "其子与师而死焉（推：传只书蹇叔哭送其子、言「必死是間，余收爾骨焉」，不书其子之死；r62-N 就地书「推」，裁二百四十一 三）"); r["notes"] += "〔r62-N 追加·2026-10-17〕僖公三十三年殽之役，先轸称「秦違蹇叔」（E118）、秦伯郊次自罪「孤違蹇叔」（E119），俱挂相关；僖公三十二年蹇叔之子与师、哭送之言见 `Q646`。"; fp.append(r)
r = dict(ppl["P_JINWEN"]); r["relations"] += "〔r62-N 追加：怀嬴今立 P_HUAIYING，见 R388〕"; fp.append(r)
r = dict(ppl["P_JINHUAI"]); r["relations"] += "〔r62-N 追加：怀嬴今立 P_HUAIYING，见 R387；僖公二十二年逃归见 E352〕"; fp.append(r)
fs = []
evs, pas = rows("events"), rows("passages")
fe = []
r = dict(evs["E085"]); r["summary"] += "〔r62-N 就地加注·2026-10-17（裁二百四十一 三1）：前638 逃归之事另立见 `E352`（引文 `Q647`）。〕"; fe.append(r)
r = dict(evs["E092"]); assert "秦宗女" in r["summary"]; r["summary"] += "〔r62-N 就地加注·2026-10-17（裁二百四十一 三）：上文「秦宗女」之「宗女」出《史记·晋世家》「繆公以宗女五人妻重耳，故子圉妻與往」（`S004`，后出层）；《左传·僖公二十三年》只书「秦伯納女五人，懷嬴與焉」（`Q648`），《国语·晋语四》秦伯称「寡人之適，此為才」（`Q649`，韦注「適，適妃子」），二说异，并陈。〕"; fe.append(r)
fq = []
r = dict(pas["Q127"]); assert "文嬴（怀嬴）" in r["modern_note"]; r["modern_note"] = r["modern_note"].replace("文嬴（怀嬴）", "文嬴") + "〔r62-N 就地勘正·2026-10-17（裁二百四十一 三）：原书「文嬴（怀嬴）」，删「（怀嬴）」——杜注僖公三十三年「文嬴，晉文公始適秦，秦穆公所妻夫人，襄公嫡母」；怀嬴即辰嬴（杜注文公六年），赵孟谓其「班在九人」，与为襄公嫡母之文嬴非一人（见 `P_HUAIYING`）。〕"; fq.append(r)
fep = []
for e in csv.DictReader(open(os.path.join(CSV, "event_people.csv"), encoding="utf-8", newline="")):
    if e["event_id"] == "E114":
        assert e["presence"] == "亲至"
        e = dict(e); e["role_in_event"] += "。r62-N 改相关（裁二百四十一 三）：本目只据《史记·秦本纪》（`S005`，后出层），后出层不立 presence"; e["presence"] = "相关"; fep.append(e)
assert len(fep) == 3
r = dict(src["Z059"]); r["notes"] += "〔r62-N 追加·2026-10-17〕本篇另取八月晋襄公卒、赵孟贾季议立长君一节（`Q651`、`Q652`，挂 `E353`）。"; fs.append(r)

write("events_new.csv", "events", events)
write("passages_new.csv", "passages", passages)
write("people_new.csv", "people", people)
write("event_people_new.csv", "event_people", event_people)
write("relations_new.csv", "relations", relations)
write("fixes_people.csv", "people", fp)
write("fixes_sources.csv", "sources", fs)
write("fixes_events.csv", "events", fe)
write("fixes_passages.csv", "passages", fq)
write("fixes_event_people.csv", "event_people", fep)

ids = [e["id"] for e in events] + [p["id"] for p in passages] + [p["id"] for p in people] + [x["id"] for x in relations]
with open(os.path.join(OUT, "ids_used.txt"), "w", encoding="utf-8", newline="\n") as f:
    f.write("# r62-N 新立之 ID（号段 E352–E361｜Q646–Q665｜R387–R394｜Z161–Z165；Z 未用）\n")
    f.write("\n".join(ids) + "\n")
print("events", len(events), "passages", len(passages), "people", len(people), "ep", len(event_people), "rel", len(relations), "ids", len(ids))
for p in passages:
    print(p["id"], p["quote_original"][:60])
