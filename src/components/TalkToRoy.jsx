// Talk to Roy: chat with Bishal's tiny guide. An AI answers on the server (api/roy.js), using only the facts in this world.
// Visitors can type or, in Chrome and Edge, hold the mic and speak. Roy can point to a realm with a [[realm]] link.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { art, go } from "../lib/core";
import { music } from "../lib/music";
import { REALMS, ROYCHAT } from "../content";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const PLACES = { world: { name: "the world map", route: "/world" }, ...Object.fromEntries(REALMS.map((r) => [r.id, { name: r.name, route: r.route }])) };

let readyCheck = null;   // asked once per visit: is the AI switched on?
export const royReady = () => (readyCheck ||= fetch("/api/roy").then((r) => (r.ok ? r.json() : { ready: false })).then((j) => !!j.ready).catch(() => false));

function Reply({ text, onGo }) {
  const parts = text.split(/\[\[(\w+)\]\]/);
  return parts.map((p, i) => (i % 2
    ? PLACES[p] && <button key={i} type="button" className="tr-go" onClick={() => onGo(PLACES[p].route)}>Take me to {PLACES[p].name} ›</button>
    : <span key={i}>{p.trim()}</span>));
}

export default function TalkToRoy({ onClose }) {
  const [msgs, setMsgs] = useState([{ role: "roy", text: ROYCHAT.hello }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const list = useRef(null), input = useRef(null), rec = useRef(null), alive = useRef(true);

  useEffect(() => { list.current?.scrollTo({ top: 1e6, behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => {   // open and close once: the chat stays "alive" until it really closes
    alive.current = true; input.current?.focus();
    return () => { alive.current = false; try { rec.current?.abort(); } catch { /* not listening */ } music.duck(false); };
  }, []);
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", esc, true);
    return () => window.removeEventListener("keydown", esc, true);
  }, [onClose]);

  async function ask(q) {
    q = q.trim().slice(0, 600);
    if (!q || busy) return;
    const next = [...msgs, { role: "user", text: q }];
    setMsgs(next); setText(""); setBusy(true);
    let reply = ROYCHAT.down;
    try {
      const r = await fetch("/api/roy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(1).slice(-12) }) });
      const j = await r.json().catch(() => ({}));
      reply = r.ok && j.text ? j.text : j.error || ROYCHAT.down;
    } catch { /* offline: keep the friendly message */ }
    if (!alive.current) return;
    setMsgs((m) => [...m, { role: "roy", text: reply }]); setBusy(false);
  }
  function listen() {
    if (!SR || listening || busy) return;
    try {
      const r = new SR(); rec.current = r;
      r.lang = "en-IN"; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = (e) => { const t = e.results?.[0]?.[0]?.transcript || ""; if (t) ask(t); };
      r.onend = () => { music.duck(false); if (alive.current) setListening(false); };
      r.onerror = () => { music.duck(false); if (alive.current) setListening(false); };
      music.duck(true); r.start(); setListening(true);
    } catch { music.duck(false); setListening(false); }
  }
  const travel = (route) => { onClose(); go(route); };

  return (
    <motion.div className="panel tr" role="dialog" aria-label="Talk to Roy" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.22 }}>
      <div className="tr-top">
        <i style={{ backgroundImage: `url(${art("00-roy-and-ui/roy-happy")})` }} />
        <div><div className="ptitle">Talk to Roy</div><span>{ROYCHAT.sub}</span></div>
        <button type="button" className="tr-x" onClick={onClose} aria-label="Close the chat">✕</button>
      </div>
      <div className="tr-list" ref={list}>
        {msgs.map((m, i) => (
          <div key={i} className={"tr-m " + m.role}>{m.role === "roy" ? <Reply text={m.text} onGo={travel} /> : m.text}</div>
        ))}
        {busy && <div className="tr-m roy tr-typing"><b /><b /><b /></div>}
        {msgs.length === 1 && (
          <div className="tr-chips">{ROYCHAT.chips.map((c) => <button key={c} type="button" onClick={() => ask(c)}>{c}</button>)}</div>
        )}
      </div>
      <form className="tr-in" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
        {SR && <button type="button" className={"tr-mic" + (listening ? " on" : "")} onClick={listen} aria-label="Speak your question" title="Speak your question">🎙</button>}
        <input ref={input} value={text} maxLength={600} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.stopPropagation()}
          placeholder={listening ? "Listening…" : "Ask me anything…"} aria-label="Your question" />
        <button type="submit" className="tr-send" disabled={!text.trim() || busy} aria-label="Send">➤</button>
      </form>
      <div className="tr-note">{ROYCHAT.note}</div>
    </motion.div>
  );
}
