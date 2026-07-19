import { useRef, useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Enable scroll-snap to first-level children (default true). */
  snap?: boolean;
  /** Persist scroll position under this key (sessionStorage). */
  persistId?: string;
}

/** Horizontal scroller: hidden scrollbar, drag-to-scroll (mouse), native touch w/ momentum. */
const DragScroller = ({ children, className = "", snap = true, persistId }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  // Restore + persist scroll position
  useEffect(() => {
    const el = ref.current;
    if (!el || !persistId) return;
    const key = `rail:${persistId}`;
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) el.scrollLeft = parseFloat(saved) || 0;
    } catch {}
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        try { sessionStorage.setItem(key, String(el.scrollLeft)); } catch {}
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [persistId]);

  // Apply snap alignment to first-level children
  useEffect(() => {
    const el = ref.current;
    if (!el || !snap) return;
    Array.from(el.children).forEach((c) => {
      (c as HTMLElement).style.scrollSnapAlign = "start";
    });
  }, [snap, children]);

  // Mouse drag (touch uses native inertia)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let moved = false;
    let raf = 0;
    let pendingX = 0;

    const applyScroll = () => {
      raf = 0;
      el.scrollLeft = pendingX;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
      // Temporarily disable snap during drag for smoothness
      if (snap) el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      pendingX = scrollStart - dx;
      if (!raf) raf = requestAnimationFrame(applyScroll);
    };
    const endDrag = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      el.style.cursor = "grab";
      if (snap) el.style.scrollSnapType = "x proximity";
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [snap]);

  return (
    <div
      ref={ref}
      className={`overflow-x-auto no-scrollbar select-none touch-pan-x ${className}`}
      style={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        overscrollBehaviorX: "contain",
        scrollSnapType: snap ? "x proximity" : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default DragScroller;
