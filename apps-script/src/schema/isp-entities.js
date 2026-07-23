/**
 * ISP — Identity & Security Platform
 * Entity schema definitions.
 */

var ISP_ENTITY_DEFS = [
  {
    key: "ispUsers",
    sheetName: "ISP_Users",
    columns: [
      "id", "employeeId", "fullName", "email", "username",
      "passwordHash", "passwordSalt",
      "status", "roleId", "organizationalUnitId",
      "lastLogin", "failedAttempts", "lockedUntil",
      "createdAt", "updatedAt"
    ],
    idColumn: "id",
    indexes: ["email", "username", "status", "roleId"],
  },
  {
    key: "ispRoles",
    sheetName: "ISP_Roles",
    columns: [
      "id", "name", "description", "level", "isSystem", "deleted",
      "createdAt", "updatedAt"
    ],
    idColumn: "id",
    indexes: ["name", "isSystem"],
  },
  {
    key: "ispPermissions",
    sheetName: "ISP_Permissions",
    columns: [
      "id", "module", "action", "description", "createdAt"
    ],
    idColumn: "id",
    indexes: ["module", "action"],
  },
  {
    key: "ispRolePermissions",
    sheetName: "ISP_RolePermissions",
    columns: [
      "id", "roleId", "permissionId", "revoked", "createdAt"
    ],
    idColumn: "id",
    indexes: ["roleId", "permissionId"],
  },
  {
    key: "ispSessions",
    sheetName: "ISP_Sessions",
    columns: [
      "id", "userId", "userEmail",
      "loginAt", "lastActivity", "expiresAt",
      "ipAddress", "userAgent", "status"
    ],
    idColumn: "id",
    indexes: ["userId", "status"],
  },
  {
    key: "ispAuditLogs",
    sheetName: "ISP_AuditLogs",
    columns: [
      "id", "userId", "userEmail",
      "action", "module", "entity", "entityId",
      "result", "ipAddress", "timestamp", "details"
    ],
    idColumn: "id",
    indexes: ["userId", "action", "module", "result"],
  },
  {
    key: "ispConfig",
    sheetName: "ISP_Config",
    columns: [
      "id", "key", "value", "updatedAt", "updatedBy"
    ],
    idColumn: "id",
    indexes: ["key"],
  },
];

function mergeISPEntities_() {
  ISP_ENTITY_DEFS.forEach(function (def) {
    SchemaRegistry.register(def);
  });
}
