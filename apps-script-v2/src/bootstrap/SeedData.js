/**
 * SeedData — datos iniciales del sistema.
 *
 * Todos los métodos son idempotentes (upsert, no insert duplicado).
 * runSetup() es la función de entrada visible en el editor GAS.
 */
var SeedData = {

  ADMIN_USERS: [
    {
      id:       "usr-admin-global-001",
      email:    "vicerrectoria.financiera@upes.edu.sv",
      nombre:   "Vicerrectoría Administrativa y Financiera",
      rol:      "ADMINISTRADOR_GENERAL",
      unidadId: "GLOBAL",
    },
    {
      id:       "usr-admin-vraf-001",
      email:    "rrhh@upes.edu.sv",
      nombre:   "Administrador VRAF",
      rol:      "ADMINISTRADOR_UNIDAD",
      unidadId: "vraf",
    },
    {
      id:       "usr-admin-vraf-002",
      email:    "linda.alas@upes.edu.sv",
      nombre:   "Linda Bellaneth Alas García",
      rol:      "ADMINISTRADOR_UNIDAD",
      unidadId: "vraf",
    },
  ],

  WORKSPACES: [
    { id: "vraf",    nombre: "VRAF",         codigo: "VRAF", descripcion: "Vicerrectoría Administrativa y Financiera" },
    { id: "rrhh",    nombre: "RRHH",         codigo: "RH",   descripcion: "Recursos Humanos" },
    { id: "conta",   nombre: "Contabilidad", codigo: "CONT", descripcion: "Contabilidad General" },
    { id: "compras", nombre: "Compras",       codigo: "COMP", descripcion: "Compras y Adquisiciones" },
    { id: "mant",    nombre: "Mantenimiento", codigo: "MANT", descripcion: "Mantenimiento General" },
    { id: "salud",   nombre: "Salud SSO",     codigo: "SSO",  descripcion: "Seguridad y Salud Ocupacional" },
  ],

  upsertAdminUsers: function () {
    var TEMP_PASSWORD = "UPES2026!";
    var repo = Repository.for("usuarios");
    var now  = new Date().toISOString();
    var count = 0;

    SeedData.ADMIN_USERS.forEach(function (u) {
      var salt     = Crypto.salt();
      var hash     = Crypto.hash(TEMP_PASSWORD, salt);
      var initials = u.nombre.split(" ").filter(Boolean).slice(0, 2).map(function (n) { return n[0]; }).join("").toUpperCase();

      var existing = repo.findOne({ email: u.email });
      if (existing) {
        repo.update(existing.id, {
          rol:                u.rol,
          unidadId:           u.unidadId,
          activo:             true,
          passwordHash:       hash,
          passwordSalt:       salt,
          mustChangePassword: false,
          updatedAt:          now,
        });
        Logger.log("  Upsert: " + u.email + " [actualizado]");
      } else {
        repo.create({
          id:                 u.id,
          nombre:             u.nombre,
          email:              u.email,
          unidadId:           u.unidadId,
          rol:                u.rol,
          activo:             true,
          passwordHash:       hash,
          passwordSalt:       salt,
          mustChangePassword: false,
          avatarInitials:     initials,
          lastLoginAt:        null,
          createdAt:          now,
          updatedAt:          now,
        });
        Logger.log("  Creado: " + u.email);
      }
      count++;
    });

    return count;
  },

  upsertWorkspaces: function () {
    var repo  = Repository.for("workspaces");
    var now   = new Date().toISOString();
    var count = 0;

    SeedData.WORKSPACES.forEach(function (ws) {
      if (!repo.exists({ id: ws.id })) {
        repo.create(Object.assign({}, ws, { activo: true, createdAt: now }));
        Logger.log("  Workspace creado: " + ws.id);
        count++;
      } else {
        Logger.log("  Workspace existente: " + ws.id + " [omitido]");
      }
    });

    return count;
  },
};

// ─── Función de entrada (visible en el editor GAS) ───────────────────────────

function runSetup() {
  Logger.log("╔══════════════════════════════════════╗");
  Logger.log("║   SSE-VRAF v2 — Setup & Bootstrap    ║");
  Logger.log("╚══════════════════════════════════════╝");

  try {
    // 1. Spreadsheet
    Logger.log("\n[1/4] Verificando Spreadsheet...");
    var ss = SheetSetup.getOrCreateSpreadsheet();
    Logger.log("      ID: " + ss.getId());
    Logger.log("      URL: " + ss.getUrl());

    // 2. Hojas
    Logger.log("\n[2/4] Creando hojas...");
    var sheetsResult = SheetSetup.ensureAllSheets(ss);
    Logger.log("      Creadas: " + (sheetsResult.created.join(", ") || "ninguna (ya existían)"));

    // 3. Workspaces
    Logger.log("\n[3/4] Inicializando workspaces...");
    var wsCount = SeedData.upsertWorkspaces();
    Logger.log("      Total: " + wsCount + " creados");

    // 4. Usuarios admin
    Logger.log("\n[4/4] Configurando usuarios administradores...");
    var userCount = SeedData.upsertAdminUsers();
    Logger.log("      Total: " + userCount + " usuarios configurados");
    Logger.log("      Contraseña temporal: UPES2026!");

    Logger.log("\n✓ Setup completado exitosamente.");
    Logger.log("  Recuerda configurar WEBHOOK_SHARED_SECRET en Script Properties.");

    return { ok: true, spreadsheetId: ss.getId(), users: userCount, workspaces: wsCount };

  } catch (err) {
    Logger.log("\n✗ Error en setup: " + err.message);
    throw err;
  }
}
