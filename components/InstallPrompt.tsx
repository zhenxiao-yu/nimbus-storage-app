"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "nimbus-install-dismissed-v1";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already dismissed previously
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    // Already running as installed PWA
    const mql = window.matchMedia?.("(display-mode: standalone)");
    if (mql?.matches) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setVisible(false);
      setDeferred(null);
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      } else {
        // User dismissed the native prompt — don't nag again this session.
        dismiss();
      }
    } catch {
      dismiss();
    } finally {
      setDeferred(null);
    }
  }, [deferred, dismiss]);

  if (!visible || !deferred) return null;

  return (
    <div
      role="region"
      aria-label="Install Nimbus"
      className="pointer-events-auto fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm flex-col gap-3 rounded-xl border border-border/70 bg-card/95 p-4 shadow-elevated backdrop-blur sm:right-4 sm:left-auto sm:mx-0"
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 text-white"
        >
          <Download className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install Nimbus</p>
          <p className="text-xs text-muted-foreground">
            Faster access and an app-like experience right from your home
            screen.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={dismiss}
          className="flex-1"
        >
          Not now
        </Button>
        <Button size="sm" type="button" onClick={install} className="flex-1">
          Install
        </Button>
      </div>
    </div>
  );
}
