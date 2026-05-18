"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Models } from "node-appwrite";

interface QuickLookContextValue {
  /** The file currently shown in Quick Look, or null when closed. */
  file: Models.DefaultDocument | null;
  open: boolean;
  /** Imperatively open Quick Look on a specific file. */
  openQuickLook: (file: Models.DefaultDocument) => void;
  /** Close the Quick Look overlay. */
  closeQuickLook: () => void;
  /** Replace the open file (used by ← / → arrow navigation). */
  setFile: (file: Models.DefaultDocument) => void;
}

const QuickLookContext = createContext<QuickLookContextValue | null>(null);

/**
 * Owns the in-memory "is Quick Look open and on which file?" state. Mounted
 * by FileGrid so it sits inside the MultiSelectProvider; QuickLook reads
 * orderedIds + lastClickedId from there and the file array from props on
 * the overlay itself.
 */
export function QuickLookProvider({ children }: { children: React.ReactNode }) {
  const [file, setFileState] = useState<Models.DefaultDocument | null>(null);
  const [open, setOpen] = useState(false);

  const openQuickLook = useCallback((f: Models.DefaultDocument) => {
    setFileState(f);
    setOpen(true);
  }, []);

  const closeQuickLook = useCallback(() => {
    setOpen(false);
  }, []);

  const setFile = useCallback((f: Models.DefaultDocument) => {
    setFileState(f);
  }, []);

  const value = useMemo<QuickLookContextValue>(
    () => ({ file, open, openQuickLook, closeQuickLook, setFile }),
    [file, open, openQuickLook, closeQuickLook, setFile],
  );

  return (
    <QuickLookContext.Provider value={value}>
      {children}
    </QuickLookContext.Provider>
  );
}

export function useQuickLook(): QuickLookContextValue | null {
  return useContext(QuickLookContext);
}

export function useQuickLookStrict(): QuickLookContextValue {
  const ctx = useContext(QuickLookContext);
  if (!ctx) {
    throw new Error("useQuickLookStrict must be used inside <QuickLookProvider>");
  }
  return ctx;
}
