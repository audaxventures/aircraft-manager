"use client";

import * as React from "react";

// Shared across the Currency and Duty Days pages (and within each page,
// across the status cards and the table below them) so hiding a pilot in
// one place hides it everywhere immediately, and it stays hidden across
// navigation/reloads until explicitly unhidden. Backed by a module-level
// store + useSyncExternalStore rather than each component's own useState,
// so multiple hook instances mounted on the same page stay in sync with
// each other instead of only updating on the next full page load.
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

let cached: Set<string> | null = null;
const listeners = new Set<() => void>();
const EMPTY_SET: Set<string> = new Set();

function getSnapshot(): Set<string> {
  if (cached === null) cached = readStored();
  return cached;
}

function getServerSnapshot(): Set<string> {
  return EMPTY_SET;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: Set<string>) {
  cached = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  listeners.forEach((listener) => listener());
}

function useHiddenPilots() {
  const hidden = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const hide = React.useCallback((id: string) => {
    const next = new Set(getSnapshot());
    next.add(id);
    commit(next);
  }, []);

  const unhide = React.useCallback((id: string) => {
    const next = new Set(getSnapshot());
    next.delete(id);
    commit(next);
  }, []);

  return { hidden, hide, unhide };
}

export { useHiddenPilots };
