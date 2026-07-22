import { create } from "zustand";

/**
 * Global client-only UI state — the reference Zustand store for this project.
 *
 * Use this layer for transient UI that several distant components need to read
 * or toggle (nav drawers, command palettes, global modals). It is NOT a cache
 * for server data: anything fetched from the API stays server-fetched and is
 * re-pulled with router.refresh() — mirroring it here would mean owning cache
 * invalidation by hand. See ./README.md for the full convention.
 *
 * Pattern to copy for new stores:
 *   1. Declare a single State type with data fields first, then actions.
 *   2. create<State>()((set) => ({ ... })) — note the curried () for correct
 *      TypeScript inference under Zustand v5.
 *   3. Keep actions in the store; keep components presentational by reading
 *      slices via selectors (see usage example below).
 *
 * Usage (selector form avoids re-rendering on unrelated state changes):
 *   const sidebarOpen = useUiStore((s) => s.sidebarOpen);
 *   const toggleSidebar = useUiStore((s) => s.toggleSidebar);
 */
type UiState = {
  /** Whether the side navigation drawer is expanded. */
  sidebarOpen: boolean;

  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: false,

  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
