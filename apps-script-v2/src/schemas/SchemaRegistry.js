/**
 * SchemaRegistry — registro central de entidades y sus hojas en el Spreadsheet.
 *
 * Cada entidad se registra con:
 *   { sheetName: string, columns: string[] }
 *
 * El orden de columns define el orden de columnas en la hoja.
 * SheetSetup.js y Repository.js consumen este registro.
 */
var SchemaRegistry = (function () {
  var _registry = {};

  return {
    register: function (entityName, schema) {
      if (!schema.sheetName || !schema.columns || !schema.columns.length) {
        throw new Error("Schema inválido para entidad: " + entityName);
      }
      _registry[entityName] = schema;
    },

    get: function (entityName) {
      var schema = _registry[entityName];
      if (!schema) {
        var e = new Error("Entidad no registrada: " + entityName);
        e.code = "NOT_FOUND";
        throw e;
      }
      return schema;
    },

    all: function () {
      return _registry;
    },

    has: function (entityName) {
      return !!_registry[entityName];
    },

    names: function () {
      return Object.keys(_registry);
    },
  };
})();
