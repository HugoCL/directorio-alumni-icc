"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/** Links Clerk session to Convex user (heals empty tokenIdentifier, promotes admin). */
export function SessionBootstrap() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ensureSession = useMutation(api.users.ensureSession);
  const ran = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || ran.current) return;
    ran.current = true;
    void ensureSession({}).catch(() => {
      ran.current = false;
    });
  }, [isAuthenticated, isLoading, ensureSession]);

  return null;
}
