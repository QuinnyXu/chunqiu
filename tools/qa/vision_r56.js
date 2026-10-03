/* 经纬春秋 · r58-A 走查门：底图之契之自验是否灵
 * （任务书 `team/round54_prompts.md` §十五 裁一百二十三〔2026-10-03 EDT〕、
 *   §十一 裁一百一十四〔2026-10-02 EDT〕；件之全文见 `## Task for Vision · r58-A`）
 *
 * ★★ 【门头之语】（照裁一百二十三 第四条／件之 §四 改作，原字照录）
 *
 *   **本门证底图之契之自验是否灵，以史上诸本为其敌。**
 *   **不证今日生产之一对是否好——那一问窗一关即无变量，其证在推送之账（裁八十四），不在本门。**
 *
 * ★ 裁八十四之所指（任务书 `:2260` 附近）：「推送后一跑，准入推送件；★ 其果须逐项入账，不得只记『绿』」。
 *
 * ---------------------------------------------------------------------------
 * 【其题之改，当记】本门之前身（r56-A 之议、裁一百二十一 之命）所证者是「**窗内之形**」——
 *   某一日之一对（旧图 × 新脚本）。**窗一关即无变量**：生产所服之 `app.js` 与仓内今本同字，
 *   旧图即今图，二度得一个**恒过之正验**。裁一百二十三 改其所证之物：
 *     **旧**：某日之一对是否好（一个会消失之状）。
 *     **新**：`BASE_MAP_NEEDS` 之**自验是否灵**（一具器），以**史上曾真实存在之诸本底图**为其敌。
 *   **其期不是「与今图相等」，是「当报即报、当默即默，且报则指名所缺之 id」。**
 *   ★ 其利：敌不由我们捏造，由史料供给——真实存在过之 6 枚 id 之本，强于一个手删 `#layer-anchors` 之形。
 *     此即裁一百一十四「绿须自证其能红」之最干净之形。
 *
 * ---------------------------------------------------------------------------
 * ★★★ 【敌之出处，逐式明记】（裁一百二十五②，**2026-10-03 EDT Co站长**）
 *
 *   ★ **其由照录**：「**否则后人见此门有史料在守，而不知其中二式守的是手造之敌。**」
 *   ★★ **并照录裁一百二十五 所勘裁一百二十三 之一语（其另一半）**：
 *       **「史本有变量者，取史本；史本无变量者，手造之敌不是退路，是唯一之器。」**
 *
 *   ★★ **每行之末皆标其量之所在**（裁一百三十 一款：**凡系于库之现状之断言，须就地标出其量之所在**）。
 *
 *   ★ 〔2026-10-03 EDT 勘·r58-C 复核之一〕**此表原有一个四列之表头，r58-C 加「其量之所在」一列时
 *     只添新表头而未去旧表头，遂成「一表两头」**，领队复核实读而得。★ **今去之。**
 *     ★★ **其自身即裁一百三十 所治之形，且是落「裁一百三十」那一件时留下的**——
 *     **所当留者是「语」之史（见下【其史】一段），不是一个被新列替掉的表头。**
 *
 *   | 式（`BASE_MAP_NEEDS` 之目） | 所属视图 | **其敌之出处** | 其所以 | ★ **其量之所在** |
 *   |---|---|---|---|---|
 *   | `#layer-states ellipse[data-state]`           | home            | **史本** `a4f9d40` | 其图全无一个 `data-state` | §三·末 之表（该本该视图之所期非空） |
 *   | `#layer-states-west ellipse[data-state]`      | home            | **史本** `9babe2b`／`a4f9d40` | 西扩之前无此层 | 同上 |
 *   | `#layer-states-southeast ellipse[data-state]` | home            | **史本** `28d824f`／`a23a9bb`／`ba69919`／`9babe2b`／`a4f9d40` | 吴（东南）之前无此层 | 同上 |
 *   | `#layer-labels text[data-state]`              | home            | **史本** `a4f9d40` | 同上·无 `data-state` | 同上 |
 *   | `#layer-anchors`                              | single／dual    | ★ **手造**（§四·甲） | **史上八本恒 1 枚，无一例外——史料不供此敌** | §一 末之 `aSet` 一断（`grep -n "aSet" 本文件`） |
 *   | `#layer-labels g[font-size]`                  | single／dual    | ★ **手造**（§四·乙） | **史上八本恒 2 枚，无一例外——史料不供此敌** | §一 末之 `gSet` 一断（`grep -n "gSet" 本文件`） |
 *   | `viewBox`（载时之 `0 0 1200 700`）            | home／single／dual | ★ **手造**（§四·**戊**） | **史上八本恒 `0 0 1200 700`，无一例外——史料不供此敌** | §一 末之 `vbSet` 一断（`grep -n "vbSet" 本文件`） |
 *
 *   ★ 八本之数系**本门落笔时实测**（`#layer-anchors` 恒 1、`<g … font-size>` 恒 2、`viewBox` 恒 `0 0 1200 700`），
 *     与 Co站长自核之数相符（裁一百二十五／一百二十九 原文）。其八本之 rev 与 sha256 逐行见本门 §一 之输出。
 *   ★★ **其三断俱非 `note` 而是判**：若某日其数不齐，**不作绿、不作红，作 `exit 2`**，并照录其文与其实之差
 *     ——**机器不替人改那句话**（裁一百三十 三款）。
 *
 *   ★ **【其史】`viewBox` 一目之敌，何以后立**（★ 照裁一百三十 二款：**此段系「其史」，其真假不随库变**，故不系量）：
 *     r58-A 本节初立之日，裁一百二十五①／件之第九节**只命 `single`／`dual` 二式**，本门遂**不自立第三形**，
 *     只在此明记「**此目之能红今未证**」，**不假称其防**。
 *     ★ 站长录本门一语为据：「**其既已明记『今无敌』，那一句本身就是一张待办之票**」——
 *     **裁一百二十九（2026-10-03 EDT）准补，且其由不是「宜」，是「必须」**，其由二：
 *       ① 照裁一百一十四 三款——**红之路未证之判据不是判据**；契之六式已五式证其能红，独此一目未证。
 *       ② ★★ **`viewBox` 之害与余式异质**：若无此自验，**图照出而每一个点都落错位置——图在，而图是错的**，
 *          静默而不响。★ **而今日正由这一个判据独挡，其「是否真挡得住」恰是今日唯一未证之事。**
 *          （★ **今日之行为二者同路**——`viewBox` 不合亦入同一个 `missing`、亦报 breach、图亦不出；
 *            详其逐行之辨见 §四·戊 之注。）
 *     ★ 其形今已立于 §四·戊，故上表该行已自「**今无敌**」改书「**手造**」——
 *     **否则补了形而留了旧话，又是一个该改而未改之门头**（裁一百三十；本门之「其界」一段遂退为此「其史」）。
 *
 * ★★★ 【登记：此表何时须改】（裁一百二十五③；★ 并照裁一百三十 升为常条之治）
 *   **日后若有一轮真改了 `#layer-anchors`、`#layer-labels` 之形或 `viewBox` 之值，其本即成史料之敌**——
 *   **上表该行须自「手造」改书「史本 `<其 rev>`」，§四·甲／乙／戊 之相应一形亦当随之降为冗**。
 *   ★ **其改之触发即裁九十九④ 之约**（同文二处：`site/app.js` 头【一约】一、与 `base_map.svg` 头）：
 *     「**凡动 `base_map.svg` 之结构者，同件须复读本清册**——改其 id、改其嵌套、去其 `data-state`、
 *       移其 `transform`、换其 `viewBox`，皆在此列。」
 *   ★ 即：**凡那一约被触发之件，同件须复读本门此表**；本门之 §一 跑时自取全史，其数会自己变，
 *     **而「其敌出于史本抑出于手造」这一句，机器不会替人改——故登记于此，以人之手改之。**
 *
 * ---------------------------------------------------------------------------
 * 【本门所答之问，与各问之求法·所期·读法】
 *
 * §一 **全史本之取，不挑样**（裁一百二十三 加款㈠；挑样即把名单请回来，裁九十九①，
 *      且挑者必按今日之见挑，而今日之见正是受审之物）。
 *      求法：`git log --format=%h -- site/assets/map/base_map.svg`，**其所列者尽取**。
 *      ★ **本门不写死其数**：其数随库而得，并与「史本一枚不少」之断同报。
 *      取法一律 `git show <rev>:site/assets/map/base_map.svg` **只读取出**——不切分支、不写 git index。
 *
 * §二 **二法求同**（裁一百二十三 加款㈡；★ 本门之命所系）
 *      ★★ 若「所期」与「所验」同出 `BASE_MAP_NEEDS` 之一法，则**同错同绿**——此门遂自证其己，成一循环。
 *      故逐本逐视图，所缺者以**二法各算一过**：
 *        ·**甲法（文本正则）**：不经 DOM、**不读 `BASE_MAP_NEEDS`**，只在 SVG 之**原文**上
 *          以本门**手抄之一份契**（见下 `CONTRACT`）逐式求之：`#X` 问其 `id="X"` 在否；
 *          `#X tag[attr]` 则以**标签深度扫描**取 `#X` 之**内容**（不含其自身之属），
 *          在其内求 `<tag ... attr=`。
 *        ·**乙法（DOM 查询）**：于页内**另取一过所服之 SVG 原文**，以 `DOMParser` 解之，
 *          再以**同一份手抄之契**行 `querySelector`。
 *      **二法所得须逐项相等**；★ **不相等者，不问谁对——其跑作废（exit 2），待人读之。**
 *      ★ 乙法所用之选择器亦出本门之手抄，**不自 `app.js` 读取**——故「门之量具」自成一物。
 *      ★ 并另立一量为**账兼哨**：**所挂之活图**（宿主内之 `<svg>`，即自验当时所查之物）之所缺，
 *        与乙法逐式相等否（**只比选择器，不比 `viewBox`——其由见【门内自撞·一】**）。
 *
 * ★★ 【门内自撞·一，当记；原量法照录不删】乙法初稿作「**取宿主内之活图行 `querySelector`**」，
 *   于**人物地图／并观地图**二视图 **8 本全数**撞出「二法不等」（exit 2，24 格之 16 格作废）：
 *   乙法所得多出一目 `viewBox@686.1899… 83.5388… 402.9142… 235.0333…`。
 *   ★ **红的是量具，不是被量之物**：此二视图有**缩放**，其码于载后**改写活图之 `viewBox`**，
 *   而 `mountBaseMap()` 所查者是**载时**之值（`0 0 1200 700`）。**我量到的是后来的那个数。**
 *   故乙法改取「**另取一过所服之原文，以 `DOMParser` 解之**」——其所解者正是自验当时所对之物；
 *   **不改断言之期以凑绿**（与 r55【门内自撞·一】同族：错在量具，改量具）。
 *   ★ 活图之所缺仍留一量作账兼哨（**只比选择器**），并将活图之 `viewBox` 实值照录入账——
 *   **「其值被改写」是一桩实情，不是本门该掩去之事。**
 *
 * ★★ 【门内自撞·二，当记】§四·甲（删 `#layer-anchors`）初跑「告 0 枚——该红而未红」，exit 2。
 *   ★ 其实非「未报」：浏览器之 console 当场有 `[base_map 契] …缺 #layer-anchors…`，
 *   页内亦确有一枚 `P.base-map-breach` 挂在 `#map-canvas` 之下。**错在本门之码**——
 *   §四 之一行写作 `p.reports.map(parseReport)`，而 `p.reports` 之元素系 `{text, visible, role}` 之**对象**，
 *   `parseReport` 所待者是**字串**，遂 `String(对象)` 得 `"[object Object]"`，解之不得而作「无告」。
 *   （§三 之同一处写作 `parseReport(x.text)`，故 §三 未撞。）★ **一个「0 枚」与一个「解不开」，
 *   在我初稿之输出里一模一样——裁一百一十四 四款正身，而这一回犯在门自己身上。**
 *   今改作 `parseReport(x.text)`，并令 `parseReport` 遇解不开者**另记其形**，不复静默作「无」。
 *
 * §三 **当报即报、当默即默、报则指名**（本门之判，exit 1 之所在）
 *      以 §二 二法求同之果为**所期**，与 `app.js` 之自验**所实报者**（页内 `.base-map-breach`
 *      之文，其形为「底图未按契载入（<处>）：缺 A、B……——多半是……」）**逐项对位**（承裁二十四）。
 *      ★ **不得以「整批见红」充每条能红**：逐本、逐视图、逐选择器各一条。
 *
 * §四 **反证五形，俱须红；不红即 exit 2**（裁一百一十四②；★ 丁系本门自加，其据是三款）
 *      ★ **其号之史，当记**（为后人核其所指）：r58-A 初立时二形（甲＝删 anchors、乙＝错 hash）；
 *        r58-A 续节（裁一百二十五①）补「令 `g[font-size]` 为 0」入乙，**错 hash 移丙、聋之自验移丁**；
 *        r58-C（裁一百二十九①）补「换其 `viewBox`」，★ **列为戊而不插入丙之位——旧号自此不再移。**
 *      甲 **删去 `#layer-anchors` 之图**（自今本派生）→ 人物地图／并观地图**须报且指名** `#layer-anchors`。
 *      乙 **令 `#layer-labels g[font-size]` 为 0 之图**（裁一百二十五① 所命之补形，2026-10-03 EDT）
 *        → 人物地图／并观地图**须报且指名** `#layer-labels g[font-size]`。
 *        ★★ **甲乙须分记，不得以一形之红充二式之能红**（领队加问，承裁二十四「逐条对位」）：
 *        故二形各一跑、各一断，且**各断其告只及本式、不及另一式**（去 `font-size` 之形其
 *        `#layer-anchors` 仍 1 枚；删 anchors 之形其 `<g … font-size>` 仍 2 枚——**各只一变量**）。
 *      丙 **错 hash 之形**（**旧作 §四·乙**，补入乙形后移此）→ ★ **其哨须断 `location.hash ＝ 所书之 hash`**。
 *        ★★ **不得以「宿主容器在不在」为哨**：`#home-map`／`#map-canvas`／`#cmp-canvas`
 *        系 SPA 预置之空壳，**在每一页俱 `true`，此哨恒绿、防不住任何事**（领队第二十笔实测）。
 *        本门遂**照录其实、不假称其防**（裁一百一十四 之记②）：乙式一跑并报三宿主之在否，
 *        以**实数**示「那个哨若用，其值恒 `true`」。
 *      丁 ★ **聋之自验**（**领队未命，本门自加**；其据是裁一百一十四 **三款**；**旧作 §四·丙**）——
 *        甲乙丙三形所证者是「自验之器能由默转报」（二式各一形）与「门之哨能辨没走到」；
 *        **而 §三 之判（当报而报）自身能不能红？** 不答此问，§三 即是装饰。
 *        其法：**只在内存内**将所取之 `app.js` 之 `BASE_MAP_NEEDS.home` 空为 `[]`（造一具聋器），
 *        配 id 最少之史本喂之——二法算得 4 式当缺而聋器一字不报，**本门于此输入必判红**。
 *        ★ **`site/app.js` 一字未动**（r58-B 之重戳已回绿，勿令其重跑——r58-C 件之 §五）。
 *      戊 **换其 `viewBox` 为 `0 0 1200 701` 之图**（裁一百二十九① 所命之补形，2026-10-03 EDT）
 *        → **三视图俱须报，且其告须带实得之值**（`site/app.js :64` 自带「（今为「…」）」一语）。
 *        ★ **其形与甲乙同族（手造之图），其序列于末者，为不动甲乙丙丁之旧号。**
 *        ★★ **其所证者当书准**：不是「补一个最小之目」，是「**证那个独挡之判据真能红**」——详 §四·戊 之注。
 *
 * §五 **并报所取之物与其时**（裁一百一十五① 所加之款）
 *      ① 今之 `app.js` **跑时自生产取**（与 r56-A 同法），报其 sha256 与取之时刻；
 *      ② **底图不取生产，取史本**（本件之题已改），逐本报其 rev、日、sha256 与取之时刻。
 *      否则日后看日志，**不知其所验者为何一对**。
 *
 * §六 **`requireBrowser()`**（r57-A 所立，裁一百一十七／一百一十九④）
 *      其实名系驼峰 `requireBrowser`（`require_browser.js` 系文件名之形，非函数名）；
 *      其输出自带 `executablePath`、浏览器实际版本、**`cwd`** 与 **`require.resolve("playwright")` 之实得路径**。
 *
 * ---------------------------------------------------------------------------
 * 【退出码三分】（裁一百一十四 二款、四款）
 *   0 —— 诸断皆绿，且**五反证皆红**（本门今日之绿可恃）。
 *   1 —— 有断为红：自验**当报而默**、**当默而报**、或**报而不指名**。
 *   2 —— **本门自身出错**：反证不红、二法不相等、史本取不着、`requireBrowser()` 取不到浏览器。
 *        ★ 此码之意是「**今日这一跑不作数**」——不作绿、不作红。
 *
 * 【本门不动仓库任何文件】史本一律 `git show` 只读取出；override 皆在内存之静态服务器上。
 *
 * 【本门无重试（照裁五十七，2026-09-26；★ 有意为之，勿补）】
 *   一次网络失败即 **exit 2**，不自行复跑。★ **实测之账**：本门落笔之日（2026-10-03）
 *   曾连两跑撞 `getaddrinfo ENOTFOUND chunqiu.timechorus.com`（同时 `curl` 得 200、`nslookup` 解得四址），
 *   **第三跑即通**——与裁五十七 所记之形同族。**后人见偶发 exit 2，请复跑，勿补重试**：
 *   **加重试之代价是把真的 DNS 故障也熬成绿。**
 *
 * 用法：node tools/qa/vision_r56.js
 *   · 不设 QA_BASE_URL → 自生产站 https://chunqiu.timechorus.com 取 `app.js`
 */
"use strict";
const http = require("http"), https = require("https"), fs = require("fs"), path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");
const MAP_PATH = "site/assets/map/base_map.svg";
const MAP_URL = "/assets/map/base_map.svg";

const PROD = "https://chunqiu.timechorus.com";
const BASE_REMOTE = String(process.env.QA_BASE_URL || PROD).replace(/\/+$/, "");
const NET_MS = 25000;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

/* ---------------- 三路计数：绿／红／本门自身出错 ---------------- */
let checks = 0, fails = 0, gateErrs = 0;
function head(s) { console.log("\n" + s); }
function note(s) { console.log("    " + s); }
function ok(cond, label, detail) {
  checks++; if (!cond) fails++;
  console.log("  " + (cond ? "✓" : "✗") + " " + label + (detail ? "  —— " + detail : ""));
}
/* 反证之记（裁一百一十四 二款）：反证不红者，其跑作废——不作绿、不作红，作「本门自身出错」 */
function selfcheck(cond, label, detail) {
  if (!cond) gateErrs++;
  console.log("  " + (cond ? "✓" : "⚠") + " 〔反证〕" + label + (detail ? "  —— " + detail : "")
    + (cond ? "" : "\n      ←★ **反证不红：其跑作废，作本门自身出错（exit 2，裁一百一十四 二款）**"));
}
/* 二法不同之记（裁一百二十三 加款㈡）：不问谁对，其跑作废 */
function twoways(cond, label, detail) {
  if (!cond) gateErrs++;
  console.log("  " + (cond ? "✓" : "⚠") + " 〔二法〕" + label + (detail ? "  —— " + detail : "")
    + (cond ? "" : "\n      ←★ **二法不相等：不问谁对，其跑作废（exit 2，裁一百二十三 加款㈡）**"));
}
function gatedie(msg) {
  console.log("\n⚠ 本门自身出错：" + msg + "\nexit 2。");
  process.exit(2);
}
const sha256 = (s) => crypto.createHash("sha256").update(Buffer.isBuffer(s) ? s : Buffer.from(s, "utf8")).digest("hex");
const now = () => new Date().toISOString();
const oneLine = (t) => String(t).split(/[\r\n]+/).join(" ");

/* =========================================================================
 * 门之【手抄之一份契】——★ 本门之量具，**不自 `app.js` 读取**
 *   其所以手抄：裁一百二十三 加款㈡「所期须以独立之谓词算，不得调自验之码」。
 *   ★ 其漂之治：§二·丙 另以正则自所取之 `app.js` 原文抽出 `BASE_MAP_NEEDS`，
 *     与本抄**比文**；不同即 exit 2（**此比只作漂之警，不参与所期之算**）。
 * ========================================================================= */
const CONTRACT = {
  home: ["#layer-states ellipse[data-state]", "#layer-states-west ellipse[data-state]",
         "#layer-states-southeast ellipse[data-state]", "#layer-labels text[data-state]"],
  single: ["#layer-anchors", "#layer-labels g[font-size]"],
  dual: ["#layer-anchors", "#layer-labels g[font-size]"],
};
/* 门之手抄之 viewBox 之期（`app.js` 之 `MAP_W = 1200, MAP_H = 700`）——同受 §二·丙 之漂警 */
const VIEWBOX_EXPECT = "0 0 1200 700";
const VIEWS = [
  { key: "home", where: "首页地图", host: "#home-map", hash: "#/" },
  { key: "single", where: "人物地图", host: "#map-canvas", hash: "#/p/P_WENJIANG/map" },
  { key: "dual", where: "并观地图", host: "#cmp-canvas", hash: "#compare=P_WENJIANG,P_QIXIANG" },
];
const HOSTS_ALL = ["#home-map", "#map-canvas", "#cmp-canvas"];

/* =========================================================================
 * 甲法：文本正则 —— 不经 DOM、不读 `BASE_MAP_NEEDS`
 * ========================================================================= */
/* 取 `id="X"` 之元素之**内容**（不含其自身之开标签）。
 *   其法：寻 `id="X"` → 回溯其 `<` 取标签名 → 自其开标签之后起，以同名标签之
 *   开／闭逐一计深（自闭合者不计深），深归零处即其内容之尾。
 *   返回 null 系「无此 id」；返回 "" 系「有此 id 而其内容为空（含自闭合）」。 */
function innerOfId(text, id) {
  const needle = 'id="' + id + '"';
  const idx = text.indexOf(needle);
  if (idx < 0) return null;
  const lt = text.lastIndexOf("<", idx);
  if (lt < 0) return null;
  const mt = /^<([A-Za-z][-\w:.]*)/.exec(text.slice(lt, lt + 64));
  if (!mt) return null;
  const tag = mt[1];
  const gt = text.indexOf(">", idx);
  if (gt < 0) return null;
  if (text[gt - 1] === "/") return "";            // <g id="X"/> 自闭合
  const re = new RegExp("<\\/?" + tag + "(?=[\\s/>])", "g");
  re.lastIndex = gt + 1;
  let depth = 1, mm;
  while ((mm = re.exec(text))) {
    if (text[mm.index + 1] === "/") {
      depth--;
      if (depth === 0) return text.slice(gt + 1, mm.index);
    } else {
      const g2 = text.indexOf(">", mm.index);
      if (g2 < 0) return null;
      if (text[g2 - 1] !== "/") depth++;
    }
  }
  return null;                                    // 不闭合：其形不可解
}
function countId(text, id) {
  const re = new RegExp('id="' + id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + '"', "g");
  return (text.match(re) || []).length;
}
/* 解一式选择器：`#X` 或 `#X tag[attr]` */
function parseSel(sel) {
  let m = /^#([-\w]+)$/.exec(sel);
  if (m) return { id: m[1], tag: null, attr: null };
  m = /^#([-\w]+)\s+([A-Za-z]+)\[([-\w]+)\]$/.exec(sel);
  if (m) return { id: m[1], tag: m[2], attr: m[3] };
  return null;
}
/* 甲法之所缺（其序照契之序，viewBox 之目殿后——与 `mountBaseMap()` 之推序同） */
function missingByText(svgText, sels, label) {
  const out = [];
  for (const sel of sels) {
    const p = parseSel(sel);
    if (!p) gatedie("门之手抄有一式解不开：" + sel);
    const n = countId(svgText, p.id);
    if (n > 1) gatedie(label + "：`id=\"" + p.id + "\"` 在图中出现 " + n + " 次，其形歧义，本门不猜");
    let present;
    if (!p.tag) {
      present = n === 1;
    } else {
      const inner = innerOfId(svgText, p.id);
      if (inner === null) present = false;
      else {
        const re = new RegExp("<" + p.tag + "\\b[^>]*\\b" + p.attr.replace(/-/g, "-") + "\\s*=");
        present = re.test(inner);
      }
    }
    if (!present) out.push(sel);
  }
  const mv = /<svg\b[^>]*\bviewBox\s*=\s*"([^"]*)"/.exec(svgText);
  const vb = mv ? mv[1].trim().replace(/[\s,]+/g, " ") : null;
  if (vb !== VIEWBOX_EXPECT) out.push("viewBox@" + String(vb));
  return out;
}

/* =========================================================================
 * 静态服务器（双 override：史本之图、生产之 app.js）
 * ========================================================================= */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2" };
function srv(root, overrideRef) {
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]);
      if (u === "/") u = "/index.html";
      const ct = MIME[path.extname(u).toLowerCase()] || "application/octet-stream";
      const ov = overrideRef.cur;
      if (ov && Object.prototype.hasOwnProperty.call(ov, u)) {
        rs.writeHead(200, { "Content-Type": ct, "Cache-Control": "no-store" }); rs.end(ov[u]); return;
      }
      const fp = path.join(root, u);
      if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": ct, "Cache-Control": "no-store" }); rs.end(d); });
    });
    s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s));
  });
}

/* ---------------- 自生产取物（不加参、不设缓存头；随 3xx） ---------------- */
function fetchRaw(u, hops) {
  hops = hops == null ? 4 : hops;
  const mod = u.indexOf("https:") === 0 ? https : http;
  return new Promise((resolve, reject) => {
    const rq = mod.get(u, { headers: { "User-Agent": UA, "Accept": "*/*" } }, (res) => {
      const st = res.statusCode;
      if (st >= 300 && st < 400 && res.headers.location && hops > 0) {
        res.resume();
        let next;
        try { next = new URL(res.headers.location, u).toString(); } catch (e) { return reject(e); }
        return fetchRaw(next, hops - 1).then(resolve, reject);
      }
      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => resolve({ url: u, status: st, headers: res.headers, buf: Buffer.concat(chunks) }));
      res.on("error", reject);
    });
    rq.on("error", reject);
    rq.setTimeout(NET_MS, () => rq.destroy(new Error("取物超时 " + NET_MS + "ms：" + u)));
  });
}

/* =========================================================================
 * 一页之量：喂一本图、一个 hash，取 ①哨 ②乙法之所缺 ③自验之所实报
 * ========================================================================= */
async function probe(browser, base, view, intendedHash, writeHash) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
  const pg = await ctx.newPage();
  const perrs = [], cerrs = [], breachLogs = [];
  pg.on("pageerror", e => perrs.push(oneLine(e.message || e)));
  pg.on("console", m => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.indexOf("[base_map 契]") >= 0) { breachLogs.push(oneLine(t)); return; }
    /* CF Analytics beacon 系零依赖之例外清单所许（conventions），其 CORS 之噪不入本门之数 */
    if (/cloudflareinsights|cdn-cgi\/rum/.test(t)) return;
    if (/Failed to load resource/.test(t) && /cloudflareinsights|cdn-cgi\/rum/.test(String((m.location && m.location().url) || ""))) return;
    cerrs.push(oneLine(t));
  });
  await pg.goto(base + writeHash, { waitUntil: "networkidle" });
  await pg.waitForTimeout(900);

  const m = await pg.evaluate(async (arg) => {
    const out = {
      hashNow: location.hash, hostsPresent: {}, svgIn: false,
      parsedMissing: null, parsedVb: null, parseErr: null,
      liveMissing: null, liveVb: null, reports: [],
    };
    arg.hostsAll.forEach(h => { out.hostsPresent[h] = !!document.querySelector(h); });

    /* ---- 乙法：另取一过所服之 SVG 原文，以 `DOMParser` 解之（**载时之形**，未经页内改写） ----
     * ★ 其所以不取活图：此二视图之缩放于载后改写活图之 `viewBox`（见门头【门内自撞·一】）。 */
    try {
      const r = await fetch(arg.mapUrl, { cache: "no-store" });
      const t = await r.text();
      const doc = new DOMParser().parseFromString(t, "image/svg+xml");
      if (doc.querySelector("parsererror")) out.parseErr = "DOMParser 解之不得（parsererror）";
      else {
        const root = doc.documentElement;
        out.parsedMissing = arg.sels.filter(s => !root.querySelector(s));
        out.parsedVb = (root.getAttribute("viewBox") || "").trim().replace(/[\s,]+/g, " ");
      }
    } catch (e) { out.parseErr = String((e && e.message) || e); }

    const host = document.querySelector(arg.host);
    if (host) {
      const svg = host.querySelector("svg");
      out.svgIn = !!svg;
      if (svg) {
        /* 账兼哨：**活图**（自验当时所查之物）之所缺——只比选择器 */
        out.liveMissing = arg.sels.filter(s => !svg.querySelector(s));
        out.liveVb = (svg.getAttribute("viewBox") || "").trim().replace(/[\s,]+/g, " ");
      }
      /* 自验之告系 `box.appendChild(p)`，故为宿主之**直子** */
      out.reports = Array.from(host.children)
        .filter(n => n.classList && n.classList.contains("base-map-breach"))
        .map(n => ({
          text: n.textContent || "",
          visible: !!(n.offsetParent || n.getClientRects().length),
          role: n.getAttribute("role") || "",
        }));
    }
    return out;
  }, { host: view.host, sels: CONTRACT[view.key], hostsAll: HOSTS_ALL, mapUrl: MAP_URL.slice(1) });

  await ctx.close();
  /* 乙法之所缺并入 viewBox 之目，使二法同形可比 */
  let domMissing = null;
  if (m.parsedMissing) {
    domMissing = m.parsedMissing.slice();
    if (m.parsedVb !== VIEWBOX_EXPECT) domMissing.push("viewBox@" + String(m.parsedVb));
  }
  return {
    hashNow: m.hashNow, intended: intendedHash, wrote: writeHash,
    hostsPresent: m.hostsPresent, svgIn: m.svgIn, parseErr: m.parseErr,
    domMissing: domMissing, parsedVb: m.parsedVb,
    liveMissing: m.liveMissing, liveVb: m.liveVb,
    reports: m.reports, perrs, cerrs, breachLogs,
  };
}
/* 自自验之告解其所缺（★ 其形出 `app.js` 之 `mountBaseMap()`：
 *   「底图未按契载入（<处>）：缺 A、B……——多半是……」）
 * ★ 解不开者**另记其形**，不复静默作「无」——见门头【门内自撞·二】。 */
let parseMisses = [];
function parseReport(text) {
  const s = String(text == null ? "" : text).trim();
  const m = /^底图未按契载入（(.+?)）：缺 (.+?)——多半是/.exec(s);
  if (!m) { if (s) parseMisses.push(s.slice(0, 140)); return null; }
  return { where: m[1], items: m[2].split("、").map(s2 => s2.trim()).filter(Boolean) };
}
/* 宿主之告中属本视图者（★ 一律以 `x.text` 入 `parseReport`，不以其对象入——门内自撞·二） */
function myReports(p, where) {
  return p.reports.map(x => parseReport(x.text)).filter(q => q && q.where === where);
}
/* 对位：所期（二法求同者）与所实报者。viewBox 之目以前缀认（自验之文带「（今为「…」）」之饰） */
function sameItems(expect, actual) {
  if (expect.length !== actual.length) return false;
  for (let i = 0; i < expect.length; i++) {
    const e = expect[i], a = actual[i];
    if (e.indexOf("viewBox@") === 0) { if (a.indexOf('viewBox="') !== 0) return false; }
    else if (e !== a) return false;
  }
  return true;
}
const fmt = (a) => a && a.length ? a.join("、") : "〔空〕";

/* ========================================================================= */
(async () => {
  console.log("经纬春秋 · r58-A 走查门：底图之契之自验是否灵（裁一百二十三）");
  console.log("本门证底图之契之自验是否灵，以史上诸本为其敌。");
  console.log("不证今日生产之一对是否好——那一问窗一关即无变量，其证在推送之账（裁八十四），不在本门。");
  console.log("跑之时刻（UTC）：" + now());

  head("§六 浏览器之取（`requireBrowser()`，裁一百一十七／一百一十九④）");
  const { requireBrowser } = require("./require_browser.js");
  const { browser, executablePath, browserVersion } = await requireBrowser();
  note("★ 上二行系 `requireBrowser()` 自报：executablePath、浏览器实际版本、`cwd`、`require.resolve` 实得路径。");
  note("本门另记：门之所在 __dirname=" + __dirname);

  /* ---------------- §五① 生产之 app.js ---------------- */
  head("§五① 今之 `app.js`——跑时自生产取（裁一百一十五①：须记其哈希与取之时刻）");
  const appUrl = BASE_REMOTE + "/app.js";
  const tApp = now();
  let appRes;
  try { appRes = await fetchRaw(appUrl); } catch (e) { gatedie("取生产 `app.js` 不得（" + oneLine(e.message || e) + "）：" + appUrl); }
  if (appRes.status !== 200) gatedie("取生产 `app.js` 得 HTTP " + appRes.status + "：" + appRes.url);
  const appText = appRes.buf.toString("utf8");
  const appSha = sha256(appRes.buf);
  note("其源 = " + appRes.url);
  note("其 sha256 = " + appSha);
  note("取之时刻（UTC）= " + tApp + "；其字节 = " + appRes.buf.length);
  ok(/function mountBaseMap\s*\(/.test(appText) && /const BASE_MAP_NEEDS\s*=/.test(appText),
    "所取之 `app.js` 内确有 `BASE_MAP_NEEDS` 与 `mountBaseMap()`",
    "否则本门所验者非自验之码");

  /* ---------------- §二·丙 漂之警：门之手抄 vs 今之 BASE_MAP_NEEDS ---------------- */
  head("§二·丙 漂之警：门之**手抄之契** vs 所取 `app.js` 内之 `BASE_MAP_NEEDS`");
  note("★ 此比**只作漂之警**，不参与「所期」之算（所期出 §二·甲乙二法）。不同即 exit 2，待人读之。");
  {
    const mNeeds = /const BASE_MAP_NEEDS\s*=\s*\{([\s\S]*?)\n\};/.exec(appText);
    if (!mNeeds) gatedie("自所取之 `app.js` 抽 `BASE_MAP_NEEDS` 之字面不得——本门之量具无从比对");
    const body = mNeeds[1];
    const got = {};
    ["home", "single", "dual"].forEach(k => {
      /* ★ `\]` 须带其后之 `,` 方为数组之尾——否则非贪之 `*?` 会停在 `ellipse[data-state]` 之 `]` 上
       *   （初稿如此，`home` 遂抽得〔空〕而误报漂；此系门内第三次自撞，改量具不改期）。 */
      const re = new RegExp(k + "\\s*:\\s*\\[([\\s\\S]*?)\\]\\s*,");
      const mm = re.exec(body);
      got[k] = mm ? (mm[1].match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1)) : null;
    });
    ["home", "single", "dual"].forEach(k => {
      const a = got[k], b = CONTRACT[k];
      const same = !!a && a.length === b.length && a.every((v, i) => v === b[i]);
      twoways(same, "`BASE_MAP_NEEDS." + k + "` 与门之手抄同文",
        "今之 app.js＝" + fmt(a || []) + "；门之手抄＝" + fmt(b));
    });
    const mw = /const MAP_W\s*=\s*(\d+)\s*,\s*MAP_H\s*=\s*(\d+)/.exec(appText);
    const vbNow = mw ? ("0 0 " + mw[1] + " " + mw[2]) : null;
    twoways(vbNow === VIEWBOX_EXPECT, "`MAP_W`／`MAP_H` 所成之 viewBox 与门之手抄同文",
      "今之 app.js＝" + String(vbNow) + "；门之手抄＝" + VIEWBOX_EXPECT);
  }

  /* ---------------- §一 全史本之取 ---------------- */
  head("§一 全史本之取（裁一百二十三 加款㈠：**不挑样**）");
  let logOut;
  try {
    logOut = execFileSync("git", ["log", "--format=%h|%ad|%s", "--date=short", "--", MAP_PATH],
      { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString("utf8");
  } catch (e) { gatedie("`git log -- " + MAP_PATH + "` 不得（" + oneLine(e.message || e) + "）"); }
  const revs = logOut.split(/\r?\n/).filter(Boolean).map(l => {
    const p = l.split("|");
    return { rev: p[0], date: p[1], subj: p.slice(2).join("|") };
  });
  note("求法：`git log --format=%h|%ad|%s --date=short -- " + MAP_PATH + "`");
  note("★ 本门**不写死其数**：所列者尽取。今所得 **" + revs.length + " 本**。");
  ok(revs.length >= 2, "史本不止一枚（否则本门无变量可言）", "得 " + revs.length + " 本");
  const tMaps = now();
  for (const r of revs) {
    try {
      r.text = execFileSync("git", ["show", r.rev + ":" + MAP_PATH], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString("utf8");
    } catch (e) { gatedie("`git show " + r.rev + ":" + MAP_PATH + "` 取不出（" + oneLine(e.message || e) + "）"); }
    r.sha = sha256(r.text);
    r.ids = Array.from(new Set((r.text.match(/id="[^"]*"/g) || []))).length;
    r.nodes = (r.text.match(/<(ellipse|path|text|circle|polyline|polygon|rect|line)\b/g) || []).length;
    /* 裁一百二十五② 之二数：门头【敌之出处】之表所系者即此二列 */
    r.nAnchors = countId(r.text, "layer-anchors");
    r.nLabelG = (r.text.match(/<g[^>]*\bfont-size\s*=/g) || []).length;
  }
  note("取法：`git show <rev>:" + MAP_PATH + "`（**只读取出**，不切分支、不写 git index）；取之时刻（UTC）= " + tMaps);
  console.log("  " + ["本", "日", "绘图节点", "id 枚数", "#layer-anchors", "<g … font-size>", "sha256（前 12）"].join(" ｜ "));
  revs.forEach(r => console.log("  " + [r.rev, r.date, String(r.nodes), String(r.ids), String(r.nAnchors), String(r.nLabelG), r.sha.slice(0, 12)].join(" ｜ ") + "　" + r.subj));
  const idSet = Array.from(new Set(revs.map(r => r.ids))).sort((a, b) => a - b);
  ok(idSet.length >= 2, "诸本之 id 枚数**不齐**（即 `home` 四式真有史料之变量——裁一百二十三 勘其一之所据）",
    "所见之枚数 = " + idSet.join("／"));

  /* ★★ 门头【敌之出处】之表所系之二数，跑时自核一过（裁一百二十五②③）——
   *   其表书「`single`／`dual` 二式史上无变量，故其敌系手造」。**此句须机器年年复核**：
   *   若某日史料真供了此敌（某本之数与众不同），则**门头之表与 §四 之甲乙二形俱须人手改**
   *   （裁一百二十五③：「其本即成史料之敌」）——故此时不作绿、不作红，作**本门自身出错**（exit 2），
   *   逼人来读。★ **一个该改而未改之门头，比一条红更难发现。** */
  {
    const aSet = Array.from(new Set(revs.map(r => r.nAnchors)));
    const gSet = Array.from(new Set(revs.map(r => r.nLabelG)));
    const flat = aSet.length === 1 && gSet.length === 1;
    twoways(flat, "`single`／`dual` 二式在全 " + revs.length + " 史本**仍无变量**（门头【敌之出处】之表所系者）",
      "`#layer-anchors` 之数 = " + aSet.join("／") + "（表所书：恒 1）；`<g … font-size>` 之数 = " + gSet.join("／") + "（表所书：恒 2）"
      + (flat ? "" : "　→★ **史料今已供此敌：门头【敌之出处】之该二行须改书「史本」，§四·甲乙二形当随之降为冗（裁一百二十五③）；本门不自改，待人读之**"));
    if (flat) note("★ 读法：此二数一齐，即「史料不供此敌」仍成立，故 §四·甲乙之**手造**正当（裁一百二十五 所勘之语：**手造之敌不是退路，是唯一之器**）。");
    /* ★★ `viewBox` 一目同受此理，且**同为一判，不作 `note`**（裁一百二十九①、裁一百三十 一款三款）——
     *   门头上表该行今书「**手造**（§四·戊）」，其所系之量**即此一断**；
     *   其数不齐即「史料今已供此敌」，门头该行与 §四·戊 俱须人手改，故作 exit 2，不作绿不作红。
     *   ★ 旧话之所在与其改，见门头【其史】一段（上轮书「今无敌」「此目之能红今未证」，今已改）。 */
    const vbSet = Array.from(new Set(revs.map(r => {
      const mv = /<svg\b[^>]*\bviewBox\s*=\s*"([^"]*)"/.exec(r.text);
      return mv ? mv[1].trim().replace(/[\s,]+/g, " ") : "〔无〕";
    })));
    const vbFlat = vbSet.length === 1 && vbSet[0] === VIEWBOX_EXPECT;
    twoways(vbFlat, "`viewBox` 一目在全 " + revs.length + " 史本**仍无变量**（门头【敌之出处】该行所系者）",
      "全史本之值 = " + vbSet.join("／") + "（表所书：恒 `" + VIEWBOX_EXPECT + "`）"
      + (vbFlat ? "　→ 故 §四·戊 之**手造**正当（裁一百二十九①）"
        : "　→★ **史料今已供此敌：门头【敌之出处】该行须改书「史本」，§四·戊 当随之降为冗；本门不自改，待人读之**"));
  }

  /* ---------------- §二＋§三 逐本逐视图 ---------------- */
  const overrideRef = { cur: null };
  const server = await srv(SITE, overrideRef);
  const base = "http://127.0.0.1:" + server.address().port + "/";
  note("本地源端 = " + base + "（`/app.js` 覆为生产之本；" + MAP_URL + " 覆为史本）");

  head("§二＋§三 逐本逐视图：二法求同（§二）→ 与自验所实报者逐项对位（§三）");
  note("所期之算：**甲法**＝文本正则（不经 DOM、不读 `BASE_MAP_NEEDS`）；**乙法**＝页内 `querySelector`（选择器出门之手抄）。");
  note("★ 二法不等即 exit 2（不问谁对）；二法既同，乃以其果为所期，与 `.base-map-breach` 之文对位。");

  const matrix = [];
  for (const r of revs) {
    head("  〔本 " + r.rev + "（" + r.date + "，id " + r.ids + " 枚）〕");
    for (const view of VIEWS) {
      const expectText = missingByText(r.text, CONTRACT[view.key], "本 " + r.rev);
      overrideRef.cur = { "/app.js": appText, [MAP_URL]: r.text };
      const p = await probe(browser, base, view, view.hash, view.hash);

      /* 哨：location.hash ＝ 所书之 hash（★ 不以宿主在否为哨——其值恒 true） */
      const sentinel = p.hashNow === view.hash;
      ok(sentinel, view.where + "·哨：`location.hash` ＝ 所书之 hash",
        "所书 " + view.hash + "；今 " + p.hashNow);
      if (!sentinel) { matrix.push({ rev: r.rev, view: view.key, skipped: "哨红" }); continue; }
      ok(p.svgIn, view.where + "·图已注入宿主（" + view.host + " 内有 `<svg>`）", p.svgIn ? "" : "未注入，本格无从量");
      if (!p.svgIn) { matrix.push({ rev: r.rev, view: view.key, skipped: "图未注入" }); continue; }
      if (p.parseErr) { twoways(false, view.where + "·乙法可行", "乙法之 DOMParser 不得：" + p.parseErr); matrix.push({ rev: r.rev, view: view.key, skipped: "乙法不行" }); continue; }

      /* §二 二法求同 */
      const same = expectText.length === p.domMissing.length && expectText.every((v, i) => v === p.domMissing[i]);
      twoways(same, view.where + "·二法所得相等",
        "甲法（文本正则）＝" + fmt(expectText) + "；乙法（DOMParser 查询）＝" + fmt(p.domMissing));
      if (!same) { matrix.push({ rev: r.rev, view: view.key, skipped: "二法不等" }); continue; }
      const expect = expectText;
      /* 账兼哨：活图之所缺（自验当时所查之物）须与乙法同——**只比选择器**（活图之 viewBox 经页内改写） */
      const selOnly = p.domMissing.filter(x => x.indexOf("viewBox@") !== 0);
      const live = p.liveMissing || [];
      const liveSame = !!p.liveMissing && live.length === selOnly.length && live.every((v, i) => v === selOnly[i]);
      twoways(liveSame, view.where + "·活图之所缺与乙法同（只比选择器）",
        "活图＝" + fmt(live) + "；乙法＝" + fmt(selOnly)
        + "；★ 活图之 `viewBox` 实为「" + String(p.liveVb) + "」，所服之原文为「" + String(p.parsedVb) + "」"
        + (p.liveVb === p.parsedVb ? "（二者同）" : "（**经页内缩放改写**，故不入此比——门内自撞·一）"));
      if (!liveSame) { matrix.push({ rev: r.rev, view: view.key, skipped: "活图与乙法不等" }); continue; }

      /* §三 与自验所实报者对位 */
      const rawMine = p.reports.filter(x => { const q = parseReport(x.text); return q && q.where === view.where; });
      const parsed = rawMine.map(x => parseReport(x.text));
      const mine = rawMine;
      if (expect.length === 0) {
        ok(mine.length === 0, view.where + "·**当默而默**（所缺为空，自验不报）",
          mine.length === 0 ? "本视图之告 0 枚" : "却报 " + mine.length + " 枚：" + mine.map(x => oneLine(x.text)).join(" ／ "));
      } else {
        ok(mine.length === 1, view.where + "·**当报而报**（所缺 " + expect.length + " 式，自验出告 1 枚）",
          "本视图之告 " + mine.length + " 枚" + (mine.length ? "；可见 " + mine.filter(x => x.visible).length + " 枚、role=" + (mine[0].role || "〔无〕") : ""));
        if (mine.length === 1) {
          const got = parsed[0].items;
          ok(sameItems(expect, got), view.where + "·**报则指名所缺**（逐项对位，承裁二十四）",
            "所期＝" + fmt(expect) + "；所报＝" + fmt(got));
          /* 逐式一条，不以整批见红充每条能红 */
          expect.forEach(e => {
            const hit = e.indexOf("viewBox@") === 0
              ? got.some(g => g.indexOf('viewBox="') === 0)
              : got.indexOf(e) >= 0;
            ok(hit, view.where + "·所报之内指名 `" + e + "`", hit ? "" : "未见于告：" + fmt(got));
          });
        }
      }
      matrix.push({ rev: r.rev, date: r.date, ids: r.ids, view: view.key, expect: expect, got: parsed.length ? parsed[0].items : [], perrs: p.perrs.length, cerrs: p.cerrs.length });
    }
  }

  head("§三·末 一表总览（逐本逐视图：所期／所报；★ pageerror 之数只入账，不入判）");
  console.log("  " + ["本", "视图", "所期（二法求同）", "所报（自验）", "pageerror"].join(" ｜ "));
  matrix.forEach(c => console.log("  " + [c.rev, c.view, c.skipped ? "〔" + c.skipped + "〕" : fmt(c.expect), c.skipped ? "—" : fmt(c.got), c.skipped ? "—" : String(c.perrs)].join(" ｜ ")));
  note("★ **pageerror 不入判**：旧本之图配今之脚本，其下游本当抛错（裁九十九之所由）——");
  note("  本门所证者是「自验之告当报即报」，不是「旧本能跑」。故其数照录成账，不冒充判据。");

  /* ---------------- §四 反证五形 ---------------- */
  head("§四 反证五形，俱须红；不红即 exit 2（裁一百一十四②）");
  const newest = revs[0];
  note("五形皆自**今本** " + newest.rev + "（" + newest.date + "，sha256 " + newest.sha.slice(0, 12) + "）派生——各只一变量。");
  note("★ 甲乙**戊**三形系三式之**手造之敌**（裁一百二十五①、裁一百二十九①；其所以手造，见门头【敌之出处】）。");
  note("★ **戊之序列于末、不列于乙之后**：为不动甲乙丙丁之旧号（已移一回，不再移——裁一百三十 之意：旧话旧号不轻动）。");

  /* ---- 手造之敌三形（甲乙戊），各管其事（裁一百二十五①／一百二十九①，领队加问：须分记） ----
   * ★ **不得以一形之红充数式之能红**（承裁二十四「逐条对位」）：故三形各一跑、各一断，
   *   且各断其告**只及本目**。 */
  const BAD_VB = "0 0 1200 701";   /* ★ 戊所书之坏值：**最小之差**（一单位）——见其形之注 */
  const MADE = [
    {
      tag: "甲", sel: "#layer-anchors", label: "`#layer-anchors`", silent: ["home"],
      hits: (items) => items.indexOf("#layer-anchors") >= 0,
      pure: (t) => {
        const sg = missingByText(t, CONTRACT.single, "反证甲");
        const hm = missingByText(t, CONTRACT.home, "反证甲");
        if (!(sg.length === 1 && sg[0] === "#layer-anchors")) gatedie("反证甲：甲法算 single 之所缺为「" + fmt(sg) + "」，非恰一目，其形不洁");
        if (hm.length !== 0) gatedie("反证甲：甲法算 home 之所缺为「" + fmt(hm) + "」，当为空，其形不洁");
      },
      title: "删去 `#layer-anchors` 之图",
      make: (t) => {
        const re = /<g\s+id="layer-anchors"[^>]*>[\s\S]*?<\/g>|<g\s+id="layer-anchors"[^>]*\/>/;
        if (!re.test(t)) gatedie("今本之内寻 `#layer-anchors` 之元素不得，反证甲造不出");
        return t.replace(re, "");
      },
      /* 单变量之验：所欲去者归零，而另一式之物一字不动 */
      clean: (t) => {
        const a = countId(t, "layer-anchors");
        const g = (t.match(/<g[^>]*\bfont-size\s*=/g) || []).length;
        if (a !== 0) gatedie("反证甲所造之图内 `#layer-anchors` 仍在（" + a + " 枚），其形不洁");
        if (g !== 2) gatedie("反证甲所造之图内 `<g … font-size>` 之数为 " + g + "（当为 2），非单变量");
        return "`id=\"layer-anchors\"` 之数 = " + a + "（原 1）；`<g … font-size>` 之数 = " + g + "（原 2，**未动**）";
      },
    },
    {
      tag: "乙", sel: "#layer-labels g[font-size]", label: "`#layer-labels g[font-size]`", silent: ["home"],
      hits: (items) => items.indexOf("#layer-labels g[font-size]") >= 0,
      pure: (t) => {
        const sg = missingByText(t, CONTRACT.single, "反证乙");
        const hm = missingByText(t, CONTRACT.home, "反证乙");
        if (!(sg.length === 1 && sg[0] === "#layer-labels g[font-size]")) gatedie("反证乙：甲法算 single 之所缺为「" + fmt(sg) + "」，非恰一目，其形不洁");
        if (hm.length !== 0) gatedie("反证乙：甲法算 home 之所缺为「" + fmt(hm) + "」，当为空，其形不洁");
      },
      title: "令 `#layer-labels g[font-size]` 为 **0** 之图（★ 裁一百二十五① 所命之补形）",
      make: (t) => {
        const n = (t.match(/<g[^>]*\bfont-size\s*=/g) || []).length;
        if (n !== 2) gatedie("今本之 `<g … font-size>` 之数为 " + n + "（当为 2），反证乙造不出");
        /* 只去 `<g>` 之 `font-size` 一属，其组其子一字不动——变量只此一个 */
        return t.replace(/<g([^>]*?)\s+font-size="[^"]*"/g, "<g$1");
      },
      clean: (t) => {
        const g = (t.match(/<g[^>]*\bfont-size\s*=/g) || []).length;
        const a = countId(t, "layer-anchors");
        if (g !== 0) gatedie("反证乙所造之图内 `<g … font-size>` 仍有 " + g + " 枚，其形不洁");
        if (a !== 1) gatedie("反证乙所造之图内 `#layer-anchors` 之数为 " + a + "（当为 1），非单变量");
        return "`<g … font-size>` 之数 = " + g + "（原 2）；`id=\"layer-anchors\"` 之数 = " + a + "（原 1，**未动**）";
      },
    },
    /* ---- 戊：换其 `viewBox` 一式（裁一百二十九①，2026-10-03 EDT 所命之补形） ----
     * ★★ **本形所证者当书准**（照件之「领队之辨」）：**不是「补一个最小之目」，是「证那个独挡之判据真能红」。**
     *   裁一百二十九② 书「余式之失皆响……而 `viewBox` 不合则图照出，只是每一个点都落错位置」——
     *   ★ **领队逐行读 `site/app.js` 之 `mountBaseMap()`（`:61–67`）已辨其实**：
     *     `:61` 诸式缺 → `missing.push(sel)`；★ **`:62–65` `viewBox` 不合 → 亦 `missing.push(…)`**；
     *     `:67` `if (!missing.length) return svg;`。
     *   ★★ **故今日二者同路**——俱入同一个 `missing`、俱报 breach、俱不返回 `svg`、**图俱不出**。
     *   **裁一百二十九② 之语，若读作「今日之行为」则不实；若读作「若无此自验，其害之性质」则属实。**
     *   ★★ **而此辨使其结论更强**：`viewBox` 之害最烈（**图在而图是错的，静默而不响**），
     *   而今日正由**这一个判据独挡**；而「它是否真挡得住」恰是今日唯一未证之事——
     *   **一个未证之判据，守着契中唯一会静默出错的那一目。** 本形即证其能红。
     * ★ **所以改其值而非删其属**（件之 §一）：其期由 `MAP_W`／`MAP_H` 组成、**不写死**，
     *   删其属则所比之物不在，改其值则**判据之「期」仍自码来**。
     * ★ **所以取一单位之差（`0 0 1200 701`）**：若其判据以近似或容差为之，**最小之差即能蒙过**；
     *   一单位之差能红，则大差必红。**取最难之形，不取最易之形。** */
    {
      tag: "戊", sel: "viewBox", label: "`viewBox`（其告须带实得之值）", silent: [],
      hits: (items) => items.some(i => i.indexOf('viewBox="') === 0 && i.indexOf(BAD_VB) >= 0),
      pure: (t) => {
        /* ★ 三视图之所缺须**俱恰为** viewBox 一目（`viewBox` 之断不出 `needs`，三视图同受其治） */
        ["home", "single", "dual"].forEach(k => {
          const m = missingByText(t, CONTRACT[k], "反证戊");
          if (!(m.length === 1 && m[0] === "viewBox@" + BAD_VB)) {
            gatedie("反证戊：甲法算 " + k + " 之所缺为「" + fmt(m) + "」，非恰一目「viewBox@" + BAD_VB + "」，其形不洁");
          }
        });
      },
      title: "换其 `viewBox` 为 `" + BAD_VB + "` 之图（★ 裁一百二十九① 所命之补形；**一单位之差**）",
      make: (t) => {
        const mv = /<svg\b[^>]*\bviewBox\s*=\s*"([^"]*)"/.exec(t);
        if (!mv) gatedie("今本之内寻外层 `<svg>` 之 `viewBox` 不得，反证戊造不出");
        if (mv[1].trim().replace(/[\s,]+/g, " ") !== VIEWBOX_EXPECT) {
          gatedie("今本之 `viewBox` 为「" + mv[1] + "」，非门之手抄之 " + VIEWBOX_EXPECT + "，反证戊之单变量不成");
        }
        return t.replace(mv[0], mv[0].replace(mv[1], BAD_VB));
      },
      clean: (t) => {
        const mv = /<svg\b[^>]*\bviewBox\s*=\s*"([^"]*)"/.exec(t);
        const a = countId(t, "layer-anchors");
        const g = (t.match(/<g[^>]*\bfont-size\s*=/g) || []).length;
        if (!mv || mv[1] !== BAD_VB) gatedie("反证戊所造之图其 `viewBox` 为「" + (mv ? mv[1] : "〔无〕") + "」，非 " + BAD_VB + "，其形不洁");
        if (a !== 1 || g !== 2) gatedie("反证戊所造之图 `#layer-anchors`=" + a + "、`<g … font-size>`=" + g + "（当为 1／2），非单变量");
        return "`viewBox` = `" + mv[1] + "`（原 `" + VIEWBOX_EXPECT + "`，★ 其属**未删，只改其值**）；"
          + "`id=\"layer-anchors\"` 之数 = " + a + "、`<g … font-size>` 之数 = " + g + "（**俱未动**）";
      },
    },
  ];
  /* 一形之量，factored 为一式——★ 甲乙戊**共用此一函数**（承本门自立之则：量具共用，才谈得上对位反证） */
  async function runMadeForm(F) {
    head("  §四·" + F.tag + " " + F.title);
    const madeText = F.make(newest.text);
    note("所造之图 sha256 = " + sha256(madeText) + "；" + F.clean(madeText));
    F.pure(madeText);   /* ★ 其形之洁，更以门之甲法自核一过；不洁即 exit 2，不以不洁之形冒充反证 */
    for (const view of VIEWS) {
      const expectText = missingByText(madeText, CONTRACT[view.key], "反证" + F.tag);
      overrideRef.cur = { "/app.js": appText, [MAP_URL]: madeText };
      const p = await probe(browser, base, view, view.hash, view.hash);
      if (p.hashNow !== view.hash || !p.svgIn || p.parseErr) { selfcheck(false, view.where + "·反证" + F.tag + "可量", "哨／注入／乙法不成：hash=" + p.hashNow + "、svgIn=" + p.svgIn + "、parseErr=" + String(p.parseErr)); continue; }
      const same = expectText.length === p.domMissing.length && expectText.every((v, i) => v === p.domMissing[i]);
      twoways(same, view.where + "·反证" + F.tag + "二法所得相等", "甲法＝" + fmt(expectText) + "；乙法＝" + fmt(p.domMissing));
      if (!same) continue;
      /* ★ 一律以 `x.text` 入 `parseReport`——初稿误以对象入之，解不开而作「无告」（门内自撞·二） */
      const mine = myReports(p, view.where);
      if (F.silent.indexOf(view.key) >= 0) {
        /* 本视图之契不含此目——此一格之**当默**正是「逐目各管其事」之证 */
        ok(mine.length === 0, view.where + "·反证" + F.tag + "·当默（" + F.label + " 不在本视图之契内）",
          mine.length ? "却报：" + fmt(mine[0].items) : "告 0 枚");
      } else {
        const red = mine.length === 1 && F.hits(mine[0].items);
        selfcheck(red, view.where + "·反证" + F.tag + "·**须报且指名 " + F.label + "**",
          mine.length ? "所报＝" + fmt(mine[0].items) : "告 0 枚——**该红而未红**");
        /* ★ 分记之证：此形之告**只**指名本目，不及他目——否则「一形之红」即被当作数式俱能红 */
        if (mine.length === 1) {
          const other = MADE.filter(x => x.tag !== F.tag).map(x => x.label);
          const onlyMine = mine[0].items.length === 1 && F.hits(mine[0].items);
          ok(onlyMine, view.where + "·反证" + F.tag + "·其告**只**及本目，不及 " + other.join("／"),
            "所报＝" + fmt(mine[0].items));
        }
      }
    }
  }
  for (const F of MADE) { if (F.tag !== "戊") await runMadeForm(F); }

  /* 丙：错 hash 之形（★ 旧作 §四·乙；r58-A 续节补入「令 g[font-size] 为 0」一形后移作丙） */
  head("  §四·丙 错 hash 之形（★ 其哨须断 `location.hash ＝ 所书之 hash`；**旧作 §四·乙**）");
  note("所书之坏 hash = `#person=P_NOBODY&view=map`（旧式 hash，`app.js` 之 `legacyToNewHash()` 将其改写为 `#/`），");
  note("而本门所欲量者是 `#/p/P_WENJIANG/map` 之人物地图——**页根本没走到**。");
  {
    const view = VIEWS[1];
    const BAD = "#person=P_NOBODY&view=map";
    overrideRef.cur = { "/app.js": appText, [MAP_URL]: newest.text };
    const p = await probe(browser, base, view, view.hash, BAD);
    const sentinelRed = p.hashNow !== view.hash;
    selfcheck(sentinelRed, "错 hash 之哨**须红**：`location.hash` ≠ 所书之 hash",
      "所欲量者 " + view.hash + "；所书 " + BAD + "；今 " + p.hashNow
      + (sentinelRed ? "　→ 哨红，本格作废不作绿（**正其所当为**）" : "　→ **该红而未红**"));
    note("★ 并照录其实、不假称其防（裁一百一十四 之记②）——此页三宿主之在否：");
    HOSTS_ALL.forEach(h => note("    " + h + " = " + (p.hostsPresent[h] ? "true" : "false")));
    const allTrue = HOSTS_ALL.every(h => p.hostsPresent[h]);
    note("  " + (allTrue ? "★★ 三者俱 `true`——**「宿主容器在不在」这个哨，在此页恒绿、防不住任何事**（领队第二十笔实测之果），故本门不用它。"
      : "★ 今测三者非俱 `true`——与领队第二十笔之实测不符，此事须人读（本门仍不以之为哨）。"));
    note("★ 并照录此页之「四项全绿」之假相：pageerror " + p.perrs.length + "、console.error " + p.cerrs.length
      + "、`.base-map-breach` " + p.reports.length + " 枚、本视图之告 0 枚——");
    note("  **一个根本没走到的页面，其「无错」与一个好页一模一样**（裁一百一十四 开篇之语）。所分者惟上一哨。");
  }

  /* 丙：聋之自验（★ 领队未命，本门自加；其据是裁一百一十四 **三款**） */
  head("  §四·丁 **聋之自验**（★ 本门自加，裁一百一十四 三款：「凡判据须能指出一个使其为红之输入」；**旧作 §四·丙**）");
  note("★ 其由：§四·甲乙丙三形所证者，是**自验之器**能由默转报（二式各一形）、与**门之哨**能辨「没走到」。");
  note("  而 §三 之判（**当报而报**）本身呢？**若自验聋了，本门会不会红？**——此问不答，§三 即是装饰。");
  note("★ 其法：取所取之生产 `app.js`，**只在内存内**将 `BASE_MAP_NEEDS.home` 空为 `[]`（造一具聋器），");
  note("  配 `" + revs[revs.length - 1].rev + "`（id 最少之史本，二法算其所缺 4 式）喂之。★ **`site/app.js` 一字未动。**");
  {
    const deafRe = /(home\s*:\s*\[)[\s\S]*?(\]\s*,)/;
    const nHit = (appText.match(/home\s*:\s*\[/g) || []).length;
    if (nHit !== 1) gatedie("`home: [` 在所取之 `app.js` 内出现 " + nHit + " 次，造聋器之改不洁，本门不猜");
    const deafApp = appText.replace(deafRe, "$1$2");
    const mNeeds2 = /home\s*:\s*\[([\s\S]*?)\]\s*,/.exec(deafApp);
    if (!mNeeds2 || mNeeds2[1].trim() !== "") gatedie("所造之聋器其 `home` 未空，其形不洁");
    const oldest = revs[revs.length - 1];
    const view = VIEWS[0];
    const expectText = missingByText(oldest.text, CONTRACT[view.key], "反证丁");
    overrideRef.cur = { "/app.js": deafApp, [MAP_URL]: oldest.text };
    const p = await probe(browser, base, view, view.hash, view.hash);
    note("所造之聋器 sha256 = " + sha256(deafApp) + "（生产之本 " + appSha.slice(0, 12) + "；只此一处之别）");
    if (p.hashNow !== view.hash || !p.svgIn || p.parseErr) {
      selfcheck(false, "首页地图·反证丁可量", "哨／注入／乙法不成：hash=" + p.hashNow + "、svgIn=" + p.svgIn + "、parseErr=" + String(p.parseErr));
    } else {
      const same = expectText.length === p.domMissing.length && expectText.every((v, i) => v === p.domMissing[i]);
      twoways(same, "首页地图·反证丁二法所得相等", "甲法＝" + fmt(expectText) + "；乙法＝" + fmt(p.domMissing));
      if (same) {
        const mine = myReports(p, view.where);
        /* 所期：二法算得 4 式当缺，而聋器一字不报 → §三 之判**当红** */
        const gateWouldRed = expectText.length > 0 && mine.length === 0;
        selfcheck(gateWouldRed, "聋之自验之下，§三 之判（**当报而报**）**须红**",
          "二法所算之所缺 " + expectText.length + " 式＝" + fmt(expectText)
          + "；聋器之告 " + mine.length + " 枚"
          + (gateWouldRed ? "　→ 本门于此输入必判红（exit 1），故 §三 之判是判据，不是装饰"
            : "　→ **该红而未红**：§三 之判指不出一个使其为红之输入"));
      }
    }
  }

  /* 戊：换其 `viewBox`（★ 其序列于末，为不动甲乙丙丁之旧号；其形与甲乙同族——手造之图） */
  await runMadeForm(MADE.filter(x => x.tag === "戊")[0]);

  await browser.close();
  server.close();

  /* ---------------- 结 ---------------- */
  head("结");
  if (parseMisses.length) {
    /* ★ 「解不开」与「无告」须可分（裁一百一十四 四款；门内自撞·二之治） */
    gateErrs++;
    console.log("  ⚠ 有 " + parseMisses.length + " 条 `.base-map-breach` 之文**解不开**（非「无告」）——本门之解法与告之形不合，其跑作废：");
    Array.from(new Set(parseMisses)).slice(0, 8).forEach(s => console.log("      · " + s));
  } else {
    console.log("  ✓ 凡所见之 `.base-map-breach` 之文**皆解得开**（0 条解不开；「解不开」与「无告」在本门之输出里可分）");
  }
  console.log("  共 " + checks + " 条，" + (fails ? "✗ 红 " + fails + " 条" : "✓ 全绿")
    + (gateErrs ? "；⚠ 本门自身出错 " + gateErrs + " 条（反证不红／二法不等）" : "；反证俱红、二法俱同"));
  if (gateErrs) {
    console.log("  ★★ **本门自身出错：今日这一跑不作数**——不作绿、不作红（exit 2，裁一百一十四 二款、裁一百二十三 加款㈡）。");
    console.log("  ★ 「全绿」而 exit 2，正是「绿而不可恃」；请人读之，勿以其绿为凭。");
    process.exit(2);
  }
  console.log("  所验者：" + revs.length + " 本史图 × " + VIEWS.length + " 视图；生产 `app.js` sha256 " + appSha.slice(0, 12)
    + "（取于 " + tApp + "）；史本取于 " + tMaps + "。");
  process.exit(fails ? 1 : 0);
})().catch(e => {
  console.error("\n⚠ 本门自身出错（未捕获）：" + (e && e.stack || e));
  console.error("exit 2。");
  process.exit(2);
});
