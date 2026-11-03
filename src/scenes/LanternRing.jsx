// The Lantern Ring: a round night-market of 12 shops (one per build). Stand at the fountain and turn; step inside for the item card.
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { BgBox, useStage } from "../components/Stage";
import { Dialogue, Region, Btn, Toast } from "../components/Ui";
import { art, go, store, useStore, reducedMotion, wait } from "../lib/core";
import { SHOPS } from "../content";
import "./LanternRing.css";

const D2R = Math.PI / 180, STEP = 360 / SHOPS.length;
const norm = (a) => ((a % 360) + 540) % 360 - 180;
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

export default function LanternRing({ route }) {
  const id = route.sub[0];
  const shop = SHOPS.findIndex((s) => s.id === id);
  return shop >= 0 ? <Shop i={shop} /> : <Plaza />;
}

let lastYaw = 0; // remember which way you were facing when you come back out

function Plaza() {
  const { portrait } = useStage();
  const { bag } = useStore();
  const [yaw, setYaw] = useState(lastYaw);
  const [entering, setEntering] = useState(null);
  const yawRef = useRef(yaw); yawRef.current = yaw;
  const drag = useRef(null), moved = useRef(false), anim = useRef(0);
  useEffect(() => { lastYaw = yaw; }, [yaw]);
  const alive = useRef(true); useEffect(() => () => { alive.current = false; }, []);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  const animateYaw = useCallback((to, ms = 550) => new Promise((res) => {
    cancelAnimationFrame(anim.current);
    const from = yawRef.current, t0 = performance.now();
    if (reducedMotion()) { setYaw(to); res(); return; }
    const stepf = (t) => {
      const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      setYaw(from + (to - from) * e);
      if (k < 1) anim.current = requestAnimationFrame(stepf); else res();
    };
    anim.current = requestAnimationFrame(stepf);
  }), []);
  const front = ((Math.round(yaw / STEP) % SHOPS.length) + SHOPS.length) % SHOPS.length;

  function onMove(e) { const d = drag.current; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 6) moved.current = true; setYaw(d.yaw - dx * 0.18); }
  function onUp() { window.removeEventListener("pointermove", onMove); const d = drag.current; drag.current = null; if (d && moved.current) animateYaw(Math.round(yawRef.current / STEP) * STEP); }
  const onDown = (e) => {
    if (entering) return;
    moved.current = false; cancelAnimationFrame(anim.current);
    drag.current = { x: e.clientX, yaw: yawRef.current };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onUp, { once: true });
  };
  const turn = (k) => animateYaw(Math.round(yawRef.current / STEP) * STEP + k * STEP);
  const enterShop = useCallback(async (j) => {
    if (entering) return;
    setEntering(SHOPS[j].id);
    await wait(reducedMotion() ? 0 : 650);
    if (alive.current && location.hash === "#/ring") go("/ring/" + SHOPS[j].id);
  }, [entering]);
  const pick = (j) => {
    if (moved.current || entering) return;
    const rel = norm(j * STEP - yawRef.current);
    if (Math.abs(rel) < STEP / 2) enterShop(j); else animateYaw(yawRef.current + rel);
  };
  useEffect(() => {
    const k = (e) => { if (e.key === "ArrowLeft") turn(-1); if (e.key === "ArrowRight") turn(1); if (e.key === "Enter") enterShop(front); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  const W = portrait ? 820 : 1440, cx = W / 2, rx = portrait ? 520 : 760;
  const vis = SHOPS.map((s, j) => {
    const a = norm(j * STEP - yaw), d = Math.cos(a * D2R);
    return { s, j, a, d, x: cx + rx * Math.sin(a * D2R), by: (portrait ? 980 : 650) + 18 * d, h: (portrait ? 150 : 170) + (portrait ? 170 : 190) * Math.max(0, d) };
  }).filter((v) => v.d > -0.05).sort((p, q) => p.d - q.d);

  return (
    <div className="lr" onPointerDown={onDown}>
      <Living src={art("05-lantern-ring/bg-ring")} amount={8} drift={false} filter="blur(6px) brightness(.5) saturate(1.2)" />
      <BgBox className="lr-floorbox"><div className="lr-floor" style={{ backgroundImage: `url(${art("05-lantern-ring/plaza-ring")})`, backgroundPositionX: `${-yaw * 6}px` }} /></BgBox>
      <Particles kind="lanterns" density={0.9} />
      <div className="lr-hz" />
      <Region title="THE LANTERN RING" sub="stand by the fountain · turn to browse" />
      <div className={"lr-shops" + (entering ? " entering" : "")}>
        {vis.map(({ s, j, a, d, x, by, h }) => {
          const isFront = j === front;
          return (
            <div key={s.id} className={"lr-shop" + (isFront ? " sel" : "") + (d < 0.5 ? " far" : "")}
              style={{ left: x, top: by - h, height: h, zIndex: Math.round(10 + d * 20), opacity: Math.min(1, d * 3 + 0.2), transform: `translateX(-50%) perspective(900px) rotateY(${-a * 0.55}deg)` }}>
              <button type="button" onClick={() => pick(j)} aria-label={(isFront ? "Enter " : "Turn to ") + s.name}>
                <img src={art("05-lantern-ring/shop-" + s.id)} alt="" draggable="false" />
              </button>
              {d > 0.35 && <div className={"lr-sign" + (isFront ? " on" : "")}><b>{s.name}</b><span>{s.proj} · {stars(s.stars)}</span></div>}
              {entering === s.id && <div className="lr-bloom" />}
            </div>
          );
        })}
      </div>
      <div className="panel lr-bag"><div className="k">YOUR BAG · {bag.length} / {SHOPS.length}</div>
        <div className="slots">{SHOPS.map((s) => <div key={s.id} className={"slot" + (bag.includes(s.id) ? " f" : "")} title={bag.includes(s.id) ? s.item : "not collected yet"}>
          {bag.includes(s.id) ? <img src={art("05-lantern-ring/" + s.itemImg)} alt={s.item} /> : "?"}</div>)}</div>
      </div>
      <div className="lr-ctl">
        <button type="button" className="ico" onClick={() => turn(-1)} aria-label="Turn left">⟲</button>
        <Btn onClick={() => enterShop(front)}>✦ ENTER {SHOPS[front].name.toUpperCase()}</Btn>
        <button type="button" className="ico" onClick={() => turn(1)} aria-label="Turn right">⟳</button>
      </div>
      <Dialogue expr="wink" text="Twelve shops, one for every build. Drag to turn around the fountain. Step inside one and it gives you an item card with the real numbers." />
    </div>
  );
}

function Shop({ i }) {
  const s = SHOPS[i];
  const { bag } = useStore();
  const have = bag.includes(s.id);
  const [toast, setToast] = useState(null);
  useEffect(() => { setToast(null); }, [i]);
  const add = () => {
    if (store.addToBag(s.id)) {
      const full = store.get().bag.length === SHOPS.length;
      setToast(full ? { title: "THE BAG IS FULL", text: "All 12 cards collected · Window Shopper" } : { title: "ADDED TO YOUR BAG", text: `${s.item} · ${store.get().bag.length} / ${SHOPS.length}` });
      setTimeout(() => setToast(null), 2600);
    }
  };
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") go("/ring");
      if (e.key === "ArrowRight") go("/ring/" + SHOPS[(i + 1) % SHOPS.length].id);
      if (e.key === "ArrowLeft") go("/ring/" + SHOPS[(i + SHOPS.length - 1) % SHOPS.length].id);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [i]);
  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div key={s.id} className="lr-in" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <Living src={art("05-lantern-ring/bg-in-" + (s.interior || s.id))} amount={12} />
        </motion.div>
      </AnimatePresence>
      <Particles kind="motes" density={0.5} />
      <div className="shade-top" style={{ top: -200, height: 420 }} />
      <Region title={s.name.toUpperCase()} sub={s.proj} className="lr-region" />
      <AnimatePresence mode="wait">
        <motion.div key={s.id} className="lr-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div className="panel lr-sp" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="k">SHOP {i + 1} OF {SHOPS.length}</div>
            <h2>{s.name}</h2>
            <div className="p">{s.proj}</div>
            <p>{s.desc}</p>
            <div className="bb">
              <Btn onClick={add} disabled={have}>{have ? "✓ IN YOUR BAG" : "✦ ADD TO BAG"}</Btn>
              {s.link ? <Btn dark href={s.link}>See the build ↗</Btn> : <span className="note">{s.linkNote || ""}</span>}
            </div>
          </motion.div>
          <motion.div className="lr-card" initial={{ opacity: 0, rotateY: 75 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}>
            <img className="fr" src={art("00-roy-and-ui/ui-card-frame")} alt="" />
            <div className="in">
              <img className="it" src={art("05-lantern-ring/" + s.itemImg)} alt={s.item} />
              <div className="nm">{s.item}</div>
              <div className="stars">{stars(s.stars)}</div>
              <div className="ty">{s.type}</div>
              <div className="st">{s.stats.map(([a, b]) => <div key={a}><span>{a}</span><b>{b}</b></div>)}</div>
              <div className="fl">"{s.flavour}"</div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="navbtns lr-nav">
        <Btn dark className="sm" onClick={() => go("/ring")}>◀ THE PLAZA</Btn>
        <Btn dark className="sm" onClick={() => go("/ring/" + SHOPS[(i + SHOPS.length - 1) % SHOPS.length].id)}>‹ PREV SHOP</Btn>
        <Btn className="sm" onClick={() => go("/ring/" + SHOPS[(i + 1) % SHOPS.length].id)}>NEXT SHOP ›</Btn>
      </div>
      <Toast show={!!toast} title={toast?.title} text={toast?.text} />
      <Dialogue key={s.id} expr={i % 2 ? "wink" : "happy"} text={`Welcome to ${s.name}. Take the card; every number on it is real.`} />
    </>
  );
}
