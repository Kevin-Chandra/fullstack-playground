"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_PAGINATION_PAGE } from "../constants/pagination";
import { BasePaginationParam } from "../types/BasePaginationParam";
import { ErrorEntity } from "../types/ErrorEntity";
import { Paginated } from "../types/Paginated";
import { Result } from "../types/result";

export type PaginatedListHook<T, P extends BasePaginationParam> = () => {
  fetch: (params: P) => Promise<Result<Paginated<T>, ErrorEntity>>;
};

export interface InfiniteListResult<T> {
  /** All combined item result */
  items: T[];
  /**
   * First load (or a reload after reset) — nothing on screen behind it. True
   * from the first render, before the mount fetch has even started.
   */
  loadingFirstPage: boolean;
  /** A later page loading underneath items already on screen. */
  loadingNextPage: boolean;
  /** Set when the first page failed; `items` is empty behind it. */
  firstPageError?: ErrorEntity;
  /** Set when a later page failed; the loaded items stay on screen. */
  nextPageError?: ErrorEntity;
  /** False once the loaded page is the last one the server reports. */
  hasNextPage: boolean;
  loadNextPage: () => void;
  /** Reset and refetch first page */
  loadFirstPage: () => void;
}

/** Appends `incoming`, skipping any item whose `id` is already in `current`. */
function mergeItems<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !seen.has(item.id))];
}

/**
 * Turns any {@link PaginatedListHook} into an infinite-scroll list: keeps every
 * page fetched so far in one growing array instead of swapping the page out.
 *
 * The wrapped hook still owns a single page — this one drives its `page`
 * argument forward and folds each successful response into `items`, deduped by
 * `id` (see {@link mergeItems}), so a page that overlaps one already loaded
 * cannot double up entries.
 *
 * Loading is driven three ways:
 * - mount and every later change of `params.search` run {@link loadFirstPage}
 *   through an effect, which clears `items`, returns to page 1 and refetches;
 * - `loadNextPage` fetches the page after the last one loaded, and no-ops
 *   while a request is in flight or once the end of the list is known;
 * - callers may invoke `loadFirstPage` directly to reload from scratch.
 *
 * `hasNextPage` comes from the response's own `meta`, not from counting items:
 * the list has more to give while `currentPage` is short of `totalPages`.
 * Errors are split by position —
 * a failed first page surfaces as `firstPageError` with an empty list, while a
 * failed later page surfaces as `nextPageError` and leaves the loaded items on
 * screen. A failed page is not counted as loaded, so the next `loadNextPage`
 * retries it rather than skipping over its items.
 *
 * Note that `params.page` is ignored outright — this hook owns the cursor and
 * always starts from {@link BASE_PAGINATION_PAGE} — and `params` is otherwise
 * only re-read for `search`, so a changed `limit` on an already-mounted list
 * has no effect until something else triggers a fetch. Pass it memoized — the returned callbacks are keyed off it, so a fresh
 * object literal on every render rebuilds all three and defeats any consumer
 * memoizing against them.
 *
 * Requests are not cancellable, so overlap is resolved on arrival instead:
 * every request takes a serial from {@link requestIdRef}, and a response whose
 * serial is no longer the newest is dropped. Unlike matching on page number,
 * this also discards a page-1 response left over from a previous search term.
 */
export function useInfiniteList<T extends { id: string }, P extends BasePaginationParam>(
  usePaginatedList: PaginatedListHook<T, P>,
  params: P
): InfiniteListResult<T> {
  const [items, setItems] = useState<T[]>([]);

  // Starts true so the list shows its spinner on the very first render, instead
  // of flashing an empty state until the mount effect starts the request.
  const [loadingFirstPage, setLoadingFirstPage] = useState(true)
  const [loadingNextPage, setLoadingNextPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const { fetch } = usePaginatedList();

  const [firstPageError, setFirstPageError] = useState<ErrorEntity>()
  const [nextPageError, setNextPageError] = useState<ErrorEntity>()

  /**
   * Last page whose response was applied. Only meaningful once `hasNextPage`
   * is true, which a success must have set first. Never rendered, so a ref.
   */
  const loadedPageRef = useRef(BASE_PAGINATION_PAGE);

  /** Serial of the most recently started request — see {@link fetchData}. */
  const requestIdRef = useRef(0);

  const fetchData = useCallback(
    async (targetPage: number) => {
      const requestId = ++requestIdRef.current;

      setFirstPageError(undefined)
      setNextPageError(undefined)
      setLoadingNextPage(targetPage !== BASE_PAGINATION_PAGE)
      setLoadingFirstPage(targetPage === BASE_PAGINATION_PAGE)

      const result = await fetch({ ...params, page: targetPage })

      // A newer request supersedes this one; let its response win instead.
      if (requestId !== requestIdRef.current) return;

      setLoadingFirstPage(false)
      setLoadingNextPage(false)

      if (result.success) {
        const { data: resultItems, meta } = result.data
        loadedPageRef.current = targetPage;
        setItems((current) => mergeItems(current, resultItems))
        setHasNextPage(meta.currentPage < meta.totalPages)
      } else if (targetPage === BASE_PAGINATION_PAGE) {
        setFirstPageError(result.error)
      } else {
        setNextPageError(result.error)
      }
    },
    [fetch, params],
  )

  const loadNextPage = useCallback(() => {
    if (loadingFirstPage || loadingNextPage || !hasNextPage) return;

    fetchData(loadedPageRef.current + 1);
  }, [fetchData, hasNextPage, loadingFirstPage, loadingNextPage]);

  /**
   * Drops every loaded page and requests page 1 again. Deliberately unguarded:
   * `loadingFirstPage` starts true, so bailing on it would bail on the mount
   * effect and nothing would ever load.
   */
  const loadFirstPage = useCallback(() => {
    setItems([]);
    setHasNextPage(false);
    setFirstPageError(undefined);
    setNextPageError(undefined);

    fetchData(BASE_PAGINATION_PAGE);
  }, [fetchData]);

  // Keyed on the search term alone, on purpose: `loadFirstPage` takes a new
  // identity every time `params` changes, so depending on it would refetch on
  // renders that changed nothing the list reads.
  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search])

  return {
    items,
    loadingFirstPage,
    loadingNextPage,
    firstPageError,
    nextPageError,
    hasNextPage,
    loadNextPage,
    loadFirstPage,
  };
}
