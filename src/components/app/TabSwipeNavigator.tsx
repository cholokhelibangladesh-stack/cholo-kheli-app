import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

interface Props {
  tabs: string[];
}

/**
 * Touch-only horizontal swipe navigation between primary tabs.
 * - Activates on touch pointers (iOS/Android); mouse users use the tab bar.
 * - Ignores swipes that start on inputs, buttons, or horizontally scrollable areas
 *   (carousels, DragScroller rails), so it never fights native gestures.
 * - Requires clearly horizontal intent + minimum distance to trigger.
 */
const TabSwipeNavigator = ({ tabs }: Props) => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined" || tabs.length < 2) return;

    const INTERACTIVE =
      "a,button,input,textarea,select,label,summary,video,audio," +
      "[role='button'],[role='slider'],[role='switch'],[role='tab']," +
      "[contenteditable='true'],[data-no-swipe]";

    const hasHorizontalScroll = (el: Element | null) => {
      while (el && el !== document.body) {
        const h = el as HTMLElement;
        const s = getComputedStyle(h);
        if ((s.overflowX === "auto" || s.overflowX === "scroll") && h.scrollWidth > h.clientWidth) return true;
        el = el.parentElement;
      }
      return false;
    };

    let startX = 0, startY = 0, startT = 0;
    let tracking = false;
    let blocked = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { tracking = false; return; }
      const t = e.touches[0];
      const target = e.target as Element | null;
      blocked =
        !!target &&
        (!!target.closest(INTERACTIVE) || hasHorizontalScroll(target));
      // Edge swipes: reserve iOS back-swipe zone
      if (t.clientX < 20 || t.clientX > window.innerWidth - 20) blocked = true;
      startX = t.clientX;
      startY = t.clientY;
      startT = performance.now();
      tracking = true;
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking || blocked) { tracking = false; return; }
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = performance.now() - startT;
      // Require dominantly horizontal, meaningful distance, reasonable speed
      if (Math.abs(dx) < 60) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.6) return;
      if (dt > 700) return;

      const idx = tabs.findIndex(
        (to) => pathname === to || pathname.startsWith(to + "/")
      );
      if (idx === -1) return;
      const nextIdx = dx < 0 ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= tabs.length) return;
      navigate({ to: tabs[nextIdx] });
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", () => { tracking = false; }, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [tabs, pathname, navigate]);

  return null;
};

export default TabSwipeNavigator;
