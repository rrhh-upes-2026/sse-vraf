/**
 * NCE — Notification & Communication Engine Unit Definition.
 */
var NCE_UNIT_DEF = {
  key: "nce",
  label: "Notification & Communication Engine",
  enabled: true,
  handlers: {
    getDashboard: function (p) { return NCEController.getDashboard(p); },
    getNotifications: function (p) { return NCEController.getNotifications(p); },
    createNotification: function (p) { return NCEController.createNotification(p); },
    markRead: function (p) { return NCEController.markRead(p); },
    archiveNotification: function (p) { return NCEController.archiveNotification(p); },
    getTemplates: function (p) { return NCEController.getTemplates(p); },
    getTemplate: function (p) { return NCEController.getTemplate(p); },
    createTemplate: function (p) { return NCEController.createTemplate(p); },
    updateTemplate: function (p) { return NCEController.updateTemplate(p); },
    getPreference: function (p) { return NCEController.getPreference(p); },
    updatePreference: function (p) { return NCEController.updatePreference(p); },
    generateDigest: function (p) { return NCEController.generateDigest(p); },
    getDigests: function (p) { return NCEController.getDigests(p); },
    consumeAUEEvents: function (p) { return NCEController.consumeAUEEvents(p); },
    seedTemplates: function (p) { return NCEController.seedTemplates(p); },
  },
};
