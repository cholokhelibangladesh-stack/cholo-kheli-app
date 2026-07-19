import { useRef, useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

/** Horizontal scroller: hidden scrollbar, drag-to-scroll (mouse + touch native). */
const DragScroller = ({ children, className = "" }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let moved = false;

    const onDown = (e: PointerEvent) => {
      // Only left mouse; allow all pen/touch
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
      // Don't capture touch — let native touch scrolling handle it smoothly
      if (e.pointerType === "mouse") {
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown || e.pointerType !== "mouse") return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = scrollStart - dx;
    };
    const endDrag = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      if (e.pointerType === "mouse") {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {}
        el.style.cursor = "grab";
      }
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
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
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`overflow-x-auto no-scrollbar select-none touch-pan-x ${className}`}
      style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
};

export default DragScroller;
