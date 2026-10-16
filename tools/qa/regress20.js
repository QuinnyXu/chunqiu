/* 【退出码】（r61-X 补，裁二百三十一 二4；照 prod_freshness.js 门头之式）
 *   0 ＝ 报成且无判红；1 ＝ 判红——本门余皆只报（各人播放钮之显隐、降级、状态行），唯「页面错误」（pageerror）非空即 1；
 *   2 ＝ 本门自身出错（浏览器起不来等抛错，`.catch` 出）。
 *   ★ 此前本门只报、恒 exit 0，抛错以 1 退——自 r61-X 起三分如上。
 *   〔r62-C 补（裁二百三十三 二2、本书 §三十七）〕★ 2 另含：**内建反证不红**——每跑于同一浏览器上下文另开一页，
 *     于页内真抛一条未捕之错（`setTimeout(() => { throw … })`），令其经 `page.on("pageerror")` 之同一接线（`wire()`）入其错列，
 *     再以同一判函数（`judgeErrs()`）判之：须判红、且其由之文恰含所注入之错；不然即接线或判法失灵 → exit 2。
 *     其由：r61-X 之反证副本把错**直推入 errs 于打印之后**，日志印「页面错误: 无」而 exit 1——红而非因，未证 pageerror 之接线。
 *   ★ 判红之由于末行明书（「判红之由：页面错误 N 条——…」），exit 1 须红在其因上。
 */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const SITE_DIR=path.resolve(__dirname,"..","..","site");
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon"};
function srv(root){return new Promise((res,rej)=>{const s=http.createServer((rq,rs)=>{let u=decodeURIComponent(rq.url.split("?")[0].split("#")[0]);if(u==="/")u="/index.html";const fp=path.join(root,u);if(!fp.startsWith(root)){rs.writeHead(403);rs.end();return;}fs.readFile(fp,(e,d)=>{if(e){rs.writeHead(404);rs.end();return;}rs.writeHead(200,{"Content-Type":MIME[path.extname(fp).toLowerCase()]||"application/octet-stream"});rs.end(d);});});s.on("error",rej);s.listen(0,"127.0.0.1",()=>res(s));});}
/* r62-C：错之接线与判法各只一处——正跑与反证共用，反证所证者即正跑所用者 */
const wire=(page,arr)=>page.on("pageerror",e=>arr.push(e.message));
const judgeErrs=(arr)=>({red:arr.length>0,why:arr.join(" | ")});
const INJECT="r62-C 反证：页内注入之未捕之错（经 pageerror 之接线）";
const IDS=["P_WENJIANG","P_LUHUAN","P_QIXIANG","P_ZHENGZHAO","P_JIZHONG","P_ZHENGZHUANG","P_LUYIN","P_WUJIANG","P_LUZHUANG","P_QIHUAN","P_QIXI","P_JINWEN","P_LIJI","P_QINMU","P_CHUCHENG","P_MUJI","P_CHUZHUANG","P_ZHUANGJIANG","P_XUANJIANG","P_XIGUI"];
(async()=>{
  const pw=require("playwright");
  const baseURL=process.env.QA_BASE_URL||null;
  let s=null,origin=baseURL;
  if(!origin){s=await srv(SITE_DIR);origin=`http://127.0.0.1:${s.address().port}`;console.log("本地服务器："+origin);}
  else console.log("真机 QA_BASE_URL："+origin);
  const b=await pw.chromium.launch();const c=await b.newContext({viewport:{width:1200,height:800}});
  await c.addInitScript(()=>{try{localStorage.setItem("chunqiu_tour_v1","1");}catch(e){}});
  const p=await c.newPage();let errs=[];
  wire(p,errs);
  let degraded=[];
  for(const id of IDS){
    await p.goto(origin+"/#/p/"+id+"/map",{waitUntil:"load"});
    await p.waitForTimeout(500);
    const r=await p.evaluate(()=>({
      name:(document.querySelector(".person-nav .pn-name")||{}).textContent||"?",
      playHidden:document.querySelector("#btn-play").hidden,
      playDisabled:document.querySelector("#btn-play").disabled,
      degradeHidden:document.querySelector("#play-degrade").hidden,
      status:document.querySelector("#map-status").textContent,
    }));
    const deg=!r.degradeHidden;
    if(deg)degraded.push(id);
    console.log(`${id.padEnd(15)} ${(r.name||"").padEnd(6)} play隐藏=${r.playHidden?"是":"否"} 降级显=${deg?"是":"否"} | ${r.status}`);
  }
  console.log("\n降级清单:",degraded.join("、"));
  console.log("页面错误:",errs.length?errs.join(" | "):"无");
  /* r62-C 内建反证：另开一页（同一上下文），真抛一条未捕之错，经同一 wire()／judgeErrs() 判之——须红、且红在其因上 */
  const q=await c.newPage();const probeErrs=[];wire(q,probeErrs);
  await q.goto(origin+"/#/",{waitUntil:"load"});
  await q.evaluate((msg)=>{setTimeout(()=>{throw new Error(msg);},0);},INJECT);
  await q.waitForTimeout(400);
  const pj=judgeErrs(probeErrs);
  console.log("〔反证〕注入页之页面错误:",pj.why||"无");
  const probeOk=pj.red&&pj.why.includes(INJECT)&&!errs.some(x=>x.includes(INJECT));
  console.log("〔反证〕"+(probeOk?"当场红，且红在其因上（所注入之错之文见上行；正跑之错列未受染）":"★ 不红或红非其因——接线／判法失灵，本门自身出错（exit 2）"));
  const verdict=judgeErrs(errs);
  console.log(verdict.red?"判红之由：页面错误 "+errs.length+" 条——"+verdict.why:"判红之由：无（页面错误 0 条）");
  await b.close();if(s)s.close();
  process.exit(!probeOk?2:verdict.red?1:0);   // r61-X：页面抛错即判红；r62-C：反证不红即 2（见门头【退出码】）
})().catch(e=>{console.error(e);process.exit(2);});
