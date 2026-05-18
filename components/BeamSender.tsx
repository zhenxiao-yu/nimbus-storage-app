"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn, convertFileSize } from "@/lib/utils";
import { MAX_FILE_SIZE } from "@/constants";

// Frame protocol — keep in sync with BeamReceiver:
//   1. Sender opens a PeerJS data channel as `nimbus-beam-XXXX`.
//   2. Sender sends a JSON `{ type: "meta", name, size, mimeType }` first.
//   3. Sender streams binary ArrayBuffer chunks of CHUNK_SIZE bytes.
//   4. Sender finishes with JSON `{ type: "done" }`.
//   5. Either side may send `{ type: "abort", reason }` to bail out.
//
// Control frames travel as JSON strings, payload frames travel as ArrayBuffer
// — the receiver discriminates on `typeof data === "string"`.
const CHUNK_SIZE = 64 * 1024; // 64 KB per data-channel write

const PEER_PREFIX = "nimbus-beam-";
const MAX_ID_ATTEMPTS = 6;

interface BeamFile {
  $id: string;
  name: string;
  size: number;
  url: string;
  extension?: string;
  mimeType?: string;
}

type Phase =
  | "init"
  | "waiting"
  | "connected"
  | "transferring"
  | "done"
  | "error"
  | "unsupported";

interface BeamSenderProps {
  file: BeamFile;
}

const generateCode = () =>
  String(Math.floor(1000 + Math.random() * 9000)); // 4-digit, 1000-9999

const isWebRtcAvailable = () =>
  typeof window !== "undefined" &&
  typeof window.RTCPeerConnection !== "undefined";

export default function BeamSender({ file }: BeamSenderProps) {
  const [phase, setPhase] = useState<Phase>("init");
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [bytesSent, setBytesSent] = useState(0);
  const [peerLabel, setPeerLabel] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Hold the live Peer + connection refs so cleanup can reach them on unmount.
  // PeerJS is imported dynamically because it pulls in browser-only globals.
  const peerRef = useRef<unknown>(null);
  const connRef = useRef<unknown>(null);
  const cancelledRef = useRef(false);
  const oversize = file.size > MAX_FILE_SIZE;

  const tearDown = useCallback(() => {
    cancelledRef.current = true;
    try {
      const conn = connRef.current as { close?: () => void } | null;
      conn?.close?.();
    } catch {
      /* ignore */
    }
    try {
      const peer = peerRef.current as { destroy?: () => void } | null;
      peer?.destroy?.();
    } catch {
      /* ignore */
    }
    connRef.current = null;
    peerRef.current = null;
  }, []);

  const sendFileRef = useRef<
    | ((conn: { send: (data: unknown) => void; close?: () => void }) => Promise<void>)
    | null
  >(null);

  const startBeam = useCallback(async () => {
    if (!isWebRtcAvailable()) {
      setPhase("unsupported");
      return;
    }

    setError("");
    setBytesSent(0);
    setPhase("init");
    cancelledRef.current = false;

    let mod;
    try {
      mod = await import("peerjs");
    } catch (e) {
      console.error("Failed to load peerjs", e);
      setError("Couldn't load the beam transport. Refresh and try again.");
      setPhase("error");
      return;
    }

    const Peer = mod.default;

    // Try a few codes if the broker tells us the ID is in use.
    const attempt = async (remaining: number): Promise<void> => {
      if (cancelledRef.current) return;
      const candidate = generateCode();

      const peer = new Peer(`${PEER_PREFIX}${candidate}`, { debug: 0 });
      peerRef.current = peer;

      return new Promise<void>((resolve) => {
        let settled = false;

        peer.on("open", () => {
          if (cancelledRef.current) {
            try { peer.destroy(); } catch { /* ignore */ }
            return;
          }
          settled = true;
          setCode(candidate);
          setPhase("waiting");
          resolve();
        });

        peer.on("error", (err: { type?: string; message?: string }) => {
          // ID collision — destroy and try again with a fresh 4-digit code.
          if (
            !settled &&
            (err?.type === "unavailable-id" || err?.type === "id-taken")
          ) {
            try { peer.destroy(); } catch { /* ignore */ }
            if (remaining > 0) {
              attempt(remaining - 1).then(resolve);
              return;
            }
            setError("Couldn't reserve a code. Try again.");
            setPhase("error");
            settled = true;
            resolve();
            return;
          }

          if (!settled) {
            console.error("PeerJS open error", err);
            setError(
              err?.message ||
                "Couldn't connect to the beam broker. Check your network and retry.",
            );
            setPhase("error");
            settled = true;
            resolve();
          }
        });

        peer.on("connection", (incoming: unknown) => {
          if (connRef.current) {
            // Already serving someone — politely close late arrivals.
            try { (incoming as { close?: () => void }).close?.(); } catch { /* ignore */ }
            return;
          }
          connRef.current = incoming;
          const conn = incoming as {
            peer?: string;
            on: (e: string, cb: (...args: unknown[]) => void) => void;
            send: (data: unknown) => void;
          };
          setPeerLabel(conn.peer ? conn.peer.slice(-6) : "guest");

          conn.on("open", async () => {
            setPhase("connected");
            await sendFileRef.current?.(conn);
          });

          conn.on("close", () => {
            // mid-flight disconnect — user retries via the button below.
          });

          conn.on("error", (err) => {
            console.error("Beam data channel error", err);
            setError("The transfer connection dropped.");
            setPhase("error");
          });
        });
      });
    };

    await attempt(MAX_ID_ATTEMPTS);
  }, []);

  const sendFile = useCallback(async (conn: {
    send: (data: unknown) => void;
    close?: () => void;
  }) => {
    try {
      setPhase("transferring");
      setBytesSent(0);

      const res = await fetch(file.url);
      if (!res.ok) throw new Error(`fetch failed (${res.status})`);
      const blob = await res.blob();
      const buf = await blob.arrayBuffer();
      const total = buf.byteLength;

      // 1. Metadata frame
      conn.send(
        JSON.stringify({
          type: "meta",
          name: file.name,
          size: total,
          mimeType: file.mimeType || blob.type || "application/octet-stream",
        }),
      );

      // 2. Stream chunks. Yield to the event loop periodically so the UI can
      //    paint progress; PeerJS handles internal flow control.
      let offset = 0;
      while (offset < total) {
        if (cancelledRef.current) return;
        const end = Math.min(offset + CHUNK_SIZE, total);
        const slice = buf.slice(offset, end);
        conn.send(slice);
        offset = end;
        setBytesSent(offset);
        // Yield to the microtask queue every ~512KB so the channel buffer can drain.
        if (offset % (CHUNK_SIZE * 8) === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      // 3. Completion sentinel
      conn.send(JSON.stringify({ type: "done" }));
      setPhase("done");
    } catch (e) {
      console.error("Beam transfer failed", e);
      setError(
        e instanceof Error
          ? `Transfer failed: ${e.message}`
          : "Transfer failed.",
      );
      setPhase("error");
      try { conn.send(JSON.stringify({ type: "abort", reason: "sender-error" })); } catch { /* ignore */ }
    }
  }, [file]);

  // Keep the ref pointed at the latest sendFile so startBeam can invoke it
  // without re-creating itself on every render.
  useEffect(() => {
    sendFileRef.current = sendFile;
  }, [sendFile]);

  // Kick things off once on mount; tear down on unmount / page hide.
  useEffect(() => {
    if (!isWebRtcAvailable()) {
      const t = setTimeout(() => setPhase("unsupported"), 0);
      return () => clearTimeout(t);
    }
    // External system subscribe (PeerJS) — setState fires in response to peer events.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startBeam();

    const handleBeforeUnload = () => tearDown();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      tearDown();
    };
    // intentionally fire once — startBeam closes over file via props which is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Select the code manually.");
    }
  };

  const handleRetry = () => {
    tearDown();
    cancelledRef.current = false;
    setCode("");
    setError("");
    setBytesSent(0);
    setPhase("init");
    // small tick to let teardown settle before re-opening a peer
    setTimeout(() => startBeam(), 50);
  };

  const handleSendAnother = () => {
    tearDown();
    // Back to dashboard so the user can pick another file.
    window.location.href = "/dashboard";
  };

  const progressPct =
    file.size > 0 ? Math.min(100, Math.round((bytesSent / file.size) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to dashboard
        </Link>
      </div>

      <header className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Wifi aria-hidden="true" className="size-3.5 text-primary" />
          Beam — peer-to-peer transfer
        </span>
        <h1 className="h2 break-all">{file.name}</h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground/70 tabular-nums">
            {convertFileSize(file.size)}
          </span>
          {file.extension && (
            <>
              <span className="mx-1.5 text-border">·</span>
              <span className="uppercase">{file.extension}</span>
            </>
          )}
        </p>
      </header>

      {oversize && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          This file is larger than {convertFileSize(MAX_FILE_SIZE)}. Beam will
          still attempt the transfer, but free WebRTC brokers are best-effort —
          keep both tabs open until it finishes.
        </div>
      )}

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft sm:p-8">
        {phase === "unsupported" ? (
          <UnsupportedBlock />
        ) : phase === "error" ? (
          <ErrorBlock message={error} onRetry={handleRetry} />
        ) : phase === "done" ? (
          <DoneBlock peerLabel={peerLabel} onSendAnother={handleSendAnother} />
        ) : phase === "transferring" || phase === "connected" ? (
          <TransferringBlock bytesSent={bytesSent} total={file.size} pct={progressPct} />
        ) : (
          <WaitingBlock code={code} onCopy={handleCopy} copied={copied} loading={phase === "init"} />
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Your file streams directly from this tab to the recipient&rsquo;s browser
        over WebRTC. Nimbus never relays the bytes — only a kilobyte-sized
        handshake passes through a public signaling broker.
      </p>
    </div>
  );
}

function WaitingBlock({
  code,
  onCopy,
  copied,
  loading,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-sm text-muted-foreground">
        Have your friend open{" "}
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
          /beam
        </span>{" "}
        and enter this code:
      </p>
      <div
        className="font-mono text-6xl font-bold tracking-[0.35em] tabular-nums sm:text-7xl"
        aria-live="polite"
      >
        {loading || !code ? (
          <span className="inline-flex items-center gap-2 text-3xl text-muted-foreground sm:text-4xl">
            <Loader2 aria-hidden="true" className="size-7 animate-spin motion-reduce:animate-none" />
            <span>Reserving…</span>
          </span>
        ) : (
          code
        )}
      </div>

      <Button
        variant="outline"
        onClick={onCopy}
        disabled={!code}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check aria-hidden="true" className="size-4" />
            Copied
          </>
        ) : (
          <>
            <Copy aria-hidden="true" className="size-4" />
            Copy code
          </>
        )}
      </Button>

      {code && (
        <div
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          aria-live="polite"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
          Waiting for the receiver to connect…
        </div>
      )}
    </div>
  );
}

function TransferringBlock({
  bytesSent,
  total,
  pct,
}: {
  bytesSent: number;
  total: number;
  pct: number;
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Send aria-hidden="true" className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">Transferring…</p>
        <p className="text-sm text-muted-foreground tabular-nums">
          {convertFileSize(bytesSent)} of {convertFileSize(total)} ·{" "}
          <span className="font-medium text-foreground">{pct}%</span>
        </p>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full bg-primary transition-[width] duration-150 ease-out",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DoneBlock({
  peerLabel,
  onSendAnother,
}: {
  peerLabel: string;
  onSendAnother: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Check aria-hidden="true" className="size-7" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">Sent!</p>
        <p className="text-sm text-muted-foreground">
          Delivered to{" "}
          <span className="font-mono text-foreground">
            {peerLabel || "the receiver"}
          </span>
          .
        </p>
      </div>
      <Button onClick={onSendAnother} className="gap-2">
        <Send aria-hidden="true" className="size-4" />
        Send another file
      </Button>
    </div>
  );
}

function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <WifiOff aria-hidden="true" className="size-6" />
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        {message || "Something went wrong with the beam."}
      </p>
      <Button onClick={onRetry} className="gap-2">
        <RefreshCw aria-hidden="true" className="size-4" />
        Try again
      </Button>
    </div>
  );
}

function UnsupportedBlock() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff aria-hidden="true" className="size-6" />
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        Your browser doesn&rsquo;t support peer-to-peer transfer. Try the latest
        Chrome, Firefox, or Safari.
      </p>
    </div>
  );
}
