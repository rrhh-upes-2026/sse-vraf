/**
 * Repository — CRUD genérico sobre Google Sheets.
 *
 * Uso:
 *   var repo = Repository.for("usuarios");
 *   repo.findAll({ activo: true })
 *   repo.findOne({ email: "..." })
 *   repo.findById("usr-xxx")
 *   repo.create({ id, nombre, ... })
 *   repo.update("usr-xxx", { rol: "ANALISTA" })
 *   repo.remove("usr-xxx")
 *
 * Reglas:
 *   - La primera fila de cada hoja es la cabecera (no se toca).
 *   - Los valores booleanos se serializan como strings "true"/"false".
 *   - Los objetos se serializan como JSON.
 *   - Los campos no incluidos en columns se ignoran silenciosamente.
 */
var Repository = (function () {

  // ── Helpers de hoja ───────────────────────────────────────────────────────

  function openSheet_(entityName) {
    var schema = SchemaRegistry.get(entityName);
    var id = Config.spreadsheetId();
    if (!id) throw new Error("SPREADSHEET_ID no configurado en Script Properties.");
    var ss = SpreadsheetApp.openById(id);
    var sheet = ss.getSheetByName(schema.sheetName);
    if (!sheet) {
      var e = new Error("Hoja no encontrada: " + schema.sheetName + ". Ejecuta runSetup() primero.");
      e.code = "SHEET_NOT_FOUND";
      throw e;
    }
    return { sheet: sheet, cols: schema.columns };
  }

  // ── Serialización ─────────────────────────────────────────────────────────

  function rowToObj_(row, cols) {
    var obj = {};
    for (var i = 0; i < cols.length; i++) {
      var v = row[i];
      if (v === "" || v === undefined || v === null) { obj[cols[i]] = null; continue; }
      if (v === "true")  { obj[cols[i]] = true;  continue; }
      if (v === "false") { obj[cols[i]] = false; continue; }
      obj[cols[i]] = v;
    }
    return obj;
  }

  function objToRow_(obj, cols) {
    return cols.map(function (col) {
      var v = obj[col];
      if (v === undefined || v === null) return "";
      if (typeof v === "boolean") return String(v);
      if (typeof v === "object")  return JSON.stringify(v);
      return String(v);
    });
  }

  // ── Lectura de todas las filas ────────────────────────────────────────────

  function readAllRows_(sheet, cols) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    var data = sheet.getRange(2, 1, lastRow - 1, cols.length).getValues();
    return data.map(function (row) { return rowToObj_(row, cols); });
  }

  // ── Filtro ────────────────────────────────────────────────────────────────

  function matches_(obj, filter) {
    if (!filter) return true;
    return Object.keys(filter).every(function (k) {
      var fv = filter[k];
      var ov = obj[k];
      if (fv === null || fv === undefined) return ov === null || ov === undefined;
      // Comparación case-insensitive para strings
      return String(ov).toLowerCase() === String(fv).toLowerCase();
    });
  }

  // ── Factory ───────────────────────────────────────────────────────────────

  return {
    for: function (entityName) {
      var repo = {

        findAll: function (filter) {
          var ctx  = openSheet_(entityName);
          var rows = readAllRows_(ctx.sheet, ctx.cols);
          return filter ? rows.filter(function (r) { return matches_(r, filter); }) : rows;
        },

        findOne: function (filter) {
          var ctx  = openSheet_(entityName);
          var rows = readAllRows_(ctx.sheet, ctx.cols);
          for (var i = 0; i < rows.length; i++) {
            if (matches_(rows[i], filter)) return rows[i];
          }
          return null;
        },

        findById: function (id) {
          return repo.findOne({ id: id });
        },

        create: function (data) {
          var ctx = openSheet_(entityName);
          ctx.sheet.appendRow(objToRow_(data, ctx.cols));
          return data;
        },

        update: function (id, patch) {
          var ctx     = openSheet_(entityName);
          var lastRow = ctx.sheet.getLastRow();
          if (lastRow < 2) { var e1 = new Error("Registro no encontrado: " + id); e1.code = "NOT_FOUND"; throw e1; }

          var idIdx = ctx.cols.indexOf("id");
          var data  = ctx.sheet.getRange(2, 1, lastRow - 1, ctx.cols.length).getValues();

          for (var i = 0; i < data.length; i++) {
            if (String(data[i][idIdx]) === String(id)) {
              var existing = rowToObj_(data[i], ctx.cols);
              var updated  = Object.assign({}, existing, patch);
              ctx.sheet.getRange(i + 2, 1, 1, ctx.cols.length).setValues([objToRow_(updated, ctx.cols)]);
              return updated;
            }
          }
          var e2 = new Error("Registro no encontrado: " + id); e2.code = "NOT_FOUND"; throw e2;
        },

        remove: function (id) {
          var ctx     = openSheet_(entityName);
          var lastRow = ctx.sheet.getLastRow();
          if (lastRow < 2) { var e = new Error("Registro no encontrado: " + id); e.code = "NOT_FOUND"; throw e; }

          var idIdx = ctx.cols.indexOf("id");
          var col   = ctx.sheet.getRange(2, idIdx + 1, lastRow - 1, 1).getValues();

          for (var i = col.length - 1; i >= 0; i--) {
            if (String(col[i][0]) === String(id)) {
              ctx.sheet.deleteRow(i + 2);
              return true;
            }
          }
          var e2 = new Error("Registro no encontrado: " + id); e2.code = "NOT_FOUND"; throw e2;
        },

        count: function (filter) {
          return repo.findAll(filter).length;
        },

        exists: function (filter) {
          return repo.findOne(filter) !== null;
        },
      };

      return repo;
    },
  };
})();
