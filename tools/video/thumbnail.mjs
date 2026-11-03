// Renders the YouTube thumbnail (1280x720 JPG) from the site's own art.
// Usage: node tools/video/thumbnail.mjs <out.jpg>
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
const out = process.argv[2];
const ART = path.resolve("../v2/art/FINAL");
const uri = (f) => `data:image/${f.endsWith(".png") ? "png" : "jpeg"};base64,${fs.readFileSync(path.join(ART, f)).toString("base64")}`;
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito:wght@800;900&display=swap" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}html,body{width:1280px;height:720px;overflow:hidden;background:#0b0f1e}
.bg{position:absolute;inset:0;background:url(${uri("02-vast-city/bg-city.jpg")}) 62% 40%/cover}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,12,30,.92) 0%,rgba(8,12,30,.78) 38%,rgba(8,12,30,.15) 66%,transparent 80%)}
.roy{position:absolute;right:40px;bottom:-6px;height:640px;transform:scaleX(-1);filter:drop-shadow(0 18px 30px rgba(0,0,0,.55))}
.t{position:absolute;left:64px;top:92px;width:720px}
.k{font-family:Nunito,sans-serif;font-weight:900;font-size:30px;letter-spacing:.22em;color:#e9c77b}
h1{font-family:Cinzel,serif;font-weight:900;line-height:.98;margin-top:18px;color:#fff6dc;font-size:112px;letter-spacing:.02em;text-shadow:0 6px 24px rgba(0,0,0,.7)}
h1 b{display:block;color:#f2c75c;font-size:150px}
.pill{display:inline-block;margin-top:30px;padding:14px 26px;border:3px solid #e9c77b;border-radius:999px;background:rgba(10,13,28,.85);
font-family:Nunito,sans-serif;font-weight:900;font-size:30px;color:#fff6dc}</style></head>
<body><div class="bg"></div><div class="shade"></div><img class="roy" src="${uri("00-roy-and-ui/roy-pose-point.png")}">
<div class="t"><div class="k">BISHAL ROY · THE VAST REALM</div><h1>BUILT BY<b>VOICE</b></h1><div class="pill">My portfolio · 17,600 words spoken</div></div></body></html>`;
const b = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720 });
await p.setContent(html, { waitUntil: "load", timeout: 45000 });
const ok = await p.evaluate(() => Promise.race([document.fonts.load("900 112px Cinzel").then((f) => f.length > 0), new Promise((r) => setTimeout(() => r(false), 20000))]));
if (!ok) throw new Error("Cinzel did not load");
await p.screenshot({ path: out, type: "jpeg", quality: 92 });
await b.close(); console.log("thumbnail:", out);
