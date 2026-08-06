#!/usr/bin/env python3
"""
build.py — genera SSS_VRAF_V2.gs concatenando todos los módulos en orden de dependencia.

Uso:
    python3 build.py

Salida:
    ../SSS_VRAF_V2.gs  (listo para pegar en el editor de Google Apps Script)
"""
import os
import sys

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "SSS_VRAF_V2.gs")

# Orden estricto de dependencia — no modificar sin actualizar los imports
ORDER = [
    # ── Capa 0: Config (sin dependencias) ─────────────────────────────────────
    "config/Config.js",

    # ── Capa 1: Respuesta HTTP + Criptografía + Validación + RBAC ─────────────
    "core/Response.js",
    "security/Crypto.js",
    "validators/Validator.js",
    "rbac/Roles.js",
    "rbac/Permissions.js",

    # ── Capa 2: Seguridad (depende de Config) ─────────────────────────────────
    "security/SecretGuard.js",
    "security/RateLimiter.js",

    # ── Capa 3: Schema Registry ────────────────────────────────────────────────
    "schemas/SchemaRegistry.js",
    "schemas/core.schema.js",

    # ── Capa 4: Repositorio (depende de SchemaRegistry + Config) ──────────────
    "repositories/Repository.js",

    # ── Capa 5: Servicios Google (independientes entre sí) ────────────────────
    "services/google/MailService.js",
    "services/google/DriveService.js",
    "services/google/DocsService.js",
    "services/google/CalendarService.js",
    "services/google/GeminiService.js",

    # ── Capa 6: Auditoría (depende de Repository) ─────────────────────────────
    "services/audit/AuditService.js",

    # ── Capa 7: Servicios de negocio (dependen de Repository + Audit + Mail) ──
    "services/auth/PasswordService.js",
    "services/auth/AuthService.js",
    "services/users/UserService.js",

    # ── Capa 8: Controllers ────────────────────────────────────────────────────
    "controllers/AuthController.js",
    "controllers/UserController.js",
    "controllers/WorkspaceController.js",
    "controllers/AuditController.js",

    # ── Capa 9: Router (depende de todos los controllers) ─────────────────────
    "core/Router.js",

    # ── Capa 10: Bootstrap ────────────────────────────────────────────────────
    "bootstrap/SheetSetup.js",
    "bootstrap/SeedData.js",

    # ── Entrada (debe ir al final) ────────────────────────────────────────────
    "Code.js",
]


def build():
    parts = []
    total_bytes = 0
    missing = []

    for rel in ORDER:
        full = os.path.join(SRC, rel)
        if not os.path.exists(full):
            missing.append(rel)
            continue
        with open(full, "r", encoding="utf-8") as f:
            content = f.read().rstrip()
        sep = "// " + "═" * 70 + "\n// " + rel + "\n// " + "═" * 70
        parts.append(sep + "\n\n" + content)
        total_bytes += len(content)

    if missing:
        print("ERROR — Archivos faltantes:")
        for m in missing:
            print("  " + m)
        sys.exit(1)

    merged = "\n\n\n".join(parts)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(merged + "\n")

    kb = total_bytes // 1024
    print("OK — " + OUT)
    print("     {} módulos, {:,} bytes ({} KB)".format(len(ORDER), total_bytes, kb))
    print("\nPróximos pasos:")
    print("  1. Abre el editor de Google Apps Script")
    print("  2. Pega el contenido de SSS_VRAF_V2.gs (reemplaza todo)")
    print("  3. Actualiza appsscript.json con access: ANYONE")
    print("  4. Despliega como Web App → Ejecutar como: Yo, Acceso: Cualquiera")
    print("  5. Selecciona runSetup() y ejecútala")


if __name__ == "__main__":
    build()
