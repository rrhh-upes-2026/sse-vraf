# SSE-VRAF — Apps Script backend (BFF)

Parallel track to `web/`. This is the Backend-for-Frontend: Google Apps
Script fronting Google Sheets (one tab per entity) and Google Drive
(evidence files — metadata only lives in Sheets, the file itself always
lives in Drive). `web/` never talks to Sheets/Drive directly; it only knows
`IAppsScriptClient` (`web/services/adapters/types.ts`) and this project
implements the other end of that same contract.

**Status: Sprint 1 foundation.** Generic CRUD per entity, no business rules
(R01–R10), no Drive/Gmail integration yet, no RUI-formatted ids. Those land
with the sprint that owns each rule — see `web/README.md` for the sprint
plan. Until this is deployed, `web/` runs entirely on
`MockAppsScriptAdapter` and none of this code executes.

## Files

- `appsscript.json` — manifest. `access: "DOMAIN"` restricts the Web App to
  signed-in users of this script's Google Workspace domain — **this is the
  real access control**, not an app-level secret (Apps Script Web Apps can't
  read custom request headers, so there's no clean way to check a bearer
  token the way a normal API would).
- `src/schema/entities.js` — sheet name + column order per entity. Keep this
  in sync with `web/types/entities.ts` by hand for now.
- `src/repositories/SheetRepository.js` — the only file touching
  `SpreadsheetApp`. Generic list/get/create/update/remove against any
  registered entity.
- `src/router.js` — dispatches `"<entity>.<verb>"` actions to the
  repository. Entity-specific business rules should become their own named
  actions here, not get bolted onto `SheetRepository`.
- `src/Code.js` — `doGet`/`doPost` Web App entry point.
- `src/utils/response.js` — `{ ok, data }` / `{ ok: false, error }` envelope,
  matching `httpAppsScriptAdapter.ts` exactly.
- `src/drive/`, `src/gmail/`, `src/services/` — empty on purpose.
  Evidence-to-Drive and notification sending are separate future sprints
  (§08 automations); `services/` is where entity-specific business rules
  (R02, R03, R08...) will live once their sprint lands, called from
  `router.js` as named actions rather than folded into `SheetRepository.js`.

## Setup

1. Create a Google Sheet (this becomes the "database"). Copy its ID from
   the URL.
2. In the [Apps Script editor](https://script.google.com), create a new
   project, or install [`clasp`](https://github.com/google/clasp) and run
   `clasp create --type webapp` in this directory, then `clasp push` to
   upload the files under `src/` and `appsscript.json`.
3. In the project's Script Properties (Project Settings → Script
   Properties), set `SPREADSHEET_ID` to the Sheet ID from step 1. Sheets
   (tabs) are created automatically on first write per entity — you don't
   need to pre-create them.
4. Optional defense-in-depth: set `WEBHOOK_SHARED_SECRET` as a script
   property and pass the same value as `secret` in request params from a
   trusted **server-side-only** caller. Don't wire this into the browser
   adapter — a secret shipped to client JS isn't a secret. The real gate is
   step 5.
5. Deploy → New deployment → Web app. Set **Execute as: Me**, **Who has
   access: Anyone within [your domain]** (this is `access: "DOMAIN"` in
   `appsscript.json`). Copy the `/exec` URL.
6. In `web/.env.local`, set `APPS_SCRIPT_WEB_APP_URL` to that URL. Every
   service built on `createEntityService()` now hits the real backend with
   no code changes above `services/adapters/getAppsScriptClient.ts`.

## Why no CORS preflight handling

`web/services/adapters/httpAppsScriptAdapter.ts` posts with
`Content-Type: text/plain;charset=utf-8` on purpose. Apps Script Web Apps
don't answer `OPTIONS` preflight requests, so the request has to stay a
CORS "simple request" — that's why it can't use
`Content-Type: application/json` even though the body is JSON text.
