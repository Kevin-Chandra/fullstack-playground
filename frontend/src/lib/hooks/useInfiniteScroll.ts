"use client";

import { useEffect, useRef } from "react";
import { BOTTOM_MARGIN_INFINITE_LIST } from "../constants/pagination";

type UseInfiniteScrollOptions = {
  enabled?: boolean;
  rootMargin?: string;
};

/**
 * Fires `onLoadMore` when the returned sentinel element scrolls into view.
 *
 * Attach the ref to an empty element placed after the last item. Keep `enabled`
 * false while a page is in flight, on the last page, or after a failed page —
 * the sentinel stays mounted and the observer is simply not attached, so
 * resuming is a state change rather than a remount. Leaving it true across a
 * failed page spins: the observer re-fires against a sentinel that is still on
 * screen, and the failure that put it there does not block the next attempt.
 *
 * `rootMargin` grows the trigger area past the viewport so the next page starts
 * loading before the user actually hits the bottom.
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  { enabled = true, rootMargin = BOTTOM_MARGIN_INFINITE_LIST }: UseInfiniteScrollOptions = {},
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
