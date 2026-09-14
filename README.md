# PokéDex Collections

A two-page Pokémon fan site: browse the full National Pokédex with search-as-you-type,
and organise your favourites into custom groups that survive a reload.

Built with Next.js 16 (App Router), TypeScript in strict mode, Zustand + `persist`,
CSS Modules, and Vitest.

---

## Run locally

Requires **Node 22** (see `.github/workflows/ci.yml`; Node 20.19+ also works).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server                            |
| `npm run build`     | Production build                      |
| `npm start`         | Serve the production build            |
| `npm run lint`      | ESLint (`eslint-config-next`)         |
| `npm run typecheck` | `tsc --noEmit`, strict mode           |
| `npm run test`      | Vitest unit tests (store logic)       |

No environment variables and no API key — PokeAPI is public.

---

## Architecture

```
src/
├── app/                      # App Router: routing + composition only
│   ├── layout.tsx            # sticky nav, live favourites counter, next/font, metadata
│   ├── page.tsx              # Browse route
│   ├── loading.tsx           # route-level loading UI
│   ├── error.tsx             # route-level error boundary
│   └── favourites/{page,error}.tsx
│
├── features/
│   ├── pokemon-browse/       # search & browse
│   │   ├── components/       # SearchBar, PokemonGrid, PokemonCard, TypeBadge, BrowseView
│   │   ├── hooks/usePokemonSearch.ts   # index + filtering + pagination, no JSX
│   │   ├── api.ts            # every PokeAPI call, fully typed, no JSX
│   │   └── index.ts          # public API
│   │
│   └── favourites/           # favourite & group management
│       ├── components/       # FavouriteButton, GroupManager, GroupSection, FavouriteCard,
│       │                     # FavouritesBoard, FavouritesCounter
│       ├── store.ts          # Zustand + persist — state lives with its owning feature
│       ├── store.test.ts     # tests colocated with the store
│       └── index.ts          # public API
│
└── shared/
    ├── ui/                   # Button, Card, Badge, Skeleton, Spinner, EmptyState, NavLink
    ├── types/                # Pokémon domain types + canonical type colours
    └── lib/                  # cn, useDebouncedValue
```

### Decisions

**Feature-based structure, simplified from Feature-Sliced Design.** Full FSD
(`app / processes / pages / widgets / features / entities / shared`) would be
over-engineering for two pages, so the layer list is deliberately reduced to
`app / features / shared`. Each feature owns its components, hooks, API calls and
state, and exposes them through an explicit public API (`index.ts`). Adding a
feature means adding a folder, not scattering files across `components/`,
`hooks/`, `api/` and `store/` trees. Pages import from `features/x` only, never
from feature internals.

**One-way feature dependency.** `pokemon-browse` imports `FavouriteButton` from
`features/favourites`; the reverse is forbidden, so the favourites feature stays
usable without the browse feature. The alternative — passing a favourite-toggle
slot down from the page — is prop-drilling that buys nothing at this size, so the
one-way import is the accepted pragmatic trade-off. It is noted in a comment in
`PokemonCard.tsx` and in both `index.ts` files.

**`shared/` knows nothing about features.** Type badges are the interesting case:
both features render them. Rather than let `favourites` import `pokemon-browse`,
`shared/ui/Badge` takes a *colour* (domain-agnostic), the canonical Pokémon type
palette lives in `shared/types/pokemon.ts` (domain data, no UI), and
`pokemon-browse/TypeBadge` is the thin Pokémon-aware wrapper.

**State ownership is self-documenting.** The Zustand store lives inside
`features/favourites` rather than in a top-level `store/`, which makes the
global-vs-local boundary obvious from the file tree:

- **Global** — favourites and groups. They cross routes, feed the nav counter and
  must survive reloads.
- **Local** — the search query, fetched results and pagination, owned by
  `usePokemonSearch`. Nothing outside the browse page reads them, and a persisted
  search box would be surprising.

Both halves are documented in comments at the top of `store.ts` and
`usePokemonSearch.ts`.

**Zustand + `persist`** covers state management *and* the persistence requirement
in one pattern, with no hand-rolled localStorage effects. Hydration uses
`useSyncExternalStore` against `persist.hasHydrated()`: the server snapshot is
always `false` and React reuses it for the hydration pass, so store-dependent UI
can never produce a mismatch. Rehydration from localStorage is synchronous, so
the usual `useState(false)` + effect flip would render a frame late.

**App Router conventions instead of hand-rolled equivalents** — `loading.tsx` for
route loading, `error.tsx` for route error boundaries (with `reset()` as retry),
the metadata API for titles, and `next/font` for self-hosted fonts with no layout
shift. Both routes are server components that compose a client container from a
feature, which keeps business logic out of the routing layer entirely.

**Data-fetching never lives in presentation components.** `api.ts` does the
fetching and maps wire formats onto a small `PokemonSummary`; `usePokemonSearch`
owns the orchestration; `PokemonGrid` and `PokemonCard` only render props.

**API choice: PokeAPI**, for zero-auth setup inside the time budget. Its lack of a
search endpoint turned into the most interesting architectural constraint:

1. Fetch the full name index once (`?limit=10000`, names + URLs only), cached in
   module scope in `api.ts` and evicted on failure so retry genuinely re-requests.
2. Filter it client-side on a 200 ms debounce, exact and prefix matches first.
3. Hydrate details (`official-artwork` sprite + types) lazily for the visible page
   only — 24 cards, extended by a "Load more" button. Details are memoised per
   name, so paging is additive and re-searching a previous term is free.
4. Everything is typed end to end; there is no `any` in the codebase.

Individual detail failures are tolerated (PokeAPI has a few flaky form entries) and
recorded so the grid does not retry them forever; the error state appears only when
a whole batch fails.

**Three handled states, everywhere.** Every data view renders exactly one of
loading (skeleton grid), error (message + retry button) or empty (e.g. *No Pokémon
match "xyz"*). There are no blank screens and no unhandled promise rejections.

---

## Trade-offs made for the ~2-hour budget

- **"Load more" pagination instead of virtualisation.** 1,351 index entries filter
  fine client-side, but the DOM grows as you page; a virtualised grid would be the
  correct answer at ten times the size.
- **Unit tests scoped to the store.** That is where the business rules live —
  dedupe, the virtual Ungrouped group, and the guarantee that deleting a group
  never deletes its Pokémon. Component and E2E tests would be the next step, not a
  replacement.
- **No Pokémon detail page.** Cards carry artwork, number, name and types; stats,
  abilities and evolution chains were out of scope.
- **No request cancellation on the wire.** In-flight fetches are ignored rather
  than aborted; with `AbortController` threaded through `api.ts` this would be a
  small change.
- **Image delivery is tuned rather than solved.** Sprites go through the Next
  optimizer with a capped candidate-width set, a 30-day cache TTL, and the first
  row loaded eagerly while the rest lazy-load — an uncapped set requesting all 24
  at once made the optimizer time out against GitHub's CDN on a slow link. A
  self-hosted sprite mirror or a CDN in front of the optimizer would be the real
  fix.

## With more time

- A Pokémon detail route (`/pokemon/[name]`), server-rendered from the same `api.ts`.
- Drag-and-drop group reordering, replacing the per-card `<select>`.
- React Query for request caching, deduplication and retry, replacing the hand-rolled
  module-scope caches.
- An E2E smoke test (favourite → group → reload → still there).
- An ESLint `no-restricted-imports` rule to enforce the feature public APIs
  mechanically, instead of by comment and review.

---

## Accessibility & motion

Semantic `nav` / `main` / `section` / real `button` elements throughout. Favourite
toggles are `aria-pressed` with names that include the Pokémon ("Add Pikachu to
favourites"), the search input and every group control is labelled, focus-visible
rings are global, and the whole app is keyboard-operable. Favourite buttons are a
44×44 tap target and are always visible — never revealed on hover.

Animations are pure CSS (card hover lift, springy heart pop, staggered grid
fade-in), all 150–240 ms, and a single global `prefers-reduced-motion` block turns
them off.

---

## CI

`.github/workflows/ci.yml` runs on every push and pull request:
install → lint → typecheck → test → build.

---

## AI usage

AI (Claude) was used for scaffolding and implementation. I directed the
architecture, reviewed all of the code, and made the technical decisions
documented above — the feature-sliced-but-simplified layout, the one-way feature
dependency, the global-vs-local state boundary, the indexed-search data strategy,
and the testing scope.
