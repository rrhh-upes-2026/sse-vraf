"use client";

import { useState, useEffect } from "react";
import type { SessionUser } from "./session";

export type { SessionUser };

interface UseSessionResult {
  user: SessionUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

export function useSession(): UseSessionResult {
  const [state, setState] = useState<UseSessionResult>({ user: null, status: "loading" });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { user: SessionUser | null }) => {
        setState(
          data.user
            ? { user: data.user, status: "authenticated" }
            : { user: null, status: "unauthenticated" },
        );
      })
      .catch(() => setState({ user: null, status: "unauthenticated" }));
  }, []);

  return state;
}
