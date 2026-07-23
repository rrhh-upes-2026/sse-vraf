/**
 * IIA Unit Definition — Institutional Intelligence Assistant.
 * 12 handlers proxied to IIAController.
 */

var IIA_UNIT_DEF = {
  namespace: "iia",
  handlers: {
    chat:               function (p, ctx) { return IIAController.handle("chat",               p, ctx); },
    listConversations:  function (p, ctx) { return IIAController.handle("listConversations",  p, ctx); },
    getConversation:    function (p, ctx) { return IIAController.handle("getConversation",    p, ctx); },
    deleteConversation: function (p, ctx) { return IIAController.handle("deleteConversation", p, ctx); },
    getDashboard:       function (p, ctx) { return IIAController.handle("getDashboard",       p, ctx); },
    getConfig:          function (p, ctx) { return IIAController.handle("getConfig",          p, ctx); },
    updateConfig:       function (p, ctx) { return IIAController.handle("updateConfig",       p, ctx); },
    listPrompts:        function (p, ctx) { return IIAController.handle("listPrompts",        p, ctx); },
    updatePrompt:       function (p, ctx) { return IIAController.handle("updatePrompt",       p, ctx); },
    getHistory:         function (p, ctx) { return IIAController.handle("getHistory",         p, ctx); },
    checkStatus:        function (p, ctx) { return IIAController.handle("checkStatus",        p, ctx); },
    clearHistory:       function (p, ctx) { return IIAController.handle("clearHistory",       p, ctx); },
  },
};
