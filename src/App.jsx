import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Stage, { useStage } from "./components/Stage";
import { Btn } from "./components/Ui";
import { useRoute, go, preload, art, store, useStore, wait, motion as motionSwitch, useMotion } from "./lib/core";
import { REALMS, SIXTY, PERSON, INTRO } from "./content";
import { PRELOAD } from "./lib/preloads";
import Title from "./scenes/Title";
import World from "./scenes/World";
import VastCity from "./scenes/VastCity";
import LongLine from "./scenes/LongLine";
import Lake from "./scenes/Lake";
import LanternRing from "./scenes/LanternRing";
import Crafters from "./scenes/Crafters";
import Echo from "./scenes/Echo";
import Skyport from "./scenes/Skyport";

const SCENES = { title: Title, world: World, city: VastCity, line: LongLine, lake: Lake, ring: LanternRing, crafters: Crafters, echo: Echo, skyport: Skyport };
const REALM_IDS = REALMS.map((r) => r.id);

function realmTitle(id) {
  if (id === "world") return { title: "THE VAST REALM", sub: "drag to look around · pick a realm" };
  const r = REALMS.find((x) => x.id === id);
  return r ? { title: r.name.toUpperCase(), sub: r.short } : { title: "", sub: "" };
}

function CloudWipe({ wipe }) {
  // the stage is scaled, so "fixed" would only cover the stage: size the clouds to the whole window instead
  const { bg } = useStage();
  return (
    <AnimatePresence>
      {wipe && (
        <motion.div key="wipe" className="wipe" style={{ position: "absolute", left: bg.left, top: bg.top, width: bg.width, height: bg.height }} initial={{ opacity: 0 }} animate={{ opacity: wipe.phase === "open" ? 0 : 1 }} exit={{ opacity: 0 }}
          transition={{ duration: wipe.phase === "open" ? 0.7 : 0.55, ease: "easeInOut" }}>
          <motion.img src={art("01-world/bg-clouds-wipe")} alt="" initial={{ scale: 1.35 }} animate={{ scale: wipe.phase === "open" ? 1.5 : 1.05 }}
            transition={{ duration: wipe.phase === "open" ? 0.8 : 0.7, ease: "easeOut" }} />
          <AnimatePresence>
            {wipe.phase === "title" && (
              <motion.div className="wipe-title" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <h1>{wipe.title}</h1><div className="orn" /><p>{wipe.sub}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hud({ onSixty, realm, onIntro }) {
  const { visited } = useStore();
  const n = REALM_IDS.filter((id) => visited.includes(id)).length;
  return (
    <div className="hud">
      <button type="button" className="hud-tl" onClick={() => go("/world")} aria-label="Back to the world map">
        <div className="crest">BR</div>
        <div className="who"><b>THE VAST REALM</b><span>Bishal Roy · a world spoken into being</span></div>
      </button>
      <div className="hud-tr">
        <button type="button" className="pillh" onClick={onSixty}>◷ 60-second version</button>
        <div className="pillh" title="Realms explored">◈ {n} / {REALM_IDS.length}</div>
        {INTRO[realm] && <button type="button" className="ico" onClick={onIntro} aria-label="What is this place?" title="What is this place?">?</button>}
        <MotionBtn />
        {realm !== "world" && <button type="button" className="ico" onClick={() => go("/world")} aria-label="World map" title="World map">🗺</button>}
      </div>
    </div>
  );
}

function Intro({ id, onClose }) {
  const it = INTRO[id];
  useEffect(() => {
    const f = (e) => { if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", f, true); return () => window.removeEventListener("keydown", f, true);
  }, [onClose]);
  return (
    <motion.div className="overlay intro-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="panel intro" initial={{ y: 24, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }} transition={{ duration: 0.4 }} onClick={(e) => e.stopPropagation()}>
        <div className="k">◆ REALM DISCOVERED ◆</div>
        <h2>{it.title}</h2>
        <h4>WHAT IS THIS PLACE?</h4>
        <p>{it.what}</p>
        <h4>HOW TO EXPLORE</h4>
        <ul>{it.how.map((h) => <li key={h}>{h}</li>)}</ul>
        <div className="b"><Btn onClick={onClose} autoFocus>✦ EXPLORE</Btn></div>
      </motion.div>
    </motion.div>
  );
}

function MotionBtn() {
  const on = useMotion();
  return <button type="button" className="ico" onClick={() => motionSwitch.set(!on)} aria-pressed={on} aria-label={on ? "Turn animations off" : "Turn animations on"} title={on ? "Animations on (click to calm)" : "Animations off (click to turn on)"}>{on ? "✨" : "⏸"}</button>;
}

function Sixty({ onClose }) {
  useEffect(() => {
    const f = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }, [onClose]);
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="panel sixty" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="x" onClick={onClose} aria-label="Close">✕</button>
        <div className="top"><i style={{ backgroundImage: `url(${art("00-roy-and-ui/roy-happy")})` }} />
          <div><h2>The 60-second version</h2><div className="l">{SIXTY.lead}</div></div></div>
        <ul>{SIXTY.points.map((p) => <li key={p}>{p}</li>)}</ul>
        <div className="b">
          <Btn href={`mailto:${PERSON.email}?subject=Wispr%20Flow%20%C2%B7%20Bishal%20Roy`}>✈ HIRE ME · EMAIL</Btn>
          <Btn dark href={PERSON.resume}>Résumé</Btn>
          <Btn dark href={PERSON.linkedin}>LinkedIn</Btn>
          <Btn dark onClick={onClose}>▶ Take the tour anyway</Btn>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const route = useRoute();
  const [shown, setShown] = useState(route);
  const [wipe, setWipe] = useState(null);
  const [sixty, setSixty] = useState(false);
  const [intro, setIntro] = useState(null);
  const { seen = [] } = useStore();
  const seq = useRef(0);

  useEffect(() => {
    if (!SCENES[route.realm]) { go("/"); return; }
    const my = ++seq.current;
    if (route.realm === shown.realm) { setShown(route); return; }
    (async () => {
      const info = realmTitle(route.realm);
      const fromTitle = shown.realm === "title";
      setWipe({ phase: "close", ...info });
      await Promise.all([wait(fromTitle ? 450 : 600), preload((PRELOAD[route.realm] || []).map(art))]);
      if (my !== seq.current) return;
      setShown(route);
      if (REALM_IDS.includes(route.realm)) store.visit(route.realm);
      setWipe({ phase: "title", ...info });
      await wait(950);
      if (my !== seq.current) return;
      setWipe({ phase: "open", ...info });
      await wait(750);
      if (my !== seq.current) return;
      setWipe(null);
    })();
  }, [route.path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // keyboard: M = map
    const f = (e) => { if (e.target.closest?.("input,textarea")) return; if ((e.key === "m" || e.key === "M") && shown.realm !== "title") go("/world"); };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }, [shown.realm]);

  // show the realm's intro card once, after the clouds have opened
  useEffect(() => {
    if (wipe || !INTRO[shown.realm] || seen.includes(shown.realm)) return;
    const t = setTimeout(() => setIntro(shown.realm), 250);
    return () => clearTimeout(t);
  }, [wipe, shown.realm]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (intro && intro !== shown.realm) setIntro(null); }, [shown.realm, intro]);
  const closeIntro = () => { store.seeIntro(intro); setIntro(null); };

  const Scene = SCENES[shown.realm] || Title;
  return (
    <Stage>
      <AnimatePresence mode="wait">
        <motion.div key={shown.realm} className="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <Scene route={shown} busy={!!wipe} onSixty={() => setSixty(true)} />
        </motion.div>
      </AnimatePresence>
      {shown.realm !== "title" && <Hud onSixty={() => setSixty(true)} realm={shown.realm} onIntro={() => setIntro(shown.realm)} />}
      <CloudWipe wipe={wipe} />
      <AnimatePresence>{intro && !wipe && <Intro key={intro} id={intro} onClose={closeIntro} />}</AnimatePresence>
      <AnimatePresence>{sixty && <Sixty onClose={() => setSixty(false)} />}</AnimatePresence>
    </Stage>
  );
}
