// Background music: a short playlist that plays in order and loops.
// It starts with the visitor's first click (browsers block sound before that), unless they turned it
// off on an earlier visit. The on/off choice and the last track are remembered.
import { useSyncExternalStore } from "react";
import { MUSIC } from "../content";

const KEY = "vast-realm-music", TKEY = "vast-realm-track", VOL = 0.3, DUCK = 0.03;
const N = MUSIC.tracks.length;
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

let pref = read(KEY);                       // "on", "off", or null (never chosen)
let idx = Math.min(N - 1, Math.max(0, parseInt(read(TKEY) || "0", 10) || 0));
let playing = false, ducked = false, errors = 0, audio = null, raf = 0;
let snap = { playing, idx };
const subs = new Set();
const emit = () => { snap = { playing, idx }; subs.forEach((f) => f()); };

function el() {
  if (!audio && typeof Audio !== "undefined") {
    audio = new Audio(); audio.preload = "none"; audio.volume = 0;
    audio.addEventListener("ended", () => go(idx + 1));
    audio.addEventListener("playing", () => { errors = 0; });
    audio.addEventListener("error", () => { if (playing && ++errors < N) go(idx + 1); else stop(); });
  }
  return audio;
}
function fade(to, ms, done) {
  cancelAnimationFrame(raf);
  const a = audio; if (!a) return;
  const from = a.volume, t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms); a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) raf = requestAnimationFrame(step); else done?.();
  };
  raf = requestAnimationFrame(step);
}
function load(i) { idx = ((i % N) + N) % N; write(TKEY, String(idx)); el().src = `/music/${MUSIC.tracks[idx].file}`; }
function play() {
  const a = el(); if (!a) return;
  if (!a.getAttribute("src")) load(idx);
  playing = true; emit();
  const p = a.play();
  if (p?.then) p.then(() => fade(ducked ? DUCK : VOL, 1500)).catch(() => { playing = false; emit(); });
}
function stop() { playing = false; emit(); if (audio) fade(0, 400, () => audio.pause()); }
function go(i) { const was = playing; load(i); if (was) { audio.volume = 0; play(); } else emit(); }
function choose(on) { pref = on ? "on" : "off"; write(KEY, pref); }

export const music = {
  get: () => snap,
  time: () => audio?.currentTime || 0,
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
  start() { if (pref !== "off" && !playing) play(); },
  toggle() { if (playing) { choose(false); stop(); } else { choose(true); play(); } },
  next: () => go(idx + 1),
  prev: () => go(idx - 1),
  pick(i) { choose(true); load(i); audio.volume = 0; play(); },
  // the Echo Caves listen for the visitor's voice: keep the music almost silent meanwhile
  duck(on) { ducked = on; if (playing) fade(on ? DUCK : VOL, 300); },
};
export const useMusic = () => useSyncExternalStore(music.subscribe, music.get);

if (typeof window !== "undefined") {
  window.__vrMusic = music;   // read by the tests
  // the first click anywhere starts the music; a click on the music button itself is left to the button
  window.addEventListener("pointerdown", (e) => { if (!e.target.closest?.(".mus")) music.start(); }, { once: true, capture: true });
  document.addEventListener("visibilitychange", () => {
    if (!audio || !playing) return;
    if (document.hidden) audio.pause(); else audio.play().catch(() => { /* resumes on the next click */ });
  });
}
