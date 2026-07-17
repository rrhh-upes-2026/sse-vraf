# SSE Platform — Apps Script Backend (BFF)

Backend-for-Frontend for the SSE institutional platform (UPES).
All data lives in Google Sheets (one tab per entity) and Google Drive
(documents, templates, PDF exports). The Next.js front-end (`web/`) never
touches Sheets or Drive directly — it sends JSON actions to this Web App
and reads the response.

---

## Folder structure

```
apps-script/
├── .clasp.json              ← clasp config (rootDir → src/)
├── README.md                ← this file
└── src/                     ← rootDir pushed to Apps Script
    ├── appsscript.json      ← manifest (scopes, runtime, access)
    ├── Code.js              ← doPost / doGet entry point
    ├── router.js            ← action dispatcher
    ├── audit/
    │   └── AuditService.js
    ├── auth/
    │   └── AuthBridge.js
    ├── config/
    │   └── Config.js
    ├── controllers/
    │   ├── BuilderController.js
    │   ├── ContratacionController.js
    │   ├── HealthController.js
    │   └── WorkspaceController.js
    ├── drive/
    │   ├── DriveService.js
    │   └── WorkspaceFolderManager.js
    ├── events/
    │   ├── EventDispatcher.js
    │   └── EventTypes.js
    ├── jobs/
    │   └── BackgroundJobs.js
    ├── repositories/
    │   └── SheetRepository.js
    ├── resources/
    │   └── ResourceService.js
    ├── schema/
    │   ├── entities.js
    │   ├── workspace-admin-entities.js
    │   ├── builder-entities.js
    │   └── contratacion-entities.js
    ├── services/
    │   ├── CacheService.js
    │   ├── CalendarService.js
    │   ├── DocsService.js
    │   ├── GmailService.js
    │   ├── LockService.js
    │   ├── NotificationService.js
    │   └── WorkspacePermissions.js
    ├── setup/
    │   ├── BootstrapController.js
    │   ├── DriveSetup.js
    │   ├── SpreadsheetSetup.js
    │   └── WorkspaceTemplateInstaller.js
    └── utils/
        ├── idgen.js
        ├── logger.js
        ├── response.js
        └── validator.js
```

> All files in `src/` are loaded into the same global Apps Script scope.
> Subdirectories are for local organisation only — Apps Script flattens them.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Google Workspace domain | `access: "DOMAIN"` in manifest — personal accounts cannot access this Web App |
| Google Sheet (the database) | Create one blank sheet; copy its ID from the URL |
| Google Drive folder (optional) | DriveSetup creates the folder tree automatically |
| Node.js ≥ 18 + clasp | `npm i -g @google/clasp` then `clasp login` |

---

## Option A — Deploy with clasp (recommended)

### 1. Create the Apps Script project

```bash
cd apps-script

# If starting from scratch — creates a new bound/standalone project:
clasp create --type webapp --title "SSE Platform BFF"
# clasp writes the real scriptId into .clasp.json automatically.

# If you already have an existing project:
# Edit .clasp.json and replace YOUR_SCRIPT_ID_HERE with the real script ID.
# The script ID is the long string in the project URL:
#   https://script.google.com/home/projects/<SCRIPT_ID>/edit
```

### 2. Push the source

```bash
clasp push
# Uploads every file under src/ (including appsscript.json) to Apps Script.
# Run this again whenever you change source files.
```

### 3. Set Script Properties

In the Apps Script editor → **Project Settings** → **Script Properties**, add:

| Property | Value | Required |
|---|---|---|
| `SPREADSHEET_ID` | ID of the Google Sheet from prerequisites | Yes |
| `DRIVE_ROOT_FOLDER_ID` | ID of the Drive folder for documents | No (DriveSetup creates it) |
| `WEBHOOK_SHARED_SECRET` | Any random string (32+ chars) | No (extra auth layer) |
| `INSTANCE_NAME` | e.g. `SSE-UPES-PROD` | No (defaults to `SSE-Platform`) |

### 4. Deploy as a Web App

```bash
clasp deploy --description "RC-1 production"
# Prints the deployment ID and the /exec URL.
```

Or via the editor: **Deploy → Manage deployments → New deployment**
- **Type**: Web app
- **Execute as**: Me (the account that owns the Spreadsheet)
- **Who has access**: Anyone within UPES domain (`access: "DOMAIN"`)

Copy the `/exec` URL — this is `APPS_SCRIPT_WEB_APP_URL`.

### 5. Configure the front-end

In `web/.env.local` (or in your hosting platform's environment variables):

```
APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
```

Restart the Next.js dev server. All services switch from mock to live mode automatically.

---

## Option B — Manual deployment (no clasp)

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. For each file under `src/`, create a corresponding script file in the editor
   (**+** → Script file). Use the same filename (without the path prefix).
3. Copy-paste the file contents. Start with the files in this order to
   minimise "not defined" errors during the initial save:
   1. `utils/idgen.js`, `utils/logger.js`, `utils/response.js`, `utils/validator.js`
   2. `config/Config.js`
   3. `schema/entities.js`, `schema/workspace-admin-entities.js`,
      `schema/builder-entities.js`, `schema/contratacion-entities.js`
   4. All remaining files in any order
4. Paste the contents of `src/appsscript.json` into the manifest
   (**Project Settings → Show appsscript.json**).
5. Continue from **step 3** of Option A above.

---

## First-run initialisation (run once after deploy)

Open the Apps Script editor, select the function, and click **Run**:

| Function | What it does |
|---|---|
| `initializeDatabase()` | Creates all sheet tabs with correct headers. Safe to re-run. |
| `initializeWorkspaceSettings()` | Seeds the 6 workspace settings rows (rrhh, vraf, conta, compras, mant, salud). |

Or use the **Platform Bootstrap Wizard** in the web app
(`/ws/rrhh/admin/system`) which calls these via `platform.*` actions.

---

## Request format

The Web App accepts `POST` requests with a JSON body sent as `text/plain`
(CORS simple request — Apps Script cannot respond to `OPTIONS` preflight):

```json
{
  "action": "<namespace>.<verb>",
  "params": { },
  "userId": "optional-user-id",
  "userEmail": "optional@upes.edu.sv",
  "secret": "WEBHOOK_SHARED_SECRET if configured"
}
```

### Action namespaces

| Namespace | Examples | Handler |
|---|---|---|
| `auth.*` | `auth.getUser`, `auth.listUsers` | `AuthBridge` |
| `resource.*` | `resource.create`, `resource.get` | `ResourceService` |
| `platform.*` | `platform.initDatabase`, `platform.healthCheck` | `BootstrapController` |
| `builder.*` | `builder.save`, `builder.publish` | `BuilderController` |
| `health.*` | `health.get` | `HealthController` |
| `contratacion.*` | `contratacion.crearProceso`, `contratacion.avanzarEtapa` | `ContratacionController` |
| `wsBlueprints.*` | `wsBlueprints.list`, `wsBlueprints.publish` | Generic CRUD + `WorkspaceController` |
| `wsKPIs.*` | `wsKPIs.create`, `wsKPIs.recordKPIValue` | Generic CRUD + `WorkspaceController` |
| `wsSettings.*` | `wsSettings.upsertByWsId` | `WorkspaceController` |
| *(any entity)*`.list/get/create/update/remove/restore` | | Generic CRUD via `SheetRepository` |

### Response envelope

```json
{
  "success": true,
  "data": { },
  "metadata": { "requestId": "REQ-...", "durationMs": 42, "pagination": null },
  "errors": [],
  "timestamp": "2026-07-16T23:00:00.000Z"
}
```

---

## Security

- **Domain restriction** — `access: "DOMAIN"` in the manifest limits the Web App
  to signed-in users of the UPES Google Workspace domain. This is the primary
  access control; no bearer token is checked from browser callers.
- **WEBHOOK_SHARED_SECRET** — optional extra gate for trusted server-side callers
  (e.g. a cron job or CI pipeline). Pass the same value in the `secret` field.
  **Do not expose this secret in browser-side JavaScript.**
- **Execute as: Me** — the script runs as the deploying account, which must have
  edit access to the Spreadsheet and Drive folder. This prevents per-user
  permission issues when reading/writing shared data.

---

## OAuth scopes (src/appsscript.json)

| Scope | Used by |
|---|---|
| `auth/spreadsheets` | `SheetRepository` — all entity CRUD |
| `auth/drive` | `DriveService`, `WorkspaceFolderManager`, `DocsService` |
| `auth/documents` | `DocsService` — template merging and PDF export |
| `auth/calendar` | `CalendarService` — event creation for process timelines |
| `auth/gmail.send` | `GmailService`, `NotificationService` |
| `auth/script.external_request` | `UrlFetchApp` — outbound HTTP (webhooks) |

---

## Development tips

- **Hot-reload**: `clasp push --watch` re-uploads on every file save.
- **Logs**: View execution logs in the Apps Script editor under
  **Executions** or in Google Cloud Logging (Stackdriver).
- **Local testing**: Use the Apps Script editor's built-in test runner
  (`Run → Run function`) to call individual functions with hardcoded params.
- **Version pinning**: After a successful deploy, note the deployment ID.
  Use `clasp deploy --deploymentId <ID> --description "RC-X"` to update
  an existing deployment rather than creating a new one (keeps the URL stable).
