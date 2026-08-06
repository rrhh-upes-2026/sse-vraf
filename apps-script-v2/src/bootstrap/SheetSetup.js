/**
 * SheetSetup — crea y verifica las hojas del Spreadsheet.
 *
 * Idempotente: crea la hoja si no existe, la ignora si ya existe.
 * Las cabeceras se toman del SchemaRegistry.
 */
var SheetSetup = {
  HEADER_COLOR:      "#1a73e8",
  HEADER_FONT_COLOR: "#ffffff",

  getOrCreateSpreadsheet: function () {
    var ssId = Config.spreadsheetId();
    if (ssId) {
      try { return SpreadsheetApp.openById(ssId); } catch (_) {}
    }

    Logger.log("Creando nuevo Spreadsheet...");
    var ss = SpreadsheetApp.create("SSE-VRAF — Base de Datos v2");

    // Eliminar hoja por defecto
    var sheets = ss.getSheets();
    if (sheets.length > 0) {
      // Crear una temporal para no quedar sin hojas
      ss.insertSheet("__tmp__");
      sheets.forEach(function (s) {
        if (s.getName() !== "__tmp__") ss.deleteSheet(s);
      });
    }

    Config.set("SPREADSHEET_ID", ss.getId());
    Logger.log("Spreadsheet creado: " + ss.getId());
    return ss;
  },

  ensureSheet: function (ss, schema) {
    var sheet = ss.getSheetByName(schema.sheetName);
    if (sheet) return { created: false, name: schema.sheetName };

    sheet = ss.insertSheet(schema.sheetName);

    // Cabecera
    var headerRange = sheet.getRange(1, 1, 1, schema.columns.length);
    headerRange.setValues([schema.columns]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground(SheetSetup.HEADER_COLOR);
    headerRange.setFontColor(SheetSetup.HEADER_FONT_COLOR);
    headerRange.setHorizontalAlignment("center");

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, schema.columns.length);

    return { created: true, name: schema.sheetName };
  },

  ensureAllSheets: function (ss) {
    var schemas = SchemaRegistry.all();
    var created = [];
    var existing = [];

    Object.keys(schemas).forEach(function (name) {
      var result = SheetSetup.ensureSheet(ss, schemas[name]);
      if (result.created) created.push(result.name);
      else existing.push(result.name);
    });

    // Eliminar hoja temporal si existe
    var tmp = ss.getSheetByName("__tmp__");
    if (tmp) ss.deleteSheet(tmp);

    return { created: created, existing: existing };
  },
};
