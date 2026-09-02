// r44 生产带参复验·数据层：直连生产 JSON，核对莘婢互指小件两条断言
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
  const [meta, passages] = await Promise.all(
    ["meta.json", "passages.json"].map((f) => fetchJson(BASE + f + "?v=" + V))
  );

  console.log("== meta ==");
  console.log(JSON.stringify(meta.tables));

  const byId = (rows) => Object.fromEntries(rows.map((r) => [r.id, r]));
  const P = byId(passages);

  let pass = 0, fail = 0;
  const assert = (name, cond, detail) => {
    if (cond) { pass++; console.log("PASS", name, detail || ""); }
    else { fail++; console.log("FAIL", name, detail || ""); }
  };

  const q073 = P["Q073"], q161 = P["Q161"], q442 = P["Q442"], q443 = P["Q443"];

  console.log("\n== 断言 1：骊姬页 Q073/Q443 两侧互指 + 破读作嬖备考两侧俱见 ==");
  assert("Q073 存在", !!q073);
  assert("Q443 存在", !!q443);
  assert("Q073 → Q443 互指（含【r44 互指补·婢案】节）", q073.modern_note.includes("【r44 互指补·婢案"));
  assert("Q073 指向 Q443", q073.modern_note.includes("`Q443`") || q073.modern_note.includes("Q443"));
  assert("Q443 → Q073 互指", q443.modern_note.includes("`Q073`") || q443.modern_note.includes("Q073"));
  assert("Q073 含「转录本破读作嬖」备考", q073.modern_note.includes("转录本破读作嬖"));
  assert("Q443 含「转录本破读作嬖」备考", q443.modern_note.includes("转录本破读作嬖"));

  console.log("\n== 断言 2：息妫页 Q161/Q442 两侧互指 ==");
  assert("Q161 存在", !!q161);
  assert("Q442 存在", !!q442);
  assert("Q161 → Q442 互指（含【r44 互指补·莘案】节）", q161.modern_note.includes("【r44 互指补·莘案"));
  assert("Q161 指向 Q442", q161.modern_note.includes("`Q442`") || q161.modern_note.includes("Q442"));
  assert("Q442 → Q161 互指（末节）", q442.modern_note.includes("互指补·莘案（「异消解」处之双向互指）"));
  assert("Q442 指向 Q161", q442.modern_note.includes("`Q161`") || q442.modern_note.includes("Q161"));
  assert("Q161 含「转录本破读作嬖」备考互见", q161.modern_note.includes("转录本破读作嬖"));
  assert("Q442 含「转录本破读作嬖」备考互见", q442.modern_note.includes("转录本破读作嬖"));

  console.log("\n== 断言 3：Q442 释文形貌落定（r44d 支①，含简上之「＝」）==");
  assert("Q442.quote_original 已录整理本释文括注式（郶（蔡））", q442.quote_original.includes("郶（蔡）"));
  assert("Q442.quote_original 含「賽＝（息）侯」", q442.quote_original.includes("賽＝（息）侯"));
  assert("Q442.quote_original 含「是賽＝爲＝（息媯）」", q442.quote_original.includes("是賽＝爲＝（息媯）"));
  assert("Q442.quote_original 三「＝」全录", (q442.quote_original.match(/＝/g) || []).length === 3);
  assert("Q442.quote_original 旧首句已不存（娶→取甲档回改已落）", !q442.quote_original.includes("蔡哀侯娶妻"));
  assert("Q442.quote_original 不含「娶」", !q442.quote_original.includes("娶"));
  assert("Q442.quote_original 不录注释号〔二〕", !q442.quote_original.includes("〔二〕"));
  assert("Q442.quote_original 「訓（順）」未动（丙档旧判仍立）", q442.quote_original.includes("訓（順）"));
  assert("Q442.modern_note 含 r44d 支①执行节", q442.modern_note.includes("【★r44d 支①执行·就地注记"));

  console.log(`\n== 共 ${pass}/${pass + fail} PASS，${fail} FAIL ==`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error("ERROR", e);
  process.exit(1);
});
