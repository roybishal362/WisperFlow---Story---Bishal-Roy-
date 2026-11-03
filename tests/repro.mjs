import puppeteer from "puppeteer-core";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
const p = await b.newPage(); await p.setViewport({ width: 1915, height: 852 });
// like his laptop: Windows "animation effects" off => prefers-reduced-motion: reduce
await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await p.goto("https://wisper-flow-story-bishal-roy.vercel.app/#/line/leg3", { waitUntil: "networkidle0" }); await sleep(3500);
const box = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }, sel);
const click = (t) => p.evaluate((t) => [...document.querySelectorAll("button")].find((x) => x.textContent.includes(t))?.click(), t);
await click("NEXT STOP"); await sleep(2200); await p.screenshot({ path: "tests/repro-a.png" });
console.log("after NEXT STOP:", await p.evaluate(() => location.hash), "bar", await box(".ll-bar"), "tkt", await box(".ll-tkw"), "dlg", await box(".dlg"));
await click("ROLL OUT"); await sleep(300); console.log("sparks visible right after ROLL OUT:", await p.evaluate(() => !!document.querySelector(".ll-sparks")));
await sleep(2500); await p.screenshot({ path: "tests/repro-b.png" });
console.log("after roll out:", await p.evaluate(() => location.hash), "bar", await box(".ll-bar"), "tkt", await box(".ll-tkw"), "dlg", await box(".dlg"), "stage", await box(".stage"));
await b.close();
