/**
 * IIE — Institutional Intelligence Engine entity schemas.
 * Owns only configuration/rule sheets. All operational data is read from other engines.
 */
var IIE_ENTITY_SHEETS = {
  iieConfiguration: {
    sheetName: "IIE_Configuration",
    columns: [
      "id", "wsId", "key", "value", "label", "description",
      "category", "type", "min", "max", "updatedAt", "createdAt",
    ],
  },
  iieKnowledgeRules: {
    sheetName: "IIE_KnowledgeRules",
    columns: [
      "id", "wsId", "name", "description", "conditions", "consequences",
      "logic", "weight", "confidence", "enabled", "category", "priority",
      "createdAt", "updatedAt",
    ],
  },
  iieModelParameters: {
    sheetName: "IIE_ModelParameters",
    columns: [
      "id", "wsId", "model", "parameter", "value", "description",
      "createdAt", "updatedAt",
    ],
  },
};

function mergeIIEEntities_() {
  Object.keys(IIE_ENTITY_SHEETS).forEach(function (key) {
    ENTITY_SHEETS[key] = IIE_ENTITY_SHEETS[key];
  });
}
