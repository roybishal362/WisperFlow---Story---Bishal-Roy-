import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { Btn } from "../components/Ui";
import { art, go, preload, roy } from "../lib/core";
import { TITLE } from "../content";
import { music } from "../lib/music";
import { PRELOAD } from "../lib/preloads";
import "./Title.css";

export default function Title({ onSixty }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const list = PRELOAD.world.map(art);
    let done = 0, alive = true;
    list.forEach((src) => preload([src]).then(() => { done++; if (alive) setPct(Math.round((done / list.length) * 100)); }));
    const t = setTimeout(() => alive && setPct(100), 9000); // never block the visitor
    return () => { alive = false; clearTimeout(t); };
  }, []);
  const ready = pct >= 100;
  useEffect(() => {
    const f = (e) => { if (ready && (e.key === "Enter" || e.key === " ")) { music.start(); go("/world"); } };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }, [ready]);
  return (
    <>
      <Living src={art("01-world/bg-world")} amount={18} />
      <Particles kind="motes" />
      <div className="vig" style={{ position: "absolute", inset: -400 }} />
      <motion.div className="t-title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <div className="t-pre">{TITLE.presents}</div>
        <h1>{TITLE.name}</h1>
        <div className="orn" />
        <p>{TITLE.tagline}</p>
      </motion.div>
      <motion.div className="panel t-tip" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
        <i style={{ backgroundImage: `url(${roy("happy")})` }} />
        <div><b>ROY'S TIP</b><span>{TITLE.tip}</span></div>
      </motion.div>
      <motion.div className="t-load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
        {ready ? (
          <div className="t-btns">
            <Btn onClick={() => { music.start(); go("/world"); }} autoFocus>✦ ENTER THE REALM</Btn>
            <Btn dark onClick={onSixty}>◷ 60-second version</Btn>
          </div>
        ) : (
          <>
            <div className="bar"><div style={{ width: pct + "%" }} /></div>
            <div className="lbl">LAYING THE TRACKS · {pct}%</div>
          </>
        )}
        <div className="hint">Built by voice with Wispr Flow · Roy is Bishal's guide (and his chibi self)</div>
      </motion.div>
    </>
  );
}
