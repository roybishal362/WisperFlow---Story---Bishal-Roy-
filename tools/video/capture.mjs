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
  2: { dur: 18, start: "/world", cues: { turn1: 1.5, turn2: 4.5, travel: 10 } },
  3: { dur: 30, start: "/line/leg1", cues: { depot: 8, rollout: 16, sky: 23 } },
  4: { dur: 20, start: "/lake", cues: { tower: 5, mirror: 11 } },
  5: { dur: 22, start: "/ring", cues: { turn: 1.5, enter: 4.5, bag: 9, next: 12.5 } },
  6: { dur: 30, start: "/echo", cues: { crystal1: 9, crystal2: 15, speak: 25 } },
  7: { dur: 25, start: "/skyport", cues: { plan: 9, council: 17 } },
  8: { dur: 12, start: "/skyport/end", cues: {} },
};

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new",
  args: ["--no-sandbox", "--force-device-scale-factor=1", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(base + "/#/", { waitUntil: "networkidle0" });
// clean state, intros already seen (the video shows the realms, not the welcome cards)
await page.evaluate((all) => { localStorage.setItem("vast-realm-v1", JSON.stringify({ visited: [], bag: [], stages: {}, crystals: [], seen: all })); localStorage.setItem("vast-realm-motion", "on"); }, ALL);
await page.reload({ waitUntil: "networkidle0" });
const hideDialogue = () => page.addStyleTag({ content: ".dlg{display:none !important}" });
await hideDialogue();
const hash = (h) => page.evaluate((x) => { location.hash = x; }, h);
const click = (text) => page.evaluate((t) => [...document.querySelectorAll("button")].find((x) => x.textContent.includes(t))?.click(), text);
const clickSel = (sel, i = 0) => page.evaluate((s, i) => document.querySelectorAll(s)[i]?.click(), sel, i);

// warm every realm's paintings so nothing pops in on camera
for (const h of ["/world", "/city", "/line/leg1", "/line/depot2", "/line/leg3", "/line/leg5", "/lake", "/lake/2", "/ring", "/ring/oracle", "/ring/apothecary", "/crafters/forge", "/echo", "/skyport", "/skyport/plan/1", "/skyport/council", "/skyport/end"]) { await hash(h); await sleep(2600); }

const ACTIONS = {
  1: { enter: () => click("ENTER THE REALM") },
  2: { turn1: () => page.keyboard.press("ArrowRight"), turn2: () => page.keyboard.press("ArrowRight"),
       travel: () => page.evaluate(() => [...document.querySelectorAll(".w-hit")].find((b) => b.getAttribute("aria-label").includes("Long Line"))?.click()) },
  3: { depot: () => hash("/line/depot2"), rollout: () => click("ROLL OUT"), sky: () => hash("/line/leg5") },
  4: { tower: () => clickSel(".lk-tw", 1), mirror: () => click("TURN THE MIRROR") },
  5: { turn: () => page.evaluate(() => [...document.querySelectorAll(".lr-shop button")].find((b) => b.getAttribute("aria-label").includes("Oracle"))?.click()),
       enter: () => click("ENTER THE ORACLE"), bag: () => click("ADD TO BAG"), next: () => click("NEXT SHOP") },
  6: { crystal1: () => clickSel(".ec-list button", 0), crystal2: () => clickSel(".ec-list button", 1), speak: () => click("the skyport") },
  7: { plan: () => clickSel(".sp-route", 0), council: () => hash("/skyport/council") },
  8: {},
};

for (const [n, def] of Object.entries(PARTS)) {
  if (only && only !== n) continue;
  const t = T[n] || {}; const dur = t.dur || def.dur; const cues = { ...def.cues, ...(t.cues || {}) };
  // set the starting screen off-camera
  if (n === "1") { await page.evaluate(() => { location.hash = "/"; }); await page.reload({ waitUntil: "networkidle0" }); await hideDialogue(); await sleep(4500); }
  else { await hash(def.start); await sleep(3600); }
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
