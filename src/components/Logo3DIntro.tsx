import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen loading intro on a soft candy-blue backdrop. Renders the
 * Cholo Kheli mark as shiny silver (via CSS mask + metallic gradient) with
 * a sweeping sheen, then animates OUT with a scale + fade + blur exit so
 * the transition never snaps. Auto-dismisses after ~2.2s (or on tap).
 */

const CANDY_BLUE = "#7EC8FF";
const CANDY_BLUE_DEEP = "#4DA9F7";

const SilverLogoMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 360 240" className={className} role="img" aria-label="Cholo Kheli" data-logo-mark style={{ display: "block" }}>
    <g fill="none" stroke="#f7f9fb" strokeWidth="20" strokeLinecap="round" style={{ filter: "drop-shadow(0 12px 22px rgba(20,50,90,0.38))" }}>
      <path d="M35 166C125 150 224 103 259 18" />
      <path d="M89 185C183 162 289 94 302 9" />
    </g>
    <path
      d="M281 111 342 218h-82l-45-62 37-58z"
      fill="#f7f9fb"
      style={{ filter: "drop-shadow(0 12px 22px rgba(20,50,90,0.38))" }}
    />
  </svg>
);

interface Props {
  onDone: () => void;
  duration?: number; // ms
}

export default function Logo3DIntro({ onDone, duration = 2200 }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  const finish = () => setVisible(false);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="logo-intro"
          data-logo-intro
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onClick={finish}
          style={{
            background: `radial-gradient(120% 90% at 50% 40%, ${CANDY_BLUE} 0%, ${CANDY_BLUE_DEEP} 55%, #2E86D6 100%)`,
          }}
        >
          {/* Soft ambient light blobs */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(40% 30% at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 60%), radial-gradient(35% 28% at 80% 85%, rgba(255,255,255,0.22) 0%, transparent 60%)",
            }}
          />

          {/* Silver logo mark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{ width: "min(78vw, 360px)", aspectRatio: "1.49 / 1" }}
          >
            {/* Soft glow behind mark */}
            <div
              aria-hidden
              className="absolute inset-0 -m-8 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 45%, transparent 75%)",
                filter: "blur(6px)",
              }}
            />

            <SilverLogoMark className="absolute inset-0 h-full w-full" />

            {/* Sweeping specular sheen */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none rounded-[42%] mix-blend-screen"
            >
              <motion.div
                className="absolute top-0 bottom-0 w-1/3"
                initial={{ x: "-160%" }}
                animate={{ x: "260%" }}
                transition={{ delay: 0.5, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background:
                    "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)",
                  filter: "blur(2px)",
                }}
              />
            </div>
          </motion.div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="pointer-events-none mt-10 flex flex-col items-center gap-2"
          >
            <div className="font-display text-white tracking-[0.22em] text-xl font-semibold drop-shadow-[0_2px_10px_rgba(0,40,80,0.35)]">
              CHOLO <span className="font-bold">KHELI</span>
            </div>
            <div className="text-[10px] tracking-[0.42em] uppercase text-white/85">
              Let's Play
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
