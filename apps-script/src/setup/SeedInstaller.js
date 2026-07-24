/**
 * SeedInstaller — Institutional seed data for SSE-VRAF.
 *
 * Installs the 6 organizational workspaces, 6 institutional users,
 * and their workspace-user assignments during BootstrapController.installTemplates().
 *
 * Design rules:
 *   • No user data hardcoded outside this file.
 *   • Idempotent: checks for existing records before inserting.
 *   • All writes use createEntity_/getEntity_ from SheetRepository.
 *   • wsSettings.id = wsId by convention (same as upsertByWsId pattern).
 */
var SeedInstaller = (function () {

  // ── Institutional users ──────────────────────────────────────────────────────

  var SEED_USERS = [
    {
      id:        "usr-linda-alas",
      email:     "linda.alas@upes.edu.sv",
      nombre:    "Linda Bellaneth Alas García",
      cargo:     "Vicerrectora Administrativa Financiera",
      unidadKey: "vraf",
      rol:       "GENERAL_ADMIN",
    },
    {
      id:        "usr-roberto-reales",
      email:     "roberto.reales@upes.edu.sv",
      nombre:    "Roberto Efraín Reales Ramírez",
      cargo:     "Jefe de Recursos Humanos",
      unidadKey: "rrhh",
      rol:       "GENERAL_ADMIN",
    },
    {
      id:        "usr-rrhh-admin",
      email:     "rrhh@upes.edu.sv",
      nombre:    "Administrador RRHH",
      cargo:     "Administrador General",
      unidadKey: "rrhh",
      rol:       "GENERAL_ADMIN",
    },
    {
      id:        "usr-oscar-flores",
      email:     "oscar.flores@upes.edu.sv",
      nombre:    "Oscar Gilberto Flores",
      cargo:     "Jefe de Contabilidad",
      unidadKey: "contabilidad",
      rol:       "UNIT_OWNER",
    },
    {
      id:        "usr-ady-hernandez",
      email:     "ady.hernandez@upes.edu.sv",
      nombre:    "Ady Yared Hernández Medrano",
      cargo:     "Jefe de Compras",
      unidadKey: "compras",
      rol:       "UNIT_OWNER",
    },
    {
      id:        "usr-belly-salguero",
      email:     "belly.salguero@upes.edu.sv",
      nombre:    "Belly Donald Salguero Corado",
      cargo:     "Jefe de Mantenimiento e Infraestructura",
      unidadKey: "mantenimiento",
      rol:       "UNIT_OWNER",
    },
    {
      id:        "usr-ruth-escobar",
      email:     "ruth.escobar@upes.edu.sv",
      nombre:    "Ruth Nohemy Escobar González",
      cargo:     "Responsable de Salud y Seguridad Ocupacional",
      unidadKey: "salud",
      rol:       "UNIT_OWNER",
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

  function isInstalled_() {
    try {
      var result = listEntities_("usuarios", { email: "linda.alas@upes.edu.sv" });
      return !!(result.items && result.items.length > 0);
    } catch (e) {
      return false;
    }
  }

  // ── Install steps ─────────────────────────────────────────────────────────────

  function installUsers_(userId, logs) {
    var now = new Date().toISOString();
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
          id:             u.id,
          nombre:         u.nombre,
          email:          u.email,
          unidadId:       u.unidadKey,
          rol:            u.rol,
          activo:         true,
          avatarInitials: initials_(u.nombre),
          createdAt:      now,
          updatedAt:      now,
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
    var now = new Date().toISOString();
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
    var now = new Date().toISOString();
    var count = 0;
    for (var i = 0; i < SEED_USERS.length; i++) {
      var u = SEED_USERS[i];
      try {
        var existing = listEntities_("wsUsers", { wsId: u.unidadKey, email: u.email });
        if (existing.items && existing.items.length > 0) {
          log_(logs, "info", "wsUser ya existe: " + u.email + " → " + u.unidadKey);
          continue;
        }
        createEntity_("wsUsers", {
          id:        IdGen.uuid(),
          wsId:      u.unidadKey,
          userId:    u.id,
          email:     u.email,
          nombre:    u.nombre,
          rol:       u.rol === "GENERAL_ADMIN" ? "ADMIN" : "HEAD",
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
    if (isInstalled_()) {
      log_(logs, "info", "Seed data ya instalada — omitiendo.");
      return { skipped: true, logs: logs };
    }
    log_(logs, "info", "Instalando seed data institucional UPES...");
    var users      = installUsers_(userId, logs);
    var workspaces = installWorkspaces_(userId, logs);
    var wsUsers    = installWorkspaceUsers_(userId, logs);
    log_(logs, "success",
      "Seed data instalada: " + users + " usuarios, " +
      workspaces + " workspaces, " + wsUsers + " asignaciones.");
    return { skipped: false, users: users, workspaces: workspaces, wsUsers: wsUsers, logs: logs };
  }

  return {
    installAll:      installAll,
    SEED_USERS:      SEED_USERS,
    SEED_WORKSPACES: SEED_WORKSPACES,
  };

})();
