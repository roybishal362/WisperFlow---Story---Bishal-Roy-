// The Wispr Skyport: the summit. Flight plans (growth ideas for Wispr Flow India), the Council Chamber (the "hire me" treaty), the departure.
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { Dialogue, Region, Btn } from "../components/Ui";
import { art, go, store } from "../lib/core";
import { SKYPORT, PERSON } from "../content";
import "./Skyport.css";

const mail = `mailto:${PERSON.email}?subject=${encodeURIComponent("Wispr Flow · let's talk, Bishal")}`;

export default function Skyport({ route }) {
  const [page, n] = route.sub;
  useEffect(() => {
    const k = (e) => e.key === "Escape" && go("/skyport");
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  if (page === "plan" && SKYPORT.plans[Number(n) - 1]) return <Plan i={Number(n) - 1} />;
  if (page === "council") return <Council />;
  if (page === "end") return <End />;
  return <Dock />;
}

function Dock() {
  return (
    <>
      <Living src={art("08-wispr-skyport/bg-skyport-dock")} amount={14} />
      <Particles kind="motes" density={0.7} />
      <div className="shade-top" style={{ top: -200, height: 420 }} />
      <Region title="THE WISPR SKYPORT" sub="the summit · where the line ends" />
      <motion.div className="sp-scw sp-plans" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <img src={art("00-roy-and-ui/ui-parchment")} alt="" />
        <div className="sc">
          <h3>FLIGHT PLANS</h3>
          <div className="sub">three routes I'd fly for Wispr Flow India</div>
          {SKYPORT.plans.map((p, j) => (
            <button type="button" key={p.n} className="sp-route" onClick={() => go(`/skyport/plan/${j + 1}`)}>
              <h4>ROUTE {p.n} · {p.name.toUpperCase()}</h4><p>{p.one}</p><span>open the plan ›</span>
            </button>
          ))}
          <div className="src">India: 14% of installs, ~2% of revenue. <a href={SKYPORT.sourceUrl} target="_blank" rel="noreferrer">{SKYPORT.source}</a></div>
        </div>
      </motion.div>
      <motion.div className="panel sp-days" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
        <div className="k">THE ROUTE</div><h3>My first 30 days</h3>
        {SKYPORT.days.map(([w, t]) => <div className="d" key={w}><b>{w}</b><span>{t}</span></div>)}
      </motion.div>
      <div className="navbtns sp-nav">
        <Btn onClick={() => go("/skyport/council")}>✈ BOARD THE AIRSHIP</Btn>
        <Btn dark className="sm" href={mail}>Email</Btn>
        <Btn dark className="sm" href={PERSON.linkedin}>LinkedIn</Btn>
        <Btn dark className="sm" href={PERSON.resume}>Résumé</Btn>
      </div>
      <Dialogue expr="proud" text="This is where the Long Line ends, and where I'd like the next journey to start: aboard Wispr Flow. Ready when you are." />
    </>
  );
}

function Plan({ i }) {
  const p = SKYPORT.plans[i];
  return (
    <>
      <Living src={art("08-wispr-skyport/bg-skyport-dock")} amount={10} filter="blur(3px) brightness(.8)" />
      <Particles kind="motes" density={0.5} />
      <AnimatePresence mode="wait">
        <motion.div key={i} className="sp-scw sp-plan" initial={{ opacity: 0, y: 40, rotate: -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
          <img src={art("00-roy-and-ui/ui-parchment")} alt="" />
          <div className="sc">
            <h3>ROUTE {p.n} · {p.name.toUpperCase()}</h3>
            <div className="sub">{p.hindi}</div>
            <h4>THE INSIGHT</h4><p>{p.insight}</p>
            <h4>THE FLIGHT</h4><p>{p.idea}</p>
            <h4>FIRST TEST</h4><p>{p.test}</p>
            <h4>WE MEASURE</h4><p>{p.measure}</p>
            {i === 2 && <p className="pricing">{SKYPORT.pricing}</p>}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="navbtns sp-pnav">
        <Btn dark className="sm" onClick={() => go("/skyport")}>◀ THE DOCK</Btn>
        {i < 2 ? <Btn className="sm" onClick={() => go(`/skyport/plan/${i + 2}`)}>NEXT ROUTE ›</Btn> : <Btn className="sm" onClick={() => go("/skyport/council")}>✈ TO THE COUNCIL</Btn>}
      </div>
      <Dialogue key={i} expr="proud" text={["My first flight plan for Wispr Flow India. Small, cheap, and measured in two weeks.", "A channel I've already run: campus workshops. This challenge is the kit.", "One real Hinglish moment beats a hundred ads."][i]} />
    </>
  );
}

function Council() {
  const T = SKYPORT.treaty;
  return (
    <>
      <Living src={art("08-wispr-skyport/bg-council-v2")} amount={12} />
      <Particles kind="motes" density={0.8} />
      <div className="shade-top" style={{ top: -200, height: 420 }} />
      <Region title="THE COUNCIL CHAMBER" sub="the Wispr Skyport" />
      <motion.div className="sp-scw sp-treaty" initial={{ opacity: 0, y: 40, scaleY: 0.6 }} animate={{ opacity: 1, y: 0, scaleY: 1 }} transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}>
        <img src={art("00-roy-and-ui/ui-parchment")} alt="" />
        <div className="sc">
          <h3>A PROPOSED ALLIANCE</h3>
          <div className="sub">between Wispr Flow and Bishal Roy</div>
          <h4>I BRING</h4><p>{T.bring}</p>
          <h4>I ASK</h4><p>{T.ask}</p>
          <h4>FIRST MISSION</h4><p>{T.mission}</p>
          <div className="sig"><span>Wispr Flow</span><span>Bishal Roy</span></div>
          <div className="wax">BR</div>
        </div>
      </motion.div>
      <motion.div className="sp-acts" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
        <Btn href={mail}>✒ SIGN · EMAIL ME</Btn>
        <Btn dark href={PERSON.linkedin}>LinkedIn</Btn>
        <Btn dark href={PERSON.resume}>Résumé (PDF)</Btn>
        <Btn dark href={PERSON.twin}>Ask my AI twin ↗</Btn>
        <Btn dark onClick={() => go("/skyport/end")}>✈ DEPART</Btn>
      </motion.div>
      <Dialogue expr="proud" text="That's the whole journey. If you'd like me on the team, the quill is right there. Thank you for riding all the way up." />
    </>
  );
}

function End() {
  return (
    <>
      <Living src={art("08-wispr-skyport/bg-skyport-departure")} amount={16} />
      <Particles kind="petals" density={0.9} />
      <motion.div className="sp-end" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}>
        <div className="pre">THE END OF THE LONG LINE</div>
        <h1>Next station: Wispr Flow</h1>
        <div className="bb">
          <Btn href={mail}>✈ BOARD WITH ME · EMAIL</Btn>
          <Btn dark onClick={() => go("/world")}>🗺 Back to the world</Btn>
          <Btn dark onClick={() => { store.reset(); go("/"); }}>↺ Replay from the start</Btn>
        </div>
      </motion.div>
      <Dialogue expr="proud" text="Thank you for riding all the way up. I hope I see you on board." />
    </>
  );
}
