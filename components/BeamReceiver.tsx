"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Download,
  Loader2,
  RefreshCw,
  WifiOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn, convertFileSize } from "@/lib/utils";

// Mirror of the sender's protocol — see components/BeamSender.tsx for docs.
const PEER_PREFIX = "nimbus-beam-";

type Phase =
  | "idle"
  | "dialing"
  | "receiving"
  | "done"
  | "error"
  | "unsupported";

interface FileMeta {
  name: string;
  size: number;
  mimeType: string;
}

interface ControlFrame {
  type: "meta" | "done" | "abort";
  name?: string;
  size?: number;
  mimeType?: string;
  reason?: string;
}

const isWebRtcAvailable = () =>
  typeof window !== "undefined" &&
  typeof window.RTCPeerConnection !== "undefined";

export default function BeamReceiver() {
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<FileMeta | null>(null);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [downloadName, setDownloadName] = useState("");

  const peerRef = useRef<unknown>(null);
  const connRef = useRef<unknown>(null);
  const chunksRef = useRef<ArrayBuffer[]>([]);
  const metaRef = useRef<FileMeta | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Defer to the next tick so the initial paint completes before we flip
    // into the unsupported state — also satisfies the no-sync-setState lint.
    if (!isWebRtcAvailable()) {
      const t = setTimeout(() => setPhase("unsupported"), 0);
      return () => clearTimeout(t);
    }
  }, []);

  const tearDown = useCallback(() => {
    cancelledRef.current = true;
    try {
      const conn = connRef.current as { close?: () => void } | null;
      conn?.close?.();
    } catch { /* ignore */ }
    try {
      const peer = peerRef.current as { destroy?: () => void } | null;
      peer?.destroy?.();
    } catch { /* ignore */ }
    connRef.current = null;
    peerRef.current = null;
  }, []);

  useEffect(() => {
    const onUnload = () => tearDown();
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      tearDown();
    };
  }, [tearDown]);

  const finalizeDownload = useCallback(() => {
    const finalMeta = metaRef.current;
    if (!finalMeta) {
      setError("Transfer finished without a filename. Ask the sender to retry.");
      setPhase("error");
      return;
    }
    const blob = new Blob(chunksRef.current, {
      type: finalMeta.mimeType || "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = finalMeta.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke shortly after so the browser has time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    setDownloadName(finalMeta.name);
    setPhase("done");

    // Free chunks now that the Blob owns the bytes.
    chunksRef.current = [];
  }, []);

  const startReceive = useCallback(async () => {
    if (!isWebRtcAvailable()) {
      setPhase("unsupported");
      return;
    }
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setError("Enter the 4-digit code from the sender.");
      setPhase("error");
      return;
    }

    setError("");
    setPhase("dialing");
    setBytesReceived(0);
    chunksRef.current = [];
    metaRef.current = null;
    setMeta(null);
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

    const peer = new Peer(undefined as unknown as string, { debug: 0 });
    peerRef.current = peer;

    peer.on("open", () => {
      if (cancelledRef.current) return;
      const conn = peer.connect(`${PEER_PREFIX}${code}`, {
        reliable: true,
        serialization: "binary",
      });
      connRef.current = conn;

      conn.on("open", () => {
        setPhase("receiving");
      });

      conn.on("data", (data: unknown) => {
        if (typeof data === "string") {
          // Control frame
          let frame: ControlFrame;
          try {
            frame = JSON.parse(data);
          } catch {
            return;
          }
          if (frame.type === "meta" && frame.name && typeof frame.size === "number") {
            const m: FileMeta = {
              name: frame.name,
              size: frame.size,
              mimeType: frame.mimeType || "application/octet-stream",
            };
            metaRef.current = m;
            setMeta(m);
          } else if (frame.type === "done") {
            finalizeDownload();
          } else if (frame.type === "abort") {
            setError("The sender cancelled the transfer.");
            setPhase("error");
          }
          return;
        }

        // Binary chunk
        let buf: ArrayBuffer | null = null;
        if (data instanceof ArrayBuffer) {
          buf = data;
        } else if (ArrayBuffer.isView(data)) {
          const view = data as ArrayBufferView;
          buf = view.buffer.slice(
            view.byteOffset,
            view.byteOffset + view.byteLength,
          );
        } else if (
          typeof Blob !== "undefined" &&
          data instanceof Blob
        ) {
          // PeerJS may wrap as Blob in some browsers — handle async.
          data.arrayBuffer().then((b) => {
            chunksRef.current.push(b);
            setBytesReceived((n) => n + b.byteLength);
          });
          return;
        }
        if (buf) {
          chunksRef.current.push(buf);
          setBytesReceived((n) => n + (buf as ArrayBuffer).byteLength);
        }
      });

      conn.on("close", () => {
        // If we already finished, ignore. Otherwise treat as mid-flight drop.
        setPhase((p) => {
          if (p === "done" || p === "error") return p;
          setError("The sender disconnected before the file finished.");
          return "error";
        });
      });

      conn.on("error", (err: { message?: string }) => {
        console.error("Beam receive error", err);
        setError(err?.message || "Transfer error.");
        setPhase("error");
      });
    });

    peer.on("error", (err: { type?: string; message?: string }) => {
      console.error("PeerJS receive error", err);
      if (err?.type === "peer-unavailable") {
        setError(
          "No sender found for that code. Double-check the digits and try again.",
        );
      } else {
        setError(
          err?.message ||
            "Couldn't connect to the beam broker. Check your network.",
        );
      }
      setPhase("error");
    });
  }, [code, finalizeDownload]);

  const handleReset = () => {
    tearDown();
    cancelledRef.current = false;
    chunksRef.current = [];
    metaRef.current = null;
    setMeta(null);
    setBytesReceived(0);
    setError("");
    setDownloadName("");
    setCode("");
    setPhase("idle");
  };

  const pct =
    meta && meta.size > 0
      ? Math.min(100, Math.round((bytesReceived / meta.size) * 100))
      : 0;

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {phase === "unsupported" ? (
        <UnsupportedBlock />
      ) : phase === "done" ? (
        <DoneBlock filename={downloadName} onAnother={handleReset} />
      ) : phase === "error" ? (
        <ErrorBlock message={error} onRetry={handleReset} />
      ) : phase === "receiving" ? (
        <ReceivingBlock meta={meta} bytesReceived={bytesReceived} pct={pct} />
      ) : phase === "dialing" ? (
        <DialingBlock code={code} />
      ) : (
        <IdleBlock
          code={code}
          onChange={(v) => {
            setError("");
            setCode(v);
          }}
          onSubmit={startReceive}
        />
      )}

      <p className="text-center text-xs text-muted-foreground">
        Files stream directly from the sender&rsquo;s browser to yours over
        WebRTC. Nimbus never sees the bytes.
      </p>
    </div>
  );
}

function IdleBlock({
  code,
  onChange,
  onSubmit,
}: {
  code: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-soft sm:p-8">
      <div className="space-y-1.5 text-center">
        <h1 className="h3">Enter the beam code</h1>
        <p className="text-sm text-muted-foreground">
          Ask the sender for their 4-digit code.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col items-center gap-5"
      >
        <InputOTP
          maxLength={4}
          value={code}
          onChange={onChange}
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus
        >
          <InputOTPGroup className="gap-2">
            {[0, 1, 2, 3].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="size-14 rounded-md border text-xl font-semibold tabular-nums first:rounded-l-md last:rounded-r-md"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button
          type="submit"
          disabled={code.length !== 4}
          className="w-full gap-2"
        >
          Receive
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function DialingBlock({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft">
      <Loader2
        aria-hidden="true"
        className="size-8 animate-spin text-primary motion-reduce:animate-none"
      />
      <p className="text-sm text-muted-foreground">
        Connecting to{" "}
        <span className="font-mono text-foreground">{code}</span>…
      </p>
    </div>
  );
}

function ReceivingBlock({
  meta,
  bytesReceived,
  pct,
}: {
  meta: FileMeta | null;
  bytesReceived: number;
  pct: number;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-soft sm:p-8">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Receiving file
        </p>
        <p className="break-all text-lg font-semibold">
          {meta?.name || "Waiting for filename…"}
        </p>
        {meta && (
          <p className="text-sm text-muted-foreground tabular-nums">
            {convertFileSize(bytesReceived)} of {convertFileSize(meta.size)} ·{" "}
            <span className="font-medium text-foreground">{pct}%</span>
          </p>
        )}
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
  filename,
  onAnother,
}: {
  filename: string;
  onAnother: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Check aria-hidden="true" className="size-7" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">Saved!</p>
        <p className="break-all text-sm text-muted-foreground">
          Downloaded{" "}
          <span className="font-medium text-foreground">{filename}</span>.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onAnother} variant="outline" className="gap-2">
          <Download aria-hidden="true" className="size-4" />
          Beam another file
        </Button>
        <Button asChild>
          <Link href="/">Visit Nimbus</Link>
        </Button>
      </div>
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
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <WifiOff aria-hidden="true" className="size-6" />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground" aria-live="polite">
        {message}
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
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff aria-hidden="true" className="size-6" />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        Your browser doesn&rsquo;t support peer-to-peer transfer. Try the latest
        Chrome, Firefox, or Safari.
      </p>
    </div>
  );
}
