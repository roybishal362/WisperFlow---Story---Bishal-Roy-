// Small shared helpers: art paths, preloading, hash routing, saved progress.
import { useEffect, useState, useSyncExternalStore } from "react";

export const art = (p) => `/art/${p}.webp`;
export const roy = (expr) => art(`00-roy-and-ui/roy-${expr}`);

const loaded = new Map();
export function preload(paths, timeoutMs = 8000) {
  const one = (src) => {
    if (loaded.has(src)) return loaded.get(src);
    const p = new Promise((res) => {
      const im = new Image();
      im.onload = () => (im.decode ? im.decode().catch(() => {}).then(res) : res());
      im.onerror = () => res();
      im.src = src;
    });
    loaded.set(src, p);
    return p;
  };
  const all = Promise.all(paths.map(one));
  return Promise.race([all, new Promise((r) => setTimeout(r, timeoutMs))]);
}

// ---------- hash router: #/realm/sub/... ----------
export function parse(hash) {
  const path = (hash || "").replace(/^#/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  return { path, realm: parts[0] || "title", sub: parts.slice(1) };
}
export function useRoute() {
  const [r, setR] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const f = () => setR(parse(window.location.hash));
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return r;
}
export const go = (path) => {
  if (window.location.hash !== "#" + path) window.location.hash = path;
};

// ---------- saved progress (localStorage) ----------
const KEY = "vast-realm-v1";
let state = { visited: [], bag: [], stages: {}, crystals: [], seen: [] };
try { state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { /* first visit */ }
const subs = new Set();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } subs.forEach((f) => f()); }
export const store = {
  get: () => state,
  subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
  visit(realm) { if (!state.visited.includes(realm)) { state = { ...state, visited: [...state.visited, realm] }; save(); } },
  addToBag(id) { if (!state.bag.includes(id)) { state = { ...state, bag: [...state.bag, id] }; save(); return true; } return false; },
  setStage(ws, n) { state = { ...state, stages: { ...state.stages, [ws]: n } }; save(); },
  seeIntro(id) { const seen = state.seen || []; if (!seen.includes(id)) { state = { ...state, seen: [...seen, id] }; save(); } },
  reset() { state = { visited: [], bag: [], stages: {}, crystals: [], seen: [] }; save(); },
};
export const useStore = () => useSyncExternalStore(store.subscribe, store.get);

// ---------- misc ----------
// Motion: full animations by default (the story depends on them); visitors can turn them off with the HUD switch.
const MKEY = "vast-realm-motion";
let motionOn = true;
try { motionOn = localStorage.getItem(MKEY) !== "off"; } catch { /* private mode */ }
const msubs = new Set();
export const motion = {
  get: () => motionOn,
  set(v) { motionOn = v; try { localStorage.setItem(MKEY, v ? "on" : "off"); } catch { /* private mode */ } document.documentElement.classList.toggle("calm", !v); msubs.forEach((f) => f()); },
  subscribe: (f) => { msubs.add(f); return () => msubs.delete(f); },
};
if (typeof document !== "undefined") document.documentElement.classList.toggle("calm", !motionOn);
export const useMotion = () => useSyncExternalStore(motion.subscribe, motion.get);
export const reducedMotion = () => !motionOn;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
