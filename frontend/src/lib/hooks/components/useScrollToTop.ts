"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SCROLL_TO_TOP_THRESHOLD } from "../../constants/scroll";

type UseScrollToTopOptions = {
  threshold?: number;
};

const SCROLLABLE_OVERFLOW = ["auto", "scroll", "overlay"];

export function useScrollToTop({
  threshold = SCROLL_TO_TOP_THRESHOLD,
}: UseScrollToTopOptions = {}) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLElement | Window | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroller = findScrollContainer(anchorRef.current);
    scrollerRef.current = scroller;

    function handleScroll() {
      setVisible(getScrollTop(scroller) > threshold);
    }

    /* the container may already be scrolled on mount (a preserved route, a
       reload part-way down), so seed the state before the first event */
    handleScroll();

    const target: EventTarget = scroller;
    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { anchorRef, visible, scrollToTop };
}

function findScrollContainer(anchor: HTMLElement | null): HTMLElement | Window {
  let node = anchor?.parentElement ?? null;

  while (node) {
    if (SCROLLABLE_OVERFLOW.includes(getComputedStyle(node).overflowY)) return node;
    node = node.parentElement;
  }

  return window;
}

function getScrollTop(scroller: HTMLElement | Window): number {
  return scroller instanceof Window ? scroller.scrollY : scroller.scrollTop;
}
