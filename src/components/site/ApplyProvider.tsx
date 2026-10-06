"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ApplyDialog, type ApplyTarget } from "./ApplyDialog";

type Ctx = {
  openApply: (target: ApplyTarget) => void;
  openTalentPool: () => void;
};

const ApplyContext = createContext<Ctx | null>(null);

export function useApply() {
  const ctx = useContext(ApplyContext);
  if (!ctx) throw new Error("useApply must be used inside <ApplyProvider>");
  return ctx;
}

export function ApplyProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ApplyTarget | null>(null);
  // Bumped on every open so the dialog remounts with a clean form.
  const [session, setSession] = useState(0);

  const openApply = useCallback((t: ApplyTarget) => {
    setTarget(t);
    setSession((s) => s + 1);
  }, []);
  const openTalentPool = useCallback(() => {
    setTarget({ mode: "talent" });
    setSession((s) => s + 1);
  }, []);

  return (
    <ApplyContext.Provider value={{ openApply, openTalentPool }}>
      {children}
      {target && <ApplyDialog key={session} target={target} onClose={() => setTarget(null)} />}
    </ApplyContext.Provider>
  );
}
