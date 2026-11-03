// Talk to Roy: Roy's dialogue box grows into a conversation. An AI answers on the server (api/roy.js),
// using only the facts in this world. Visitors can type or, in Chrome and Edge, tap the mic and speak.
// Roy can point to a realm with a [[realm]] link, which becomes a gold "Take me there" button.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { go, roy } from "../lib/core";
import { music } from "../lib/music";
import { Btn } from "./Ui";
import { REALMS, ROYCHAT } from "../content";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const PLACES = { world: { name: "the world map", route: "/world" }, ...Object.fromEntries(REALMS.map((r) => [r.id, { name: r.name, route: r.route }])) };

function Line({ m, onGo }) {
  if (m.role === "user") return <div className="tr-ln you"><b>YOU</b><p>{m.text}</p></div>;
  const parts = m.text.split(/\[\[(\w+)\]\]/);
  const words = parts.filter((_, i) => i % 2 === 0).join(" ").replace(/\s+\n/g, "\n").trim();
  const place = parts.filter((p, i) => i % 2 && PLACES[p]).map((p) => PLACES[p])[0];
  return (
    <div className="tr-ln roy"><b>ROY</b><p>{words}</p>
      {place && <Btn className="tr-go" onClick={() => onGo(place.route)}>✦ Take me to {place.name}</Btn>}
    </div>
  );
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
  const face = listening ? "surprised" : busy ? "thinking" : "happy";

  return (
    <motion.div className="tr" role="dialog" aria-label="Talk to Roy" style={{ x: "-50%" }}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      <div className="tr-box">
        <div className="name">ROY</div>
        <div className="tr-head">TALK TO ROY <span>· {ROYCHAT.sub}</span></div>
        <button type="button" className="tr-x" onClick={onClose} aria-label="Close the conversation">✕</button>
        <div className="tr-list" ref={list}>
          {msgs.map((m, i) => <Line key={i} m={m} onGo={travel} />)}
          {busy && <div className="tr-ln roy"><b>ROY</b><p className="tr-dots"><i>◆</i><i>◆</i><i>◆</i></p></div>}
          {msgs.length === 1 && <div className="tr-chips">{ROYCHAT.chips.map((c) => <button key={c} type="button" onClick={() => ask(c)}>{c}</button>)}</div>}
        </div>
        <form className="tr-in" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
          {SR && <button type="button" className={"ico tr-mic" + (listening ? " on" : "")} onClick={listen} aria-label="Speak your question" title="Speak your question">🎙</button>}
          <input ref={input} value={text} maxLength={600} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.stopPropagation()}
            placeholder={listening ? "Listening… speak now" : "Ask me anything about my story…"} aria-label="Your question" />
          <button type="submit" className="btn tr-send" disabled={!text.trim() || busy}>ASK ›</button>
        </form>
        <div className="tr-note">{ROYCHAT.note}</div>
      </div>
      <div className="tr-por" style={{ backgroundImage: `url(${roy(face)})` }} />
    </motion.div>
  );
}
