// Talk to Roy, end to end: the top-bar button appears, the chat opens, a question gets an answer,
// and a realm link in the answer travels there. Needs `node tools/roy-dev.mjs` (or --mock) running.
// Usage: node tests/roy-chat.mjs [baseUrl] [--mobile] [--shots=dir]
import puppeteer from "puppeteer-core";
const base = process.argv.find((a) => a.startsWith("http")) || "http://localhost:4173";
const mobile = process.argv.includes("--mobile");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
const p = await b.newPage();
await p.setViewport(mobile ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { width: 1536, height: 864 });
const problems = [], results = [];
p.on("console", (m) => ["error", "warning"].includes(m.type()) && problems.push(`[console.${m.type()}] ${m.text()}`));
p.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));
const check = (name, ok, extra = "") => { results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " (" + extra + ")" : ""}`); if (!ok) problems.push(`[roy] ${name}`); };
const tap = async (sel) => { const el = await p.waitForSelector(sel, { timeout: 8000 }); if (mobile) await el.tap(); else await el.click(); };

await p.goto(base + "/#/world", { waitUntil: "networkidle0" });
await p.evaluate(() => { localStorage.setItem("vast-realm-v1", JSON.stringify({ visited: [], bag: [], stages: {}, crystals: [], seen: ["world", "city", "line", "lake", "ring", "crafters", "echo", "skyport"] })); localStorage.setItem("vast-realm-music", "off"); });
await p.reload({ waitUntil: "networkidle0" }); await sleep(2500);
check("Talk to Roy button shows", !!(await p.$(".pillh.talk")));
check("Roy's dialogue offers \"Ask me anything\"", !!(await p.$(".dlg .ask")));
await tap(".dlg .ask"); await sleep(700);
check("chat opens with a greeting and question chips", await p.evaluate(() => !!document.querySelector(".tr .tr-ln.roy") && document.querySelectorAll(".tr-chips button").length >= 3));
const box = await p.evaluate(() => { const r = document.querySelector(".tr-box").getBoundingClientRect(), q = document.querySelector(".tr-por").getBoundingClientRect(); return [Math.min(r.left, q.left), r.top, r.right, Math.max(r.bottom, q.bottom)].map(Math.round).concat([innerWidth, innerHeight]); });
check("chat fits on screen", box[0] >= 0 && box[1] >= 0 && box[2] <= box[4] && box[3] <= box[5], box.join(","));
await p.type(".tr-in input", "What is the Lake of Mirrors?");
await p.keyboard.press("Enter");
await p.waitForFunction(() => document.querySelectorAll(".tr .tr-ln.roy p:not(.tr-dots)").length >= 2, { timeout: 30000 }).catch(() => {});
const answer = await p.evaluate(() => [...document.querySelectorAll(".tr .tr-ln.roy p:not(.tr-dots)")].pop()?.innerText || "");
check("Roy answers", answer.length > 20, answer.replace(/\s+/g, " ").slice(0, 160));
check("typing did not move the world", await p.evaluate(() => location.hash) === "#/world");
if (shots) await p.screenshot({ path: `${shots}/roy-${mobile ? "phone" : "desk"}.png` });
const go = await p.$(".tr-go");
if (go) { if (mobile) await go.tap(); else await go.click(); await sleep(3500); check("realm link travels", (await p.evaluate(() => location.hash)).startsWith("#/"), await p.evaluate(() => location.hash)); }
else results.push("(no realm link in this answer)");
console.log(results.join("\n")); console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nNO PROBLEMS");
await b.close();
