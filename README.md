# PokéDex Collections

[![CI](https://github.com/nguyensongtai/pokedex-collections/actions/workflows/ci.yml/badge.svg)](https://github.com/nguyensongtai/pokedex-collections/actions/workflows/ci.yml)

- **Live site:** https://pokedex-collections.vercel.app
- **Repository:** https://github.com/nguyensongtai/pokedex-collections

A two-page Pokémon fan site: browse the full National Pokédex with search-as-you-type,
and organise your favourites into custom groups that survive a reload. English and
Vietnamese.

Built with Next.js 16 (App Router), TypeScript in strict mode, Zustand + `persist`,
CSS Modules, and Vitest.

The UI implements the `PokeDex Collections.dc.html` design canvas — its palette,
type scale, card and row layouts, empty/error/loading states, and its EN/VI copy.

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
│   ├── Nav/                  # one client boundary for the shell's nav
│   ├── RouteError/           # shared behaviour for both error boundaries
│   ├── favourites/{page,error}.tsx
│   └── pokemon/[id]/         # detail route: page, loading, error, not-found
│
├── features/
│   ├── pokemon-browse/       # search & browse
│   │   ├── components/       # SearchBar/, PokemonGrid/, PokemonCard/,
│   │   │                     # TypeBadge/, BrowseView/
│   │   ├── hooks/usePokemonSearch.ts   # index + filtering + pagination, no JSX
│   │   ├── api.ts            # every PokeAPI call, fully typed, no JSX
│   │   ├── api.test.ts       # search matching rules
│   │   └── index.ts          # public API
│   │
│   ├── pokemon-detail/       # one Pokémon: stats, abilities, Pokédex entry
│   │   ├── components/       # PokemonDetailView/, DetailNav/, StatBars/,
│   │   │                     # DetailSkeleton/, NotFoundState/
│   │   ├── api.ts            # server-side PokeAPI calls, fully typed, no JSX
│   │   └── index.ts          # public API
│   │
│   └── favourites/           # favourite & group management
│       ├── components/       # FavouriteButton/, GroupSection/, FavouriteRow/,
│       │                     # FavouritesBoard/, FavouritesCounter/
│       ├── store.ts          # Zustand + persist — state lives with its owning feature
│       ├── store.test.ts     # tests colocated with the store
│       └── index.ts          # public API
│
└── shared/
    ├── ui/                   # Artwork/, Badge/, Button/, Card/, ErrorState/,
    │                         # NavLink/, Skeleton/
    ├── i18n/                 # dictionary, language store, LanguageToggle/ (+ store.test.ts)
    ├── types/                # Pokémon domain types + canonical type colours
    └── lib/                  # cn, useDebouncedValue
```

**One folder per component.** Every component is a directory holding
`index.tsx` and, where it has styles, `index.module.css` — so a component's
markup and its stylesheet are never separated by an alphabetised file list, and
deleting a component means deleting one folder. Import paths are unchanged
(`@/shared/ui/Badge` resolves to `Badge/index.tsx`), so the barrel files did not
move. The exceptions are the App Router's own route files (`layout.tsx`,
`page.tsx`, `loading.tsx`, `error.tsx`): their paths *are* the routing contract,
so they keep their stylesheets beside them.

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

**Every `shared/ui` export has at least two consumers.** Implementing the design
changed which shapes are genuinely shared: `Card`, `Skeleton` and a new
`ErrorState` each back two or more callers, so `Spinner` and `EmptyState` were
removed rather than left as a kit that looks fuller than it is. A primitive with a
single caller belongs next to that caller.

**State ownership is self-documenting.** The Zustand store lives inside
`features/favourites` rather than in a top-level `store/`, which makes the
global-vs-local boundary obvious from the file tree:

- **Global** — favourites and groups (`features/favourites/store.ts`), plus the
  selected language (`shared/i18n/store.ts`). Both cross routes and must survive
  reloads.
- **Local** — the search query, loaded Pokédex and pagination, owned by
  `usePokemonSearch`; rename drafts, per-image load state, the heart's pop. Nothing
  outside their component reads them, and a persisted search box would be
  surprising.

The language store sits in `shared/i18n` rather than in a feature precisely
*because* no feature owns it: the nav and both pages read it. Those two stores are
the complete set of global state. Both boundaries are documented in comments at the
top of `store.ts` and `usePokemonSearch.ts`.

**Zustand + `persist`** covers state management *and* the persistence requirement
in one pattern, with no hand-rolled localStorage effects. Hydration uses
`useSyncExternalStore` against `persist.hasHydrated()`: the server snapshot is
always `false` and React reuses it for the hydration pass, so store-dependent UI
can never produce a mismatch. Rehydration from localStorage is synchronous, so
the usual `useState(false)` + effect flip would render a frame late.

**The detail route fetches on the server.** `/pokemon/[id]` is the one route whose
data is not client state, so it is a real server component: `page.tsx` awaits
PokeAPI during the render, `generateMetadata` gives every Pokémon its own document
title and description, an unknown id becomes `notFound()` rather than an error,
and the two requests it needs run in parallel. Responses are revalidated monthly —
entity data that has not changed since 1996 does not need refetching per request.
The view below it is a client component only because the copy is translated in the
browser; every byte it renders arrives as props.

Adding it meant adding `features/pokemon-detail/` — a folder, its own `api.ts`, its
own public API. No existing feature changed shape to accommodate it, which is the
claim the feature-based layout makes and the first chance the project had to test
it.

**App Router conventions instead of hand-rolled equivalents** — `loading.tsx` for
route loading, `error.tsx` for route error boundaries (with `reset()` as retry),
the metadata API for titles, and `next/font` for self-hosted fonts with no layout
shift. Both routes are server components that compose a client container from a
feature, which keeps business logic out of the routing layer entirely.

**Data-fetching never lives in presentation components.** `api.ts` does the
fetching and maps wire formats onto a small `PokemonSummary`; `usePokemonSearch`
owns the orchestration; `PokemonGrid` and `PokemonCard` only render props.

**API choice: PokeAPI**, for zero-auth setup inside the time budget. Its lack of a
search endpoint turned into the most interesting architectural constraint, and the
design settled how to answer it.

The obvious route — `/pokemon?limit=10000` — returns names and URLs only. No types.
That forces one detail request per visible card, and makes the design's
*search by type* impossible without fetching all ~1,000 of them anyway.

Walking the **18 type endpoints** inverts the problem: 18 parallel requests return
every Pokémon already grouped by type, which is exactly the join the UI needs.

1. One pass builds the full `id → {name, types}` index, cached in module scope in
   `api.ts` and evicted on failure so retry genuinely re-requests.
2. Artwork URLs are derived from the id, so no request is ever made to discover a
   sprite.
3. Filtering by name, dex number or type is then pure client-side work on a 200 ms
   debounce (`filterPokedex`, unit-tested).
4. Pagination is 48 cards at a time behind a "Show more · N left" button, and it is
   purely a slice — no fetch, no waterfall, nothing to re-request.
5. Everything is typed end to end; there is no `any` in the codebase.

The cost is a heavier first load in exchange for no request waterfall, instant
pagination, and type search. Alternate forms (ids above 10000 — megas, regionals)
are filtered out, which is why the count reads ~1,025 rather than ~1,300.

**Three handled states, everywhere.** Every data view renders exactly one of
loading (skeleton grid), error (message + retry button) or empty (e.g. *No Pokémon
match "xyz"*). There are no blank screens and no unhandled promise rejections.

---

## Trade-offs made for the ~2-hour budget

- **"Show more" pagination instead of virtualisation.** ~1,025 entries filter fine
  client-side, but the DOM grows as you page; a virtualised grid would be the
  correct answer at ten times the size.
- **Unit tests scoped to pure logic.** 22 cases over the favourites store (dedupe,
  the virtual Ungrouped group, the guarantee that deleting a group never deletes its
  Pokémon), the language store and dictionary parity, and the search matcher — the
  three places business rules actually live. Component and E2E tests would be the
  next step, not a replacement.
- **No evolution chains on the detail page.** It covers artwork, types, the Pokédex
  entry, height/weight/base EXP, abilities and base stats. Evolution needs a third
  endpoint and a tree renderer, which was more than the remaining budget.
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

- Evolution chains and move lists on the detail route.
- `generateStaticParams` for the first generation, so the most-visited detail pages
  are prerendered instead of rendered on demand.
- Locale-routed i18n (`/[lang]/...`) with `next-intl`, so language is shareable in a
  URL and translated copy is server-rendered rather than swapped on the client.
- Drag-and-drop group reordering, replacing the per-card `<select>`.
- React Query for request caching, deduplication and retry, replacing the hand-rolled
  module-scope caches.
- An E2E smoke test (favourite → group → reload → still there).
- An ESLint `no-restricted-imports` rule to enforce the feature public APIs
  mechanically, instead of by comment and review.

---

## Where this departs from the design canvas

The canvas is a single 1440px artboard rendered by the Design Canvas runtime. Four
deliberate differences:

- **Responsive behaviour is ours.** The canvas specifies none. Grids use
  `auto-fill minmax()` from 375px to 1920px, the shell gutter tightens at 720px and
  480px, the nav wordmark collapses to the Poké Ball mark (the link keeps its
  `aria-label`), and favourite rows stack their controls below 480px.
- **Tap targets.** The canvas draws a 36px heart. The visual is unchanged, but a
  transparent `::before` expands the *hit area* to 44×44 to clear the touch
  guideline.
- **`:focus-visible`, not `:focus`.** The canvas' `style-focus` compiles to
  `:focus`, which lights the ring on mouse clicks too. Keyboard paths keep the ring;
  pointer paths don't.
- **"0 groups".** The canvas' summary string always names a group count, so a fresh
  collection reads "3 Pokémon in 0 groups". With no groups yet it falls back to the
  plain count.
- **Navigation is links, not click handlers.** The canvas models the detail screen
  as a `page` state: cards are `role="button"` divs, and Back returns to whichever
  screen you came from. With a real route per Pokémon those become `<a>` elements,
  so middle-click, right-click, "open in new tab" and the browser's own back button
  all work. Cards use the stretched-link pattern — the anchor wraps the name and
  covers the card via `::after` — because nesting the favourite button inside an
  `<a>` would be invalid HTML and would swallow its click. Back is a link to Browse
  rather than "the previous screen", since the browser already owns that job.

## Accessibility & motion

Semantic `nav` / `main` / `section` / real `button` elements throughout. Favourite
toggles are `aria-pressed` with names that include the Pokémon, in the active
language ("Add Pikachu to favourites" / "Thêm Pikachu vào yêu thích"); the search
input, the language switcher and every group control are labelled; focus-visible
rings are global; and the whole app is keyboard-operable.

`<html lang>` follows the language switcher. It is not decoration: assistive
technology picks its voice and pronunciation rules from it, so Vietnamese copy
under `lang="en"` gets read with English phonetics.

**Headings describe the document, not every card.** The browse grid is a list of
results, so its 48 cards are not 48 document sections: each `<article>` takes its
accessible name from its name element via `aria-labelledby`, and the grid sits in
one labelled region. The outline is `h1 Browse → h2 Results` — two headings, not
forty-nine — while screen-reader users still navigate card to card through the
list. The favourites page is the opposite case: its groups *are* real sections, so
each one keeps an `h2`. Depth follows structure, so no `h3` is invented for it.

Images carry `alt`, not `title` — descriptive on the browse cards, empty on the
favourites rows where the name sits right beside the image and a repeat would just
be noise. `title` is deliberately not used as an accessibility mechanism anywhere:
it never appears on touch, never on keyboard focus, and is inconsistently exposed
by screen readers. Links get their names from their text, or from `aria-label`
where the label is icon-only.

Animations are pure CSS — card and row hover lift, the springy heart pop, the
skeleton shimmer, staggered grid fade-in — all 150–250 ms, and a single global
`prefers-reduced-motion` block turns them off. The heart's pop is scoped to the
click that turns it on, so a page of saved favourites doesn't pop on load.

---

## CI/CD

Two pipelines, both triggered by a push to `master`:

- **CI** — `.github/workflows/ci.yml` runs on every push and pull request:
  install → lint → typecheck → test → build. The badge at the top of this file
  reports the latest run.
- **CD** — Vercel builds and deploys the same commit to
  https://pokedex-collections.vercel.app. Pull requests get their own preview
  deployment.

Vercel handles the deploy rather than a job in the workflow: it is the first-party
host for Next.js, so the App Router's static prerendering and the `next/image`
optimizer work with no configuration. Re-implementing that as a GitHub Actions
deploy step would mean giving up the image optimizer for a static export, and the
brief does not weigh the choice of provider.

---

## AI usage

AI (Claude) wrote most of the code in this repository, including the scaffolding,
the components and the tests. That is the point: it moved the expensive part of
the work from typing to deciding, which is what let all seven optional items land
inside the time budget. The trade-offs listed above are scope decisions, not
things that ran out of typing time.

What the AI produced first was rarely what shipped. Four examples, each traceable
in the commit history:

**The data strategy was reversed once.** The first implementation took the obvious
route — `/pokemon?limit=10000` for the name index, then a detail request per
visible card. It worked. It also could not answer "search by type" without
hydrating all ~1,000 details first. Walking the 18 type endpoints instead returns
every Pokémon already grouped by type, which is exactly the join the UI needs:
one pass, no per-card request, no waterfall. Worth noting what the swap cost:
`api.ts`, the hook it feeds, and three lines of the feature's barrel. Not one
component and not one store changed. A boundary is only worth having if it makes
a change of that size that cheap.

**Two lint errors were fixed rather than suppressed.** React 19's
`react-hooks/set-state-in-effect` rejected both the hydration guard and the search
hook. Adding a disable comment was one line. Instead the hydration guard became
`useSyncExternalStore` against `persist.hasHydrated()` — which is also *more*
correct, since localStorage rehydrates synchronously and the `useState` + effect
pattern shows a stale frame — and the search hook now derives pagination instead
of mirroring it into state.

**The image failures were measured, not guessed at.** Next's optimizer was
returning 500s for some sprites. The tempting fix, `unoptimized: true`, was tried
and measured: it was worse. The real cause was an uncapped candidate-width set
pulling all 24 sprites at once, so the fix was to cap the widths, cache for 30
days, and load only the first row eagerly. Production now reports zero failed
image requests.

**The design was adapted, not copied.** The canvas is a single 1440px artboard. It
specifies no small-screen behaviour, uses `:focus` where `:focus-visible` belongs,
draws a 36px tap target, and has a summary string that reads "3 Pokémon in 0
groups" on a fresh collection. Each of those was changed deliberately and is
listed under *Where this departs from the design canvas*.

Every claim in this README was checked by running the app, not by reading the
code: the UI was exercised in a browser from 336px to 1600px, the full group
lifecycle was clicked through, and the deployed site was re-verified on production
(zero console errors, zero failed requests).
