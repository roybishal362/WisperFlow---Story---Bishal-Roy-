// Light ambient particles on a canvas: gold motes, embers, petals, fireflies, lantern glow, crystal sparks.
import { useEffect, useRef } from "react";
import { BgBox } from "./Stage";
import { useMotion } from "../lib/core";

const KINDS = {
  motes: { n: 46, col: ["255,226,150", "255,244,210"], r: [1, 2.6], vy: [-0.25, -0.05], vx: [-0.12, 0.12], glow: 8 },
  embers: { n: 60, col: ["255,160,70", "255,200,110", "255,110,50"], r: [1, 2.4], vy: [-1.1, -0.35], vx: [-0.3, 0.3], glow: 10 },
  petals: { n: 26, col: ["255,190,210", "255,225,235", "250,170,200"], r: [2.5, 4.5], vy: [0.25, 0.6], vx: [0.2, 0.6], glow: 0, petal: true },
  fireflies: { n: 30, col: ["255,226,140", "190,255,210"], r: [1.2, 2.4], vy: [-0.15, 0.15], vx: [-0.2, 0.2], glow: 14, blink: true },
  crystals: { n: 44, col: ["126,240,244", "200,160,255", "180,255,250"], r: [1, 2.2], vy: [-0.35, -0.08], vx: [-0.1, 0.1], glow: 12, blink: true },
  lanterns: { n: 18, col: ["255,190,110", "255,220,150"], r: [3, 5], vy: [-0.35, -0.15], vx: [-0.08, 0.08], glow: 18, lantern: true },
};
const rnd = (a, b) => a + Math.random() * (b - a);

export default function Particles({ kind = "motes", density = 1 }) {
  const ref = useRef(null);
  const on = useMotion();
  useEffect(() => {
    const cv = ref.current; if (!cv || !on) { cv?.getContext("2d").clearRect(0, 0, cv.width, cv.height); return; }
    const K = KINDS[kind] || KINDS.motes, ctx = cv.getContext("2d");
    let W = 0, H = 0, raf, t = 0;
    const fit = () => { W = cv.width = cv.clientWidth; H = cv.height = cv.clientHeight; };
    fit();
    const make = (init) => ({ x: Math.random() * W, y: init ? Math.random() * H : (K.vy[1] > 0 ? -10 : H + 10),
      r: rnd(...K.r), vx: rnd(...K.vx), vy: rnd(...K.vy), c: K.col[(Math.random() * K.col.length) | 0], ph: Math.random() * 6.28, rot: Math.random() * 6.28 });
    const ps = Array.from({ length: Math.round(K.n * density) }, () => make(true));
    const ro = new ResizeObserver(fit); ro.observe(cv);
    const draw = () => {
      t += 0.016; ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.x += p.vx + Math.sin(t + p.ph) * 0.15; p.y += p.vy; p.rot += 0.01;
        if (p.y < -20 || p.y > H + 20 || p.x < -20 || p.x > W + 20) Object.assign(p, make(false));
        const a = K.blink ? 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + p.ph)) : 0.85;
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = `rgb(${p.c})`;
        if (K.glow) { ctx.shadowColor = `rgba(${p.c},0.9)`; ctx.shadowBlur = K.glow; }
        if (K.petal) { ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.6, p.r * 0.8, 0, 0, 6.28); ctx.fill(); }
        else if (K.lantern) { ctx.fillRect(p.x - p.r * 0.7, p.y - p.r, p.r * 1.4, p.r * 2); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); }
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [kind, density, on]);
  return <BgBox className="particles"><canvas ref={ref} /></BgBox>;
}
