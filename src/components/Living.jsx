// A "living painting": the background drifts slowly (Ken Burns) and leans with the pointer (parallax).
import { useEffect, useRef } from "react";
import { BgBox } from "./Stage";
import { useMotion } from "../lib/core";

let px = 0, py = 0; // shared pointer position, -1..1
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    px = (e.clientX / window.innerWidth) * 2 - 1;
    py = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
}

export function useParallax(ref, amount = 14) {
  const on = useMotion();
  useEffect(() => {
    if (!on) { if (ref.current) ref.current.style.translate = "0px 0px"; return; }
    let raf, cx = 0, cy = 0;
    const tick = () => {
      cx += (px * amount - cx) * 0.06; cy += (py * amount * 0.6 - cy) * 0.06;
      if (ref.current) ref.current.style.translate = `${-cx}px ${-cy}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ref, amount, on]);
}

export default function Living({ src, amount = 14, drift = true, position = "center", filter, children, className = "" }) {
  const ref = useRef(null);
  const on = useMotion();
  useParallax(ref, amount);
  return (
    <BgBox className={"living " + className}>
      <div ref={ref} className="living-in">
        <img src={src} alt="" draggable="false" className={drift && on ? "drift" : ""}
          style={{ objectPosition: position, filter }} />
      </div>
      {children}
    </BgBox>
  );
}
