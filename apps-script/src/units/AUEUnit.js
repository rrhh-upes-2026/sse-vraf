/**
 * AUE — Automation & Event Engine
 * OrgUnitRegistry registration definition.
 */
var AUE_UNIT_DEF = {
  key:     "aue",
  label:   "Automation & Event Engine",
  enabled: true,
  handlers: {
    getDashboard:   function (p) { return AUEController.getDashboard(p);   },
    getEvents:      function (p) { return AUEController.getEvents(p);      },
    createEvent:    function (p) { return AUEController.createEvent(p);    },
    processEvent:   function (p) { return AUEController.processEvent(p);   },
    getRules:       function (p) { return AUEController.getRules(p);       },
    getRule:        function (p) { return AUEController.getRule(p);        },
    createRule:     function (p) { return AUEController.createRule(p);     },
    updateRule:     function (p) { return AUEController.updateRule(p);     },
    duplicateRule:  function (p) { return AUEController.duplicateRule(p);  },
    getExecutions:  function (p) { return AUEController.getExecutions(p);  },
    getQueue:       function (p) { return AUEController.getQueue(p);       },
    retryExecution: function (p) { return AUEController.retryExecution(p); },
  },
};
