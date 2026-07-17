/**
 * GmailService — platform Gmail wrapper.
 *
 * All outbound email goes through this service. GmailApp access is gated by
 * Config.gmailEnabled() — when Gmail is disabled, send methods are no-ops that
 * return false so callers can react without throwing.
 *
 * The `opts` parameter accepted by sendEmail / sendBulkEmail supports:
 *   cc      {string}  — comma-separated CC addresses
 *   bcc     {string}  — comma-separated BCC addresses
 *   replyTo {string}  — Reply-To address
 *   name    {string}  — display name for the From field
 */
var GmailService = {

  /**
   * Send an HTML email to a single recipient.
   *
   * @param {string} to        — recipient email address
   * @param {string} subject   — email subject
   * @param {string} htmlBody  — HTML body content
   * @param {Object} [opts]    — optional: { cc, bcc, replyTo, name }
   * @returns {boolean} true on success, false if Gmail is disabled or recipient is empty
   */
  sendEmail: function (to, subject, htmlBody, opts) {
    if (!GmailService.isEnabled()) {
      AppLogger.debug("GmailService.sendEmail: Gmail disabled, skipping", { to: to });
      return false;
    }

    if (!to) {
      AppLogger.warn("GmailService.sendEmail: no recipient provided, skipping");
      return false;
    }

    if (!subject) {
      AppLogger.warn("GmailService.sendEmail: no subject provided", { to: to });
    }

    var options = { htmlBody: htmlBody || "" };

    opts = opts || {};
    if (opts.cc)      options.cc      = opts.cc;
    if (opts.bcc)     options.bcc     = opts.bcc;
    if (opts.replyTo) options.replyTo = opts.replyTo;
    if (opts.name)    options.name    = opts.name;

    try {
      GmailApp.sendEmail(to, subject || "", "", options);
      AppLogger.info("GmailService.sendEmail: sent", { to: to, subject: subject });
      return true;
    } catch (e) {
      AppLogger.error("GmailService.sendEmail: failed", {
        to:    to,
        error: String(e.message || e),
      });
      throw e;
    }
  },

  /**
   * Send the same email to multiple recipients.
   * Errors per-recipient are caught and logged silently; the method always
   * completes the full list and returns a results summary.
   *
   * @param {string[]} recipients  — array of email address strings
   * @param {string}   subject
   * @param {string}   htmlBody
   * @param {Object}   [opts]      — same options as sendEmail
   * @returns {{ sent: number, failed: number, errors: Array }}
   */
  sendBulkEmail: function (recipients, subject, htmlBody, opts) {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      AppLogger.warn("GmailService.sendBulkEmail: empty recipients list");
      return { sent: 0, failed: 0, errors: [] };
    }

    var sent   = 0;
    var failed = 0;
    var errors = [];

    for (var i = 0; i < recipients.length; i++) {
      var to = recipients[i];
      try {
        var ok = GmailService.sendEmail(to, subject, htmlBody, opts);
        if (ok) {
          sent++;
        } else {
          // disabled or empty address — not a hard failure
          failed++;
        }
      } catch (e) {
        failed++;
        errors.push({ to: to, error: String(e.message || e) });
        AppLogger.error("GmailService.sendBulkEmail: error for recipient", {
          to:    to,
          error: String(e.message || e),
        });
      }
    }

    AppLogger.info("GmailService.sendBulkEmail: completed", {
      total:  recipients.length,
      sent:   sent,
      failed: failed,
    });

    return { sent: sent, failed: failed, errors: errors };
  },

  /**
   * Wrap arbitrary HTML content in the standard SSE platform email template.
   * Returns a complete HTML string ready for use as htmlBody.
   *
   * @param {string} content       — inner HTML to embed
   * @param {string} [instanceName] — platform name shown in the header (defaults to Config.instanceName())
   * @returns {string} full HTML email body
   */
  buildPlatformEmail: function (content, instanceName) {
    var name = instanceName || Config.instanceName() || "SSE Platform";
    var year = new Date().getFullYear();

    return [
      '<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px;',
      '     margin: 0 auto; padding: 20px; background-color: #ffffff;">',

      // Header
      '  <div style="background-color: #1a73e8; padding: 16px 20px;',
      '       border-radius: 6px 6px 0 0;">',
      '    <h1 style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 600;">',
      '      ' + _escapeHtml_(name),
      '    </h1>',
      '  </div>',

      // Body content
      '  <div style="border: 1px solid #e0e0e0; border-top: none; padding: 24px 20px;',
      '       border-radius: 0 0 6px 6px; color: #333333; line-height: 1.6;">',
      '    ' + (content || ""),
      '  </div>',

      // Footer
      '  <div style="margin-top: 16px; font-size: 12px; color: #9e9e9e; text-align: center;">',
      '    &copy; ' + year + ' ' + _escapeHtml_(name) + '. Mensaje generado automáticamente.',
      '  </div>',

      '</div>',
    ].join("\n");
  },

  /**
   * Check whether Gmail sending is enabled for this deployment.
   * Reads the GMAIL_ENABLED script property via Config.
   *
   * @returns {boolean}
   */
  isEnabled: function () {
    try {
      return Config.gmailEnabled();
    } catch (e) {
      AppLogger.warn("GmailService.isEnabled: Config.gmailEnabled() threw, defaulting to false", {
        error: String(e.message || e),
      });
      return false;
    }
  },
};

// ---------------------------------------------------------------------------
// Module-private helpers (not on the GmailService object)
// ---------------------------------------------------------------------------

/**
 * Escape HTML special characters to prevent injection in email templates.
 * @param {string} str
 * @returns {string}
 * @private
 */
function _escapeHtml_(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}
