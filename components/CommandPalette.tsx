"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Models } from "node-appwrite";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Loader2,
  LogOut,
  Moon,
  Search as SearchIcon,
  Sun,
  Upload,
} from "lucide-react";

import { navItems } from "@/constants";
import { cn, formatRelativeTime } from "@/lib/utils";
import { getFiles } from "@/lib/actions/file.actions";
import { signOutUser } from "@/lib/actions/user.actions";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TYPE_CHIP: Record<string, string> = {
  document: "DOC",
  image: "IMG",
  video: "VID",
  audio: "AUD",
  other: "FILE",
};

const focusUploaderButton = () => {
  if (typeof document === "undefined") return false;
  const btn = document.querySelector<HTMLButtonElement>(
    'button[aria-label="Upload"], header button:has(> svg.lucide-upload)',
  );
  // Fallback: any button whose text is "Upload"
  const fallback =
    btn ??
    Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.trim().toLowerCase() === "upload",
    );
  if (fallback) {
    fallback.focus();
    fallback.click();
    return true;
  }
  return false;
};

const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [files, setFiles] = useState<Models.DefaultDocument[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Lazy-load files when the palette opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // Open-driven async fetch — loading flag toggles around the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingFiles(true);
    (async () => {
      try {
        const result = await getFiles({ types: [], limit: 20 });
        if (!cancelled) setFiles(result?.documents ?? []);
      } catch {
        if (!cancelled) setFiles([]);
      } finally {
        if (!cancelled) setLoadingFiles(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const navigateTo = useCallback(
    (url: string) => {
      close();
      router.push(url);
    },
    [close, router],
  );

  const openFileUrl = useCallback(
    (url: string) => {
      close();
      if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    [close],
  );

  const handleToggleTheme = useCallback(() => {
    close();
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [close, resolvedTheme, setTheme]);

  const handleUpload = useCallback(() => {
    close();
    // Defer to next tick so the palette unmounts first, then we can focus/click
    requestAnimationFrame(() => focusUploaderButton());
  }, [close]);

  const handleSignOut = useCallback(async () => {
    close();
    try {
      await signOutUser();
    } catch {
      // signOutUser redirects on success; thrown NEXT_REDIRECT is expected
    }
  }, [close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh] sm:pt-[18vh]"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 bg-background/70 backdrop-blur-md motion-safe:animate-in motion-safe:fade-in-0"
        tabIndex={-1}
      />

      <Command
        label="Command palette"
        loop
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-screen-sm overflow-hidden rounded-2xl border border-border/60",
          "bg-popover/95 shadow-elevated backdrop-blur-xl",
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-150",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-4">
          <SearchIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <Command.Input
            autoFocus
            placeholder="Type a command or search files…"
            className={cn(
              "h-12 w-full flex-1 bg-transparent text-sm outline-none",
              "placeholder:text-muted-foreground",
            )}
          />
          <kbd className="hidden shrink-0 rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            Esc
          </kbd>
        </div>

        <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto scrollbar-thin p-2">
          <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group
            heading="Navigation"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            {navItems.map(({ url, name, icon: Icon }) => (
              <Command.Item
                key={url}
                value={`nav ${name} ${url}`}
                onSelect={() => navigateTo(url)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm",
                  "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{name}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground opacity-0 data-[selected=true]:opacity-100"
                />
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading={loadingFiles ? "Files (loading…)" : "Files"}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            {loadingFiles && files.length === 0 ? (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <Loader2
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
                Loading recent files…
              </div>
            ) : !loadingFiles && files.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                No files yet — upload one to see it here.
              </div>
            ) : (
              files.map((file) => (
                <Command.Item
                  key={file.$id}
                  value={`file ${file.name} ${file.type ?? ""} ${file.extension ?? ""}`}
                  onSelect={() => openFileUrl(file.url)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm",
                    "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex shrink-0 items-center justify-center rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {TYPE_CHIP[file.type as string] ?? "FILE"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(file.$createdAt)}
                  </span>
                </Command.Item>
              ))
            )}
          </Command.Group>

          <Command.Group
            heading="Actions"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            <Command.Item
              value="action upload file new"
              onSelect={handleUpload}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm",
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
              )}
            >
              <Upload
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <span className="flex-1 truncate">Upload file</span>
            </Command.Item>
            <Command.Item
              value="action toggle theme dark light"
              onSelect={handleToggleTheme}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm",
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
              )}
            >
              {resolvedTheme === "dark" ? (
                <Sun
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              ) : (
                <Moon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              )}
              <span className="flex-1 truncate">
                Toggle theme ({resolvedTheme === "dark" ? "light" : "dark"})
              </span>
            </Command.Item>
            <Command.Item
              value="action sign out logout"
              onSelect={handleSignOut}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm",
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
              )}
            >
              <LogOut
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <span className="flex-1 truncate">Sign out</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-medium">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-medium">
              ↵
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-medium">
              Esc
            </kbd>
            close
          </span>
        </div>
      </Command>
    </div>
  );
};

export default CommandPalette;
