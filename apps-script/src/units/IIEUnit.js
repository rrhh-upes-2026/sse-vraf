/**
 * IIE — Institutional Intelligence Engine unit registration.
 */
var IIE_UNIT_DEF = {
  key: "iie",
  label: "Institutional Intelligence Engine",
  enabled: true,
  handlers: {
    getDashboard:         IIEController.getDashboard,
    getDiagnostics:       IIEController.getDiagnostics,
    getRecommendations:   IIEController.getRecommendations,
    getPredictions:       IIEController.getPredictions,
    getAnomalies:         IIEController.getAnomalies,
    getNarratives:        IIEController.getNarratives,
    getConfiguration:     IIEController.getConfiguration,
    updateConfiguration:  IIEController.updateConfiguration,
    getKnowledgeRules:    IIEController.getKnowledgeRules,
    updateKnowledgeRule:  IIEController.updateKnowledgeRule,
    getSemanticModel:     IIEController.getSemanticModel,
    semanticQuery:        IIEController.semanticQuery,
  },
};
