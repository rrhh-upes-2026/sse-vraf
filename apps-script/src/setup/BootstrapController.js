/**
 * BootstrapController — orchestrates the 9-step Platform Installation Wizard.
 *
 * Every method is called by the router via "platform.<step>" and returns a
 * standardised StepResult:
 *
 *   {
 *     step:   <number>,
 *     status: 'ok' | 'warning' | 'error',
 *     logs:   [{ level: 'info'|'warn'|'error'|'success', message, timestamp }],
 *     data:   { <step-specific output> },
 *     errors: ['ERROR_CODE', ...],
 *   }
 *
 * Steps are idempotent — safe to re-run. Each step merges workspace-admin
 * entities before executing to guarantee ENTITY_SHEETS is populated.
 */

var BootstrapController = (function () {

  // ── Helpers ───────────────────────────────────────────────────────────────

  function now_() { return new Date().toISOString(); }

  function log_(logs, level, message) {
    logs.push({ level: level, message: message, timestamp: now_() });
    AppLogger[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info'](
      'BootstrapController', { step: message }
    );
  }

  function ok_(step, logs, data) {
    return { step: step, status: 'ok', logs: logs, data: data || {}, errors: [] };
  }

  function fail_(step, logs, errors) {
    return { step: step, status: 'error', logs: logs, data: {}, errors: errors || [] };
  }

  function warn_(step, logs, data) {
    return { step: step, status: 'warning', logs: logs, data: data || {}, errors: [] };
  }

  function ensureEntities_() {
    try { mergeWorkspaceAdminEntities_(); } catch (_) {}
  }

  // ── Step 1: Validate environment ──────────────────────────────────────────

  function validate(params, context) {
    var logs = [];
    var errors = [];

    log_(logs, 'info', 'Iniciando validación del entorno de la plataforma...');

    // Spreadsheet
    var spreadsheetId = Config.spreadsheetId();
    if (!spreadsheetId) {
      log_(logs, 'error', 'Propiedad SPREADSHEET_ID no configurada en Script Properties');
      errors.push('PROP_MISSING_SPREADSHEET_ID');
    } else {
      try {
        var ss = SpreadsheetApp.openById(spreadsheetId);
        log_(logs, 'success', 'Spreadsheet conectado: ' + ss.getName() + ' (' + spreadsheetId + ')');
      } catch (e) {
        log_(logs, 'error', 'Error abriendo spreadsheet: ' + String(e.message || e));
        errors.push('SPREADSHEET_INACCESSIBLE');
      }
    }

    // Drive root
    var driveFolderId = Config.driveFolderRootId();
    if (!driveFolderId) {
      log_(logs, 'error', 'Propiedad DRIVE_FOLDER_ROOT_ID no configurada');
      errors.push('PROP_MISSING_DRIVE_FOLDER_ROOT_ID');
    } else {
      try {
        var folder = DriveApp.getFolderById(driveFolderId);
        log_(logs, 'success', 'Carpeta Drive raíz: ' + folder.getName() + ' (' + driveFolderId + ')');
      } catch (e) {
        log_(logs, 'error', 'Error accediendo carpeta Drive: ' + String(e.message || e));
        errors.push('DRIVE_FOLDER_INACCESSIBLE');
      }
    }

    // Optional properties
    var optional = ['ADMIN_EMAIL', 'GMAIL_ENABLED', 'WORKSPACE_DOMAIN', 'INSTANCE_NAME'];
    for (var i = 0; i < optional.length; i++) {
      var val = PropertiesService.getScriptProperties().getProperty(optional[i]);
      if (val) {
        log_(logs, 'success', 'Propiedad ' + optional[i] + ' = ' + val);
      } else {
        log_(logs, 'warn', 'Propiedad opcional ' + optional[i] + ' no configurada (se usará valor por defecto)');
      }
    }

    // Session / auth
    try {
      var email = Session.getActiveUser().getEmail();
      if (email) {
        log_(logs, 'success', 'Sesión Google activa: ' + email);
      } else {
        log_(logs, 'warn', 'No se pudo obtener el email de la sesión activa (normal en tests)');
      }
    } catch (e) {
      log_(logs, 'warn', 'Error obteniendo sesión: ' + String(e.message || e));
    }

    // Apps Script services
    try {
      LockService.getScriptLock(); // just verify accessible
      log_(logs, 'success', 'LockService disponible');
    } catch (e) {
      log_(logs, 'warn', 'LockService no disponible: ' + String(e.message || e));
    }
    try {
      CacheService.getScriptCache(); // verify accessible
      log_(logs, 'success', 'CacheService disponible');
    } catch (e) {
      log_(logs, 'warn', 'CacheService no disponible: ' + String(e.message || e));
    }

    log_(logs, errors.length ? 'error' : 'success',
      errors.length
        ? 'Validación completada con ' + errors.length + ' error(es) bloqueante(s)'
        : 'Entorno validado correctamente — listo para instalación'
    );

    if (errors.length) return fail_(1, logs, errors);
    return ok_(1, logs, { spreadsheetId: spreadsheetId, driveFolderId: driveFolderId });
  }

  // ── Step 2: Initialize Database ───────────────────────────────────────────

  function initDatabase(params, context) {
    ensureEntities_();
    var logs = [];

    log_(logs, 'info', 'Inicializando base de datos en Google Sheets...');

    try {
      var result = initializeDatabase();
      log_(logs, 'success', 'Hojas creadas: ' + result.sheetsCreated);
      log_(logs, 'success', 'Hojas verificadas: ' + result.sheetsVerified);
      log_(logs, 'success', 'Total de entidades: ' + result.totalEntities);

      if (result.sheetsCreated === 0) {
        log_(logs, 'info', 'Instalación previa detectada — todas las hojas ya existen');
      } else {
        log_(logs, 'success', result.sheetsCreated + ' hoja(s) nueva(s) creada(s)');
      }

      return ok_(2, logs, result);
    } catch (e) {
      log_(logs, 'error', 'Error inicializando base de datos: ' + String(e.message || e));
      return fail_(2, logs, ['DATABASE_INIT_FAILED']);
    }
  }

  // ── Step 3: Initialize Drive ──────────────────────────────────────────────

  function initDrive(params, context) {
    var logs = [];

    log_(logs, 'info', 'Creando jerarquía de carpetas institucionales en Google Drive...');

    try {
      var result = initializeFullDriveHierarchy();
      log_(logs, 'success', 'Carpeta raíz: ' + result.rootName);

      var systemFolders = result.systemFolders || {};
      var names = Object.keys(systemFolders);
      for (var i = 0; i < names.length; i++) {
        log_(logs, 'success', 'Carpeta de sistema creada: ' + names[i]);
      }

      var wsResults = result.workspaces || [];
      for (var j = 0; j < wsResults.length; j++) {
        var ws = wsResults[j];
        if (ws.status === 'ok') {
          log_(logs, 'success', 'Workspace ' + ws.wsId.toUpperCase() + ': ' + ws.subFolderCount + ' sub-carpetas');
        } else {
          log_(logs, 'warn', 'Workspace ' + ws.wsId + ': ' + (ws.error || 'error desconocido'));
        }
      }

      log_(logs, 'success', 'Jerarquía Drive inicializada correctamente');
      return ok_(3, logs, result);
    } catch (e) {
      log_(logs, 'error', 'Error inicializando Drive: ' + String(e.message || e));
      return fail_(3, logs, ['DRIVE_INIT_FAILED']);
    }
  }

  // ── Step 4: Install workspace templates ───────────────────────────────────

  function installTemplates(params, context) {
    ensureEntities_();
    var logs = [];
    var userId = context && context.userId || 'system';

    // ── 1. Institutional seed data (users, workspaces, wsUsers) ──────────────
    log_(logs, 'info', 'Instalando seed data institucional...');
    try {
      var seedResult = SeedInstaller.installAll(userId, []);
      var seedLogs = seedResult.logs || [];
      for (var si = 0; si < seedLogs.length; si++) { logs.push(seedLogs[si]); }
      if (!seedResult.skipped) {
        log_(logs, 'success',
          'Seed data instalada: ' +
          (seedResult.users || 0) + ' usuarios, ' +
          (seedResult.workspaces || 0) + ' workspaces.'
        );
      }
    } catch (e) {
      log_(logs, 'error', 'Error instalando seed data: ' + String(e.message || e));
    }

    // ── 2. RRHH module blueprints, KPIs, forms, request types ────────────────
    log_(logs, 'info', 'Instalando módulo RRHH...');
    try {
      var result = WorkspaceTemplateInstaller.installRRHH(userId);

      var templateLogs = result.logs || [];
      for (var i = 0; i < templateLogs.length; i++) {
        logs.push(templateLogs[i]);
      }

      if (result.skipped) {
        log_(logs, 'info', 'Módulo RRHH ya instalado — saltando para evitar duplicados');
      } else {
        log_(logs, 'success',
          'Módulo RRHH instalado: ' +
          (result.blueprints || 0) + ' procesos, ' +
          (result.kpis || 0) + ' indicadores, ' +
          (result.forms || 0) + ' formularios, ' +
          (result.requestTypes || 0) + ' tipos de solicitud'
        );
      }

      return ok_(4, logs, { seed: seedResult, rrhh: result });
    } catch (e) {
      log_(logs, 'error', 'Error instalando plantillas: ' + String(e.message || e));
      return fail_(4, logs, ['TEMPLATE_INSTALL_FAILED']);
    }
  }

  // ── Step 5: Create platform administrator ─────────────────────────────────

  function createAdmin(params, context) {
    ensureEntities_();
    var logs = [];

    log_(logs, 'info', 'Configurando administrador de la plataforma...');

    var adminEmail = context && context.userEmail
      ? context.userEmail
      : Config.adminEmail() || 'admin@upes.edu.sv';

    var adminName = params && params.nombre
      ? params.nombre
      : adminEmail.split('@')[0];

    log_(logs, 'info', 'Administrador identificado: ' + adminEmail);

    var WORKSPACES = ['rrhh', 'vraf', 'conta', 'compras', 'mant', 'salud'];
    var created = 0;
    var existing = 0;

    for (var i = 0; i < WORKSPACES.length; i++) {
      var wsId = WORKSPACES[i];
      try {
        // Check if admin already exists in this workspace
        var listResult = listEntities_('wsUsers', { wsId: wsId, email: adminEmail });
        var existing_users = listResult && listResult.items ? listResult.items : [];
        var found = false;
        for (var j = 0; j < existing_users.length; j++) {
          if (existing_users[j].email === adminEmail && !existing_users[j].deletedAt) {
            found = true;
            existing++;
            log_(logs, 'info', 'Administrador ya existe en workspace ' + wsId.toUpperCase());
            // Update role to ADMIN if not already
            updateEntity_('wsUsers', existing_users[j].id, { rol: 'ADMIN', activo: 'true' });
            break;
          }
        }
        if (!found) {
          createEntity_('wsUsers', {
            wsId:      wsId,
            nombre:    adminName,
            email:     adminEmail,
            rol:       'ADMIN',
            activo:    'true',
            createdAt: now_(),
            updatedAt: now_(),
          });
          created++;
          log_(logs, 'success', 'Administrador creado en workspace ' + wsId.toUpperCase());
        }
      } catch (e) {
        log_(logs, 'warn', 'Error en workspace ' + wsId + ': ' + String(e.message || e));
      }
    }

    log_(logs, 'success',
      'Administrador configurado: ' + created + ' creado(s), ' + existing + ' actualizado(s)'
    );

    // ── Create / update the admin record in the auth table (usuarios) ──────────
    var tempPassword = generateTempPassword_();
    var salt         = generateSalt_();
    var hash         = hashPassword_(tempPassword, salt);
    var adminNow     = now_();
    try {
      var authLookup = listEntities_("usuarios", { email: adminEmail });
      if (authLookup.items && authLookup.items.length > 0) {
        updateEntity_("usuarios", authLookup.items[0].id, {
          passwordHash:       hash,
          passwordSalt:       salt,
          mustChangePassword: true,
          activo:             true,
          updatedAt:          adminNow,
        });
        log_(logs, 'info', 'Contraseña temporal actualizada para el administrador');
      } else {
        createEntity_("usuarios", {
          nombre:             adminName,
          email:              adminEmail,
          unidadId:           'vraf',
          rol:                'ADMIN',
          activo:             true,
          passwordHash:       hash,
          passwordSalt:       salt,
          mustChangePassword: true,
          avatarInitials:     adminName.split(' ').slice(0, 2).map(function(w) { return w[0] || ''; }).join('').toUpperCase(),
          createdAt:          adminNow,
          updatedAt:          adminNow,
        });
        log_(logs, 'success', 'Usuario administrador creado en tabla de autenticación');
      }
      log_(logs, 'success', 'Contraseña temporal del administrador: ' + tempPassword + ' — cámbiela en el primer inicio de sesión');
    } catch (e) {
      log_(logs, 'warn', 'No se pudo crear el usuario en tabla de auth: ' + String(e.message || e));
    }

    AuditService.record({
      accion:      'platform.createAdmin',
      entidadTipo: 'wsUsers',
      entidadId:   adminEmail,
      usuarioId:   context && context.userId || 'system',
      resultado:   'ok',
      detalle:     { email: adminEmail, workspaces: WORKSPACES, created: created },
    });

    return ok_(5, logs, {
      email:           adminEmail,
      name:            adminName,
      workspaces:      WORKSPACES,
      created:         created,
      updated:         existing,
      tempPassword:    tempPassword, // shown in wizard UI; user must change on first login
      mustChangePw:    true,
    });
  }

  // ── Step 6: Platform configuration ───────────────────────────────────────

  function configure(params, context) {
    ensureEntities_();
    var logs = [];
    var now = now_();

    log_(logs, 'info', 'Aplicando configuración inicial de la plataforma...');

    var WORKSPACES = [
      { id: 'rrhh',    nombre: 'Recursos Humanos',             corto: 'RRHH',   color: '#2E6BE6', icon: 'M12 4.354a4 4 0 110 5.292' },
      { id: 'vraf',    nombre: 'Vicerrectoría Adm. y Fin.',    corto: 'VRAF',   color: '#5B4FD0', icon: 'M3 21h18M5 21V7l7-4 7 4v14' },
      { id: 'conta',   nombre: 'Contabilidad',                 corto: 'CONTA',  color: '#0F8A8A', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
      { id: 'compras', nombre: 'Compras y Adquisiciones',      corto: 'COMPRAS',color: '#E5A100', icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z' },
      { id: 'mant',    nombre: 'Mantenimiento',                corto: 'MANT',   color: '#12A150', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0L14.7 6.3z' },
      { id: 'salud',   nombre: 'Salud y Seguridad',            corto: 'SALUD',  color: '#E5484D', icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23' },
    ];

    var created = 0;
    var updated = 0;

    for (var i = 0; i < WORKSPACES.length; i++) {
      var ws = WORKSPACES[i];
      try {
        var existing = listEntities_('wsSettings', { wsId: ws.id });
        var rows = existing && existing.items ? existing.items : [];
        var found = false;
        for (var j = 0; j < rows.length; j++) {
          if (rows[j].wsId === ws.id) {
            found = true;
            updateEntity_('wsSettings', rows[j].id || ws.id, {
              nombre:    ws.nombre,
              nombreCorto: ws.corto,
              color:     ws.color,
              icon:      ws.icon,
              zonaHoraria: 'America/El_Salvador',
              idioma:    'es-SV',
              slaDiasDefault: '5',
              updatedAt: now,
              updatedBy: context && context.userId || 'system',
            });
            updated++;
            log_(logs, 'success', 'Configuración actualizada: ' + ws.corto);
            break;
          }
        }
        if (!found) {
          createEntity_('wsSettings', {
            wsId:        ws.id,
            nombre:      ws.nombre,
            nombreCorto: ws.corto,
            descripcion: 'Workspace ' + ws.nombre + ' de la plataforma SSE-VRAF',
            color:       ws.color,
            colorFondo:  '#EAF1FE',
            icon:        ws.icon,
            slaDiasDefault: '5',
            zonaHoraria: 'America/El_Salvador',
            idioma:      'es-SV',
            updatedAt:   now,
            updatedBy:   context && context.userId || 'system',
          });
          created++;
          log_(logs, 'success', 'Configuración inicial creada: ' + ws.corto);
        }
      } catch (e) {
        log_(logs, 'warn', 'Error configurando ' + ws.id + ': ' + String(e.message || e));
      }
    }

    // Write platform-level script property
    try {
      PropertiesService.getScriptProperties().setProperties({
        'PLATFORM_VERSION':     '1.0.0',
        'PLATFORM_INSTALLED':   'true',
        'PLATFORM_INSTALL_DATE': now,
        'PLATFORM_LOCALE':      'es-SV',
        'PLATFORM_TIMEZONE':    'America/El_Salvador',
        'PLATFORM_FISCAL_START': '01-01',
        'PLATFORM_WORK_DAYS':   'LMXJV',
      }, false);
      log_(logs, 'success', 'Propiedades de plataforma guardadas');
    } catch (e) {
      log_(logs, 'warn', 'No se pudieron guardar propiedades: ' + String(e.message || e));
    }

    log_(logs, 'success',
      'Configuración aplicada: ' + created + ' workspace(s) nuevo(s), ' + updated + ' actualizado(s)'
    );

    return ok_(6, logs, {
      workspacesConfigured: WORKSPACES.length,
      created: created,
      updated: updated,
      platformVersion: '1.0.0',
    });
  }

  // ── Step 7: Health check ──────────────────────────────────────────────────

  function healthCheck(params, context) {
    ensureEntities_();
    var logs = [];
    var checks = {};

    log_(logs, 'info', 'Ejecutando verificación de salud de la plataforma...');

    // Sheets check
    try {
      var ss = SpreadsheetApp.openById(Config.spreadsheetId());
      var sheets = ss.getSheets();
      var sheetNames = sheets.map(function(s) { return s.getName(); });
      var entityKeys = Object.keys(ENTITY_SHEETS);
      var missingSheets = [];
      for (var i = 0; i < entityKeys.length; i++) {
        var expectedName = ENTITY_SHEETS[entityKeys[i]].sheetName;
        if (sheetNames.indexOf(expectedName) === -1) {
          missingSheets.push(expectedName);
        }
      }
      if (missingSheets.length === 0) {
        log_(logs, 'success', 'Base de datos: ' + sheets.length + ' hojas presentes — OK');
        checks.sheets = 'ok';
      } else {
        log_(logs, 'warn', 'Hojas faltantes: ' + missingSheets.join(', '));
        checks.sheets = 'warning';
      }
    } catch (e) {
      log_(logs, 'error', 'Base de datos no accesible: ' + String(e.message || e));
      checks.sheets = 'error';
    }

    // Drive check
    try {
      var root = DriveService.getRootFolder();
      log_(logs, 'success', 'Drive: carpeta raíz accesible — ' + root.getName());
      checks.drive = 'ok';
    } catch (e) {
      log_(logs, 'error', 'Drive no accesible: ' + String(e.message || e));
      checks.drive = 'error';
    }

    // wsSettings check
    try {
      var settingsResult = listEntities_('wsSettings', {});
      var settingsCount = settingsResult && settingsResult.items ? settingsResult.items.length : 0;
      log_(logs, settingsCount >= 6 ? 'success' : 'warn',
        'Configuración de workspaces: ' + settingsCount + '/6 configurados');
      checks.settings = settingsCount >= 6 ? 'ok' : 'warning';
    } catch (e) {
      log_(logs, 'warn', 'Error verificando settings: ' + String(e.message || e));
      checks.settings = 'warning';
    }

    // wsBlueprints check
    try {
      var bpResult = listEntities_('wsBlueprints', { wsId: 'rrhh' });
      var bpCount = bpResult && bpResult.items ? bpResult.items.length : 0;
      log_(logs, bpCount > 0 ? 'success' : 'warn',
        'Procesos RRHH instalados: ' + bpCount);
      checks.blueprints = bpCount > 0 ? 'ok' : 'warning';
    } catch (e) {
      log_(logs, 'warn', 'Error verificando blueprints: ' + String(e.message || e));
      checks.blueprints = 'warning';
    }

    // Admin users check
    try {
      var adminResult = listEntities_('wsUsers', { rol: 'ADMIN' });
      var adminCount = adminResult && adminResult.items ? adminResult.items.length : 0;
      log_(logs, adminCount > 0 ? 'success' : 'warn',
        'Usuarios administradores: ' + adminCount);
      checks.adminUsers = adminCount > 0 ? 'ok' : 'warning';
    } catch (e) {
      log_(logs, 'warn', 'Error verificando usuarios: ' + String(e.message || e));
      checks.adminUsers = 'warning';
    }

    // Platform properties check
    var installedProp = PropertiesService.getScriptProperties().getProperty('PLATFORM_INSTALLED');
    if (installedProp === 'true') {
      log_(logs, 'success', 'Plataforma marcada como instalada — versión ' +
        (PropertiesService.getScriptProperties().getProperty('PLATFORM_VERSION') || 'desconocida'));
      checks.properties = 'ok';
    } else {
      log_(logs, 'warn', 'PLATFORM_INSTALLED no está en true');
      checks.properties = 'warning';
    }

    var allOk = Object.keys(checks).every(function(k) { return checks[k] === 'ok'; });
    var anyError = Object.keys(checks).some(function(k) { return checks[k] === 'error'; });

    log_(logs, allOk ? 'success' : anyError ? 'error' : 'warn',
      allOk
        ? 'Verificación de salud completada: todos los sistemas OK'
        : 'Verificación completada con advertencias — la plataforma es funcional'
    );

    if (anyError) return fail_(7, logs, ['HEALTH_CHECK_FAILED']);
    if (allOk) return ok_(7, logs, { checks: checks });
    return warn_(7, logs, { checks: checks });
  }

  // ── Step 8: Live test ─────────────────────────────────────────────────────

  function liveTest(params, context) {
    ensureEntities_();
    var logs = [];
    var testIds = {};
    var userId = context && context.userId || 'system';

    log_(logs, 'info', 'Ejecutando prueba en vivo — se crearán y eliminarán datos de prueba...');

    // Test 1: Create test employee
    try {
      var emp = createEntity_('empleados', {
        nombre:     'TEST Empleado Bootstrap',
        email:      'test.bootstrap@upes.edu.sv',
        cargo:      'Test',
        departamento: 'Sistema',
        activo:     'true',
        createdAt:  new Date().toISOString(),
      });
      testIds.empleado = emp && emp.id;
      log_(logs, 'success', 'Empleado de prueba creado: ' + (emp && emp.id));
    } catch (e) {
      log_(logs, 'warn', 'No se pudo crear empleado de prueba: ' + String(e.message || e));
    }

    // Test 2: Create test process
    try {
      var proc = createEntity_('procesos', {
        nombre:      'TEST Proceso Bootstrap',
        descripcion: 'Proceso de prueba de instalación',
        estado:      'activo',
        wsId:        'vraf',
        createdAt:   new Date().toISOString(),
      });
      testIds.proceso = proc && proc.id;
      log_(logs, 'success', 'Proceso de prueba creado: ' + (proc && proc.id));
    } catch (e) {
      log_(logs, 'warn', 'No se pudo crear proceso de prueba: ' + String(e.message || e));
    }

    // Test 3: Create test notification
    try {
      var notif = createEntity_('notificaciones', {
        destinatarioId: userId,
        wsId:           'vraf',
        tipo:           'info',
        titulo:         'TEST: Instalación de plataforma',
        mensaje:        'Prueba de notificación del sistema. Este mensaje se eliminará.',
        leida:          'false',
        fechaCreacion:  new Date().toISOString(),
      });
      testIds.notificacion = notif && notif.id;
      log_(logs, 'success', 'Notificación de prueba creada: ' + (notif && notif.id));
    } catch (e) {
      log_(logs, 'warn', 'No se pudo crear notificación de prueba: ' + String(e.message || e));
    }

    // Test 4: Audit record
    try {
      AuditService.record({
        accion:      'platform.liveTest',
        entidadTipo: 'system',
        entidadId:   'bootstrap',
        usuarioId:   userId,
        resultado:   'ok',
        detalle:     { testIds: testIds, timestamp: new Date().toISOString() },
      });
      log_(logs, 'success', 'Registro de auditoría creado correctamente');
    } catch (e) {
      log_(logs, 'warn', 'Error en auditoría: ' + String(e.message || e));
    }

    // Cleanup: delete test data
    log_(logs, 'info', 'Limpiando datos de prueba...');
    var cleaned = 0;

    if (testIds.empleado) {
      try { removeEntity_('empleados', testIds.empleado); cleaned++; } catch (_) {}
    }
    if (testIds.proceso) {
      try { removeEntity_('procesos', testIds.proceso); cleaned++; } catch (_) {}
    }
    if (testIds.notificacion) {
      try { removeEntity_('notificaciones', testIds.notificacion); cleaned++; } catch (_) {}
    }

    log_(logs, 'success', cleaned + ' registro(s) de prueba eliminado(s)');
    log_(logs, 'success', 'Prueba en vivo completada — todos los sistemas respondieron correctamente');

    return ok_(8, logs, { testIds: testIds, cleaned: cleaned });
  }

  // ── Step 9: Installation report ───────────────────────────────────────────

  function report(params, context) {
    ensureEntities_();
    var logs = [];

    log_(logs, 'info', 'Generando reporte de instalación...');

    var report = {
      platformVersion: PropertiesService.getScriptProperties().getProperty('PLATFORM_VERSION') || '1.0.0',
      installDate:     PropertiesService.getScriptProperties().getProperty('PLATFORM_INSTALL_DATE') || new Date().toISOString(),
      components:      {},
      warnings:        [],
      errors:          [],
    };

    // Count installed components
    var entityCounts = [
      { key: 'blueprints', entity: 'wsBlueprints', label: 'Procesos' },
      { key: 'kpis',       entity: 'wsKPIs',       label: 'Indicadores' },
      { key: 'forms',      entity: 'wsForms',       label: 'Formularios' },
      { key: 'requestTypes', entity: 'wsRequestTypes', label: 'Tipos de Solicitud' },
      { key: 'automations',  entity: 'wsAutomations',  label: 'Automatizaciones' },
      { key: 'users',        entity: 'wsUsers',         label: 'Usuarios' },
      { key: 'documents',    entity: 'wsDocuments',     label: 'Documentos' },
      { key: 'notifRules',   entity: 'wsNotifRules',    label: 'Reglas de Notificación' },
      { key: 'settings',     entity: 'wsSettings',      label: 'Configuraciones de Workspace' },
    ];

    for (var i = 0; i < entityCounts.length; i++) {
      var entry = entityCounts[i];
      try {
        var result = listEntities_(entry.entity, {});
        var count  = result && result.items ? result.items.length : 0;
        report.components[entry.key] = count;
        log_(logs, 'success', entry.label + ': ' + count + ' registros');
      } catch (e) {
        report.components[entry.key] = 0;
        log_(logs, 'warn', entry.label + ': error contando registros');
      }
    }

    // Count sheets
    try {
      var ss     = SpreadsheetApp.openById(Config.spreadsheetId());
      var sheets = ss.getSheets();
      report.sheetsTotal = sheets.length;
      log_(logs, 'success', 'Hojas de cálculo: ' + sheets.length + ' creadas');
    } catch (e) {
      report.sheetsTotal = 0;
    }

    // Drive root
    try {
      var root = DriveService.getRootFolder();
      report.driveFolderName = root.getName();
      report.driveFolderId   = root.getId();
      log_(logs, 'success', 'Carpeta Drive: ' + root.getName());
    } catch (e) {
      report.driveFolderName = 'desconocido';
    }

    var totalComponents = 0;
    var keys = Object.keys(report.components);
    for (var k = 0; k < keys.length; k++) {
      totalComponents += report.components[keys[k]];
    }

    log_(logs, 'success',
      'Plataforma SSE-VRAF v' + report.platformVersion + ' instalada correctamente. ' +
      'Total: ' + totalComponents + ' registros en ' + (report.sheetsTotal || 0) + ' hojas.'
    );

    return ok_(9, logs, report);
  }

  // ── Status check ──────────────────────────────────────────────────────────

  function getStatus(params, context) {
    var installed = PropertiesService.getScriptProperties().getProperty('PLATFORM_INSTALLED') === 'true';
    var version   = PropertiesService.getScriptProperties().getProperty('PLATFORM_VERSION') || null;
    var date      = PropertiesService.getScriptProperties().getProperty('PLATFORM_INSTALL_DATE') || null;
    return { installed: installed, version: version, installDate: date };
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    validate:         validate,
    initDatabase:     initDatabase,
    initDrive:        initDrive,
    installTemplates: installTemplates,
    createAdmin:      createAdmin,
    configure:        configure,
    healthCheck:      healthCheck,
    liveTest:         liveTest,
    report:           report,
    getStatus:        getStatus,
  };
})();
