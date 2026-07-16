# SSE-VRAF — Web (Sprint 1: Foundation)

Frontend for the Sistema de Seguimiento Estratégico VRAF (Universidad
Politécnica de El Salvador). Source of truth for everything functional/UX
is `MASTER HANDOFF - SSE-VRAF-print.html` plus the chat transcript in the
design handoff bundle — this app implements that spec exactly, with the
infrastructure replaced per the project's Google-first directive (see
below). Do not redesign screens, add modules, or change navigation without
that being an explicit instruction; this is an implementation, not a
reinterpretation.

## Stack

- Next.js App Router + React + TypeScript + Tailwind CSS v4
- shadcn/ui conventions (Radix primitives + `class-variance-authority` +
  `cn()`), hand-rolled rather than CLI-generated — the CLI's registry
  (`ui.shadcn.com`) wasn't reachable from this environment, and hand-rolling
  let the tokens match §14 exactly instead of a generic preset theme
- Auth.js v5 (`next-auth@beta`) with Google Workspace OAuth
- Zustand (client UI state) + TanStack Query (server-state caching)
- **Backend-for-Frontend: Google Apps Script**, not a Node server — see
  `../apps-script/README.md`. Google Sheets is the datastore (one tab per
  entity), Google Drive holds evidence files (Sheets only stores metadata)

## Architecture (the part that must never be skipped)

```
UI  →  Hooks  →  Services  →  IAppsScriptClient  →  Apps Script Web App  →  Sheets / Drive
```

Nothing above `IAppsScriptClient` (`services/adapters/types.ts`) knows
whether it's talking to Sheets or to in-memory mock data. This is the whole
point of Sprint 1: every later sprint can build real features against
`services/` today, then swap `MockAppsScriptAdapter` for
`HttpAppsScriptAdapter` (`services/adapters/getAppsScriptClient.ts`) by
setting one env var — no UI/Hooks/Services code changes.

- **`components/ui/`** — shadcn-style primitives (to be added as features
  need them; `lib/utils.ts` has `cn()` ready).
- **`components/layout/`** — `Sidebar`, `Topbar`, `WorkspaceSwitcher`,
  `AppShell`, `WorkspaceShell`. Pixel-matched against the navigable
  prototype (`SSE-VRAF.dc.html`), not against the printed design-system
  summary, where the two drifted slightly (see `app/globals.css` — the
  `--sse-shell-*` tokens are the prototype's literal chrome colors, kept
  separate from the documented `--sse-*` brand palette).
- **`components/shared/`** — cross-feature components. Currently just
  `PlaceholderScreen` (stub content for unbuilt routes) and
  `StudioAdminLinks` (the real navigation path into Studio/Administración —
  see below).
- **`config/nav.ts`** — the single source of truth for the 6 workspace
  units, the 10 workspace sections, and the Studio/Admin tool lists. Don't
  fork copies of this data into components.
- **`services/`** — one `createEntityService<T>()` per entity (generic, no
  business rules yet) plus `services/adapters/` (the DI seam).
- **`hooks/useEntity.ts`** — generic TanStack Query wrappers
  (`useEntityList`, `useEntityItem`, `useEntityMutations`) over any
  `EntityService`. Add a named wrapper (`useProcesos`, etc.) alongside the
  feature that first needs one — don't pre-create all 12 speculatively.
- **`types/entities.ts`, `types/roles.ts`, `types/events.ts`** — the 12
  entities (§06), 5 roles (§10), 16 events (§09) as TypeScript types.
- **`lib/rui.ts`** — Registro Único Institucional id builders (§17). Use
  these instead of raw UUIDs for anything user-facing.
- **`auth.ts`, `proxy.ts`** — Google Workspace sign-in and the session
  gate. `AUTH_GOOGLE_HD` (optional) restricts sign-in to one Workspace
  domain via Google's own `hd` claim.

### Studio/Administración navigation — read this before "fixing" it

The prototype's sidebar is a flat list: **Mi Trabajo** + workspace switcher
+ the 10 workspace sections. There is no separate top-level rail for Studio
or Administración, even though MASTER HANDOFF §03 names them as their own
functional areas — in the actual navigable prototype they're reached from
a workspace's **Configuración** screen, gated to Administrador General
(`StudioAdminLinks`, rendered from `app/(app)/ws/[wsId]/config/page.tsx`).
Routes still exist at `/studio/*` and `/admin/*` per §12/§19's file
mapping; they're just not orphaned nor promoted to top-level nav that the
original design never had.

## Dev-mode auth bypass — read before deploying

`AUTH_GOOGLE_ID` being unset means Google OAuth hasn't been provisioned in
this environment. `proxy.ts` no-ops the session redirect when
`NODE_ENV !== "production" && !AUTH_GOOGLE_ID`, purely so foundation screens
render without real Google credentials during development. This flag has
no effect once `AUTH_GOOGLE_ID` is set, and none in production regardless.
It is not a login bypass for real users — don't extend it into one.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in AUTH_SECRET at minimum (openssl rand -base64 32)
npm run dev
```

Without `APPS_SCRIPT_WEB_APP_URL` set, every service runs on
`MockAppsScriptAdapter` (`lib/mock-data.ts`) — no Google project required
to develop the UI. See `../apps-script/README.md` to wire the real backend.

## What Sprint 1 deliberately does not include

Per the approved scope: no Process Builder / Form Builder / Data Studio, no
Workspace business screens (every `ws/[wsId]/*` page is a
`PlaceholderScreen`), no RBAC enforcement beyond the demo admin/operativo
toggle in the sidebar footer, no Apps Script business rules. Those are
separate sprints, built against the same `services/`/`hooks/` layer this
sprint set up.
