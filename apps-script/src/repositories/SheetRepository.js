/**
 * Generic Sheets-backed CRUD — one tab per entity. The only file that touches
 * SpreadsheetApp directly. Services, the router, and Code.js never call
 * SpreadsheetApp themselves.
 *
 * Sprint 2 additions over Sprint 1:
 *   • listEntities_() now returns { items, pagination } and supports
 *     _page, _pageSize, _sortBy, _sortDir query params.
 *   • createEntity_() uses IdGen.forEntity() instead of the fallback.
 *   • Type coercion on read: Sheets returns Date objects and numbers natively,
 *     so toString() is applied only to string columns to avoid "[object Object]".
 *
 * Business rules (R01-R10) are NOT here — they land with the sprint that
 * owns each rule, as named router actions that call these primitives.
 */

function getSpreadsheet_() {
  var id = Config.spreadsheetId();
  if (id) return SpreadsheetApp.openById(id);

  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error(
    "No SPREADSHEET_ID script property set and this script is not bound to a spreadsheet. " +
      "See apps-script/README.md.",
  );
}

function getEntityConfig_(entityName) {
  var config = ENTITY_SHEETS[entityName];
  if (!config) throw new Error("Unknown entity: " + entityName);
  return config;
}

function ensureSheet_(entityName) {
  var config = getEntityConfig_(entityName);
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(config.sheetName);

  if (!sheet) {
    AppLogger.info("SheetRepository: creating sheet", { name: config.sheetName });
    sheet = ss.insertSheet(config.sheetName);
    sheet.getRange(1, 1, 1, config.columns.length).setValues([config.columns]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function readHeaders_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function rowToObject_(headers, row) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    if (!headers[i]) continue;
    var val = row[i];
    // Sheets returns Date objects for date-formatted cells — normalise to ISO string
    if (val instanceof Date) {
      obj[headers[i]] = val.toISOString();
    } else {
      obj[headers[i]] = val;
    }
  }
  return obj;
}

function objectToRow_(headers, obj) {
  return headers.map(function (key) {
    return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : "";
  });
}

function readAllRows_(entityName) {
  var sheet = ensureSheet_(entityName);
  var headers = readHeaders_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { sheet: sheet, headers: headers, rows: [] };

  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return { sheet: sheet, headers: headers, rows: values };
}

function matchesQuery_(obj, query) {
  if (!query) return true;
  for (var key in query) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) continue;
    var expected = query[key];
    if (expected === undefined || expected === null || expected === "") continue;
    // Loose equality so "true" matches true, "1" matches 1
    // eslint-disable-next-line eqeqeq
    if (obj[key] != expected) return false;
  }
  return true;
}

/**
 * List entities with optional filtering, sorting, and pagination.
 *
 * Special query keys (stripped before filter matching):
 *   _page      integer ≥ 1    — page number (enables pagination in response)
 *   _pageSize  integer 1-500  — items per page (default: Config.maxPageSize())
 *   _sortBy    string         — field name to sort by
 *   _sortDir   "asc"|"desc"   — sort direction (default: "asc")
 *
 * @param {string} entityName
 * @param {Object} [rawQuery]
 * @returns {{ items: Object[], pagination: Object|null }}
 */
function listEntities_(entityName, rawQuery) {
  var data = readAllRows_(entityName);

  // Separate pagination/sort params from filter params
  var filterQuery = {};
  var page = null;
  var pageSize = Config.maxPageSize();
  var sortBy = null;
  var sortDir = "asc";
  var paginate = false;

  if (rawQuery) {
    for (var key in rawQuery) {
      if (!Object.prototype.hasOwnProperty.call(rawQuery, key)) continue;
      var val = rawQuery[key];
      if (val === undefined || val === null || val === "") continue;

      if (key === "_page") {
        page = Math.max(1, parseInt(val, 10) || 1);
        paginate = true;
      } else if (key === "_pageSize") {
        pageSize = Math.min(Config.maxPageSize(), Math.max(1, parseInt(val, 10) || Config.maxPageSize()));
        paginate = true;
      } else if (key === "_sortBy") {
        sortBy = String(val);
      } else if (key === "_sortDir") {
        sortDir = String(val) === "desc" ? "desc" : "asc";
      } else {
        filterQuery[key] = val;
      }
    }
  }

  // Filter — soft-deleted rows are excluded by default
  var includeDeleted = false;
  if (rawQuery && rawQuery._includeDeleted === "true") {
    includeDeleted = true;
    delete filterQuery._includeDeleted;
  }

  var results = [];
  for (var i = 0; i < data.rows.length; i++) {
    var obj = rowToObject_(data.headers, data.rows[i]);
    if (!includeDeleted && obj.deletedAt) continue;
    if (matchesQuery_(obj, filterQuery)) results.push(obj);
  }

  // Sort
  if (sortBy) {
    var sb = sortBy;
    var sd = sortDir;
    results.sort(function (a, b) {
      var av = a[sb];
      var bv = b[sb];
      if (av === bv) return 0;
      var cmp = av < bv ? -1 : 1;
      return sd === "desc" ? -cmp : cmp;
    });
  }

  // Paginate
  var total = results.length;
  var pagination = null;
  if (paginate) {
    var p = page || 1;
    var start = (p - 1) * pageSize;
    results = results.slice(start, start + pageSize);
    pagination = {
      page:       p,
      pageSize:   pageSize,
      total:      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  return { items: results, pagination: pagination };
}

function getEntity_(entityName, id) {
  if (!id) return null;
  var data = readAllRows_(entityName);
  for (var i = 0; i < data.rows.length; i++) {
    var obj = rowToObject_(data.headers, data.rows[i]);
    if (obj.id === id && !obj.deletedAt) return obj;
  }
  return null;
}

function createEntity_(entityName, payload) {
  var sheet = ensureSheet_(entityName);
  var headers = readHeaders_(sheet);
  var id = payload.id || IdGen.forEntity(entityName);
  var obj = Object.assign({}, payload, { id: id });
  sheet.appendRow(objectToRow_(headers, obj));
  AppLogger.debug("SheetRepository: row created", { entity: entityName, id: id });
  return obj;
}

function updateEntity_(entityName, id, patch) {
  var data = readAllRows_(entityName);
  for (var i = 0; i < data.rows.length; i++) {
    var obj = rowToObject_(data.headers, data.rows[i]);
    if (obj.id === id) {
      var updated = Object.assign({}, obj, patch, { id: id });
      data.sheet
        .getRange(i + 2, 1, 1, data.headers.length)
        .setValues([objectToRow_(data.headers, updated)]);
      AppLogger.debug("SheetRepository: row updated", { entity: entityName, id: id });
      return updated;
    }
  }
  throw new Error(entityName + " " + id + " not found");
}

function removeEntity_(entityName, id) {
  var now = new Date().toISOString();
  updateEntity_(entityName, id, { deletedAt: now });
  AppLogger.debug("SheetRepository: row soft-deleted", { entity: entityName, id: id });
}

function restoreEntity_(entityName, id) {
  updateEntity_(entityName, id, { deletedAt: "" });
  AppLogger.debug("SheetRepository: row restored", { entity: entityName, id: id });
}

function purgeEntity_(entityName, id) {
  var data = readAllRows_(entityName);
  for (var i = 0; i < data.rows.length; i++) {
    var obj = rowToObject_(data.headers, data.rows[i]);
    if (obj.id === id) {
      data.sheet.deleteRow(i + 2);
      AppLogger.debug("SheetRepository: row purged", { entity: entityName, id: id });
      return;
    }
  }
}
