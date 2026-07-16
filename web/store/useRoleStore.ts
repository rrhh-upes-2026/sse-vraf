import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoRole } from "@/types/roles";

interface RoleState {
  role: DemoRole;
  toggleRole: () => void;
}

/**
 * Client-side demo role toggle — mirrors the prototype's sidebar-footer
 * switcher. This is presentational only; real authorization is enforced
 * server-side once the RBAC matrix (§16) is wired to the session.
 */
export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "admin",
      toggleRole: () =>
        set((s) => ({ role: s.role === "admin" ? "operativo" : "admin" })),
    }),
    { name: "sse-vraf-demo-role" },
  ),
);
