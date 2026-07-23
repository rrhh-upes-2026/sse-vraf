/**
 * FMI — Framework Maestro de Indicadores
 * Entity schema definitions.
 */

var FMI_ENTITIES = [
  {
    name:    "FMI_Objectives",
    columns: ["id", "codigo", "nombre", "descripcion", "estado", "orden", "createdAt", "updatedAt", "updatedBy"],
  },
  {
    name:    "FMI_Dimensions",
    columns: ["id", "codigo", "nombre", "descripcion", "estado", "orden", "createdAt", "updatedAt", "updatedBy"],
  },
  {
    name:    "FMI_UnitMeasures",
    columns: ["id", "codigo", "nombre", "tipo", "estado"],
  },
  {
    name:    "FMI_Frequencies",
    columns: ["id", "codigo", "nombre", "descripcion", "periodoDias", "estado"],
  },
  {
    name:    "FMI_Polarities",
    columns: ["id", "codigo", "nombre", "descripcion", "estado"],
  },
  {
    name:    "FMI_Formulas",
    columns: ["id", "codigo", "nombre", "descripcion", "unidadMedidaId", "formulaVisible", "formulaEjecutable", "variablesJson", "estado", "createdAt", "updatedAt", "updatedBy"],
  },
  {
    name:    "FMI_FormulaVariables",
    columns: ["id", "formulaId", "codigo", "nombre", "descripcion", "tipo", "orden"],
  },
  {
    name:    "FMI_RangeConfigs",
    columns: ["id", "nombre", "descripcion", "polaridad", "excelente", "bueno", "aceptable", "critico", "estado", "createdAt", "updatedAt", "updatedBy"],
  },
];

function mergeFMIEntities_() {
  FMI_ENTITIES.forEach(function (def) {
    SheetRepository.ensureSheet(def.name, def.columns);
  });
}
