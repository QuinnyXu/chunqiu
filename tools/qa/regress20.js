"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const SITE_DIR=path.resolve(__dirname,"..","..","site");
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon"};
function srv(root){return new Promise((res,rej)=>{const s=http.createServer((rq,rs)=>{let u=decodeURIComponent(rq.url.split("?")[0].split("#")[0]);if(u==="/")u="/index.html";const fp=path.join(root,u);if(!fp.startsWith(root)){rs.writeHead(403);rs.end();return;}fs.readFile(fp,(e,d)=>{if(e){rs.writeHead(404);rs.end();return;}rs.writeHead(200,{"Content-Type":MIME[path.extname(fp).toLowerCase()]||"application/octet-stream"});rs.end(d);});});s.on("error",rej);s.listen(0,"127.0.0.1",()=>res(s));});}
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
  p.on("pageerror",e=>errs.push(e.message));
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
  await b.close();if(s)s.close();
})().catch(e=>{console.error(e);process.exit(1);});
