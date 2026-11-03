import puppeteer from "puppeteer-core";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
const p = await b.newPage(); await p.setViewport({ width: 1672, height: 856 });
await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://127.0.0.1:4173/#/line/depot1", { waitUntil: "networkidle0" }); await sleep(3500);
for (const id of ["depot1", "depot2", "depot3", "depot4", "leg1", "leg3"]) {
  await p.evaluate((h) => { location.hash = "/line/" + h; }, id); await sleep(2600);
  const over = await p.evaluate(() => { const sc = document.querySelector(".ll-scw .sc"); return sc ? sc.scrollHeight - sc.clientHeight : 0; });
  console.log(id, "scroll text overflow px:", over);
  await p.screenshot({ path: `tests/depot-${id}.png` });
}
console.log(errs.length ? errs : "no errors"); await b.close();
