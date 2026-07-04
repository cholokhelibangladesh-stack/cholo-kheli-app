import { motion } from "framer-motion";

const SilverLogoMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 360 240" className={className} aria-hidden>
    <defs>
      <linearGradient id="ck-pending-silver" x1="35" y1="20" x2="326" y2="220" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.26" stopColor="#dce3ea" />
        <stop offset="0.5" stopColor="#ffffff" />
        <stop offset="0.72" stopColor="#9aa4af" />
        <stop offset="1" stopColor="#f6f9fc" />
      </linearGradient>
      <filter id="ck-pending-shadow" x="-20%" y="-25%" width="140%" height="150%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#14325a" floodOpacity="0.3" />
      </filter>
    </defs>
    <g fill="none" stroke="url(#ck-pending-silver)" strokeWidth="18" strokeLinecap="round" filter="url(#ck-pending-shadow)">
      <path d="M35 166C125 150 224 103 259 18" />
      <path d="M89 185C183 162 289 94 302 9" />
    </g>
    <path d="M281 111 342 218h-82l-45-62 37-58z" fill="url(#ck-pending-silver)" filter="url(#ck-pending-shadow)" />
  </svg>
);

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
          <SilverLogoMark className="absolute inset-0 h-full w-full" />
        </motion.div>
        <span className="text-[10px] tracking-[0.42em] uppercase text-white/90 font-medium drop-shadow-[0_2px_10px_rgba(0,40,80,0.35)]">
          Cholo Kheli
        </span>
      </div>
    </div>
  );
}

export default RoutePendingFallback;
