"use client";

import * as React from "react";

// Shared across the Currency and Duty Days pages so hiding a pilot's card in
// one place hides it everywhere, and it stays hidden across navigation/reloads
// until explicitly unhidden.
const STORAGE_KEY = "aircraft-manager:hidden-pilot-ids";

function readStored(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeStored(ids: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function useHiddenPilots() {
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Deferred to an effect rather than a lazy useState initializer so the
    // first client render matches the server-rendered (localStorage-less)
    // markup, avoiding a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(readStored());
  }, []);

  const hide = React.useCallback((id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.add(id);
      writeStored(next);
      return next;
    });
  }, []);

  const unhide = React.useCallback((id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.delete(id);
      writeStored(next);
      return next;
    });
  }, []);

  return { hidden, hide, unhide };
}

export { useHiddenPilots };
