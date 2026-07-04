/**
 * Route pending fallback — a soft candy-blue screen that visually matches
 * the 3D logo intro on the homepage. Prevents a white flash before the
 * intro mounts and keeps the loading state on-brand between route changes.
 */
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
      <div className="relative flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 rounded-full border-2 border-white/40 border-t-white animate-spin"
          aria-hidden
        />
        <span className="text-[10px] tracking-[0.42em] uppercase text-white/90 font-medium">
          Cholo Kheli
        </span>
      </div>
    </div>
  );
}

export default RoutePendingFallback;
