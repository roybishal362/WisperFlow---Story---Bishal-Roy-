// The designed 1440x900 stage (or 820x1460 on phones held upright), scaled to fit the window.
// Backgrounds use the "bg box": the whole window, expressed in stage coordinates, so paintings always fill the screen.
import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
export const useStage = () => useContext(Ctx);

function measure() {
  const W = window.innerWidth, H = window.innerHeight;
  const portrait = H > W * 1.15 && W < 900;
  const sw = portrait ? 820 : 1440, sh = portrait ? 1460 : 900;
  const s = Math.min(W / sw, H / sh);
  const bw = W / s, bh = H / s;
  return { W, H, sw, sh, s, portrait, bg: { left: -(bw - sw) / 2, top: -(bh - sh) / 2, width: bw, height: bh } };
}

export default function Stage({ children }) {
  const [m, setM] = useState(measure);
  useEffect(() => {
    let raf = 0;
    const f = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setM(measure())); };
    window.addEventListener("resize", f);
    window.addEventListener("orientationchange", f);
    return () => { window.removeEventListener("resize", f); window.removeEventListener("orientationchange", f); };
  }, []);
  return (
    <Ctx.Provider value={m}>
      <div className="viewport">
        <div className={"stage" + (m.portrait ? " portrait" : "")}
          style={{ width: m.sw, height: m.sh, transform: `translate(-50%,-50%) scale(${m.s})` }}>
          {children}
        </div>
      </div>
    </Ctx.Provider>
  );
}

// A full-window layer (in stage coordinates).
export function BgBox({ children, style, className = "" }) {
  const { bg } = useStage();
  return <div className={"bgbox " + className} style={{ ...bg, ...style }}>{children}</div>;
}

// A box with the painting's aspect ratio that covers the window; children can be placed in % of the painting.
export function CoverBox({ aspect = 1376 / 768, children, style, className = "" }) {
  const { bg } = useStage();
  let w = bg.width, h = w / aspect;
  if (h < bg.height) { h = bg.height; w = h * aspect; }
  return (
    <div className={"coverbox " + className}
      style={{ left: bg.left + (bg.width - w) / 2, top: bg.top + (bg.height - h) / 2, width: w, height: h, ...style }}>
      {children}
    </div>
  );
}
