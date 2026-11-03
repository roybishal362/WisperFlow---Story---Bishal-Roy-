// Interaction tests: real clicks through the main flows. Fails on console errors or a wrong destination.
// Usage: node tests/flows.mjs [baseUrl] [--mobile]
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const base = process.argv.find((a) => a.startsWith("http")) || "http://127.0.0.1:4173";
const mobile = process.argv.includes("--mobile");
const out = path.resolve("tests/flows" + (mobile ? "-mobile" : "")); fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport(mobile ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]); // like Bishal's laptop
const problems = [], results = [];
page.on("console", (m) => { if ((m.location()?.url || "").includes("/api/roy")) return; if (["error", "warning"].includes(m.type())) problems.push(`[console.${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));
page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("/api/roy")) problems.push(`[http ${r.status()}] ${r.url()}`); });
const shot = (n) => page.screenshot({ path: path.join(out, n + ".png") });
const hash = () => page.evaluate(() => location.hash);
async function clickText(sel, text) {
  const ok = await page.evaluate((sel, text) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.replace(/\s+/g, " ").includes(text));
    if (!el) return false; el.scrollIntoView?.(); el.click(); return true;
  }, sel, text);
  if (!ok) problems.push(`[missing] ${sel} "${text}"`);
  return ok;
}
async function expect(name, want) { const h = await hash(); const pass = h === want; results.push(`${pass ? "PASS" : "FAIL"} ${name}: ${h}${pass ? "" : " (wanted " + want + ")"}`); if (!pass) problems.push(`[flow] ${name} ended at ${h}, wanted ${want}`); }

await page.goto(base + "/#/", { waitUntil: "networkidle0" });
await page.evaluate(() => localStorage.setItem("vast-realm-v1", JSON.stringify({ visited: [], bag: [], stages: {}, crystals: [], seen: ["city", "line", "lake", "ring", "crafters", "echo", "skyport"] })));
await page.reload({ waitUntil: "networkidle0" }); await sleep(2500);
// 1. title -> world
{ const btns = await page.$$("button"); for (const b of btns) { if ((await b.evaluate((e) => e.textContent)).includes("ENTER THE REALM")) { await b.click(); break; } } }
await sleep(600); await shot("01-wipe"); await sleep(2400); await expect("title enters the world", "#/world");
{ const m = await page.evaluate(() => ({ on: window.__vrMusic?.get().playing, t: window.__vrMusic?.time() }));
  const ok = m.on && m.t > 0.5; results.push(`${ok ? "PASS" : "FAIL"} music starts when you enter (${(m.t || 0).toFixed(1)} s played)`); if (!ok) problems.push("[flow] music did not start"); }
{ await sleep(400); const shown = await page.evaluate(() => !!document.querySelector(".intro")); await shot("01b-intro");
  await clickText("button", "EXPLORE"); await sleep(600); const gone = await page.evaluate(() => !document.querySelector(".intro"));
  results.push(`${shown && gone ? "PASS" : "FAIL"} realm intro shows on first visit and closes`); if (!(shown && gone)) problems.push("[flow] intro card"); }
// 2. click the Lake island -> balloon flight -> lake
if (mobile) { // a real finger: first tap shows the preview card, its button travels
  const box = await page.evaluate(() => { const r = [...document.querySelectorAll(".w-hit")].find((b) => b.getAttribute("aria-label").includes("Lake")).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.touchscreen.tap(box.x, box.y); await sleep(500); await shot("02a-preview");
  await clickText("button", "TRAVEL HERE");
} else await page.evaluate(() => [...document.querySelectorAll(".w-hit")].find((b) => b.getAttribute("aria-label").includes("Lake"))?.click());
await sleep(1000); await shot("02-balloon-midflight");
{ const moved = await page.evaluate(() => { const b = document.querySelector(".w-balloon"); return b ? getComputedStyle(b).transform : "none"; });
  const ok = moved !== "none" && !moved.includes(", 870, 150)") && !moved.includes(", 560, 380)");
  results.push(`${ok ? "PASS" : "FAIL"} balloon is flying mid-trip: ${moved}`); if (!ok) problems.push("[anim] balloon did not fly"); } await sleep(3400); await expect("island travel to the lake", "#/lake");
// 3. click tower III -> fly-in
await page.evaluate(() => document.querySelectorAll(".lk-tw")[2]?.click()); await sleep(450); await shot("03-tower-zoom"); await sleep(1600); await expect("tower click", "#/lake/3");
{ const before = await page.evaluate(() => !!document.querySelector(".lk-card .s2"));
  await clickText("button", "TURN THE MIRROR"); await sleep(1300); await shot("04-tower-mirrored");
  const after = await page.evaluate(() => !!document.querySelector(".lk-card .s2") && !!document.querySelector(".lk-card .s3"));
  results.push(`${!before && after ? "PASS" : "FAIL"} mirror hides the cost until turned (before ${before}, after ${after})`); if (before || !after) problems.push("[flow] mirror reveal"); }
// 4. long line: depot roll-out
await page.evaluate(() => { location.hash = "/line/depot2"; }); await sleep(3200);
await clickText("button", "ROLL OUT");
{ const seen = (sel) => page.waitForFunction((q) => !!document.querySelector(q), { timeout: 2500 }, sel).then(() => true).catch(() => false);
  const sp = await seen(".ll-sparks"); results.push(`${sp ? "PASS" : "FAIL"} depot sparks appear`); if (!sp) problems.push("[anim] no depot sparks");
  const bn = await seen(".ll-banner"); results.push(`${bn ? "PASS" : "FAIL"} engine-upgrade banner appears`); if (!bn) problems.push("[anim] no upgrade banner");
  await shot("07-depot-banner"); }
await sleep(2200); await expect("depot rolls out to the next leg", "#/line/leg3");
await clickText("button", "NEXT STOP"); await sleep(400); await shot("08-train-departing"); await sleep(1500); await expect("next stop", "#/line/depot3");
// 5. lantern ring: enter the front shop, add to bag
await page.evaluate(() => { location.hash = "/ring"; }); await sleep(3200);
await page.keyboard.press("ArrowRight"); await sleep(800);
await clickText("button", "ENTER THE"); await sleep(350); await shot("09-shop-entering"); await sleep(1800);
await expect("enter the front shop", "#/ring/apothecary");
await clickText("button", "ADD TO BAG"); await sleep(600); await shot("10-added-to-bag");
const bag = await page.evaluate(() => JSON.parse(localStorage.getItem("vast-realm-v1") || "{}").bag || []);
results.push(`${bag.includes("apothecary") ? "PASS" : "FAIL"} bag saved: ${JSON.stringify(bag)}`); if (!bag.includes("apothecary")) problems.push("[flow] bag not saved");
// 6. crafters: strike twice
await page.evaluate(() => { location.hash = "/crafters/forge"; }); await sleep(3200);
await clickText("button", "STRIKE THE ANVIL");
{ const bu = await page.waitForFunction(() => document.querySelectorAll(".cr-burst img").length, { timeout: 1500 }).then((h) => h.jsonValue()).catch(() => 0);
  results.push(`${bu ? "PASS" : "FAIL"} forge logo burst (${bu} logos)`); if (!bu) problems.push("[anim] no logo burst"); await shot("11-forge-strike"); } await sleep(1500);
await clickText("button", "STRIKE THE ANVIL"); await sleep(1300);
const st = await page.evaluate(() => (JSON.parse(localStorage.getItem("vast-realm-v1") || "{}").stages || {}).forge);
results.push(`${st === 2 ? "PASS" : "FAIL"} forge stage after two strikes: ${st}`); if (st !== 2) problems.push("[flow] forge stage wrong");
// 7. echo: phrase chip -> lights up -> goes to the lake
await page.evaluate(() => { location.hash = "/echo"; }); await sleep(3200);
await clickText("button", "take me to the lake"); await sleep(700); await shot("12-echo-lit");
{ const lit = await page.evaluate(() => !!document.querySelector(".ec-lit") && !!document.querySelector(".ec-rings")); results.push(`${lit ? "PASS" : "FAIL"} echo cave lights up`); if (!lit) problems.push("[anim] echo did not light"); } await sleep(4200); await expect("echo phrase travels", "#/lake");
// 8. 60-second overlay opens and closes
await clickText("button", "60-second version"); await sleep(600); await shot("13-sixty");
const open = await page.evaluate(() => !!document.querySelector(".sixty")); await page.keyboard.press("Escape"); await sleep(500);
const closed = await page.evaluate(() => !document.querySelector(".sixty"));
results.push(`${open && closed ? "PASS" : "FAIL"} sixty overlay open+close`); if (!(open && closed)) problems.push("[flow] sixty overlay");
// 9. skyport -> council -> end
await page.evaluate(() => { location.hash = "/skyport"; }); await sleep(3200);
await clickText("button", "BOARD THE AIRSHIP"); await sleep(1500); await expect("board the airship", "#/skyport/council");
await clickText("button", "DEPART"); await sleep(1800); await expect("depart", "#/skyport/end"); await shot("14-end");
// 10. world drag turns the ring
await page.evaluate(() => { location.hash = "/world"; }); await sleep(3200);
const before = await page.evaluate(() => [...document.querySelectorAll(".w-isl")].map((e) => e.style.left).join());
const vw = mobile ? 390 : 1440; await page.mouse.move(vw * 0.7, 200); await page.mouse.down(); await page.mouse.move(vw * 0.3, 200, { steps: 12 }); await page.mouse.up(); await sleep(1000);
const after = await page.evaluate(() => [...document.querySelectorAll(".w-isl")].map((e) => e.style.left).join());
results.push(`${before !== after ? "PASS" : "FAIL"} drag turns the world`); if (before === after) problems.push("[flow] drag did nothing");
await shot("15-world-dragged");

console.log(results.join("\n"));
console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nNO PROBLEMS");
await browser.close();
process.exit(problems.length ? 1 : 0);
