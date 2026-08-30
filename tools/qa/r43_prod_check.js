// r43 生产带参复验·数据层：直连生产 JSON，核对四条断言的数据基础
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
  const [meta, sources, passages, events, places] = await Promise.all(
    ["meta.json", "sources.json", "passages.json", "events.json", "places.json"].map((f) =>
      fetchJson(BASE + f + "?v=" + V)
    )
  );

  console.log("== meta ==");
  console.log(JSON.stringify(meta.tables));

  const byId = (rows) => Object.fromEntries(rows.map((r) => [r.id, r]));
  const S = byId(sources), P = byId(passages), E = byId(events), L = byId(places);

  let pass = 0, fail = 0;
  const assert = (name, cond, detail) => {
    if (cond) { pass++; console.log("PASS", name, detail || ""); }
    else { fail++; console.log("FAIL", name, detail || ""); }
  };

  console.log("\n== 断言 1：婢／嬖并陈可读 ==");
  const q443 = P["Q443"], q073 = P["Q073"], e076 = E["E076"];
  assert("Q443 含婢", q443.modern_note.includes("婢"));
  assert("Q443 含嬖", q443.modern_note.includes("嬖"));
  assert("Q073 存在且非空", !!(q073 && q073.modern_note));
  assert("E076 存在", !!e076);
  console.log("Q443.modern_note[0:120] =", q443.modern_note.slice(0, 120));

  console.log("\n== 断言 2：五鹿新点落图 ==");
  const wulu = L["L_WULU"];
  assert("L_WULU lat=35.95", wulu.lat === 35.95 || Number(wulu.lat) === 35.95, "lat=" + wulu.lat);
  assert("L_WULU lng=115.03", wulu.lng === 115.03 || Number(wulu.lng) === 115.03, "lng=" + wulu.lng);
  assert("L_WULU certainty=low", wulu.certainty === "low");
  assert("L_WULU coord_certainty=low", wulu.coord_certainty === "low");
  console.log("L_WULU.modern_location =", wulu.modern_location);

  console.log("\n== 断言 3：E084 正读 ==");
  const e084 = E["E084"];
  assert("E084 含與", e084.summary.includes("與"));
  assert("E084 含简 34", e084.summary.includes("简 34"));

  console.log("\n== 断言 4：简 34 著录三处可见 ==");
  const q448 = P["Q448"], j002 = S["J002"];
  assert("Q448.modern_note 含简 34", q448.modern_note.includes("简 34"));
  assert("Q448.quote_original 仍作牙（未回改）", q448.quote_original.includes("牙") && !q448.quote_original.includes("與"));
  assert("E084.summary 含简 34", e084.summary.includes("简 34"));
  assert("J002.notes 含简 34", j002.notes.includes("简 34"));

  console.log("\n== 附加：全库不变量 ==");
  assert("sources=177", meta.tables.sources === 177);
  assert("places=91", meta.tables.places === 91);
  assert("passages=436", meta.tables.passages === 436);
  assert("events=236", meta.tables.events === 236);
  assert("B002 存在", !!S["B002"]);
  assert("B003 存在", !!S["B003"]);
  assert("B002 不在任何 source_ids 中", !events.some(e => (e.source_ids || "").split(";").includes("B002")) && !places.some(p => (p.source_ids || "").split(";").includes("B002")));

  console.log("\n==", pass, "PASS /", fail, "FAIL ==");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("ERROR", e); process.exit(2); });
