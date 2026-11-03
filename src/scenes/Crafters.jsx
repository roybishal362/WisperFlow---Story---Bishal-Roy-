// The Crafters' Quarter: five workshops, five families of skills. Each action makes the item grow one stage.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { Dialogue, Region, Btn, Toast } from "../components/Ui";
import { art, go, store, useStore, wait, reducedMotion } from "../lib/core";
import { useStage } from "../components/Stage";
import { WORKSHOPS } from "../content";
import "./Crafters.css";

const DOORS = [[300, 300], [1110, 230], [1150, 450], [250, 520], [930, 640]]; // label spots around the island (landscape)
const DOORS_P = [[210, 800], [610, 800], [210, 930], [610, 930], [410, 1060]]; // phones held upright: a grid under the island

export default function Crafters({ route }) {
  const i = WORKSHOPS.findIndex((w) => w.id === route.sub[0]);
  return i >= 0 ? <Workshop i={i} /> : <Hub />;
}

function Hub() {
  const { stages } = useStore();
  const { portrait } = useStage();
  const spots = portrait ? DOORS_P : DOORS;
  return (
    <>
      <Living src={art("01-world/bg-sky")} amount={10} />
      <Particles kind="motes" density={0.6} />
      <Region title="THE CRAFTERS' QUARTER" sub="five workshops · five families of skills" />
      <motion.img className="cr-isl" src={art("01-world/isl-crafters")} alt="The Crafters' Quarter: a floating island of workshops" initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8 }} />
      {WORKSHOPS.map((w, j) => (
        <motion.button type="button" key={w.id} className="panel cr-door" style={{ left: spots[j][0], top: spots[j][1], "--c": w.color }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + j * 0.1 }} onClick={() => go("/crafters/" + w.id)}>
          <b>{w.name}</b><span>{w.sub}</span><em>{(stages[w.id] || 0) >= 4 ? "complete ✓" : `stage ${(stages[w.id] || 0) + 1} of 5`}</em>
        </motion.button>
      ))}
      <Dialogue expr="happy" text="Five workshops, five kinds of makers. Pick a door and help them build something: every strike is a real skill." />
    </>
  );
}

function Workshop({ i }) {
  const w = WORKSHOPS[i];
  const { stages } = useStore();
  const st = stages[w.id] || 0;
  const [hit, setHit] = useState(0); // bumps on every action (flash + shake + logo burst)
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);
  useEffect(() => { setToast(false); }, [i]);
  const act = async () => {
    if (busy) return;
    if (st >= 4) { store.setStage(w.id, 0); return; }
    setBusy(true); setHit((h) => h + 1);
    await wait(reducedMotion() ? 0 : 380);
    store.setStage(w.id, st + 1);
    if (st + 1 >= 4) { setToast(true); setTimeout(() => setToast(false), 2600); }
    await wait(reducedMotion() ? 0 : 420);
    setBusy(false);
  };
  useEffect(() => {
    const k = (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); act(); } if (e.key === "Escape") go("/crafters"); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const next = WORKSHOPS[(i + 1) % WORKSHOPS.length];
  return (
    <div className={"cr-ws" + (hit && busy ? " shake" : "")} key={w.id} style={{ "--c": w.color }}>
      <Living src={art("06-crafters-quarter/" + w.art)} amount={12} />
      <Particles kind={w.id === "forge" ? "embers" : w.id === "witches" ? "crystals" : w.id === "elves" ? "fireflies" : "motes"} density={0.8} />
      <div className="shade-top" style={{ top: -200, height: 420 }} />
      <Region title="THE CRAFTERS' QUARTER" sub={`${w.name.replace("The ", "")} · ${w.sub}`} className="cr-region" />
      <div className="cr-runes">
        {w.skills.map((s, j) => <motion.span key={s} className="cr-rune" style={{ left: 470 + ((j * 173) % 440), top: 220 + ((j * 97) % 190) }}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }} transition={{ delay: 0.3 + j * 0.08, y: { duration: 4 + j * 0.3, repeat: Infinity } }}>{s}</motion.span>)}
      </div>
      <div className="panel cr-make">WHAT'S BEING MADE<b>{w.item}</b><p className="cr-about">{w.about}</p>
        {w.logos.length > 0 && <div className="cr-logos">{w.logos.map((l) => <img key={l} src={`/art/logos/${l}.svg`} alt={l} title={l} />)}</div>}
      </div>
      <div className="panel cr-strip">
        {w.stages.map((label, k) => (
          <div key={k} className={"cr-sg" + (k < st ? " done" : k === st ? " now" : "")}>
            <img src={art(`06-crafters-quarter/${w.sheet}-${k + 1}`)} alt="" />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="navbtns cr-nav">
        <Btn dark className="sm" onClick={() => go("/crafters")}>◀ THE QUARTER</Btn>
        <Btn onClick={act} disabled={busy}>{st >= 4 ? "↺ MAKE IT AGAIN" : `⚒ ${w.act}`}</Btn>
        <Btn dark className="sm" onClick={() => go("/crafters/" + next.id)}>{next.name.replace("The ", "")} ›</Btn>
      </div>
      <AnimatePresence>
        {busy && <motion.div key={"f" + hit} className="flash cr-flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6 }} />}
        {busy && w.logos.length > 0 && (
          <motion.div key={"b" + hit} className="cr-burst" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1, delay: 0.3 }}>
            {w.logos.map((l, j) => <motion.img key={l} src={`/art/logos/${l}.svg`} alt="" initial={{ x: 0, y: 0, scale: 0.4 }}
              animate={{ x: Math.cos((j / w.logos.length) * 6.28) * 220, y: Math.sin((j / w.logos.length) * 6.28) * 140 - 40, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />)}
          </motion.div>
        )}
      </AnimatePresence>
      <Toast show={toast} title="ITEM COMPLETE" text={`${w.item} · all five stages`} icon="⚒" />
      <Dialogue key={w.id} expr="proud" text={w.roy} />
    </div>
  );
}
