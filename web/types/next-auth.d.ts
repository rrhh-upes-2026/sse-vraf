import type { DefaultSession } from "next-auth";
import type { RoleCode } from "./roles";
import type { WorkspaceId } from "@/config/nav";

/**
 * The real Session/JWT interfaces live in @auth/core (next-auth/jwt just
 * does `export * from "@auth/core/jwt"`, and next-auth's Session is a
 * type-only re-export) — module augmentation only merges against the
 * module that actually declares the interface, so we target @auth/core.
 */
declare module "@auth/core/types" {
  interface Session {
    user: {
      rol: RoleCode;
      unidadId: WorkspaceId;
      usuarioId: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    rol?: RoleCode;
    unidadId?: WorkspaceId;
    usuarioId?: string;
  }
}
