/**
 * EME — Evidence Management Engine unit definition.
 *
 * Registered in Code.js after registerAllUnits_().
 * Namespace: "eme"
 */
var EME_UNIT_DEF = {
  key:     "eme",
  label:   "Gestión de Evidencias",
  enabled: true,

  handlers: {
    listEvidencias:    function (p) { return EMEController.listEvidencias(p);    },
    getEvidencia:      function (p) { return EMEController.getEvidencia(p);      },
    createEvidencia:   function (p) { return EMEController.createEvidencia(p);   },
    updateEvidencia:   function (p) { return EMEController.updateEvidencia(p);   },
    cambiarEstado:     function (p) { return EMEController.cambiarEstado(p);     },
    validarEvidencia:  function (p) { return EMEController.validarEvidencia(p);  },
    nuevaVersion:      function (p) { return EMEController.nuevaVersion(p);      },
    archivarEvidencia: function (p) { return EMEController.archivarEvidencia(p); },
    getMisEvidencias:  function (p) { return EMEController.getMisEvidencias(p);  },
    listCatalogos:     function (p) { return EMEController.listCatalogos(p);     },
    createCatalogo:    function (p) { return EMEController.createCatalogo(p);    },
    updateCatalogo:    function (p) { return EMEController.updateCatalogo(p);    },
    getHistorial:      function (p) { return EMEController.getHistorial(p);      },
    buscarEvidencias:  function (p) { return EMEController.buscarEvidencias(p);  },
    getDashboard:      function (p) { return EMEController.getDashboard(p);      },
  },
};
