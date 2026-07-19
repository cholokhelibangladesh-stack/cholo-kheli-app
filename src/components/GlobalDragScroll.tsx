import { useEffect } from "react";

/**
 * Mouse click-and-drag vertical/horizontal scroll for the window with inertia,
 * rAF-throttled. Touch uses native scrolling (already has momentum on iOS/Android).
 * Ignores interactive elements, existing scrollable containers, text selections,
 * inputs, and keyboard/AT focus paths.
 */
const GlobalDragScroll = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const INTERACTIVE =
      "a,button,input,textarea,select,label,summary,video,audio," +
      "[role='button'],[role='slider'],[role='switch'],[role='textbox']," +
      "[role='combobox'],[role='listbox'],[role='option'],[role='menuitem']," +
      "[contenteditable='true'],[contenteditable=''],[data-no-drag]";

    const isScrollable = (el: Element | null) => {
      while (el && el !== document.body) {
        const s = getComputedStyle(el as HTMLElement);
        const h = el as HTMLElement;
        if ((s.overflowY === "auto" || s.overflowY === "scroll") && h.scrollHeight > h.clientHeight) return true;
        if ((s.overflowX === "auto" || s.overflowX === "scroll") && h.scrollWidth > h.clientWidth) return true;
        el = el.parentElement;
      }
      return false;
    };

    let isDown = false;
    let startX = 0, startY = 0;
    let startScrollX = 0, startScrollY = 0;
    let lastX = 0, lastY = 0, lastT = 0;
    let vX = 0, vY = 0; // px/ms
    let moved = false;
    let raf = 0;
    let pendingX = 0, pendingY = 0;
    let inertiaRaf = 0;

    const stopInertia = () => {
      if (inertiaRaf) { cancelAnimationFrame(inertiaRaf); inertiaRaf = 0; }
    };

    const flushScroll = () => {
      raf = 0;
      window.scrollTo(pendingX, pendingY);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const target = e.target as Element | null;
      if (!target) return;
      if (target.closest(INTERACTIVE)) return;
      if (isScrollable(target)) return;
      // Preserve text selection: skip if there is an active non-collapsed selection
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;

      stopInertia();
      isDown = true;
      moved = false;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      startScrollX = pendingX = window.scrollX;
      startScrollY = pendingY = window.scrollY;
      lastT = performance.now();
      vX = vY = 0;
      document.body.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        moved = true;
        // Clear any selection created incidentally so text doesn't highlight during drag
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
      }
      pendingX = startScrollX - dx;
      pendingY = startScrollY - dy;
      if (!raf) raf = requestAnimationFrame(flushScroll);

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        // Instantaneous velocity, low-pass filtered
        vX = 0.8 * ((lastX - e.clientX) / dt) + 0.2 * vX;
        vY = 0.8 * ((lastY - e.clientY) / dt) + 0.2 * vY;
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };

    const startInertia = () => {
      const friction = 0.94;
      const minV = 0.02;
      let x = window.scrollX;
      let y = window.scrollY;
      const step = () => {
        vX *= friction;
        vY *= friction;
        if (Math.abs(vX) < minV && Math.abs(vY) < minV) { inertiaRaf = 0; return; }
        x += vX * 16;
        y += vY * 16;
        window.scrollTo(x, y);
        inertiaRaf = requestAnimationFrame(step);
      };
      inertiaRaf = requestAnimationFrame(step);
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      document.body.style.cursor = "";
      if (moved && (Math.abs(vX) > 0.05 || Math.abs(vY) > 0.05)) startInertia();
    };

    const onClickCapture = (e: MouseEvent) => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    };

    // Cancel inertia on any user input
    const onWheel = () => stopInertia();
    const onKey = () => stopInertia();
    const onTouch = () => stopInertia();

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("click", onClickCapture, true);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouch, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouch);
      if (raf) cancelAnimationFrame(raf);
      stopInertia();
    };
  }, []);
  return null;
};

export default GlobalDragScroll;
