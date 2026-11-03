// Records each part of the video script as a full-HD clip from the site, with the clicks timed.
// Usage: node tools/video/capture.mjs [baseUrl] [--timing=path/to/timing.json] [--only=3]
// timing.json (written by edit.py from your voice): { "1": { "dur": 15.2, "cues": { "enter": 10.1 } }, ... }
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const base = process.argv.find((a) => a.startsWith("http")) || "https://wisper-flow-story-bishal-roy.vercel.app";
const timingFile = (process.argv.find((a) => a.startsWith("--timing=")) || "").slice(9);
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);
const OUT = path.resolve("../video/clips"); fs.mkdirSync(OUT, { recursive: true });
const FFMPEG = "C:/Users/Bishal Roy/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe";
const T = timingFile ? JSON.parse(fs.readFileSync(timingFile, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ALL = ["world", "city", "line", "lake", "ring", "crafters", "echo", "skyport"];

// default part lengths (seconds) and cue points, used until the real voice timing exists
const PARTS = {
  1: { dur: 15, start: "/", cues: { enter: 10.5 } },
  2: { dur: 13, start: "/world", cues: { turn1: 1.5, turn2: 4.5, travel: 8 } },
  3: { dur: 24, start: "/line/leg1", cues: { depot: 6, rollout: 13, sky: 16 } },
  4: { dur: 34, start: "/lake", cues: { tower: 12, mirror: 16, lakeflip: 29 } },
  5: { dur: 24, start: "/ring", cues: { turn: 1.5, enter: 4.5, bag: 8, next: 13, plaza: 17, spin1: 18.3, spin2: 19.2, spin3: 20.1 } },
  6: { dur: 26, start: "/crafters", cues: { w1: 8, w2: 10, w3: 12, w4: 14, w5: 16, forge: 21, strike: 22.5, strike2: 25 } },
  7: { dur: 21, start: "/world", cues: { turn: 1, turn2: 4, travel: 9, crown: 17 } },
  8: { dur: 18, start: "/echo", cues: { crystal1: 8, speak: 13 } },
  9: { dur: 38, start: "/skyport", cues: { plan1: 15, plan2: 22, plan3: 29 } },
  10: { dur: 12, start: "/skyport/council", cues: { depart: 6 } },
};

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new",
  args: ["--no-sandbox", "--force-device-scale-factor=1", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(base + "/#/", { waitUntil: "networkidle0" });
// clean state, intros already seen (the video shows the realms, not the welcome cards)
await page.evaluate((all) => { localStorage.setItem("vast-realm-v1", JSON.stringify({ visited: [], bag: [], stages: {}, crystals: [], seen: all })); localStorage.setItem("vast-realm-motion", "on"); localStorage.setItem("vast-realm-music", "off"); }, ALL);
await page.reload({ waitUntil: "networkidle0" });
const hideDialogue = () => page.addStyleTag({ content: ".dlg{display:none !important}" });
await hideDialogue();
const hash = (h) => page.evaluate((x) => { location.hash = x; }, h);
const click = (text) => page.evaluate((t) => [...document.querySelectorAll("button")].find((x) => x.textContent.includes(t))?.click(), text);
const clickSel = (sel, i = 0) => page.evaluate((s, i) => document.querySelectorAll(s)[i]?.click(), sel, i);

// warm every realm's paintings so nothing pops in on camera
for (const h of ["/lake/1", "/lake/3", "/lake/4", "/lake/5", "/lake/6", "/lake/7", "/lake/8", "/crafters/alchemist", "/crafters/witches", "/crafters/elves", "/crafters/bards", "/city/7", "/world", "/city", "/line/leg1", "/line/depot2", "/line/leg3", "/line/leg5", "/lake", "/lake/2", "/ring", "/ring/oracle", "/ring/apothecary", "/crafters", "/crafters/forge", "/echo", "/skyport", "/skyport/plan/1", "/skyport/plan/2", "/skyport/plan/3", "/skyport/council", "/skyport/end"]) { await hash(h); await sleep(2600); }

const ACTIONS = {
  1: { enter: () => click("ENTER THE REALM") },
  2: { turn1: () => page.keyboard.press("ArrowRight"), turn2: () => page.keyboard.press("ArrowRight"),
       travel: () => page.evaluate(() => [...document.querySelectorAll(".w-hit")].find((b) => b.getAttribute("aria-label").includes("Long Line"))?.click()) },
  3: { depot: () => hash("/line/depot2"), rollout: () => click("ROLL OUT"), sky: () => hash("/line/leg5") },
  4: { tower: () => clickSel(".lk-tw", 2), mirror: () => click("TURN THE MIRROR"), lakeflip: () => hash("/lake/mirror"), golden: () => hash("/lake") },
  5: { turn: () => page.evaluate(() => [...document.querySelectorAll(".lr-shop button")].find((b) => b.getAttribute("aria-label").includes("Oracle"))?.click()),
       enter: () => click("ENTER THE ORACLE"), bag: () => click("ADD TO BAG"), next: () => click("NEXT SHOP"),
       plaza: () => hash("/ring"), spin1: () => page.keyboard.press("ArrowRight"), spin2: () => page.keyboard.press("ArrowRight"), spin3: () => page.keyboard.press("ArrowRight") },
  6: { w1: () => hash("/crafters/forge"), w2: () => hash("/crafters/alchemist"), w3: () => hash("/crafters/witches"), w4: () => hash("/crafters/elves"), w5: () => hash("/crafters/bards"),
       forge: () => hash("/crafters/forge"),
       strike: () => click("STRIKE THE ANVIL"), strike2: () => click("STRIKE THE ANVIL") },
  7: { turn: () => page.keyboard.press("ArrowRight"), turn2: () => page.keyboard.press("ArrowRight"),
       travel: () => page.evaluate(() => [...document.querySelectorAll(".w-hit")].find((b) => b.getAttribute("aria-label").includes("Vast City"))?.click()),
       crown: () => hash("/city/7") },
  8: { crystal1: () => clickSel(".ec-list button", 0), speak: () => click("the skyport") },
  9: { plan1: () => clickSel(".sp-route", 0), plan2: () => hash("/skyport/plan/2"), plan3: () => hash("/skyport/plan/3") },
  10: { depart: () => hash("/skyport/end") },
};

for (const [n, def] of Object.entries(PARTS)) {
  if (only && only !== n) continue;
  const t = T[n] || {}; const dur = t.dur || def.dur; const cues = t.cues ? { ...t.cues } : { ...def.cues };   // with real voice timing, only the cues it found
  // set the starting screen off-camera
  if (n === "1") { await page.evaluate(() => { location.hash = "/"; }); await page.reload({ waitUntil: "networkidle0" }); await hideDialogue(); await sleep(4500); }
  else { await hash(def.start); await sleep(3600); }
  if (n === "6") await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("vast-realm-v1")); s.stages = {}; localStorage.setItem("vast-realm-v1", JSON.stringify(s)); });
  if (n === "5") { await page.keyboard.press("ArrowRight"); await sleep(900); } // face away from the Oracle, so the turn to it shows on camera
  const file = path.join(OUT, `part${n}.webm`);
  const rec = await page.screencast({ path: file, ffmpegPath: FFMPEG, fps: 30, quality: 18 });
  const t0 = Date.now();
  const queue = Object.entries(cues).sort((a, b) => a[1] - b[1]);
  for (const [name, at] of queue) {
    const wait = at * 1000 - (Date.now() - t0); if (wait > 0) await sleep(wait);
    try { await ACTIONS[n][name]?.(); } catch (e) { console.log("cue failed", n, name, e.message); }
  }
  const rest = dur * 1000 - (Date.now() - t0); if (rest > 0) await sleep(rest);
  await rec.stop();
  console.log(`part ${n}: ${dur}s -> ${path.basename(file)}`);
}
await browser.close();
