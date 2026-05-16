"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useCommandPalette } from "@/components/CommandPaletteProvider";

const CommandPaletteTrigger = ({ className }: { className?: string }) => {
  const { toggle } = useCommandPalette();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsMac(/Mac|iPhone|iPod|iPad/i.test(navigator.platform));
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Open command palette"
      className={cn(
        "ring-focus inline-flex h-9 items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <kbd className="font-sans text-[11px] font-semibold leading-none">
        {isMac ? "⌘" : "Ctrl"}
      </kbd>
      <kbd className="font-sans text-[11px] font-semibold leading-none">K</kbd>
    </button>
  );
};

export default CommandPaletteTrigger;
