import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { UsuariosService, HistorialService } from "@/services";
import { DEFAULT_WORKSPACE } from "@/config/nav";

/**
 * Google Workspace OAuth via Auth.js. Institutional domain restriction is
 * enforced through AUTH_GOOGLE_HD (Google's own `hd` hint) when set.
 *
 * Role/unidadId are not Google claims — they're resolved from the Usuario entity
 * (services/ → Apps Script → Sheets) by email, enforcing R01 (single source of
 * truth). The lookup only runs once per session (guarded by !token.usuarioId)
 * and the result is stored in the JWT.
 *
 * Login events are written to HistorialAudit on first token issuance (best-effort;
 * audit failures never block authentication). Logout events are handled implicitly
 * by the session expiry — an explicit logout audit can be added via a signOut
 * callback once that sprint lands.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          ...(process.env.AUTH_GOOGLE_HD ? { hd: process.env.AUTH_GOOGLE_HD } : {}),
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      const hd = process.env.AUTH_GOOGLE_HD;
      // Deny if domain restriction is configured but the profile lacks the `hd`
      // claim (personal Gmail has no `hd`) or the claim doesn't match.
      if (hd && (!(profile && "hd" in profile) || profile.hd !== hd)) {
        return false;
      }
      // Block Workspace accounts not provisioned in Usuarios — a valid domain
      // email alone is insufficient; the user must exist in the directory.
      if (profile?.email) {
        const [usuario] = await UsuariosService.list({ email: profile.email });
        if (!usuario) return false;
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email && !token.usuarioId) {
        const [usuario] = await UsuariosService.list({ email: token.email });
        if (!usuario) {
          // Defense-in-depth: unprovisioned users are blocked in signIn, but
          // guard here too so the JWT never carries a default role.
          return token;
        }
        token.usuarioId = usuario.id;
        token.rol = usuario.rol;
        token.unidadId = usuario.unidadId ?? DEFAULT_WORKSPACE;

        // Audit the login event — fire-and-forget so a slow Sheets write
        // never delays the JWT callback or blocks the sign-in flow.
        HistorialService.create({
          entidadTipo: "auth",
          entidadId: token.email as string,
          usuarioId: usuario.id,
          accion: "auth.login",
          resultado: "ok",
          fecha: new Date().toISOString(),
        }).catch(() => {/* audit failure is non-fatal */});
      }
      return token;
    },
    async session({ session, token }) {
      session.user.usuarioId = token.usuarioId ?? "";
      session.user.rol = token.rol ?? "OPS";
      session.user.unidadId = token.unidadId ?? DEFAULT_WORKSPACE;
      return session;
    },
  },
});
