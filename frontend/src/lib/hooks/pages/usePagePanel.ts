import { usePanelNavigation } from "../usePanelNavigation";

export type UserPageState =
  | { mode: "closed" }
  | { mode: "view"; pageSlug: string }

export function usePagePanel() {
  const navigation = usePanelNavigation<UserPageState>({
    initialPanel: { mode: "closed" },
    guards: {},
    onLeave: {},
  });

  const { panel } = navigation;
  const selectedPageSlug = panel.mode === "view" ? panel.pageSlug : undefined;

  return { ...navigation, selectedPageSlug };
}