// Runs Talk to Roy's server function on this laptop (Vercel runs it in production).
// Usage: node tools/roy-dev.mjs   → http://localhost:8787/api/roy  (vite dev/preview forward /api here)
// Reads the keys from site/.env.local; never prints them.
import http from "node:http";
import fs from "node:fs";

for (const line of (fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);   // test one provider: --only=gemini or --only=groq
if (only === "gemini") delete process.env.GROQ_API_KEY;
if (only === "groq") delete process.env.GEMINI_API_KEY;
const port = +((process.argv.find((a) => a.startsWith("--port=")) || "").slice(7) || 8787);
let { default: handler } = await import("../api/roy.js");
if (process.argv.includes("--mock")) handler = (req, res) => {   // fake answers, to test the chat window without keys
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(req.method === "GET" ? { ready: true } : { text: "This is a test answer from Roy. The mirror shows both halves of me. [[lake]]", via: "mock" }));
};
http.createServer((req, res) => (req.url.startsWith("/api/roy") ? handler(req, res) : (res.statusCode = 404, res.end())))
  .listen(port, () => console.log(`roy-dev on :${port} · gemini key ${process.env.GEMINI_API_KEY ? "set" : "missing"} · groq key ${process.env.GROQ_API_KEY ? "set" : "missing"}`));
