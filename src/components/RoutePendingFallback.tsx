import { motion } from "framer-motion";
import CholoKheliMark from "@/components/CholoKheliMark";

/** Route pending fallback — always uses the official Cholo Kheli mark. */
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
          style={{ width: "min(54vw, 190px)", aspectRatio: "1.75 / 1" }}
          aria-hidden
        >
          <CholoKheliMark className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(20,50,90,0.32)]" />
        </motion.div>
        <span className="text-[10px] tracking-[0.42em] uppercase text-white/90 font-medium drop-shadow-[0_2px_10px_rgba(0,40,80,0.35)]">
          Cholo Kheli
        </span>
      </div>
    </div>
  );
}

export default RoutePendingFallback;
