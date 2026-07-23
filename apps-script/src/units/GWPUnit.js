/**
 * GWP — Google Workspace Integration Platform
 * OrgUnit definition. Registered in Code.js bootstrap.
 */
var GWP_UNIT_DEF = {
  key:     "gwp",
  label:   "Google Workspace Integration Platform",
  enabled: true,
  handlers: {
    // Dashboard
    "gwp.getDashboard":       function (p) { return GWPController.getDashboard(p); },
    // OAuth
    "gwp.getAuthUrl":         function (p) { return GWPController.getAuthUrl(p); },
    "gwp.handleCallback":     function (p) { return GWPController.handleCallback(p); },
    "gwp.getOAuthStatus":     function (p) { return GWPController.getOAuthStatus(p); },
    "gwp.revokeToken":        function (p) { return GWPController.revokeToken(p); },
    "gwp.refreshToken":       function (p) { return GWPController.refreshToken(p); },
    // Config
    "gwp.getConfig":          function (p) { return GWPController.getConfig(p); },
    "gwp.updateConfig":       function (p) { return GWPController.updateConfig(p); },
    // Drive
    "gwp.createFolder":       function (p) { return GWPController.createFolder(p); },
    "gwp.findFolder":         function (p) { return GWPController.findFolder(p); },
    "gwp.uploadFile":         function (p) { return GWPController.uploadFile(p); },
    "gwp.updateFile":         function (p) { return GWPController.updateFile(p); },
    "gwp.moveFile":           function (p) { return GWPController.moveFile(p); },
    "gwp.deleteFile":         function (p) { return GWPController.deleteFile(p); },
    "gwp.shareFile":          function (p) { return GWPController.shareFile(p); },
    "gwp.getFileMetadata":    function (p) { return GWPController.getFileMetadata(p); },
    "gwp.generateLink":       function (p) { return GWPController.generateLink(p); },
    "gwp.listVersions":       function (p) { return GWPController.listVersions(p); },
    "gwp.getDriveQuota":      function (p) { return GWPController.getDriveQuota(p); },
    // Gmail
    "gwp.sendMail":           function (p) { return GWPController.sendMail(p); },
    "gwp.replyToThread":      function (p) { return GWPController.replyToThread(p); },
    "gwp.getMailLogs":        function (p) { return GWPController.getMailLogs(p); },
    // Calendar
    "gwp.createEvent":        function (p) { return GWPController.createEvent(p); },
    "gwp.updateEvent":        function (p) { return GWPController.updateEvent(p); },
    "gwp.deleteEvent":        function (p) { return GWPController.deleteEvent(p); },
    "gwp.checkAvailability":  function (p) { return GWPController.checkAvailability(p); },
    "gwp.listEvents":         function (p) { return GWPController.listEvents(p); },
    // Chat
    "gwp.listSpaces":         function (p) { return GWPController.listSpaces(p); },
    "gwp.sendChatMessage":    function (p) { return GWPController.sendChatMessage(p); },
    "gwp.createChatCard":     function (p) { return GWPController.createChatCard(p); },
    "gwp.replyToSpace":       function (p) { return GWPController.replyToSpace(p); },
    "gwp.getChatLogs":        function (p) { return GWPController.getChatLogs(p); },
    // Audit
    "gwp.getAuditLog":        function (p) { return GWPController.getAuditLog(p); },
  },
};
