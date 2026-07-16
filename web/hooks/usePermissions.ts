"use client";

import { useSession } from "next-auth/react";
import type { RoleCode } from "@/types/roles";
import { ROLE_PERMISSIONS, type Permission } from "@/lib/permissions";

/**
 * Returns permission-checking utilities for the current authenticated user.
 *
 * Components MUST call hasPermission() instead of checking roles directly.
 * This keeps authorization logic centralised in lib/permissions.ts.
 *
 * Usage:
 *   const { hasPermission } = usePermissions();
 *   if (!hasPermission('process.create')) return null;
 */
export function usePermissions() {
  const { data: session, status } = useSession();
  const role = session?.user?.rol as RoleCode | undefined;
  const permSet = role ? (ROLE_PERMISSIONS[role] ?? new Set<Permission>()) : new Set<Permission>();

  return {
    /** True if the current user holds the given permission. */
    hasPermission: (permission: Permission): boolean => permSet.has(permission),
    /** Current user role code, or undefined while loading. */
    role,
    /** Session load state — avoids flash of empty state in server-rendered pages. */
    isLoaded: status !== "loading",
  };
}
