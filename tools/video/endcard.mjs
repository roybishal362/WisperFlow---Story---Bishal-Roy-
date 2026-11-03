// Renders the video's end card (1920x1080 PNG) from HTML, in the site's own style.
import puppeteer from "puppeteer-core";
const out = process.argv[2] || "endcard.png";
const art = "https://wisper-flow-story-bishal-roy.vercel.app/art/08-wispr-skyport/bg-skyport-departure.webp";
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cinzel+Decorative:wght@700&family=Nunito:wght@600;800&display=swap" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;overflow:hidden;font-family:Nunito,sans-serif;color:#fff;background:#0b0f1e}
.bg{position:absolute;inset:-40px;background:url(${art}) center/cover;filter:blur(10px) brightness(.55)}
.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;text-shadow:0 4px 24px rgba(0,0,0,.6)}
.pre{font-family:Cinzel,serif;letter-spacing:.5em;font-size:24px;color:#fff3d6}
h1{font-family:'Cinzel Decorative',Cinzel,serif;font-size:104px;margin:14px 0 8px}
.orn{width:640px;height:2px;background:linear-gradient(90deg,transparent,#e9c77b,transparent);margin:16px auto 26px}
.url{font-weight:800;font-size:44px;color:#ffe9a8}
.mail{font-size:30px;margin-top:14px;color:#eef1ff}
.by{margin-top:46px;font-family:Cinzel,serif;font-size:22px;letter-spacing:.3em;color:#bfe9ee}</style></head>
<body><div class="bg"></div><div class="c"><div class="pre">THE VAST REALM</div><h1>Bishal Roy</h1><div class="orn"></div>
<div class="url">wisper-flow-story-bishal-roy.vercel.app</div><div class="mail">roybishal9989@gmail.com · linkedin.com/in/bishal-roy-5410b5257</div>
<div class="by">BUILT BY VOICE WITH WISPR FLOW</div></div></body></html>`;
const b = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
await p.setContent(html, { waitUntil: "networkidle0" }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: out }); await b.close(); console.log("end card:", out);
