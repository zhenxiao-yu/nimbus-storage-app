"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import CommandPalette from "@/components/CommandPalette";

type Ctx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandPaletteContext = createContext<Ctx | null>(null);

export const useCommandPalette = () => {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    // Render-safe fallback so trigger buttons outside the provider don't crash.
    return {
      open: false,
      setOpen: () => {},
      toggle: () => {},
    } satisfies Ctx;
  }
  return ctx;
};

export const CommandPaletteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModK =
        (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (isModK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const value = useMemo<Ctx>(
    () => ({ open, setOpen, toggle }),
    [open, toggle],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
};
