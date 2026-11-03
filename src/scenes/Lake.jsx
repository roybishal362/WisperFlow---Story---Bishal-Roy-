// The Lake of Mirrors: one painted lake with 8 towers. Each tower: the win, the reflection (what it cost), the gold (how I mended it).
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { CoverBox } from "../components/Stage";
import { Dialogue, Region, Btn } from "../components/Ui";
import { art, go, wait, reducedMotion } from "../lib/core";
import { TOWERS, LAKE_POS } from "../content";
import "./Lake.css";

export default function Lake({ route }) {
  const sub = route.sub[0];
  const mirrorAll = sub === "mirror";
  const n = Number(sub);
  const i = n >= 1 && n <= 8 ? n - 1 : -1;
  const [zoom, setZoom] = useState(null);
  const [flip, setFlip] = useState(false);
  useEffect(() => { setZoom(null); setFlip(false); }, [sub]);
  const alive = useRef(true); useEffect(() => () => { alive.current = false; }, []);

  const fly = async (j) => {
    if (zoom !== null) return;
    setZoom(j);
    await wait(reducedMotion() ? 0 : 750);
    if (alive.current && location.hash === "#/lake") go(`/lake/${j + 1}`);
  };
  useEffect(() => {
    const k = (e) => {
      if (i >= 0 && e.key === "ArrowRight") go(`/lake/${((i + 1) % 8) + 1}`);
      if (i >= 0 && e.key === "ArrowLeft") go(`/lake/${((i + 7) % 8) + 1}`);
      if (e.key === "Escape") go("/lake");
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [i]);

  // ---------- overview (and the whole lake turned) ----------
  if (i < 0) {
    const z = zoom !== null ? LAKE_POS[zoom] : null;
    return (
      <>
        <motion.div className="lk-world" animate={mirrorAll ? { scaleY: -1, filter: "sepia(.3) hue-rotate(-20deg) saturate(1.3) brightness(.85)" } : { scaleY: 1, filter: "none" }}
          transition={{ duration: 1.1, ease: [0.6, 0, 0.3, 1] }}>
          <CoverBox className={"lk-cover" + (zoom !== null ? " zooming" : "")} style={z ? { transformOrigin: `${z[0] * 100}% ${z[1] * 100 + 25}%`, transform: "scale(2.2)", transition: "transform .75s cubic-bezier(.6,0,.3,1)" } : { transition: "transform .6s" }}>
            <img className="lk-img" src={art("04-lake-of-mirrors/bg-lake-master")} alt="The Lake of Mirrors: eight towers with gold-mended cracks, their broken reflections in the water" />
            {!mirrorAll && TOWERS.map((t, j) => (
              <button type="button" key={t.n} className="lk-tw" style={{ left: `${LAKE_POS[j][0] * 100}%`, top: `${LAKE_POS[j][1] * 100}%`, height: `${(0.615 - LAKE_POS[j][1]) * 100}%` }} onClick={() => fly(j)} aria-label={`Tower ${t.n}: ${t.name}`}>
                <span className="lk-lbl">{t.n} · {t.name.replace("The ", "")}</span>
              </button>
            ))}
          </CoverBox>
        </motion.div>
        <Particles kind="fireflies" density={0.7} />
        <div className="shade-top" style={{ top: -200, height: 440 }} />
        <Region title={mirrorAll ? "THE MIRROR, TURNED" : "THE LAKE OF MIRRORS"} sub={mirrorAll ? "the failures stand · the wins are the reflection" : "eight towers · every reflection tells the other half"} />
        <div className="navbtns lk-nav">
          {!mirrorAll && <div className="panel lk-ovtok">{TOWERS.map((t, j) => <button type="button" key={t.n} onClick={() => fly(j)} aria-label={`Tower ${t.n}: ${t.name}`}>{t.n}</button>)}</div>}
          <Btn dark className="sm" onClick={() => go(mirrorAll ? "/lake" : "/lake/mirror")}>⇅ {mirrorAll ? "TURN IT BACK" : "TURN THE MIRROR"}</Btn>
          {!mirrorAll && <Btn className="sm" onClick={() => fly(0)}>✦ START AT TOWER I</Btn>}
        </div>
        {mirrorAll && <motion.div className="panel lk-quote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>"Both are true at the same time."</motion.div>}
        <Dialogue expr="thinking" text={mirrorAll ? "Turn it back whenever you like. I keep both." : "Every tower is something I'm proud of. Look down at the water: that's the part I don't usually tell. Tap a tower."} />
      </>
    );
  }

  // ---------- one tower ----------
  const t = TOWERS[i];
  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div key={i} className="lk-bg" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <motion.div className="lk-flip" animate={flip ? { scaleY: -1, filter: "sepia(.35) hue-rotate(-25deg) saturate(1.4) brightness(.85)" } : { scaleY: 1, filter: "none" }} transition={{ duration: 0.9, ease: [0.6, 0, 0.3, 1] }}>
            <Living src={art(`04-lake-of-mirrors/bg-tower-close-${i + 1}`)} amount={12} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <Particles kind="fireflies" density={0.5} />
      <div className="shade-top" style={{ top: -200, height: 420 }} />
      <Region title="THE LAKE OF MIRRORS" sub={`tower ${t.n} of VIII`} className="lk-region" />
      <AnimatePresence mode="wait">
        <motion.div key={i} className={"panel lk-card" + (flip ? " flipped" : "")} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="k">TOWER {t.n} OF VIII</div>
          <h2>{t.name}</h2>
          <div className="lk-about">{t.about}</div>
          <div className="sec s1"><b>THE TOWER · WHAT YOU SEE</b><p>{t.win}</p></div>
          <AnimatePresence initial={false} mode="wait">
            {flip ? (
              <motion.div key="other" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, delay: 0.35 }}>
                <div className="sec s2"><b>THE REFLECTION · WHAT IT COST ME</b><p>{t.refl}</p></div>
                <div className="sec s3"><b>THE GOLD · HOW I MENDED IT</b><p>{t.gold}</p></div>
              </motion.div>
            ) : (
              <motion.button type="button" key="hint" className="lk-hint" onClick={() => setFlip(true)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <b>⇅ THE WATER HIDES THE OTHER HALF</b>
                <span>Turn the mirror to see what this win cost me, and how I mended it.</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      <div className="panel lk-bar">
        <div className="tok">{TOWERS.map((x, j) => <button type="button" key={x.n} className={j === i ? "on" : ""} onClick={() => go(`/lake/${j + 1}`)} aria-label={`Tower ${x.n}`}>{x.n}</button>)}</div>
        <Btn dark className="sm" onClick={() => go("/lake")}>◀ THE LAKE</Btn>
        <Btn dark={flip} className={"sm" + (flip ? "" : " lk-pulse")} onClick={() => setFlip((f) => !f)}>⇅ {flip ? "TURN IT BACK" : "TURN THE MIRROR"}</Btn>
        <Btn className="sm" onClick={() => go(i < 7 ? `/lake/${i + 2}` : "/lake")}>{i < 7 ? "NEXT TOWER ▶" : "BACK TO THE LAKE"}</Btn>
      </div>
    </>
  );
}
