"use client";

import { useReducer } from "react";

import { isEqual } from "../utils/isEqual";

export type PanelGuardVerdict = "allow" | "block" | "confirm";

export type PanelGuard = () => PanelGuardVerdict;

type PanelBase = { mode: string };

type PanelNavigationOptions<P extends PanelBase> = {
  initialPanel: P;
  /**
   * Consulted before leaving the keyed mode. "block" swallows the
   * navigation, "confirm" parks it until confirm/cancel is called.
   */
  guards?: Partial<Record<P["mode"], PanelGuard>>;
  /** Runs once a navigation away from the keyed mode commits. */
  onLeave?: Partial<Record<P["mode"], () => void>>;
};

type PanelNavigationState<P extends PanelBase> = {
  panel: P;
  pendingPanel: P | null;
};

type PanelNavigationEvent<P extends PanelBase> =
  | { type: "transition"; next: P }
  | { type: "requestConfirmation"; next: P }
  | { type: "confirm" }
  | { type: "cancel" };

function panelNavigationReducer<P extends PanelBase>(
  state: PanelNavigationState<P>,
  event: PanelNavigationEvent<P>,
): PanelNavigationState<P> {
  switch (event.type) {
    case "transition":
      return { panel: event.next, pendingPanel: null };
    case "requestConfirmation":
      return { ...state, pendingPanel: event.next };
    case "confirm":
      return state.pendingPanel
        ? { panel: state.pendingPanel, pendingPanel: null }
        : state;
    case "cancel":
      return { ...state, pendingPanel: null };
  }
}

/**
 * Single source of truth for which panel is open and the payload it needs.
 * Every transition goes through `navigate`, so per-mode guards can block it
 * or demand confirmation (e.g. an unsaved form) before it commits. `force`
 * skips the guard for programmatic transitions (e.g. after a successful
 * submit) but still runs the mode's `onLeave` cleanup.
 */
export function usePanelNavigation<P extends PanelBase>(
  options: PanelNavigationOptions<P>,
) {
  const [state, dispatch] = useReducer(panelNavigationReducer<P>, {
    panel: options.initialPanel,
    pendingPanel: null,
  });

  function runLeaveHook(from: P, next: P) {
    if (from.mode !== next.mode) {
      options.onLeave?.[from.mode as P["mode"]]?.();
    }
  }

  function navigate(next: P, { force = false }: { force?: boolean } = {}) {
    if (isEqual(state.panel, next)) return;

    const guard = options.guards?.[state.panel.mode as P["mode"]];
    const verdict: PanelGuardVerdict = force || !guard ? "allow" : guard();

    if (verdict === "block") return;

    if (verdict === "confirm") {
      dispatch({ type: "requestConfirmation", next });
      return;
    }

    runLeaveHook(state.panel, next);
    dispatch({ type: "transition", next });
  }

  function confirmPendingNavigation() {
    if (!state.pendingPanel) return;

    options.onLeave?.[state.panel.mode as P["mode"]]?.();
    dispatch({ type: "confirm" });
  }

  function cancelPendingNavigation() {
    dispatch({ type: "cancel" });
  }

  return {
    panel: state.panel,
    isConfirmingNavigation: state.pendingPanel !== null,
    navigate,
    confirmPendingNavigation,
    cancelPendingNavigation,
  };
}
