// Test robot: drives headless Edge through the site, records console errors and failed requests, saves screenshots.
// Usage: node tests/robot.mjs [baseUrl] [--mobile] [--only=prefix]
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const base = process.argv.find((a) => a.startsWith("http")) || "http://127.0.0.1:4173";
const mobile = process.argv.includes("--mobile");
const size = (process.argv.find((a) => a.startsWith("--size=")) || "").slice(7);
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);
const out = path.resolve("tests/shots" + (mobile ? "-mobile" : size ? "-" + size : ""));
fs.mkdirSync(out, { recursive: true });

const STEPS = [
  ["01-title", "#/"],
  ["02-world", "#/world"],
  ["03-world-turned", "#/world", async (p) => { await p.keyboard.press("ArrowRight"); await sleep(900); }],
  ["04-city", "#/city"], ["05-city-ring4", "#/city/4"], ["06-city-ring7", "#/city/7"],
  ["07-line-leg1", "#/line"], ["08-line-depot2", "#/line/depot2"], ["09-line-leg5", "#/line/leg5"], ["10-line-signal", "#/line/signal"],
  ["11-lake", "#/lake"], ["12-lake-t3", "#/lake/3"], ["13-lake-mirror", "#/lake/mirror"],
  ["14-ring", "#/ring"], ["15-ring-shop", "#/ring/teahouse"],
  ["16-crafters", "#/crafters"], ["17-crafters-alch", "#/crafters/alchemist"],
  ["18-echo", "#/echo"],
  ["19-sky", "#/skyport"], ["20-sky-plan", "#/skyport/plan/2"], ["21-sky-council", "#/skyport/council"], ["22-sky-end", "#/skyport/end"],
  ["23-intro-card", "#/lake", async (p) => { await p.evaluate(() => [...document.querySelectorAll(".hud button")].find((b) => b.textContent.trim() === "?")?.click()); await sleep(800); }],
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
const [sw, sh] = size ? size.split("x").map(Number) : [1440, 900];
await page.setViewport(mobile ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: sw, height: sh });
// like Bishal's laptop (Windows animation effects off): the site must still animate and lay out correctly
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
const problems = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`[console.${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => problems.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));
page.on("response", (r) => { if (r.status() >= 400) problems.push(`[http ${r.status()}] ${r.url()}`); });

await page.goto(base + "/#/", { waitUntil: "networkidle0" });
await page.evaluate(() => localStorage.setItem("vast-realm-v1", JSON.stringify({ visited: [], bag: [], stages: {}, crystals: [], seen: ["world", "city", "line", "lake", "ring", "crafters", "echo", "skyport"] })));
await page.reload({ waitUntil: "networkidle0" });
for (const [name, hash, act] of STEPS) {
  if (only && !name.startsWith(only)) continue;
  await page.evaluate((h) => { window.location.hash = h.slice(1); }, hash);
  await sleep(2900); // cloud wipe + scene entrance
  if (act) await act(page);
  const bad = await page.evaluate(() => {
    const W = innerWidth, H = innerHeight, out = [];
    for (const e of document.querySelectorAll(".scene .panel, .scene .dlg, .scene .ll-tkw, .scene .ll-scw, .scene .lr-card, .scene .sp-scw, .scene .btn")) {
      const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).visibility === "hidden") continue;
      if (r.left < -4 || r.top < -4 || r.right > W + 4 || r.bottom > H + 4) out.push(`${e.className.toString().slice(0, 40)} @ ${[r.left, r.top, r.right, r.bottom].map(Math.round)}`);
    }
    return out;
  });
  bad.forEach((b) => problems.push(`[offscreen] ${name}: ${b}`));
  await page.screenshot({ path: path.join(out, name + ".png") });
  process.stdout.write(".");
}
console.log("\n" + (problems.length ? problems.join("\n") : "NO PROBLEMS"));
await browser.close();
process.exit(problems.length ? 1 : 0);
