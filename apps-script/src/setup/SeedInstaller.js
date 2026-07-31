/**
 * SeedInstaller — Institutional seed data for SSE-VRAF.
 *
 * Installs the 6 organizational workspaces and 3 platform admin users
 * during BootstrapController.installTemplates().
 *
 * Design rules:
 *   • No hardcoded email/ID checks in permission logic — pure RBAC.
 *   • Idempotent: upserts on every run (update if exists, create if not).
 *   • Admin users always get their role, status, and password refreshed.
 *   • Temp password UPES2026! is stored as SHA-256(salt:password) — never plaintext.
 */
var SeedInstaller = (function () {

  // ── Password helpers (mirrors AuthBridge — kept local to avoid circular dep) ─

  function hashPwd_(password, salt) {
    var raw = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      salt + ":" + password,
      Utilities.Charset.UTF_8
    );
    return raw.map(function (b) {
      var hex = (b < 0 ? b + 256 : b).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }

  function makeSalt_() {
    return Utilities.getUuid().replace(/-/g, "");
  }

  // ── Platform admin users (bootstrapped on every run — idempotent upsert) ─────
  //
  // Role hierarchy: ADMINISTRADOR_GENERAL > ADMINISTRADOR_UNIDAD > JEFE_UNIDAD
  //                 > COORDINADOR > ANALISTA > USUARIO > CONSULTA
  //
  // ADMINISTRADOR_GENERAL has platform-wide access across all workspaces.
  // ADMINISTRADOR_UNIDAD has full access to their assigned workspace only.

  var ADMIN_SEED_USERS = [
    {
      id:        "usr-vraf-admin",
      email:     "vicerrectoria.financiera@upes.edu.sv",
      nombre:    "Vicerrectoría Administrativa y Financiera",
      cargo:     "Administrador General de la Plataforma",
      unidadKey: "GLOBAL",
      rol:       "ADMINISTRADOR_GENERAL",
    },
    {
      id:        "usr-rrhh-admin",
      email:     "rrhh@upes.edu.sv",
      nombre:    "Administrador RRHH",
      cargo:     "Administrador de Unidad VRAF",
      unidadKey: "vraf",
      rol:       "ADMINISTRADOR_UNIDAD",
    },
    {
      id:        "usr-linda-alas",
      email:     "linda.alas@upes.edu.sv",
      nombre:    "Linda Bellaneth Alas García",
      cargo:     "Vicerrectora Administrativa Financiera",
      unidadKey: "vraf",
      rol:       "ADMINISTRADOR_UNIDAD",
    },
  ];

  // ── Other institutional users (unit heads — created on first run only) ────────

  var SEED_USERS = [
    {
      id:        "usr-oscar-flores",
      email:     "oscar.flores@upes.edu.sv",
      nombre:    "Oscar Gilberto Flores",
      cargo:     "Jefe de Contabilidad",
      unidadKey: "contabilidad",
      rol:       "JEFE_UNIDAD",
    },
    {
      id:        "usr-ady-hernandez",
      email:     "ady.hernandez@upes.edu.sv",
      nombre:    "Ady Yared Hernández Medrano",
      cargo:     "Jefe de Compras",
      unidadKey: "compras",
      rol:       "JEFE_UNIDAD",
    },
    {
      id:        "usr-belly-salguero",
      email:     "belly.salguero@upes.edu.sv",
      nombre:    "Belly Donald Salguero Corado",
      cargo:     "Jefe de Mantenimiento e Infraestructura",
      unidadKey: "mantenimiento",
      rol:       "JEFE_UNIDAD",
    },
    {
      id:        "usr-ruth-escobar",
      email:     "ruth.escobar@upes.edu.sv",
      nombre:    "Ruth Nohemy Escobar González",
      cargo:     "Responsable de Salud y Seguridad Ocupacional",
      unidadKey: "salud",
      rol:       "JEFE_UNIDAD",
    },
  ];

  // ── Organizational workspaces ────────────────────────────────────────────────

  var SEED_WORKSPACES = [
    { id: "rrhh",          nombre: "Recursos Humanos",                        color: "#2E6BE6", icon: "Users" },
    { id: "vraf",          nombre: "Vicerrectoría Administrativa Financiera",  color: "#7C3AED", icon: "Building2" },
    { id: "contabilidad",  nombre: "Contabilidad y Finanzas",                 color: "#059669", icon: "DollarSign" },
    { id: "compras",       nombre: "Compras y Adquisiciones",                  color: "#D97706", icon: "ShoppingCart" },
    { id: "mantenimiento", nombre: "Mantenimiento e Infraestructura",          color: "#DC2626", icon: "Wrench" },
    { id: "salud",         nombre: "Salud y Seguridad Ocupacional",            color: "#0891B2", icon: "HeartPulse" },
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function log_(logs, level, msg) {
    logs.push({ level: level, message: msg, timestamp: new Date().toISOString() });
  }

  function initials_(nombre) {
    var words = String(nombre || "").split(/\s+/);
    var result = "";
    for (var i = 0; i < Math.min(2, words.length); i++) {
      if (words[i]) result += words[i][0].toUpperCase();
    }
    return result || "??";
  }

  // ── Install steps ─────────────────────────────────────────────────────────────

  // Upserts admin users on every bootstrap run: always refreshes role + password.
  function installAdminUsers_(userId, logs) {
    var now   = new Date().toISOString();
    var count = 0;
    var TEMP_PASSWORD = "UPES2026!";

    for (var i = 0; i < ADMIN_SEED_USERS.length; i++) {
      var u = ADMIN_SEED_USERS[i];
      try {
        var salt = makeSalt_();
        var hash = hashPwd_(TEMP_PASSWORD, salt);

        var existing = listEntities_("usuarios", { email: u.email });
        if (existing.items && existing.items.length > 0) {
          // Upsert: refresh role, status, and password hash
          updateEntity_("usuarios", existing.items[0].id, {
            rol:               u.rol,
            unidadId:          u.unidadKey,
            activo:            true,
            passwordHash:      hash,
            passwordSalt:      salt,
            mustChangePassword: false,
            updatedAt:         now,
          });
          log_(logs, "info", "Admin actualizado: " + u.email + " → " + u.rol);
        } else {
          createEntity_("usuarios", {
            id:                u.id,
            nombre:            u.nombre,
            email:             u.email,
            unidadId:          u.unidadKey,
            rol:               u.rol,
            activo:            true,
            passwordHash:      hash,
            passwordSalt:      salt,
            mustChangePassword: false,
            avatarInitials:    initials_(u.nombre),
            createdAt:         now,
            updatedAt:         now,
          });
          count++;
          log_(logs, "success", "Admin creado: " + u.nombre + " [" + u.rol + "]");
        }
      } catch (e) {
        log_(logs, "error", "Error procesando admin " + u.email + ": " + String(e.message || e));
      }
    }
    return count;
  }

  // Creates unit heads only if they don't already exist (skip on subsequent runs).
  function installUsers_(userId, logs) {
    var now   = new Date().toISOString();
    var count = 0;

    for (var i = 0; i < SEED_USERS.length; i++) {
      var u = SEED_USERS[i];
      try {
        var existing = listEntities_("usuarios", { email: u.email });
        if (existing.items && existing.items.length > 0) {
          log_(logs, "info", "Usuario ya existe: " + u.email);
          continue;
        }
        createEntity_("usuarios", {
          id:                u.id,
          nombre:            u.nombre,
          email:             u.email,
          unidadId:          u.unidadKey,
          rol:               u.rol,
          activo:            true,
          mustChangePassword: true,
          avatarInitials:    initials_(u.nombre),
          createdAt:         now,
          updatedAt:         now,
        });
        count++;
        log_(logs, "success", "Usuario creado: " + u.nombre);
      } catch (e) {
        log_(logs, "error", "Error creando usuario " + u.email + ": " + String(e.message || e));
      }
    }
    return count;
  }

  function installWorkspaces_(userId, logs) {
    var now   = new Date().toISOString();
    var count = 0;
    for (var i = 0; i < SEED_WORKSPACES.length; i++) {
      var ws = SEED_WORKSPACES[i];
      try {
        var existing = getEntity_("wsSettings", ws.id);
        if (existing) {
          log_(logs, "info", "Workspace ya configurado: " + ws.id);
          continue;
        }
        createEntity_("wsSettings", {
          id:        ws.id,
          wsId:      ws.id,
          nombre:    ws.nombre,
          color:     ws.color,
          icon:      ws.icon,
          activo:    "true",
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
        });
        count++;
        log_(logs, "success", "Workspace configurado: " + ws.nombre);
      } catch (e) {
        log_(logs, "error", "Error configurando workspace " + ws.id + ": " + String(e.message || e));
      }
    }
    return count;
  }

  function installWorkspaceUsers_(userId, logs) {
    var now   = new Date().toISOString();
    var count = 0;
    var allUsers = ADMIN_SEED_USERS.concat(SEED_USERS);

    for (var i = 0; i < allUsers.length; i++) {
      var u = allUsers[i];
      // GLOBAL unidad means cross-workspace — no wsUsers row needed
      if (u.unidadKey === "GLOBAL") continue;

      try {
        var existing = listEntities_("wsUsers", { wsId: u.unidadKey, email: u.email });
        if (existing.items && existing.items.length > 0) {
          log_(logs, "info", "wsUser ya existe: " + u.email + " → " + u.unidadKey);
          continue;
        }
        // Map platform roles to workspace-level roles
        var wsRol = "JEFE_UNIDAD";
        if (u.rol === "ADMINISTRADOR_GENERAL") wsRol = "ADMINISTRADOR_GENERAL";
        else if (u.rol === "ADMINISTRADOR_UNIDAD") wsRol = "ADMINISTRADOR_UNIDAD";
        else if (u.rol === "JEFE_UNIDAD") wsRol = "JEFE_UNIDAD";

        createEntity_("wsUsers", {
          id:        IdGen.uuid(),
          wsId:      u.unidadKey,
          userId:    u.id,
          email:     u.email,
          nombre:    u.nombre,
          rol:       wsRol,
          activo:    "true",
          createdAt: now,
          updatedAt: now,
        });
        count++;
        log_(logs, "success", "wsUser asignado: " + u.nombre + " → " + u.unidadKey);
      } catch (e) {
        log_(logs, "error", "Error asignando wsUser " + u.email + ": " + String(e.message || e));
      }
    }
    return count;
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  function installAll(userId, logs) {
    logs = logs || [];
    log_(logs, "info", "Ejecutando bootstrap institucional UPES...");

    // Admin users are always upserted (idempotent)
    var adminCount  = installAdminUsers_(userId, logs);
    // Workspaces and regular users skip if already present
    var users       = installUsers_(userId, logs);
    var workspaces  = installWorkspaces_(userId, logs);
    var wsUsers     = installWorkspaceUsers_(userId, logs);

    log_(logs, "success",
      "Bootstrap completado: " + (adminCount + users) + " usuarios, " +
      workspaces + " workspaces, " + wsUsers + " asignaciones.");
    return { skipped: false, users: adminCount + users, workspaces: workspaces, wsUsers: wsUsers, logs: logs };
  }

  return {
    installAll:      installAll,
    SEED_USERS:      ADMIN_SEED_USERS.concat(SEED_USERS),
    SEED_WORKSPACES: SEED_WORKSPACES,
  };

})();

/** Top-level wrapper — callable from the GAS editor's function dropdown. */
function runInstallAll() {
  var result = SeedInstaller.installAll();
  Logger.log(JSON.stringify(result, null, 2));
}
