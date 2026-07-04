import { motion } from "framer-motion";
import logoMark from "@/assets/cholo-kheli-mark.png.asset.json";

/** Route pending fallback — same silver-mark loading language as the intro. */
export function RoutePendingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 40%, #7EC8FF 0%, #4DA9F7 55%, #2E86D6 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 30% at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 60%), radial-gradient(35% 28% at 80% 85%, rgba(255,255,255,0.22) 0%, transparent 60%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-5" data-logo-intro>
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{ opacity: 1, scale: [0.72, 1, 0.96, 1] }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "min(58vw, 220px)", aspectRatio: "1.49 / 1" }}
          aria-hidden
        >
          <img
            src={logoMark.url}
            alt=""
            className="absolute inset-0 h-full w-full object-contain select-none"
            draggable={false}
            decoding="sync"
            style={{
              filter:
                "brightness(0) invert(1) saturate(0) drop-shadow(0 8px 20px rgba(20,50,90,0.34)) drop-shadow(0 2px 5px rgba(255,255,255,0.45))",
            }}
          />
        </motion.div>
        <span className="text-[10px] tracking-[0.42em] uppercase text-white/90 font-medium drop-shadow-[0_2px_10px_rgba(0,40,80,0.35)]">
          Cholo Kheli
        </span>
      </div>
    </div>
  );
}

export default RoutePendingFallback;
