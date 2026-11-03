// The world: the Vast City in the middle, six realms on a ring around it, joined by floating bridges.
// Drag (or arrows) to turn the ring; pick a realm and Roy's balloon flies you there.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Living from "../components/Living";
import Particles from "../components/Particles";
import { useStage } from "../components/Stage";
import { Dialogue, Btn } from "../components/Ui";
import { art, go, useStore, reducedMotion } from "../lib/core";
import { REALMS } from "../content";
import "./World.css";

const SIDE = REALMS.filter((r) => !r.center);
const CITY = REALMS.find((r) => r.center);
const BASEW = { line: 190, lake: 290, ring: 310, skyport: 330, echo: 210, crafters: 280 };
const D2R = Math.PI / 180;
const norm = (a) => ((a % 360) + 540) % 360 - 180; // -180..180

function layout(portrait) {
  return portrait
    ? { cx: 410, cy: 640, rx: 330, yf: 930, yb: 360, cityW: 330, k: 0.82 }
    : { cx: 720, cy: 395, rx: 560, yf: 640, yb: 160, cityW: 400, k: 1 };
}
function place(L, angle) {
  const a = angle * D2R, d = Math.cos(a);
  return { x: L.cx + L.rx * Math.sin(a), y: (L.yf + L.yb) / 2 + ((L.yf - L.yb) / 2) * d, d, s: 0.5 + 0.5 * ((d + 1) / 2) };
}
function bridgeStyle(L, p, w) {
  const sx = L.cx, sy = L.cy + 30;
  const dx = p.x - sx, dy = p.y - sy, dist = Math.hypot(dx, dy) || 1, ux = dx / dist, uy = dy / dist;
  const a0 = L.cityW * 0.36, a1 = w * 0.34;
  const x0 = sx + ux * a0, y0 = sy + uy * a0, x1 = p.x - ux * a1, y1 = p.y - uy * a1;
  const len = Math.max(40, Math.hypot(x1 - x0, y1 - y0) + 40);
  let rot = Math.atan2(dy, dx) / D2R; if (rot > 90) rot -= 180; if (rot < -90) rot += 180;
  const steep = Math.abs(Math.sin(Math.atan2(dy, dx)));
  return { left: (x0 + x1) / 2, top: (y0 + y1) / 2, width: len, transform: `translate(-50%,-50%) rotate(${rot}deg)`, opacity: Math.max(0, 1 - Math.max(0, steep - 0.62) * 3.2) };
}

export default function World({ busy }) {
  const { portrait } = useStage();
  const L = useMemo(() => layout(portrait), [portrait]);
  const { visited } = useStore();
  const [yaw, setYaw] = useState(0);
  const [sel, setSel] = useState(null);
  const [flying, setFlying] = useState(null); // realm being travelled to
  const yawRef = useRef(0); yawRef.current = yaw;
  const drag = useRef(null), anim = useRef(0), moved = useRef(false), ptype = useRef("mouse");
  const layerRef = useRef(null), balloonRef = useRef(null);

  const animateYaw = useCallback((to, ms = 650) => new Promise((res) => {
    cancelAnimationFrame(anim.current);
    const from = yawRef.current, t0 = performance.now();
    if (reducedMotion() || Math.abs(to - from) < 0.5) { setYaw(to); res(); return; }
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setYaw(from + (to - from) * e);
      if (k < 1) anim.current = requestAnimationFrame(step); else res();
    };
    anim.current = requestAnimationFrame(step);
  }), []);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  // ---------- drag to turn ----------
  const onDown = (e) => {
    ptype.current = e.pointerType || "mouse";
    moved.current = false;
    if (flying) return;
    cancelAnimationFrame(anim.current);
    drag.current = { x: e.clientX, yaw: yawRef.current, last: e.clientX, v: 0, t: performance.now() };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onUp, { once: true });
  };
  function onMove(e) {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) moved.current = true;
    const now = performance.now(); d.v = (e.clientX - d.last) / Math.max(1, now - d.t); d.last = e.clientX; d.t = now;
    setYaw(d.yaw - dx * 0.25);
  }
  function onUp() {
    window.removeEventListener("pointermove", onMove);
    const d = drag.current; drag.current = null; if (!d) return;
    if (!moved.current) return;
    const fling = d.v * -0.25 * 220; // keep a little momentum, then rest on a slot
    animateYaw(Math.round((yawRef.current + fling) / 60) * 60, 700);
  }
  useEffect(() => {
    const k = (e) => {
      if (flying) return;
      if (e.key === "ArrowLeft") animateYaw(Math.round(yawRef.current / 60) * 60 - 60);
      if (e.key === "ArrowRight") animateYaw(Math.round(yawRef.current / 60) * 60 + 60);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [animateYaw, flying]);

  // ---------- travel ----------
  const travel = useCallback(async (r) => {
    if (flying || busy) return;
    setSel(null); setFlying(r.id);
    let target = { x: L.cx, y: L.cy - 40 };
    if (!r.center) {
      const cur = norm(r.angle - yawRef.current);
      const slot = cur >= 0 ? 30 : -30; // bring it to the nearest front slot
      const to = yawRef.current + (cur - slot);
      await animateYaw(to, 600);
      const p = place(L, norm(r.angle - to));
      target = { x: p.x, y: p.y - 70 };
    }
    const b = balloonRef.current, layer = layerRef.current;
    const dur = reducedMotion() ? 10 : 1500;
    if (b) {
      const bx = parseFloat(b.dataset.x), by = parseFloat(b.dataset.y);
      b.animate([
        { transform: `translate(${bx}px,${by}px) scale(1)` },
        { transform: `translate(${(bx + target.x) / 2}px,${Math.min(by, target.y) - 90}px) scale(1.12)`, offset: 0.5 },
        { transform: `translate(${target.x}px,${target.y}px) scale(1.25)` },
      ], { duration: dur, easing: "cubic-bezier(.45,.05,.35,1)", fill: "forwards" });
    }
    if (layer) layer.style.transformOrigin = `${target.x}px ${target.y}px`;
    if (layer) layer.animate([{ transform: "scale(1)" }, { transform: "scale(1.35)" }],
      { duration: dur, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards", delay: dur * 0.25 }).finished.catch(() => {});
    setTimeout(() => go(r.route), dur * 0.95);
  }, [L, animateYaw, flying, busy]);

  const pick = (r) => {
    if (moved.current) return;
    if (ptype.current === "touch" && sel !== r.id) { setSel(r.id); return; }
    travel(r);
  };

  // ---------- draw ----------
  const sides = SIDE.map((r) => {
    const p = place(L, norm(r.angle - yaw));
    const w = BASEW[r.id] * p.s * L.k;
    return { r, p, w, z: Math.round(50 + p.d * 40) };
  });
  const cityZ = 50;
  const bx = portrait ? 560 : 870, by = portrait ? 380 : 150; // beside the city, where no island passes
  const n = REALMS.filter((r) => visited.includes(r.id)).length;
  const line = flying ? "Hold on to the basket!" : n === 0
    ? "Every realm is joined by a bridge, and the high ones by floating rune stones. Drag to turn the world, then pick a realm and I'll fly you there."
    : n < REALMS.length ? `${n} of ${REALMS.length} realms explored. The Skyport at the top is where my journey goes next.` : "You've seen every realm. The Crown at the top of the Vast City is open now.";
  const skyShift = Math.sin(yaw * D2R) * 30;

  return (
    <div className="world" onPointerDown={onDown} onClick={(e) => { if (!moved.current && e.target === e.currentTarget) setSel(null); }}>
      <Living src={art("01-world/bg-sky")} amount={10} drift={false} position={`calc(50% + ${skyShift}px) 40%`} />
      <Particles kind="motes" density={0.7} />
      <div className="w-layer" ref={layerRef} onClick={(e) => { if (!moved.current && e.target === e.currentTarget) setSel(null); }}>
        {sides.map(({ r, p, w, z }) => {
          const st = bridgeStyle(L, p, w);
          const runes = p.d < -0.25;
          return <img key={"b" + r.id} className="w-bridge" alt="" draggable="false" src={art(runes ? "01-world/bridge-runes" : "01-world/bridge-arch")}
            style={{ ...st, zIndex: Math.min(z, cityZ) - 2, opacity: st.opacity * (runes ? 0.85 : 1) }} />;
        })}
        <Island r={CITY} x={L.cx} y={L.cy} w={L.cityW} z={cityZ} d={1} visited={visited.includes("city")} onPick={pick}
          onHover={(id) => setSel(id)} sel={sel} />
        {sides.map(({ r, p, w, z }) => (
          <Island key={r.id} r={r} x={p.x} y={p.y} w={w} z={z} d={p.d} visited={visited.includes(r.id)} onPick={pick} onHover={(id) => setSel(id)} sel={sel} />
        ))}
        <img ref={balloonRef} className="w-balloon" src={art("00-roy-and-ui/roy-balloon-side")} alt="Roy waving from his balloon" draggable="false"
          data-x={bx} data-y={by} style={{ transform: `translate(${bx}px,${by}px)` }} />
      </div>
      <div className="w-cloudsea" />
      <AnimatePresence>
        {sel && !flying && <Preview key={sel} r={REALMS.find((x) => x.id === sel)} visited={visited.includes(sel)} onGo={travel} onClose={() => setSel(null)} portrait={portrait} />}
      </AnimatePresence>
      {!flying && (
        <div className="w-turn">
          <button type="button" className="ico" aria-label="Turn left" onClick={(e) => { e.stopPropagation(); animateYaw(Math.round(yaw / 60) * 60 - 60); }}>⟲</button>
          <span>drag to turn</span>
          <button type="button" className="ico" aria-label="Turn right" onClick={(e) => { e.stopPropagation(); animateYaw(Math.round(yaw / 60) * 60 + 60); }}>⟳</button>
        </div>
      )}
      <Dialogue expr={flying ? "surprised" : "happy"} text={line} />
    </div>
  );
}

function Island({ r, x, y, w, z, d, visited, onPick, onHover, sel }) {
  const back = d < -0.3;
  return (
    <div className={"w-isl" + (back ? " back" : "") + (sel === r.id ? " sel" : "")} style={{ left: x, top: y, width: w, zIndex: z }}>
      <button type="button" className="w-hit" onClick={() => onPick(r)} onPointerEnter={(e) => e.pointerType === "mouse" && onHover(r.id)}
        onFocus={(e) => e.target.matches?.(":focus-visible") && onHover(r.id)} aria-label={`Travel to ${r.name}`}>
        <img src={art("01-world/" + r.island)} alt="" draggable="false" style={{ animationDelay: `${(r.angle || 0) / -60}s` }} />
      </button>
      <div className={"wp" + (visited ? " lit" : "")} style={{ left: "50%", top: 4 }}>
        <div className="d" /><div className="s" /><div className="l">{r.name}{visited ? " ✓" : ""}</div>
      </div>
    </div>
  );
}

function Preview({ r, visited, onGo, onClose, portrait }) {
  if (!r) return null;
  return (
    <motion.div className={"panel w-pv" + (portrait ? " p" : "")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
      onPointerDown={(e) => e.stopPropagation()}>
      <div className="im" style={{ backgroundImage: `url(${art(r.preview)})` }} />
      <div className="tx"><b>{r.name}</b><p>{r.short}</p>
        <div className="r"><span>{visited ? "Visited ✓" : "Not visited yet"}</span></div>
        <div className="bb"><Btn className="sm" onClick={() => onGo(r)}>✦ TRAVEL HERE</Btn>{portrait && <Btn dark className="sm" onClick={onClose}>Close</Btn>}</div>
      </div>
    </motion.div>
  );
}
