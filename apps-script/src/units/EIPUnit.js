/**
 * EIP — Executive Intelligence Platform unit definition.
 * Read-only engine. No entity schema ownership.
 */
var EIP_UNIT_DEF = {
  key:     "eip",
  label:   "Executive Intelligence Platform",
  enabled: true,
  handlers: {
    getDashboard:   EIPController.getDashboard,
    getScorecard:   EIPController.getScorecard,
    getHeatMap:     EIPController.getHeatMap,
    getTrends:      EIPController.getTrends,
    getAlerts:      EIPController.getAlerts,
    getTimeline:    EIPController.getTimeline,
    getRanking:     EIPController.getRanking,
    getComparativo: EIPController.getComparativo,
  },
};
