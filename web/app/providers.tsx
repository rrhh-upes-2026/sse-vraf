"use client";

// Populate the module registry in the client bundle.
import "@/modules/_registry";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

/**
 * Client-side provider tree. SessionProvider enables useSession() in client
 * components; QueryClientProvider enables TanStack Query hooks throughout.
 *
 * SessionProvider fetches the session via /api/auth/session on the client;
 * the Auth.js route at app/api/auth/[...nextauth]/route.ts serves it.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
