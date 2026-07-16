/**
 * Input validation utilities shared across router, action handlers, and services.
 * All validators throw Error on failure — the router catches and translates to
 * the standard { success: false, errors: [...] } response envelope.
 */
var Validator = {
  /**
   * Throw if any field in `fields` is missing or blank on `obj`.
   * @param {Object} obj
   * @param {string[]} fields
   */
  requireFields: function (obj, fields) {
    var missing = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var v = obj && obj[f];
      if (v === undefined || v === null || String(v).trim() === "") {
        missing.push(f);
      }
    }
    if (missing.length > 0) {
      throw new Error("Missing required fields: " + missing.join(", "));
    }
  },

  /**
   * Throw if params.id is absent or blank.
   * @param {Object} params
   */
  requireId: function (params) {
    if (!params || !params.id || String(params.id).trim() === "") {
      throw new Error("Missing required field: id");
    }
  },

  /**
   * Return a shallow copy of `obj` with undefined/null keys removed.
   * Does not mutate the input.
   * @param {Object} obj
   * @returns {Object}
   */
  sanitize: function (obj) {
    if (!obj || typeof obj !== "object") return {};
    var out = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined && obj[key] !== null) {
          out[key] = obj[key];
        }
      }
    }
    return out;
  },

  /**
   * Return true if `id` is a non-empty string.
   * @param {*} id
   * @returns {boolean}
   */
  isValidId: function (id) {
    return typeof id === "string" && id.trim().length > 0;
  },
};
