"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Client } from "appwrite";

import { getRealtimeJWT } from "@/lib/actions/user.actions";

type Props = {
  endpoint: string;
  projectId: string;
  databaseId: string;
  filesCollectionId: string;
};

/**
 * Subscribes the current tab to the user's Files collection over Appwrite
 * Realtime. On any insert / update / delete event we call router.refresh()
 * so server-rendered dashboard pages re-fetch. A 200ms debounce coalesces
 * bursts (e.g., a multi-file upload).
 *
 * Failures (network, JWT issues) degrade silently — the user will still
 * see fresh data on their next navigation.
 */
const RealtimeSync = ({
  endpoint,
  projectId,
  databaseId,
  filesCollectionId,
}: Props) => {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!endpoint || !projectId || !databaseId || !filesCollectionId) return;

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const scheduleRefresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.refresh();
      }, 200);
    };

    (async () => {
      try {
        const jwt = await getRealtimeJWT();
        if (cancelled || !jwt) return;

        const client = new Client()
          .setEndpoint(endpoint)
          .setProject(projectId);
        client.setJWT(jwt);

        const channel = `databases.${databaseId}.collections.${filesCollectionId}.documents`;
        const unsub = client.subscribe(channel, () => {
          scheduleRefresh();
        });
        if (cancelled) {
          unsub();
          return;
        }
        unsubscribe = unsub;
      } catch {
        // Realtime is best-effort; swallow and let manual nav handle freshness.
      }
    })();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch {
          // ignore
        }
      }
    };
  }, [endpoint, projectId, databaseId, filesCollectionId, router]);

  return null;
};

export default RealtimeSync;
