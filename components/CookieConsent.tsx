"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "nimbus-consent-v1";
const CHANGE_EVENT = "nimbus-consent-change";
const OPEN_EVENT = "nimbus-consent-open";

export type ConsentValue = {
  necessary: true;
  analytics: boolean;
  ts: number;
};

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentValue>;
    if (
      parsed &&
      parsed.necessary === true &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.ts === "number"
    ) {
      return { necessary: true, analytics: parsed.analytics, ts: parsed.ts };
    }
    return null;
  } catch {
    return null;
  }
}

function writeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: value }));
  } catch {
    // ignore
  }
}

export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Hydration-safe initialization
  useEffect(() => {
    setMounted(true);
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
    }

    const handleOpen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? true);
      setVisible(true);
      setShowCustomize(true);
    };
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_EVENT, handleOpen);
  }, []);

  const persist = useCallback((analyticsAllowed: boolean) => {
    writeConsent({
      necessary: true,
      analytics: analyticsAllowed,
      ts: Date.now(),
    });
    setVisible(false);
    setShowCustomize(false);
  }, []);

  const acceptAll = () => persist(true);
  const rejectAll = () => persist(false);
  const saveCustomized = () => persist(analytics);

  // Escape closes customize view
  useEffect(() => {
    if (!showCustomize) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowCustomize(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showCustomize]);

  // Focus trap for customize dialog
  useEffect(() => {
    if (!showCustomize || !dialogRef.current) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const container = dialogRef.current;
    const focusables = container.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    container.addEventListener("keydown", handleTab);
    return () => {
      container.removeEventListener("keydown", handleTab);
      previouslyFocused.current?.focus?.();
    };
  }, [showCustomize]);

  if (!mounted || !visible) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 motion-safe:animate-fade-up motion-reduce:animate-none"
    >
      {showCustomize ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-customize-title"
          aria-describedby="cookie-customize-desc"
          className="pointer-events-auto w-full max-w-2xl rounded-xl border border-border/70 bg-card/95 p-5 shadow-elevated backdrop-blur"
        >
          <div className="space-y-1">
            <h2 id="cookie-customize-title" className="text-base font-semibold">
              Cookie preferences
            </h2>
            <p
              id="cookie-customize-desc"
              className="text-sm text-muted-foreground"
            >
              Choose which categories of cookies and storage you allow. You can
              change this any time from the footer.
            </p>
          </div>

          <ul className="mt-4 space-y-3">
            <li className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Necessary</p>
                <p className="text-xs text-muted-foreground">
                  Required for sign-in, sessions and security. Always on.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked
                  disabled
                  aria-label="Necessary cookies (always on)"
                  className="size-4 rounded border-border accent-primary"
                />
                <span>Always on</span>
              </label>
            </li>

            <li className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">
                  Vercel Analytics and Speed Insights — anonymized usage and
                  performance data to help improve the app.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  aria-label="Allow analytics cookies"
                  className="size-4 rounded border-border accent-primary"
                />
                <span>{analytics ? "Enabled" : "Disabled"}</span>
              </label>
            </li>
          </ul>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowCustomize(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button variant="outline" onClick={rejectAll} type="button">
              Reject non-essential
            </Button>
            <Button onClick={saveCustomized} type="button">
              Save preferences
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="region"
          aria-label="Cookie consent"
          className="pointer-events-auto flex w-full max-w-4xl flex-col gap-4 rounded-xl border border-border/70 bg-card/95 p-4 shadow-elevated backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="min-w-0 text-sm">
            <p className="font-medium">We use cookies</p>
            <p className="text-muted-foreground">
              Necessary cookies keep you signed in. Optional analytics cookies
              help us understand usage. See our{" "}
              <Link
                href="/cookies"
                className="underline underline-offset-2 hover:text-foreground"
              >
                cookie policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowCustomize(true)}
            >
              Customize
            </Button>
            <Button variant="outline" type="button" onClick={rejectAll}>
              Reject non-essential
            </Button>
            <Button type="button" onClick={acceptAll}>
              Accept all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
