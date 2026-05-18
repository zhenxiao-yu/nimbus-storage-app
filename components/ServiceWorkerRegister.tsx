"use client";

import { useEffect } from "react";

/**
 * Registers the Nimbus service worker (/sw.js) on mount.
 *
 * - Skips during development (Next.js dev server) to avoid stale caches.
 * - Skips if the browser does not support service workers.
 * - Logs update lifecycle events; no UI is shown.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Avoid registering the SW during local dev to prevent confusing caches.
    if (process.env.NODE_ENV !== "production") return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        if (cancelled) return;

        if (registration.waiting) {
          console.info("[SW] Update waiting to activate.");
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              console.info("[SW] New version installed; will activate on next load.");
            }
          });
        });
      } catch (err) {
        console.warn("[SW] Registration failed:", err);
      }
    };

    const onControllerChange = () => {
      console.info("[SW] Controller changed.");
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    register();

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}
