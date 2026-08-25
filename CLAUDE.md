# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Wedding-management app: a NestJS + Postgres API (`backend/`) and a Next.js App Router frontend (`frontend/`), orchestrated by Docker Compose. Domain entities are User, Guest, Rsvp, and Wish — guests RSVP through a public form and leave "wishes" (a message plus optional image/audio); authenticated staff manage them from a dashboard.

## Commands

Everything runs in Docker. The root scripts are the entry point:

```bash
npm run start     # docker compose up -d (db + backend + frontend)
npm run stop
npm run restart   # stop, rebuild with --no-cache, up
```

`src/` and `public/` are bind-mounted into both containers, so code edits hot-reload without a rebuild. Rebuild only when dependencies or Dockerfiles change.

Compose reads `.development.env` (not `.env`); `.env.example` is the template. `POSTGRES_PORT` is used both to publish the port and as the server's `-p` flag, so Postgres genuinely listens on that port rather than 5432.

**Backend** (`cd backend`):

```bash
npm test                       # jest, matches src/**/*.spec.ts
npm test -- wish.service       # single file by path pattern
npm test -- -t "creates a wish"  # single case by name
npm run test:e2e               # separate config: test/jest-e2e.json
npm run lint                   # eslint --fix
npm run build

npm run migration:show         # [X] applied, [ ] pending
npm run migration:generate -- src/migrations/AddSomething
npm run migration:run
npm run migration:revert       # one step back
```

**Frontend** (`cd frontend`):

```bash
npx tsc --noEmit   # typecheck — there is no test suite
npm run lint
npm run build
```

## Backend architecture

Standard Nest module-per-domain (`wish/`, `guest/`, `rsvp/`, `user/`, `auth/`), each a controller + service + `dto/`. Shared code sits in `libs/` (`entity/`, `constants/`, `utils/`), with cross-cutting `guards/`, `decorators/`, `pipes/`, and `config/` at `src/` root. Entities live in `libs/entity/` rather than beside their module, and TypeORM runs `autoLoadEntities` with **`synchronize: false`** — the schema is owned by `src/migrations/`, applied at boot when `DATABASE_MIGRATIONS_RUN` is true. Changing an entity means generating a migration (`npm run migration:generate -- src/migrations/Name`); see `backend/src/migrations/README.md`, which also covers baselining a database built by the old `synchronize` behaviour. Indexes TypeORM cannot infer still belong on the entity — `@Index(name, [cols], { type: "gin" })` — because an index outside entity metadata is one the next generated migration will try to drop.

**Auth** is JWT-in-httpOnly-cookies with access/refresh rotation, via three Passport strategies (`local`, `jwt`, `refresh`) and matching guards. Controllers are guarded class-wide with `@UseGuards(JwtGuard)`, and individual routes opt out with `@Public()` — `JwtGuard` reads that metadata through the `Reflector`. This inversion matters: a new route on an existing controller is authenticated unless you say otherwise, and public routes (like wish submission) should also carry an explicit `@Throttle`.

**Pagination** uses `nestjs-paginate`, with global defaults set in `main.ts` (`updateGlobalConfig`) rather than per-route. Services return `Paginated<T>`; out-of-range pages surface a custom error code the frontend maps to a "return to first page" action (see `libs/constants/error-code.constants.ts` and the frontend's `ErrorAction`).

**File uploads** go to Cloudflare R2 through `storage/storage.service.ts`, which stores an object *key* on the entity and resolves it to a public URL in the response DTO. Multipart routes combine `FileFieldsInterceptor`, the custom `@UploadedFileField()` decorator with an `ImageValidationPipe`/`AudioValidationPipe`, and `@FormDataJson("data", Dto)` to parse and validate a JSON blob riding alongside the files. Uploads and DB writes are reconciled by hand — `WishService.create` records every uploaded key before rethrowing so orphaned objects can be cleaned up.

Global `ValidationPipe({ whitelist: true })` means unlisted DTO properties are silently stripped: a field missing its `class-validator` decorator will not reach the service.

## Frontend architecture

**This is Next.js 16 — read the bundled docs before writing code.** `frontend/AGENTS.md` mandates consulting `frontend/node_modules/next/dist/docs/` (start with `01-app/02-guides/upgrading/version-16.md`) rather than relying on prior Next knowledge. Two renames already in play here: `middleware.ts` → **`src/proxy.ts`** exporting a **`proxy()`** function, and `params`/`searchParams` are Promises that must be awaited.

Three-layer split, and the boundary is enforced by convention:

- `app/` — routes only. Route groups carry the access control: `(auth)/`, `(protected)/(session)/`.
- `lib/` — all non-visual logic: `services/` (axios calls), `hooks/`, `stores/` (Zustand), `network/`, `guards/`, `types/`, `utils/`, `constants/`.
- `ui/` — presentational. `ui/components/` are generic primitives; `ui/features/` are domain-bound compositions; `ui/style/` holds the design tokens.

Imports use the `@/src/...` alias (`@/*` maps to the frontend root, so the `src` segment is part of the path).

### Data flow

`service` (throws) → `hook` (catches, returns `Result<T, ErrorEntity>`) → component (branches on `result.success`). The discriminated `Result` type in `lib/types/result.ts` is the contract — hooks never throw and never render. `handleSystemError` in `lib/utils/errorHandler.ts` is the single place an `AxiosError` becomes a typed `ErrorEntity` carrying a title, description, and optional `defaultAction`.

Server-rendered data takes a different path: `services/*.server.ts` + `network/serverApiFetch.ts` (which forwards the incoming `cookie` header), wrapped in React `cache()` so repeated calls in one render collapse into one request. Per `lib/stores/README.md`, server data must **not** be copied into a Zustand store — stores are for client-only UI state.

### Session handling has three layers

Understand all three before touching auth; they are deliberately different in strictness:

1. `src/proxy.ts` — cheap gate on cookie *presence* only, no validation. If the access cookie is gone but a refresh cookie remains, it refreshes server-side and retries the navigation so hard loads survive token expiry.
2. `(protected)/(session)/layout.tsx` → `requireUser()` — real validation against `/auth/me`.
3. `network/sessionInterceptor.ts` — on a client-side 401, single-flight refresh then replay the original request once (`_retry`).

Dead sessions are always cleared via the `/api/auth/clear-session` route, never by redirecting straight to `/login`: the cookies must be deleted first or the proxy's presence gate bounces the navigation back.

### Styling

Tailwind v4 with the design system defined **in CSS** (`ui/style/globals.css` `@theme` blocks), not a JS config. Scheme-dependent raw values (`--ds-*`) live in `app.scss` and flip with `prefers-color-scheme`; `@theme` maps them to utilities. Use the semantic tokens rather than raw Tailwind values — `bg-canvas`/`bg-raised`, `text-ink`/`text-ink-body`/`text-muted`, `border-edge`, `p-lg`/`gap-xl` (xs…4xl), `text-h1`…`text-h5`/`text-body`, `shadow-card`/`shadow-modal`, `rounded-btn-md`. Dialog widths use the `max-w-dialog-sm|md|lg` containers, which already include the viewport gutter.

Cascade layer order is declared identically in both `globals.css` and `app.scss` so precedence is fixed by name regardless of load order; toastify and runtime-injected rules stay unlayered on purpose.

Components extract their class strings into `const` declarations above the component rather than inlining long `className` literals — follow that pattern in existing files. Note that a clickable card built on `<button>` needs an explicit `text-left`, since Tailwind's Preflight does not reset the UA `text-align: center`.

