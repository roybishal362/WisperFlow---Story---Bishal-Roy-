// Reusable UI: Roy's dialogue, region title, buttons, toast.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { roy, reducedMotion } from "../lib/core";
import { talk, useTalk } from "../lib/talk";

export function Dialogue({ expr = "happy", text, children, className = "" }) {
  const [shown, setShown] = useState(0);
  const timer = useRef(null);
  const plain = typeof text === "string" ? text : "";
  useEffect(() => {
    setShown(reducedMotion() ? plain.length : 0);
    clearInterval(timer.current);
    if (reducedMotion()) return;
    timer.current = setInterval(() => setShown((n) => { if (n >= plain.length) { clearInterval(timer.current); return n; } return n + 2; }), 28);
    return () => clearInterval(timer.current);
  }, [plain]);
  const done = shown >= plain.length;
  const chat = useTalk();
  return (
    <motion.div className={"dlg " + className} style={{ x: "-50%" }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}
      onClick={() => setShown(plain.length)}>
      <div className="por" style={{ backgroundImage: `url(${roy(expr)})` }} />
      <div className="box">
        <div className="name">ROY</div>
        {chat.ready && !chat.open && <button type="button" className="ask" onClick={(e) => { e.stopPropagation(); talk.open(); }}>💬 Ask me anything</button>}
        <div className="txt" aria-live="polite">{plain.slice(0, shown)}<span className="ghost">{plain.slice(shown)}</span></div>
        {children && done && <div className="dlg-act">{children}</div>}
        <div className="next">{done ? "◆" : "▼"}</div>
      </div>
    </motion.div>
  );
}

export function Region({ title, sub, className = "", style }) {
  return (
    <motion.div className={"region " + className} style={style} initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <h1>{title}</h1><div className="orn" /><p>{sub}</p>
    </motion.div>
  );
}

export function Btn({ children, dark, onClick, href, className = "", ...rest }) {
  const cls = "btn" + (dark ? " dark" : "") + " " + className;
  if (href) return <a className={cls} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" {...rest}>{children}</a>;
  return <button type="button" className={cls} onClick={onClick} {...rest}>{children}</button>;
}

export function Toast({ show, title, text, icon = "★" }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="panel toast" style={{ x: "-50%" }} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.35 }}>
          <i>{icon}</i><div><b>{title}</b><span>{text}</span></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Panels slide in a little after the scene appears.
export const enter = (delay = 0.25, x = 0, y = 16) => ({
  initial: { opacity: 0, x, y }, animate: { opacity: 1, x: 0, y: 0 }, transition: { duration: 0.5, delay },
});
