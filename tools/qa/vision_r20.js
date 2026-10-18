/* 【退出码】（r61-T 补书，旧书裁二百〇五 三②、裁二百二十七 三3；照 prod_freshness.js 门头之式）
 *   0 ＝ 报成——★ 本门只报不判（印所量之数与截图，无断言），故**无退出码 1**；2 ＝ 本门自身出错（`.catch` 出）。★ r61-T 改：`.catch` 原以 1 退——只报之门以 1 退，读者即读作「判红」，今改 2。
 */
"use strict";
// r20 Vision 自验：管仲上线（徽记/齐五阶/时间线T层/轨迹/ego/并观）＋21主角回归
const http=require("http"),fs=require("fs"),path=require("path");
const SITE_DIR=path.resolve(__dirname,"..","..","site");
const OUT=path.resolve(__dirname,"screenshots");
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon"};
function srv(root){return new Promise((res,rej)=>{const s=http.createServer((rq,rs)=>{let u=decodeURIComponent(rq.url.split("?")[0].split("#")[0]);if(u==="/")u="/index.html";const fp=path.join(root,u);if(!fp.startsWith(root)){rs.writeHead(403);rs.end();return;}fs.readFile(fp,(e,d)=>{if(e){rs.writeHead(404);rs.end();return;}rs.writeHead(200,{"Content-Type":MIME[path.extname(fp).toLowerCase()]||"application/octet-stream"});rs.end(d);});});s.on("error",rej);s.listen(0,"127.0.0.1",()=>res(s));});}
const PROTS=["P_WENJIANG","P_QIXIANG","P_QIHUAN","P_GUANZHONG","P_LUYIN","P_LUHUAN","P_LUZHUANG","P_ZHENGZHUANG","P_ZHENGZHAO","P_WUJIANG","P_JIZHONG","P_JINWEN","P_QINMU","P_CHUCHENG","P_CHUZHUANG","P_XIGUI","P_LIJI","P_MUJI","P_ZHUANGJIANG","P_XUANJIANG"];
/* r62-S 乙（裁二百四十四 三2，2026-10-17 Co站长）：去 r62-M 之「与 people.json 取交」——取交是自动剔名，日后若有人误被降（数据错），
 * 本门亦默然剔之、不红，门失其能红。改为：
 *   ① 名单中**显式删** P_QIXI（齐僖公）——由：裁二百四十（齐僖公降二级之议）、裁二百四十三 三2（站长定「齐僖公维持降」）；
 *      r62-M `1c75d56` 解其 PROTAGONISTS 之挂，其 `#/p/P_QIXI/…` 已无其页。
 *   ② 加断「名单中人俱须为今一级（site/data/people.json is_protagonist=1），否则 exit 1」，印其名。
 *   ③ 其后凡降一人，须于本门名单显式删之（三法之「同步」须是显式之改）。
 *   反证：判法 rosterNonProto 对「名单＋一非一级者（P_QIXI）」须判出之，不判出 exit 2；
 *        另可以环境变量 QA_ROSTER_INJECT=<id> 将一人混入名单实跑，须 exit 1。（反证所用之 P_QIXI 若日后复升，须换一今非一级者。） */
const PROTO_NOW = new Set(JSON.parse(require("fs").readFileSync(require("path").join(__dirname, "..", "..", "site", "data", "people.json"), "utf8")).filter(p => Number(p.is_protagonist) === 1).map(p => p.id));
const rosterNonProto = (list) => list.filter(id => !PROTO_NOW.has(id));
if (process.env.QA_ROSTER_INJECT) PROTS.push(process.env.QA_ROSTER_INJECT);
{
  const probe = rosterNonProto([...PROTS, "P_QIXI"]);
  if (!probe.includes("P_QIXI")) { console.log("【反证·★ 不红：门自身出错】名单混入非一级者 P_QIXI 而判法未判出"); process.exit(2); }
  console.log("【反证·如期而红，计为过】名单混入非一级者 P_QIXI，判法判出");
  const bad = rosterNonProto(PROTS);
  if (bad.length) { console.log("【判·红】回归名单中人俱须为今一级：非一级者 " + bad.length + "：" + bad.join("、") + "（降者须于本门名单显式删之）"); process.exit(1); }
  console.log("【判·过】回归名单 " + PROTS.length + " 人俱为今一级");
}
(async()=>{
  const pw=require("playwright");
  const baseURL=process.env.QA_BASE_URL||null;
  let s=null,origin=baseURL;
  if(!origin){s=await srv(SITE_DIR);origin=`http://127.0.0.1:${s.address().port}`;console.log("本地服务器："+origin);}
  else console.log("真机 QA_BASE_URL："+origin);
  const b=await pw.chromium.launch();
  const c=await b.newContext({viewport:{width:1280,height:900},deviceScaleFactor:2});
  await c.addInitScript(()=>{try{localStorage.setItem("chunqiu_tour_v1","1");}catch(e){}});
  const p=await c.newPage();let errs=[];
  p.on("pageerror",e=>errs.push(e.message));

  // 1) 首页齐组五徽
  await p.goto(origin+"/#/",{waitUntil:"load"});await p.waitForTimeout(700);
  await p.screenshot({path:path.join(OUT,"r20_home.png")});

  // 2) 管仲时间线：展开 E046（堂阜·管鲍分财 S层＋孔子T层）与 E068（召陵·T层）
  await p.goto(origin+"/#/p/P_GUANZHONG/timeline",{waitUntil:"load"});await p.waitForTimeout(600);
  const tl=await p.evaluate(()=>{
    const ds=[...document.querySelectorAll('#view-timeline details[data-eid]')];
    ds.forEach(d=>{if(["E046","E068","E071"].includes(d.dataset.eid))d.open=true;});
    const badges=[...document.querySelectorAll('#view-timeline .q-layer')].map(x=>x.textContent);
    const name=(document.querySelector(".person-nav .pn-name")||{}).textContent||"?";
    return {name,eventCount:ds.length,layerBadges:badges};
  });
  await p.waitForTimeout(300);
  const e046=await p.$('#view-timeline details[data-eid="E046"]');
  if(e046)await e046.scrollIntoViewIfNeeded();
  await p.waitForTimeout(200);
  await p.screenshot({path:path.join(OUT,"r20_guanzhong_timeline_E046.png")});
  const e068=await p.$('#view-timeline details[data-eid="E068"]');
  if(e068){await e068.scrollIntoViewIfNeeded();await p.waitForTimeout(200);
    await p.screenshot({path:path.join(OUT,"r20_guanzhong_timeline_E068.png")});}

  // 3) 管仲地图轨迹（应有轨迹、不降级）
  await p.goto(origin+"/#/p/P_GUANZHONG/map",{waitUntil:"load"});await p.waitForTimeout(700);
  const mp=await p.evaluate(()=>({
    playHidden:document.querySelector("#btn-play").hidden,
    degradeHidden:document.querySelector("#play-degrade").hidden,
    status:(document.querySelector("#map-status")||{}).textContent||"",
    trackPts:document.querySelectorAll("#map-canvas polyline, #map-canvas [class*=track]").length,
  }));
  await p.screenshot({path:path.join(OUT,"r20_guanzhong_map.png")});

  // 4) ego 图（管鲍/君臣边）
  await p.goto(origin+"/#/p/P_GUANZHONG/relations",{waitUntil:"load"});await p.waitForTimeout(800);
  await p.screenshot({path:path.join(OUT,"r20_guanzhong_ego.png")});

  // 5) 并观 管仲×桓公
  await p.goto(origin+"/#compare=P_GUANZHONG,P_QIHUAN",{waitUntil:"load"});await p.waitForTimeout(900);
  const cmp=await p.evaluate(()=>{
    const sum=[...document.querySelectorAll("*")].map(e=>e.childNodes.length===1&&e.textContent||"").find(t=>t&&t.includes("交会共"))||"";
    return {
      summary:sum.trim(),
      meets:document.querySelectorAll(".cmp-meet-list li, .cmp-meet-list > *").length,
      hasSvg:!!document.querySelector("#view-compare svg"),
    };
  });
  await p.screenshot({path:path.join(OUT,"r20_compare_guan_huan.png")});

  // 6) 搜索命中
  await p.goto(origin+"/#/",{waitUntil:"load"});await p.waitForTimeout(400);
  const sr=await p.evaluate(async()=>{
    const inp=document.querySelector("#global-search");
    if(!inp)return{ok:false,reason:"无搜索框"};
    const tog=document.querySelector("#search-toggle");if(tog)tog.click();
    inp.value="管仲";inp.dispatchEvent(new Event("input",{bubbles:true}));
    await new Promise(r=>setTimeout(r,500));
    const pop=document.querySelector("#search-pop");
    const hits=(pop&&pop.textContent||"").replace(/\s+/g," ");
    return {ok:hits.includes("管仲"),sample:hits.slice(0,90)};
  });

  // 7) 回归：21 主角地图，收集报错与降级
  let degraded=[],rendered=[];
  for(const id of PROTS){
    await p.goto(origin+"/#/p/"+id+"/map",{waitUntil:"load"});await p.waitForTimeout(350);
    const r=await p.evaluate(()=>({
      name:(document.querySelector(".person-nav .pn-name")||{}).textContent||"?",
      degradeShown:!document.querySelector("#play-degrade").hidden,
      hasContent:!!document.querySelector("#map-svg, #view-map svg"),
    }));
    rendered.push(id+(r.hasContent?"":"[无图!]"));
    if(r.degradeShown)degraded.push(r.name);
  }

  console.log("\n===== r20 Vision 自验 =====");
  console.log("时间线：",JSON.stringify(tl.name),"事件数=",tl.eventCount,"分层徽标=",tl.layerBadges.join("/")||"（无）");
  console.log("地图：play隐藏=",mp.playHidden,"降级显=",!mp.degradeHidden,"轨迹图元=",mp.trackPts,"| 状态：",mp.status);
  console.log("并观：",cmp.summary||"（无交会摘要）","| 交会条数=",cmp.meets,"有SVG=",cmp.hasSvg);
  console.log("搜索管仲命中=",sr.ok,"| 样本：",sr.sample);
  console.log("回归渲染=",rendered.length,"人；降级清单=",degraded.join("、")||"（无）");
  console.log("页面错误：",errs.length?errs.join(" | "):"无");
  await b.close();if(s)s.close();
})().catch(e=>{console.error(e);process.exit(2);});
