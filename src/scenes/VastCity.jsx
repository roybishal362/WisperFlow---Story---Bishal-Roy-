// The Vast City: seven rings, seven parts of Bishal. Overview with the ring list, then one page per ring (climb up/down).
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { Dialogue, Region, Btn, enter } from "../components/Ui";
import { art, go, useStore, preload } from "../lib/core";
import { RINGS, REALMS, PERSON, TROPHIES } from "../content";
import "./VastCity.css";

const OTHER = REALMS.filter((r) => r.id !== "city").map((r) => r.id);
const fmt = (n) => n.toLocaleString("en-IN");

// Ring V: the hackathon shelf and the Kaggle arena, with the real results
function TrophyWall() {
  return (
    <div className="tw">
      <section>
        <h3>HACKATHONS &amp; FINALS</h3>
        {TROPHIES.hackathons.map((h) => (
          <div key={h.event} className="tw-h">
            <i className={"tw-badge " + h.tone}>{h.badge}</i>
            <div><b>{h.result}</b><span className="ev">{h.event}</span><span className="nt">{h.note}</span></div>
            {h.shop ? <button type="button" className="tw-go" onClick={() => go(`/ring/${h.shop}`)} title={`See ${h.build} in the Lantern Ring`}>{h.build} ›</button> : <em className="tw-go off">{h.build}</em>}
          </div>
        ))}
      </section>
      <section>
        <h3>THE KAGGLE ARENA</h3>
        <p className="tw-lead">{TROPHIES.kaggleLead}</p>
        {TROPHIES.kaggle.map((k) => {
          const ahead = Math.round(((k.teams - k.rank) / k.teams) * 100);
          return (
            <div key={k.name} className={"tw-k" + (k.note && k.note !== "team" ? " star" : "")}>
              <div className="row"><b>{k.name}</b><span>{fmt(k.rank)} / {fmt(k.teams)}</span></div>
              <div className="bar" title={`Ahead of ${ahead}% of teams`}><i style={{ width: `${ahead}%` }} /></div>
              {k.note && <div className="nt">{k.note}</div>}
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default function VastCity({ route }) {
  const { visited } = useStore();
  const crownOpen = OTHER.every((id) => visited.includes(id));
  const n = Number(route.sub[0]);
  const i = n >= 1 && n <= 7 ? n - 1 : -1;
  const prev = useRef(i); const dir = i > prev.current ? 1 : -1; useEffect(() => { prev.current = i; }, [i]);
  useEffect(() => { preload(RINGS.map((r) => art("02-vast-city/" + r.art)), 30000); }, []);

  useEffect(() => {
    const k = (e) => {
      if (i < 0) return;
      if (e.key === "ArrowUp" && i < 6) go(`/city/${i + 2}`);
      if (e.key === "ArrowDown" && i > 0) go(`/city/${i}`);
      if (e.key === "Escape") go("/city");
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [i]);

  if (i < 0) {
    return (
      <>
        <Living src={art("02-vast-city/bg-city")} amount={14} />
        <Particles kind="petals" density={0.8} />
        <div className="shade-top" style={{ top: -200, height: 460 }} />
        <Region title="THE VAST CITY" sub="seven rings · seven parts of me" />
        <motion.div className="panel vc-list" {...enter(0.3, 30, 0)}>
          {RINGS.map((r, j) => {
            const locked = j === 6 && !crownOpen;
            return (
              <button type="button" key={r.n} className={"vc-rg" + (locked ? " lock" : "")} onClick={() => go(`/city/${j + 1}`)}>
                <i>{r.n}</i><div><b>{r.name}</b><span>{locked ? "opens when every realm is explored" : r.sub}</span></div>{locked && <em>🔒</em>}
              </button>
            );
          })}
        </motion.div>
        <Dialogue expr="happy" text="Seven rings, seven parts of me. Start at the bottom with my roots. The crown opens only after you've seen everything else.">
          <Btn className="sm" onClick={() => go("/city/1")}>✦ START AT RING I</Btn>
        </Dialogue>
      </>
    );
  }

  const r = RINGS[i];
  const crown = i === 6;
  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div key={r.art} className="vc-bg" initial={{ opacity: 0, y: dir * -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: dir * 60 }} transition={{ duration: 0.8, ease: "easeInOut" }}>
          <Living src={art("02-vast-city/" + r.art)} amount={14} />
        </motion.div>
      </AnimatePresence>
      <Particles kind={crown ? "motes" : "petals"} density={0.6} />
      <div className="shade-top" style={{ top: -200, height: crown ? 520 : 480, background: crown ? "linear-gradient(180deg,rgba(8,10,24,.85),rgba(8,10,24,.35) 70%,transparent)" : undefined }} />
      <Region title="THE VAST CITY" sub={`ring ${r.n} of VII · ${r.name}`} className="vc-region" />
      <AnimatePresence mode="wait">
        <motion.div key={r.n} className={"panel vc-card" + (i === 4 ? " vc-trophy" : "")} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <div className="k">RING {r.n} OF VII</div>
          <h2>{r.name}</h2>
          <p>{r.text}</p>
          {i === 4 && <TrophyWall />}
          {crown && (crownOpen ? (
            <div className="vc-letter">
              <div className="seal">✉</div>
              <p>{r.letter}</p>
              <Btn className="sm" href={`mailto:${PERSON.email}?subject=I%20reached%20the%20Crown`}>✒ WRITE TO BISHAL</Btn>
            </div>
          ) : (
            <div className="vc-lock">
              <b>The letter is still sealed.</b>
              <span>Explore every realm to open it: {OTHER.filter((id) => !visited.includes(id)).map((id) => REALMS.find((x) => x.id === id).name).join(" · ")}</span>
              <Btn dark className="sm" onClick={() => go("/world")}>🗺 BACK TO THE WORLD</Btn>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="navbtns vc-nav">
        <Btn dark className="sm" onClick={() => go("/city")}>◀ ALL RINGS</Btn>
        <Btn dark className="sm" disabled={i === 0} onClick={() => i > 0 && go(`/city/${i}`)}>▼ DOWN</Btn>
        <Btn className="sm" disabled={i === 6} onClick={() => i < 6 && go(`/city/${i + 2}`)}>▲ UP A RING</Btn>
      </div>
      <Dialogue key={r.n} expr={r.expr} text={crown ? (crownOpen ? "You made it to the top. The letter is yours." : "The letter at the top only opens once you've explored every realm. It'll wait for you.") : r.roy} />
    </>
  );
}
