// r45 生产带参复验·数据层：直连生产 JSON，核对夹谷之会单条试点三项断言
const https = require("https");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        if (res.statusCode !== 200) return reject(new Error(url + " -> " + res.statusCode));
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

const BASE = "https://chunqiu.timechorus.com/data/";
const V = Date.now();

(async () => {
  const [meta, events, places, passages, eventPeople] = await Promise.all(
    ["meta.json", "events.json", "places.json", "passages.json", "event_people.json"].map(
      (f) => fetchJson(BASE + f + "?v=" + V)
    )
  );

  console.log("== meta ==");
  console.log(JSON.stringify(meta.tables));

  const byId = (rows) => Object.fromEntries(rows.map((r) => [r.id, r]));
  const E = byId(events);
  const L = byId(places);
  const Q = byId(passages);

  let pass = 0, fail = 0;
  const assert = (name, cond, detail) => {
    if (cond) { pass++; console.log("PASS", name, detail || ""); }
    else { fail++; console.log("FAIL", name, detail || ""); }
  };

  console.log("\n== 断言 1：孔子页新增「亲至」事目（E274/P_KONGZI）==");
  assert("E274 存在", !!E["E274"]);
  const kongziLink = eventPeople.find((r) => r.event_id === "E274" && r.person_id === "P_KONGZI");
  assert("event_people 含 E274/P_KONGZI 挂链", !!kongziLink);
  assert("P_KONGZI 于 E274 标「亲至」", kongziLink && kongziLink.presence === "亲至", kongziLink && kongziLink.presence);
  assert("P_KONGZI 于 E274 directness=direct", kongziLink && kongziLink.directness === "direct");
  const qijingLink = eventPeople.find((r) => r.event_id === "E274" && r.person_id === "P_QIJING");
  assert("P_QIJING 于 E274 亦标「亲至」", qijingLink && qijingLink.presence === "亲至");
  const yanyingLink = eventPeople.find((r) => r.event_id === "E274" && r.person_id === "P_YANYING");
  assert("晏婴不挂 E274（反面断言）", !yanyingLink);

  console.log("\n== 断言 2：夹谷事目页四条引文分层（经/传二条/史记 S 层）==");
  const q454 = Q["Q454"], q455 = Q["Q455"], q456 = Q["Q456"], q457 = Q["Q457"];
  assert("Q454 存在且挂 E274", !!q454 && q454.event_id === "E274");
  assert("Q455 存在且挂 E274", !!q455 && q455.event_id === "E274");
  assert("Q456 存在且挂 E274", !!q456 && q456.event_id === "E274");
  assert("Q457 存在且挂 E274", !!q457 && q457.event_id === "E274");
  assert("Q454（经）quote_type=原文，source=Z118", q454 && q454.quote_type === "原文" && q454.source_id === "Z118");
  assert("Q455（传上半）quote_type=原文，source=Z118", q455 && q455.quote_type === "原文" && q455.source_id === "Z118");
  assert("Q456（传下半）quote_type=原文，source=Z118", q456 && q456.quote_type === "原文" && q456.source_id === "Z118");
  assert("Q457（史记）quote_type=后出叙事，source=S015", q457 && q457.quote_type === "后出叙事" && q457.source_id === "S015");
  assert("Q457 modern_note 以【】层标起", q457 && q457.modern_note.startsWith("【"));

  console.log("\n== 断言 3：L_JIAGU 显示未定位（坐标三栏留空）==");
  const l = L["L_JIAGU"];
  assert("L_JIAGU 存在", !!l);
  assert("lat 为空", l && (l.lat === null || l.lat === ""), l && l.lat);
  assert("lng 为空", l && (l.lng === null || l.lng === ""), l && l.lng);
  assert("coord_certainty 为空", l && (l.coord_certainty === null || l.coord_certainty === ""), l && l.coord_certainty);
  assert("certainty=low", l && l.certainty === "low");
  assert("modern_location 含「未定」", l && l.modern_location && l.modern_location.includes("未定"));

  console.log(`\n== 共 ${pass}/${pass + fail} PASS，${fail} FAIL ==`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error("ERROR", e);
  process.exit(1);
});
