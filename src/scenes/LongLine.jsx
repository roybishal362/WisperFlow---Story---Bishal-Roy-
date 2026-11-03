// The Long Line: the journey as a train. Legs (stations + tickets), depots (what broke, what I rebuilt, engine change), one red signal.
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { Dialogue, Region, Btn } from "../components/Ui";
import { art, go, reducedMotion, wait } from "../lib/core";
import { LINE, ENGINES } from "../content";
import "./LongLine.css";

const eng = (id) => art("03-long-line/engine2-" + id);

function EngineBar({ cur, upgrading }) {
  return (
    <div className="panel ll-bar">
      {ENGINES.map((e, i) => (
        <div key={e.id} className="ll-bar-row">
          <div className={"ll-leg " + (i === cur ? "on" : i < cur ? "done" : "off") + (upgrading === i ? " glow" : "")}>
            <div className="e"><img src={eng(e.id)} alt="" /></div><b>LEG {e.label}</b><span>{e.place}</span>
          </div>
          {i < 4 && <div className={"ll-dep" + (i < cur ? " done" : "")}><i>⚒</i></div>}
        </div>
      ))}
    </div>
  );
}

function Ticket({ t }) {
  return (
    <motion.div className="ll-tkw" initial={{ opacity: 0, rotate: 6, y: 30 }} animate={{ opacity: 1, rotate: 1.4, y: 0 }} transition={{ duration: 0.55, delay: 0.35 }}>
      <img src={art("00-roy-and-ui/ui-ticket")} alt="" />
      <div className="tk">
        <div className="h"><span>THE LONG LINE RAILWAY</span><span>LEG {t.n} OF V</span></div>
        <h2>{t.from} → {t.to}</h2>
        <div className="r"><div><b>CLASS</b>{t.cls}</div><div><b>YEARS</b>{t.yrs}</div><div><b>PASSENGER</b>Bishal Roy</div></div>
        <p>{t.brief}</p>
      </div>
      <motion.div className="stamp" initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 0.85 }} transition={{ delay: 0.95, duration: 0.25 }}>PUNCHED</motion.div>
    </motion.div>
  );
}

export default function LongLine({ route }) {
  const id = route.sub[0] || "leg1";
  const idx = Math.max(0, LINE.findIndex((s) => s.id === id));
  const st = LINE[idx];
  const [fx, setFx] = useState(null); // depot roll-out sequence: "sparks" | "flash" | "banner"
  const [dir, setDir] = useState(1);

  const next = useCallback(() => {
    setDir(1);
    if (idx < LINE.length - 1) go("/line/" + LINE[idx + 1].id); else go("/skyport");
  }, [idx]);
  const prev = useCallback(() => {
    setDir(-1);
    if (idx > 0) go("/line/" + LINE[idx - 1].id); else go("/world");
  }, [idx]);

  const rollOut = useCallback(async () => {
    if (fx) return;
    if (reducedMotion()) { next(); return; }
    setFx("sparks"); await wait(950);
    setFx("flash"); await wait(450);
    setFx("banner"); await wait(1500);
    setFx(null); next();
  }, [fx, next]);

  useEffect(() => { setFx(null); }, [id]);
  useEffect(() => {
    const k = (e) => {
      if (fx) return;
      if (e.key === "ArrowRight") { if (st.kind === "depot") rollOut(); else next(); }
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [st, fx, next, prev, rollOut]);

  const cur = st.kind === "leg" ? st.leg : st.kind === "depot" ? (fx === "banner" ? st.to : st.from) : 3;
  return (
    <div className={"ll ll-" + st.kind + (fx === "sparks" ? " shake" : "")}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.div key={st.id} className="ll-bg" custom={dir}
          variants={{ in: (d) => ({ x: d * 320, opacity: 0 }), show: { x: 0, opacity: 1 }, out: (d) => ({ x: d * -320, opacity: 0 }) }}
          initial="in" animate="show" exit="out" transition={{ duration: 0.85, ease: [0.5, 0, 0.3, 1] }}>
          <Living src={art("03-long-line/" + st.art)} amount={12} filter={st.kind === "signal" ? "saturate(.8) brightness(.8)" : undefined} />
        </motion.div>
      </AnimatePresence>
      {st.kind === "depot" && <Particles kind="embers" density={0.5} />}
      {st.kind === "leg" && <Particles kind="motes" density={0.4} />}
      <div className="shade-top" style={{ top: -200, height: 420 }} />
      <EngineBar cur={cur} upgrading={fx === "banner" ? st.to : null} />

      <AnimatePresence mode="wait">
        <motion.div key={st.id} className="ll-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {st.kind === "leg" && <Leg st={st} />}
          {st.kind === "depot" && <Depot st={st} fx={fx} onRoll={rollOut} />}
          {st.kind === "signal" && <Signal st={st} onGo={next} />}
        </motion.div>
      </AnimatePresence>

      {st.kind !== "signal" && (
        <div className="navbtns ll-nav">
          <Btn dark className="sm" onClick={prev} disabled={!!fx}>◀ {idx === 0 ? "THE WORLD" : "PREVIOUS"}</Btn>
          {st.kind === "leg" && <Btn className="sm" onClick={next}>{idx === LINE.length - 1 ? "ON TO THE SKYPORT ✈" : "NEXT STOP ▶"}</Btn>}
        </div>
      )}
      <AnimatePresence>{fx === "flash" && <motion.div className="flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />}</AnimatePresence>
      <Dialogue key={st.id} expr={st.expr} text={fx === "banner" ? "Better than before. That's the only rule of the depot." : st.roy} />
    </div>
  );
}

function Leg({ st }) {
  return (
    <>
      <motion.div className="panel ll-stop" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
        <div className="k">{st.k}</div>
        <h3>{st.h}</h3>
        <div className="s">{st.s}</div>
        <p>{st.p}</p>
        <div className="chips">{st.chips.map(([a, b]) => <div className="chip" key={a}>{a}<small>{b}</small></div>)}</div>
        {st.lesson && <div className="lesson">"{st.lesson}"</div>}
      </motion.div>
      <Ticket t={st.ticket} />
    </>
  );
}

function Depot({ st, fx, onRoll }) {
  const from = ENGINES[st.from], to = ENGINES[st.to];
  return (
    <>
      <div className="ll-warm" />
      <Region title={st.title} sub="⚒ the train stops" style={{ top: 138 }} className="ll-dregion" />
      <motion.div className="ll-scw" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.55 }}>
        <img src={art("00-roy-and-ui/ui-parchment")} alt="" />
        <div className="sc">
          <h4>WHAT HAPPENED</h4><p>{st.story}</p>
          <h4>HOW I CAME BACK</h4><p>{st.turn}</p>
          <div className="t">TIME IN THE DEPOT · {st.time.toUpperCase()}</div>
        </div>
      </motion.div>
      <motion.div className="panel ll-up" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
        ENGINE UPGRADE<b>{from.label.split("· ")[1]} → {to.label.split("· ")[1]}</b>
        <div className="ll-eng"><img src={eng(from.id)} alt="" className={fx === "banner" ? "gone" : ""} /><span>➜</span><img src={eng(to.id)} alt="" className={fx === "banner" ? "lit" : "dim"} /></div>
        <Btn onClick={onRoll} disabled={!!fx}>{fx ? "⚙ WORKING…" : "ROLL OUT ▶"}</Btn>
      </motion.div>
      <AnimatePresence>
        {fx === "sparks" && <motion.div className="ll-sparks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ "--a": `${(i * 137) % 360}deg`, "--d": `${(i % 5) * 0.08}s` }} />)}</motion.div>}
        {fx === "banner" && (
          <motion.div className="panel ll-banner" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
            ENGINE UPGRADED · {to.label.split("· ")[1]}
            <motion.img src={eng(to.id)} alt="" initial={{ x: -260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Signal({ st, onGo }) {
  return (
    <motion.div className="panel ll-sig" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
      <div className="lamp" />
      <div className="k" style={{ color: "#ff9a8a" }}>RED SIGNAL · A SHORT STOP</div>
      <h3>{st.title}</h3>
      <p>{st.p}</p>
      <div className="ls">"{st.lesson}"</div>
      <div style={{ marginTop: 14 }}><Btn onClick={onGo}>▶ GREEN LIGHT · CONTINUE</Btn></div>
    </motion.div>
  );
}
