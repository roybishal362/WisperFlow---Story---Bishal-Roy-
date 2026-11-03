// Captures the README screenshots from the live site (or any base URL).
// Usage: node tests/readme-shots.mjs https://wisper-flow-story-bishal-roy.vercel.app
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const base = process.argv[2] || "http://127.0.0.1:4173";
const out = "docs/screens"; fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
const p = await b.newPage();
await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
const go = async (h, ms = 3400) => { await p.evaluate((x) => { location.hash = x; }, h); await sleep(ms); };
const snap = (n) => p.screenshot({ path: `${out}/${n}.png` });
const click = (text) => p.evaluate((t) => [...document.querySelectorAll("button")].find((x) => x.textContent.includes(t))?.click(), text);

await p.setViewport({ width: 1440, height: 900 });
await p.goto(base + "/#/", { waitUntil: "networkidle0" }); await p.evaluate(() => localStorage.setItem("vast-realm-v1", JSON.stringify({ visited: [], bag: [], stages: {}, crystals: [], seen: ["world", "city", "line", "lake", "ring", "crafters", "echo", "skyport"] }))); await p.reload({ waitUntil: "networkidle0" });
await sleep(4200); await snap("01-title");
await go("/world", 3800); await snap("02-world");
await p.evaluate(() => [...document.querySelectorAll(".w-hit")].find((x) => x.getAttribute("aria-label").includes("Lantern"))?.click()); await sleep(1500); await snap("03-balloon");
await go("/city", 3600); await snap("04-city");
await go("/city/6"); await snap("05-ring-community");
await go("/line", 3600); await snap("06-line-leg1");
await go("/line/depot2"); await click("ROLL OUT"); await sleep(1900); await snap("07-depot-upgrade"); await sleep(2200);
await go("/line/leg5"); await snap("08-line-sky");
await go("/lake", 3600); await snap("09-lake");
await go("/lake/2"); await click("TURN THE MIRROR"); await sleep(1400); await snap("10-tower");
await go("/lake/mirror", 3600); await snap("11-mirror");
await go("/ring", 3600); await snap("12-plaza");
await go("/ring/teahouse"); await click("ADD TO BAG"); await sleep(700); await snap("13-shop");
await go("/crafters", 3600); await snap("14-crafters");
await go("/crafters/witches"); await click("CAST"); await sleep(300); await snap("15-workshop-cast"); await sleep(1500);
await go("/echo", 3600); await click("take me to the lake"); await sleep(900); await snap("16-echo"); await sleep(3500);
await go("/skyport", 3600); await snap("17-skyport");
await go("/skyport/council"); await snap("18-council");
await go("/skyport/end"); await snap("19-end");
await go("/lake", 3600); await p.evaluate(() => [...document.querySelectorAll(".hud button")].find((x) => x.textContent.trim() === "?")?.click()); await sleep(900); await snap("20-intro"); await p.keyboard.press("Escape"); await sleep(500);
await click("60-second version"); await sleep(900); await snap("20b-sixty");
await p.keyboard.press("Escape");
// phone
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await go("/world", 3800); await snap("21-phone-world");
await go("/line/leg3"); await snap("22-phone-line");
await go("/ring/apothecary"); await snap("23-phone-shop");
await b.close(); console.log("done");
