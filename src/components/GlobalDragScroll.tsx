import { useEffect } from "react";

/** Enables click-and-drag vertical (and horizontal) scrolling on the window with a mouse.
 *  Touch already scrolls natively. Ignores drags that start on interactive elements
 *  or inside scrollable containers (so buttons, inputs, sliders still work). */
const GlobalDragScroll = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let startScrollX = 0;
    let startScrollY = 0;
    let moved = false;

    const INTERACTIVE = "a,button,input,textarea,select,label,summary,video,audio,[role='button'],[role='slider'],[role='switch'],[contenteditable='true'],[data-no-drag]";

    const isScrollable = (el: Element | null) => {
      while (el && el !== document.body) {
        const s = getComputedStyle(el as HTMLElement);
        const oy = s.overflowY;
        const ox = s.overflowX;
        if ((oy === "auto" || oy === "scroll") && (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight) return true;
        if ((ox === "auto" || ox === "scroll") && (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth) return true;
        el = el.parentElement;
      }
      return false;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const target = e.target as Element | null;
      if (target && (target.closest(INTERACTIVE) || isScrollable(target))) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      startScrollX = window.scrollX;
      startScrollY = window.scrollY;
      document.body.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      window.scrollTo(startScrollX - dx, startScrollY - dy);
    };
    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      document.body.style.cursor = "";
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("click", onClickCapture, true);
    };
  }, []);
  return null;
};

export default GlobalDragScroll;
