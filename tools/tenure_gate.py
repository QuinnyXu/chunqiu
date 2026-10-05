# -*- coding: utf-8 -*-
"""任期表（office_tenures）之门：晋之中军将，一时一人，其任期不得相叠。

由 tools/validate.py 调用（本文件无独立入口之义；validate 每跑必调，护栏不得绕过或删除）。
r59-G 立（据 team/round59_prompts.md §三 裁一百三十八 三、§四 裁一百四十、
§十一 裁一百六十、一百六十三）；门之判据取自 Sophia 备料 sim 之 gate() (a)–(d)
（docs/changes/r59_jin_zhizheng_sim.py §8），一字不改其义，仅换名以随新表之栏。

【一】表与栏（九表变十表；名与栏之由）
  表名 office_tenures（两词蛇形，同 event_people 之例）；id 前缀 TEN###（同 BKG／ARC 之取表名缩写三字母例；
  单字母前缀已为 sources 十类所占，T 亦在其内，故取三字母）。
  栏：id, person_id, state, office, start_year_bce, end_year_bce, start_basis, end_basis,
      start_basis_type, end_basis_type, title_text, title_evidence, title_certainty, certainty,
      source_ids, verify_status。
  ★ 一栏一义：certainty 专承起止之定度（high／medium，同 places.certainty 之光板例）；
    title_certainty 专承「职之推之验」（带前缀者承其一面，同 places.coord_certainty 之例，裁一百六十三）；
    title_evidence 书职名之证（將中軍／為政／推）。三栏不得相兼（裁一百四十九、一百五十一）。
  ★ 自备料 data/incoming/r59_jin_zhizheng/zhongjunjiang_ren.csv（16 任）入库之逐栏映射：
      seq → 不存栏，以 id 之号序 TEN001–TEN016 承之（门 (c) 以号序为序）；
      person_id → person_id；name → 不入（可由 person_id 连 people.name 得，重存则有漂移之险）；
      start_bce／end_bce → start_year_bce／end_year_bce（同 people.birth_year_bce 之 *_year_bce 例）；
      start_kind／end_kind → start_basis_type／end_basis_type（九表无 *_kind 之例，而 quote_type／rel_type／place_type／
        source_type 俱以 *_type 命名「某物之类」；其值（明文／推）原样；挂在 start_basis／end_basis 之侧以显其所述）；
      zhi_wen → title_text（title_ 前缀与 title_evidence／title_certainty 同族，承职名之字面；#11 荀罃一格书其「无晋之职名明文」）；
      start_basis／end_basis／title_evidence／title_certainty／certainty → 同名；
      in_library（既有／本件新立）→ 不入（合入时之来历，非任期之性，git 史可考）；
      新增：state（一律「晋」，门之「限晋」之据）、office（一律「中军将」，为政与推之任之职属由 title_evidence 承之，不入此栏）、
        source_ids（取自各任 title_text／start_basis／end_basis 所引《左传》篇与《国语》篇之 sources 行，逐篇机械对位；
        所引而 sources 无其行者——文公五年、宣公元年、宣公六年、成公三年四篇——不入，亦不新造来源行）、
        verify_status（一律「电子本」，据 CHANGES §十 四①：全件据维基文库整理本一本，未双本互校，纸本未核）。

【二】判据
  (a) 挂钩：任期表之人须在库且 state 含「晋」；凡 state 含「晋」且 role 含「中军将」（或「将中军」）者，
      须于任期表有行，且其 title_evidence＝「將中軍」；title_evidence＝「將中軍」者 role 须含「中军将」，
      非「將中軍」者 role 不得含「中军将」；凡人之 role 不得含「系推」；
      title_evidence＝「推」者 role 不得书执政／为政／中军将／继（role 只容可断之物，裁一百四十六③、一百五十、
      一百五十二 三）；「执政」入 role 须 title_evidence＝「為政」，或于 EXEC_OK 登记其「执政」之另一明文
      （将中军 ⟹ 执政 之推未验，裁一百五十二 一）。
  (b) ★ 任二任 [start,end] 不得相叠——相叠者 max(start) < min(end)；只共交接之一年者不为叠
      （年粒度之下同年先后交接不可再分）。
  (c) 以 id 序（TEN### 之号序＝备料 seq 序）为序，后任之 start 不得早于前任之 end。
  (d) 任期表所书之人若有 death_year_bce，其 end 不得晚于卒年。
  (e) 栏值之域：title_evidence 三值；title_certainty 三值，取全文（含括注之域，U+2013 与「全段」前之半角空格，
      一字不差）；certainty 取 high／medium／low；*_basis_type 取「明文／推」；verify_status 取 21 档词表
      （tools/build_kaodui_index.py 之 STATUS_ORDER）；state 含「晋」；office＝「中军将」。
  (f) title_certainty 与 title_evidence 相应（「明文」⟺「將中軍」）；非明文二值各自之域须覆其任之起止，
      域之「有／无『將中軍』之文可撞」须与 ZJJ_TEXT_YEARS 相合；二域相接不相叠而合覆全表（裁一百五十一、一百五十三）。

【三】★ 门须限 state 含「晋」——相撞之全集（Skipper 自行重求，2026-10-05 EDT，HEAD 67a974e，data/csv 九表）
  量法：Python csv.DictReader 逐表逐栏，正则 `将中军|將中軍|中军将|中軍將`，逐行判其国别；
  ★ 数以计数出之，不以截断之输出为全集（conventions v1.51 新款「截其输出者，不得言其全集」）：
    窄谓词 `将中军|將中軍`：`grep -h … data/csv/*.csv | wc -l` ＝ 51 行（event_people 9／events 13／passages 9／
      people 15／sources 5，余四表 0）；
    宽谓词（加「中军将」「中軍將」二形）：67 行（含窄谓词之 51 行）。
  ★ 注：任期表立后，其 16 行自身亦含「將中軍」（title_text 栏），故立表后复跑窄谓词得 67 行＝51＋16；
    此数与上宽谓词之 67（九表内）**数值巧合而意不同**，引时须随书其谓词与所截之日。
  ★ 67 行中，**非晋之相撞者 6 行**（齐、楚俱有；行号为 2026-10-05 HEAD 之 `grep -n` 物理行，会随增删而移，以 id 为准）：
    ┌ 国别 ┬ 表 ┬ 行 id（行号）┬ 栏与所指 ┐
    齐  people.csv        P_GUOSHU（:148）          role「齐卿，艾陵之役将中军」、notes、short_bio——哀十一「齊國書將中軍」（前484）
    齐  events.csv        E247（:218）             summary——艾陵之役，同段「齊國書將中軍」（与吴「中軍從王」同见）
    齐  passages.csv      Q390（:376，event E247） quote_original 与 modern_note——「齊國書將中軍」
    楚  event_people.csv  E098／P_ZIYU（:304）     role_in_event「楚令尹将中军、败绩师宵遁」
    楚  event_people.csv  E200／P_ZIFAN（:481）    role_in_event「楚司马将中军」
    楚／晋混 events.csv   E200（:185）             summary——「司马子反将中军」属楚，所叙之战晋楚两方（晋栾书之「将中军」在
                                                    event_people E200／P_LUANSHU，非本行）
  ★ 其余 61 行俱晋（含 state「晋/狄」之 P_HUSHEGU 二行）：people 16、event_people 14、events 14、passages 11、
    sources 5、relations 1（R101「城濮中军将」，P_JINWEN—P_XIANZHEN）；
    宽谓词分表：people 17／event_people 16／events 16／passages 12／sources 5／relations 1，合 67；非晋 6＋晋 61＝67。
  ★ 其与门之关系：门之挂钩施于 people.role，**P_GUOSHU 之 role 含「将中军」，是不限晋则必误伤之一行**
    （反证 X1 去其限即红）；event_people／events／passages 之楚、齐诸行门不触，其列于此只为全集有据，
    且使后人知「不限晋」之害不止一例。
  ★ 勘误之记（原字不抹）：裁一百四十 曾书「相撞者是楚非齐」，裁一百六十 ① 勘为误（当日 grep 截以 head -4，
    样本非全集）；今全集实况：齐楚俱有，如上。「所举之例错」一语之误在当日所截之样本，不在例。

【四】ZJJ_TEXT_YEARS——晋人「將中軍」之文所在之年（15 元），为 (f) 之地基（裁一百五十八）
  取自 Sophia r59-E6 之全文检索重跑，裁一百六十一 定作 15 元：与上 13 元（任期表各任所引之据之年）相较多前633、前619。
  求法与所覆（可重跑之文，脚本与语料不入仓，其跑不可由仓内复现，故以此文补足；全文见 docs/changes/r59_jin_zhizheng.md §十五、
  docs/changes/r59_jin_zhizheng_sim.py 之 ZJJ_TEXT_YEARS 定义处）：
    底本：维基文库整理本《春秋左氏傳》十二公页、《國語》卷01–卷21，MediaWiki action=raw，取于
      2026-10-05T03:05Z（2026-10-04 23:05 EDT）；电子本一本，未双本互校，纸本未核。
    式：核式 [將将]中[軍军]（入全集者）；广式 中[軍军]（凡含「中軍」者逐条判）；限晋人。
    所覆：左传 隐1–哀27 共 297 年；国语 21 卷。
  ★ 本集之限：只收晋之「將中軍」之文，他国之同文不入——其于所问之事（晋之职名之推：「為政」(晋)⟹「將中軍」(晋)）
    无判别力，既不能作反例，亦不能告晋之职名如何（裁一百五十九）。已求、不入：
    齐——哀十一「齊國書將中軍」（前484，库内 E247／P_GUOSHU）；楚——event_people E098／P_ZIYU、E200／P_ZIFAN
    （及见上【三】）。其所以不入是「限晋」之界，非其例之有无。
  ★ 完备性之量：本清单之完备系于重跑之全文检索（sim 之 ZJJ_TEXT_YEARS_META 记其截日与差；该量具随 sim 留于
    docs/changes/，未移入本门——本门只验 (f) 之域与清单之相合，清单自身之重跑属另件）。

【五】反证（裁一百一十四：反证须同跑，不红即 exit 2）
  selftest() 返回 [(名, 所取史料之形, 违例列表)]；validate 每跑必调，凡违例列表为空者（未红）即 exit 2。
  九形取自 Sophia sim 之 37 条反证（俱自史料之形取，非手造），十三条中其余四条（X1–X4）系本件所加；
  取舍之由见 selftest() 之注。
"""
import re

TABLE = "office_tenures"
ID_RE = re.compile(r"^TEN\d{3}$")
HML = {"high", "medium", "low"}
TE_VALUES = ("將中軍", "為政", "推")
BASIS_TYPES = ("明文", "推")

# title_certainty 三值取全文（裁一百六十三：一字不差，含括注之域；括注内「–」为 U+2013，「全段」前一半角空格；
# 后域作「前559–前509」，裁一百五十三）
TC_D1 = "反例已求·未见（域：前632–前560 全段；该段有「將中軍」之文可撞）"
TC_D2 = "反例无从求·无判别力（域：前559–前509 全段；该段无「將中軍」之文可撞）"
TC_VALUES = ("明文", TC_D1, TC_D2)
TC_RE = re.compile(r"^(反例已求·未见|反例无从求·无判别力)（域：前(\d+)–前(\d+) 全段；该段(有|无)「將中軍」之文可撞）$")

# 晋人「將中軍」之文所在之年（15 元；见【四】）
ZJJ_TEXT_YEARS = [-633, -632, -627, -625, -621, -620, -619, -615, -597, -593, -589, -587, -578, -575, -560]

# 将中军 ⟹ 执政 之推未验（裁一百五十二 一）；title_evidence＝將中軍 而 role 兼书「执政」者须另有「执政」之明文，逐人登记
EXEC_OK = {
    "P_ZHAODUN": "文公六年「宣子於是乎始為國政」",
    "P_XIKE": "宣公十七年「郤獻子為政」",
    "P_LUANSHU": "成公六年或人谓栾武子「子為大政」（晋人之言，非职名）",
}


def _num(tid):
    return int(tid[3:])


def _is_zjj_role(role):
    return "中军将" in role or "将中军" in role


def gate(people_rows, ten_rows, jin_only=True):
    """(a)–(d) 之判；返回违例列表。jin_only=False 仅供反证 X1（去其「限晋」）。"""
    bad = []
    P = {r["id"]: r for r in people_rows}
    jzj = {r["id"] for r in people_rows
           if (("晋" in r["state"]) or not jin_only) and _is_zjj_role(r["role"])}
    te = {r["person_id"]: r["title_evidence"] for r in ten_rows}
    tp = set(te)
    for p in sorted(tp):
        if p not in P or "晋" not in P[p]["state"]:
            bad.append(f"(a) {p} 有任期而不在库或非晋人")
    for p in sorted(jzj - tp):
        bad.append(f"(a) {p} 书中军将而无任期")
    for p in sorted(jzj & tp):
        if te[p] != "將中軍":
            bad.append(f"(a) {p} role 书中军将而其 title_evidence 为「{te[p]}」（无职名明文者不得于 role 书中军将）")
    for p in sorted(tp - jzj):
        if te[p] == "將中軍" and p in P:
            bad.append(f"(a) {p} title_evidence 为將中軍而 role 不书中军将")
    for r in people_rows:
        if "系推" in r["role"]:
            bad.append(f"(a) {r['id']} role 以「系推」别之")
    for p in sorted(tp):
        if te[p] == "推" and p in P and any(w in P[p]["role"] for w in ("执政", "为政", "為政", "中军将", "继")):
            bad.append(f"(a) {p} 其职系推而 role 书「{P[p]['role']}」（role 只容可断之物）")
    for p in sorted(tp):
        if p in P and ("执政" in P[p]["role"] or "为政" in P[p]["role"]) and te[p] != "為政" and p not in EXEC_OK:
            bad.append(f"(a) {p} title_evidence 为「{te[p]}」而 role 书「{P[p]['role']}」（执政无其明文之登记）")
    iv = []
    for r in ten_rows:
        try:
            iv.append((int(r["start_year_bce"]), int(r["end_year_bce"]), r["person_id"], _num(r["id"])))
        except (ValueError, KeyError):
            bad.append(f"(b) {r.get('id')} 起止年非整数或 id 不合 TEN###")
    for s, e, p, _ in iv:
        if s > e:
            bad.append(f"(b) {p} start {s} 晚于 end {e}")
    for i in range(len(iv)):
        for j in range(i + 1, len(iv)):
            a, b = iv[i], iv[j]
            if max(a[0], b[0]) < min(a[1], b[1]):
                bad.append(f"(b) {a[2]} [{a[0]},{a[1]}] 与 {b[2]} [{b[0]},{b[1]}] 相叠")
    sq = sorted(iv, key=lambda x: x[3])
    for x, y in zip(sq, sq[1:]):
        if y[0] < x[1]:
            bad.append(f"(c) TEN{y[3]:03d} start {y[0]} 早于 TEN{x[3]:03d} end {x[1]}")
    for s, e, p, _ in iv:
        d = (P.get(p) or {}).get("death_year_bce", "")
        if d and e > int(d):
            bad.append(f"(d) {p} 任止 {e} 晚于卒年 {d}")
    return bad


def tc_domain(tc):
    m = TC_RE.match(tc)
    if not m:
        return None
    return m.group(1), -int(m.group(2)), -int(m.group(3)), m.group(4)


def columns_check(ten_rows, verify_vocab):
    """(e) 栏值之域与 (f) 之相应与域。"""
    bad = []
    for r in ten_rows:
        i = r["id"]
        if r["state"] == "" or "晋" not in r["state"]:
            bad.append(f"(e) {i} state「{r['state']}」不含「晋」（本表只载晋之中军将）")
        if r["office"] != "中军将":
            bad.append(f"(e) {i} office「{r['office']}」非「中军将」")
        if r["title_evidence"] not in TE_VALUES:
            bad.append(f"(e) {i} title_evidence「{r['title_evidence']}」非三值")
        if r["title_certainty"] not in TC_VALUES:
            bad.append(f"(e) {i} title_certainty「{r['title_certainty']}」非三值全文")
        if r["certainty"] not in HML:
            bad.append(f"(e) {i} certainty「{r['certainty']}」非 high／medium／low")
        for f in ("start_basis_type", "end_basis_type"):
            if r[f] not in BASIS_TYPES:
                bad.append(f"(e) {i} {f}「{r[f]}」非「明文／推」")
        for f in ("start_basis", "end_basis", "title_text"):
            if not r[f].strip():
                bad.append(f"(e) {i} {f} 为空")
        if r["verify_status"] not in verify_vocab:
            bad.append(f"(e) {i} verify_status「{r['verify_status']}」不在 21 档词表内")
        # 起止之定度与 start/end_basis_type 相应：两端俱明文者 high，有一端系推者 medium（r59-D 原判；#9 栾书止「推（年无疑）」为 high 一例，
        # 故此处只验 high ⟹ 两端俱明文，或为已登记之例外）
        if r["certainty"] == "high" and "推" in (r["start_basis_type"], r["end_basis_type"]) and r["person_id"] != "P_LUANSHU":
            bad.append(f"(e) {i} certainty 书 high 而起止有一端系推（仅 P_LUANSHU 之「推（年无疑）」为登记之例外）")
        # (f) 相应
        tc, te = r["title_certainty"], r["title_evidence"]
        if tc in TC_VALUES and (tc == "明文") != (te == "將中軍"):
            bad.append(f"(f) {i} title_certainty「{tc[:8]}…」与 title_evidence「{te}」不相应（明文⟺將中軍）")
    return bad


def domain_check(ten_rows, text_years):
    """(f) 域之量检（裁一百五十一、一百五十三）：域为闭区间字面读，「有」＝域内至少一条，「无」＝域内无一条；
    二域相接不相叠（前域止 N，后域起 N 之次年）而合覆全表。"""
    bad = []
    doms = {}
    for r in ten_rows:
        tc = r["title_certainty"]
        if tc == "明文":
            continue
        d = tc_domain(tc)
        if d is None:
            bad.append(f"(f) {r['id']} title_certainty 之域不可解析")
            continue
        pre, a, b, yn = d
        if (pre == "反例已求·未见") != (yn == "有"):
            bad.append(f"(f) {r['id']} title_certainty 前缀「{pre}」与「该段{yn}」不相应")
        if not (a <= int(r["start_year_bce"]) and int(r["end_year_bce"]) <= b):
            bad.append(f"(f) {r['id']} [{r['start_year_bce']},{r['end_year_bce']}] 不在其域 [{a},{b}] 之内")
        inside = [y for y in text_years if a <= y <= b]
        if yn == "有" and not inside:
            bad.append(f"(f) {r['id']} 之域 [{a},{b}] 书「有『將中軍』之文可撞」而登记之文年无一落其内")
        if yn == "无" and inside:
            bad.append(f"(f) {r['id']} 之域 [{a},{b}] 书「无『將中軍』之文可撞」而登记之文年 {inside} 落其内")
        doms.setdefault(tc, (a, b))
    if len(doms) == 2:
        (a1, b1), (a2, b2) = sorted(doms.values())
        lo = min(int(r["start_year_bce"]) for r in ten_rows)
        hi = max(int(r["end_year_bce"]) for r in ten_rows)
        if a2 <= b1:
            bad.append(f"(f) 二域相叠（界年不归一）：[{a1},{b1}] 与 [{a2},{b2}]")
        elif a2 != b1 + 1:
            bad.append(f"(f) 二域不相接：[{a1},{b1}] 与 [{a2},{b2}]")
        if a1 != lo or b2 != hi:
            bad.append(f"(f) 二域之合 [{a1},{b2}] 不覆全表 [{lo},{hi}]")
    else:
        bad.append(f"(f) 非明文之域数 {len(doms)} != 2")
    return bad


def check(people_rows, ten_rows, verify_vocab):
    """正测：真数据上跑全部判据；返回违例列表。"""
    return (gate(people_rows, ten_rows) + columns_check(ten_rows, verify_vocab)
            + domain_check(ten_rows, ZJJ_TEXT_YEARS))


def _dup(rows):
    return [dict(r) for r in rows]


def _set(rows, key, val, **kw):
    """取 id 或 person_id 为 key 之行，改其栏。"""
    for r in rows:
        if r.get("id") == key or r.get("person_id") == key:
            r.update(kw)
            return rows
    raise KeyError(key)


def selftest(people_rows, ten_rows, verify_vocab):
    """反证：返回 [(名, 所取史料之形, 违例列表)]。每条须红（违例列表非空），不红即 exit 2（裁一百一十四）。

    ★ 九形（F1–F9）取自 Sophia sim 之 37 条反证中「施于任期表之门与其栏」者；其敌俱自史料之形取，非手造。
      取舍：sim 之 37 条分四类——
        甲 门 (a)–(d)（任期相叠、role 挂钩）：取其中 F1–F8；
        乙 title_evidence 栏之值（三值）：取 F9（另 title_certainty 之值与域见 X2–X4）；
        丙 在场与文辞之锁（E304／E200 之亲至以职推在场、zhi_wen／start_basis／short_bio／relations／E306 之行文）：
           不入——其所锁是 Sophia 备料一次性合入时之行文与 event_people 之判，不是任期表之门所辖；
           且 sim §十二 五 自陈「量具锁判之文字，判错则量具亦错，其绿更显其稳」，不可把行文冻进常设之门；
        丁 sim 自身之量具（还原补丁二条、ZJJ_TEXT_YEARS_META 三条）：不入——还原补丁已准而不用，META 之量随 sim 留于
           docs/changes/，未移入本门。
      F1–F8 同类者择其一：role 复书「执政」一类，sim 有十九、二十、二十一、二十二（门）四条，取二十（先且居）与十九（荀罃）二形，
      余同型，施同一检（EXEC_OK／「推」者 role 不得书执政），不重复取。
    ★ X1–X4 系本件所加，非 Sophia 之九形：X1 去「限晋」、X2–X4 为 title_certainty 之域（sim 二十六、二十八、三十一）。
    """
    out = []
    # ---- 九形 ----
    # F1 赵盾任止推后至前597，与郤缺 [-601,-597] 相叠。史料之形：赵盾去职传无明文，止年系据继任者郤缺宣公八年（前601）「為政」推定；
    #    若误取更晚之年（郤缺之任尚在前597 止于荀林父將中軍之前），二人之任即叠。
    t = _set(_dup(ten_rows), "P_ZHAODUN", None, end_year_bce="-597")
    out.append(("F1 赵盾止推后至前597（与郤缺相叠）", "宣公八年「郤缺為政」＋赵盾去职无明文", gate(people_rows, t)))
    # F2 荀罃任止误作前558，与荀偃 [-560,-554] 相叠，且晚于卒年（-560）。史料之形：襄公十三年（前560）「荀罃、士魴卒」同年「荀偃將中軍」。
    t = _set(_dup(ten_rows), "P_XUNYING", None, end_year_bce="-558")
    out.append(("F2 荀罃止误作前558（与荀偃相叠、逾卒年）", "襄公十三年「荀罃、士魴卒」「荀偃將中軍」", gate(people_rows, t)))
    # F3 先轸任止推后至前626，与先且居 [-627,-622] 相叠。史料之形：僖公三十三年（前627）先轸「免冑入狄師，死焉」，同年「命先且居將中軍」。
    t = _set(_dup(ten_rows), "P_XIANZHEN", None, end_year_bce="-626")
    out.append(("F3 先轸止推后至前626（与先且居相叠）", "僖公三十三年「免冑入狄師，死焉」「命先且居將中軍」", gate(people_rows, t)))
    # F4 先縠 role 误书「晋中军将」而无任期。史料之形：宣公十二年「荀林父將中軍，先縠佐之」——先縠为佐（库内 role「晋中军佐」），误书为将之形。
    p = _set(_dup(people_rows), "P_XIANGU", None, role="晋中军将")
    out.append(("F4 先縠 role 误书中军将而无任期", "宣公十二年「荀林父將中軍，先縠佐之」", gate(p, ten_rows)))
    # F5 赵武 role 书「晋中军将（执政）」而其 title_evidence 只是為政。史料之形：襄公二十五年「趙文子為政」，传无「將中軍」。
    p = _set(_dup(people_rows), "P_ZHAOWU", None, role="晋中军将（执政）")
    out.append(("F5 赵武 role 无职名明文而书中军将", "襄公二十五年「趙文子為政」（传无將中軍）", gate(p, ten_rows)))
    # F6 郤缺 role 复书「晋执政（为政；中军将系推）」。史料之形：宣公八年「郤缺為政」，系推之三字会在渲染摘录中掉落（裁一百三十九 三）。
    p = _set(_dup(people_rows), "P_XIQUE", None, role="晋执政（为政；中军将系推）")
    out.append(("F6 郤缺 role 复书「中军将系推」", "宣公八年「郤缺為政」", gate(p, ten_rows)))
    # F7 荀罃 role 复书「晋执政（继韩厥）」。史料之形：襄公九年楚子囊言「知罃稟焉以為政」——他国之称述，非晋之职名；其职系推（裁一百四十四）。
    p = _set(_dup(people_rows), "P_XUNYING", None, role="晋执政（继韩厥）")
    out.append(("F7 荀罃 role 复书执政（其职系推）", "襄公九年子囊言「知罃稟焉以為政」（他国之称述）", gate(p, ten_rows)))
    # F8 先且居 role 复书「晋中军将（执政）」。史料之形：僖公三十三年、文公二年只书「將中軍」，无為政／執政之文（將中軍 ⟹ 执政 之推未验）。
    p = _set(_dup(people_rows), "P_XIANQIEJU", None, role="晋中军将（执政）")
    out.append(("F8 先且居 role 复书（执政）", "僖公三十三年／文公二年只「將中軍」", gate(p, ten_rows)))
    # F9 title_evidence 填三值之外之「为政系推」。史料之形：襄公二十五年「趙文子為政」，三值不得归并或自造（裁一百三十九 三）。
    t = _set(_dup(ten_rows), "P_ZHAOWU", None, title_evidence="为政系推")
    out.append(("F9 赵武 title_evidence 填三值之外", "襄公二十五年「趙文子為政」", columns_check(t, verify_vocab)))
    # ---- 本件所加 ----
    # X1 去「限晋」：P_GUOSHU（state 齐，role「齐卿，艾陵之役将中军」）必被误伤。史料之形：哀公十一年「齊國書將中軍」。
    out.append(("X1 去 state 限晋（齐国书被误伤）", "哀公十一年「齊國書將中軍」", gate(people_rows, ten_rows, jin_only=False)))
    # X2 后域复作裁一百五十一 原字「前560–前509」（界年二域共之）——旧字面今被门拒。史料之形：襄公十三年（前560）「荀偃將中軍」落前域。
    t = _dup(ten_rows)
    for r in t:
        if r["title_certainty"] == TC_D2:
            r["title_certainty"] = TC_D2.replace("前559–前509", "前560–前509")
    out.append(("X2 后域复作「前560–前509」", "襄公十三年「荀偃將中軍」（前560）", columns_check(t, verify_vocab) + domain_check(t, ZJJ_TEXT_YEARS)))
    # X3 郤缺 title_certainty 去其域（光板「反例已求·未见」）。
    t = _set(_dup(ten_rows), "P_XIQUE", None, title_certainty="反例已求·未见")
    out.append(("X3 title_certainty 去其域", "宣公八年「郤缺為政」", columns_check(t, verify_vocab)))
    # X4 登记之文年注入一条前550 之晋人「將中軍」——「后段无可撞之文」之断须红（证其检能红）。
    out.append(("X4 后段注入一条將中軍之文年（前550）", "（假设：前560 后另有一条晋人將中軍之文）", domain_check(ten_rows, ZJJ_TEXT_YEARS + [-550])))
    return out
