// Whether Talk to Roy is switched on (the server has an AI key) and whether the chat is open.
// Shared by the top bar, Roy's dialogue box (its "Ask me" tag) and the chat itself.
import { useSyncExternalStore } from "react";

let state = { ready: false, open: false };
const subs = new Set();
const set = (patch) => { state = { ...state, ...patch }; subs.forEach((f) => f()); };

export const talk = {
  get: () => state,
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
  open: () => state.ready && set({ open: true }),
  close: () => set({ open: false }),
};
export const useTalk = () => useSyncExternalStore(talk.subscribe, talk.get);

// asked once per visit
if (typeof window !== "undefined") {
  fetch("/api/roy").then((r) => (r.ok ? r.json() : { ready: false })).then((j) => set({ ready: !!j.ready })).catch(() => { /* stays off */ });
}
