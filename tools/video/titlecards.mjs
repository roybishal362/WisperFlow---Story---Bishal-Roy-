// Renders the chapter title cards (transparent 1920x1080 PNGs) in the site's style.
// Usage: node tools/video/titlecards.mjs <outDir> "<title 1>" "<title 2>" ...
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const [out, ...titles] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const b = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
for (let i = 0; i < titles.length; i++) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}html,body{width:1920px;height:1080px;background:transparent;overflow:hidden}
.c{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:34px 90px 38px;text-align:center;
background:linear-gradient(180deg,rgba(18,24,48,.88),rgba(10,13,28,.92));border:2px solid #e9c77b;border-radius:10px;
box-shadow:0 20px 60px rgba(0,0,0,.55),inset 0 0 0 6px rgba(10,13,28,.9),inset 0 0 0 7px rgba(233,199,123,.45)}
.k{font-family:Cinzel,serif;font-weight:700;font-size:26px;letter-spacing:.5em;color:#e9c77b}
h1{font-family:Cinzel,serif;font-weight:900;font-size:86px;letter-spacing:.1em;color:#fff6dc;margin-top:8px;text-shadow:0 4px 20px rgba(0,0,0,.6);white-space:nowrap}
.o{width:520px;height:2px;margin:18px auto 0;background:linear-gradient(90deg,transparent,#e9c77b,transparent)}</style></head>
<body><div class="c"><div class="k">PART ${ROMAN[i]}</div><h1>${titles[i].toUpperCase()}</h1><div class="o"></div></div></body></html>`;
  await p.setContent(html, { waitUntil: "networkidle0" }); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${out}/title${i + 1}.png`, omitBackground: true });
}
await b.close(); console.log("title cards:", titles.length);
