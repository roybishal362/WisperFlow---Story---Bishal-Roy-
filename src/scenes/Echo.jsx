// The Echo Caves: proof of voice. Crystals hold sentences Bishal really dictated (via Wispr Flow) while building this world.
// Visitors can speak too: say a realm's name and the cave lights up and sends you there.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { Dialogue, Region, Btn } from "../components/Ui";
import { art, go, wait } from "../lib/core";
import { ECHO, REALMS } from "../content";
import "./Echo.css";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
function match(text) {
  const t = text.toLowerCase();
  for (const [id, words] of Object.entries(ECHO.keywords)) if (words.some((w) => t.includes(w))) return REALMS.find((r) => r.id === id);
  return null;
}

export default function Echo() {
  const [lit, setLit] = useState(false);
  const [heard, setHeard] = useState(null);
  const [listening, setListening] = useState(false);
  const [sel, setSel] = useState(2);
  const rec = useRef(null), alive = useRef(true);
  useEffect(() => () => { alive.current = false; try { rec.current?.abort(); } catch { /* not running */ } }, []);

  const answer = async (text) => {
    setHeard(text); setLit(true);
    const r = match(text);
    await wait(1900);
    if (!alive.current) return;
    if (r && r.id !== "echo") go(r.route); else { setLit(false); }
  };
  const start = () => {
    if (!SR || listening) return;
    try {
      const r = new SR(); rec.current = r;
      r.lang = "en-IN"; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = (e) => { const t = e.results?.[0]?.[0]?.transcript || ""; if (t) answer(t); };
      r.onend = () => alive.current && setListening(false);
      r.onerror = () => alive.current && setListening(false);
      r.start(); setListening(true); setHeard(null);
    } catch { setListening(false); }
  };
  const stop = () => { try { rec.current?.stop(); } catch { /* already stopped */ } };
  const stats = ECHO.stats.filter((s) => s.v);
  const c = ECHO.crystals[sel], cr = REALMS.find((r) => r.id === c.realm);

  return (
    <>
      <Living src={art("07-echo-caves/bg-echo-idle")} amount={12} />
      <AnimatePresence>{lit && <motion.div className="ec-lit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}><Living src={art("07-echo-caves/bg-echo-lit")} amount={12} /></motion.div>}</AnimatePresence>
      <Particles kind="crystals" density={lit ? 1.6 : 0.8} />
      {lit && <div className="ec-rings">{[0, 1, 2, 3].map((k) => <i key={k} style={{ animationDelay: `${k * 0.25}s` }} />)}</div>}
      <div className="shade-top" style={{ top: -200, height: 420 }} />
      <Region title="THE ECHO CAVES" sub={lit ? "you spoke · the cave answers" : "every crystal is a sentence I said out loud"} />
      {stats.length > 0 && (
        <div className="ec-stats">{stats.map((s) => <div key={s.l} className="panel ec-st"><b>{s.v}</b><span>{s.l}</span></div>)}</div>
      )}
      <motion.div className="panel ec-crystal" key={sel} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="k" style={{ color: "#7ef0f4" }}>CRYSTAL · {cr.name.toUpperCase()}</div>
        <q>{c.text}</q>
        <div className="src">Spoken by Bishal through Wispr Flow while building this world (word for word, as dictated).</div>
      </motion.div>
      <div className="panel ec-list">
        {ECHO.crystals.map((x, j) => { const r = REALMS.find((y) => y.id === x.realm); return (
          <button type="button" key={x.realm} className={j === sel ? "on" : ""} onClick={() => setSel(j)}>💎 {r.name}</button>); })}
      </div>
      <div className="ec-mic">
        {heard && <motion.div className="panel ec-heard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className="k" style={{ color: "#7ef0f4" }}>I HEARD</div><q>"{heard}"</q></motion.div>}
        {SR ? (
          <button type="button" className={"ec-btn" + (listening ? " on" : "")} onPointerDown={start} onPointerUp={stop} onPointerLeave={() => listening && stop()}
            onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); start(); } }} onKeyUp={(e) => (e.key === " " || e.key === "Enter") && stop()}
            aria-label="Hold to speak">🎙</button>
        ) : null}
        <div className="ec-hint">{SR ? (listening ? "Listening… say a realm, like \"take me to the lake\"" : "Hold to speak, and the cave answers") : "Voice needs Chrome or Edge. Tap a phrase instead:"}</div>
        <div className="ec-try">
          {["take me to the lake", "show me the shops", "the train journey", "the skyport"].map((p) => <Btn key={p} dark className="sm" onClick={() => answer(p)}>"{p}"</Btn>)}
        </div>
      </div>
      <Dialogue expr={lit ? "surprised" : "happy"} text={lit ? (heard && match(heard) && match(heard).id !== "echo" ? `You talked to the cave! Hold on, I'm taking you to ${match(heard).name}.` : "The cave heard you, but that isn't a realm I know. Try the lake, the shops or the train.")
        : "This whole world was built by talking. Hold the crystal and say a realm's name, and watch the cave answer."} />
    </>
  );
}
