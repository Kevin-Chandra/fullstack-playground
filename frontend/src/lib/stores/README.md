# Client state stores (Zustand)

Global, **client-only** state lives here. Stores sit in the same `lib/` layer as
hooks and services, so UI components stay presentational and read state through a
`useXStore` hook.

## What belongs here

- Cross-component **UI state**: nav drawers, command palettes, global modals,
  theme/preferences, a toast queue.
- Genuinely **client-only** state shared across distant components that's awkward
  to thread through props.

## What does NOT belong here

- **Server data.** Users, the current session, anything from the API stays
  server-fetched (see `lib/services/*.server.ts` + guards) and is re-pulled with
  `router.refresh()` after mutations (see `lib/hooks/useMutation.ts`). Copying it
  into a store means you now own cache invalidation by hand and fight Next.js'
  server-component model. If you need client-side caching/optimistic updates,
  reach for TanStack Query or SWR — not a store.

## Conventions

- One file per store, named `useXStore.ts`, default-importable as `useXStore`.
- Declare a single `State` type: data fields first, then actions.
- Use the curried form `create<State>()((set) => ({ ... }))` for correct TS
  inference under Zustand v5.
- Keep actions inside the store. Components read slices via **selectors**
  (`useXStore((s) => s.field)`) so they only re-render on the state they use.
- Need persistence (e.g. theme in `localStorage`)? Wrap with the `persist`
  middleware and guard against SSR hydration mismatches (`skipHydration` +
  rehydrate on mount), since these stores can be imported into server-rendered
  trees.

See `useUiStore.ts` for the reference implementation.
