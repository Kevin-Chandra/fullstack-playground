"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { QueryParams } from "../../constants/queryParams";
import { usePanelNavigation } from "../usePanelNavigation";

export type UserPageState =
  | { mode: "closed" }
  | { mode: "view"; pageSlug: string }

function panelFromSlug(pageSlug: string | null): UserPageState {
  return pageSlug ? { mode: "view", pageSlug } : { mode: "closed" };
}

export function usePagePanel() {
  const searchParams = useSearchParams();

  const navigation = usePanelNavigation<UserPageState>({
    // A slug in the URL (e.g. coming back from publications) opens the panel.
    initialPanel: panelFromSlug(searchParams.get(QueryParams.PAGE_SLUG)),
    guards: {},
    onLeave: {},
  });

  const { panel } = navigation;
  const selectedPageSlug = panel.mode === "view" ? panel.pageSlug : undefined;

  // Mirror the committed panel back into the URL so leaving and returning to
  // this route reopens it. replaceState keeps panel toggles out of the history
  // stack while still syncing `useSearchParams`.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedPageSlug) {
      if (params.get(QueryParams.PAGE_SLUG) === selectedPageSlug) return;
      params.set(QueryParams.PAGE_SLUG, selectedPageSlug);
    } else {
      if (!params.has(QueryParams.PAGE_SLUG)) return;
      params.delete(QueryParams.PAGE_SLUG);
    }

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [selectedPageSlug, searchParams]);

  return { ...navigation, selectedPageSlug };
}
