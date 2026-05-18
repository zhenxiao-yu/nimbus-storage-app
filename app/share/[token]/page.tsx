import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants";
import { getFileByShareToken } from "@/lib/actions/file.actions";
import {
  constructDownloadUrl,
  convertFileSize,
  formatDateTime,
  getFileIcon,
} from "@/lib/utils";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const file = await getFileByShareToken(token);
  const title = file ? `${file.name} · Shared via Nimbus` : "Shared file";
  return {
    title,
    description: file
      ? `${file.name} — shared securely via Nimbus.`
      : "This share link is no longer available.",
    robots: { index: false, follow: false },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const file = await getFileByShareToken(token);
  if (!file) notFound();

  const isImage = file.type === "image" && file.extension !== "svg";
  const isVideo = file.type === "video";
  const isAudio = file.type === "audio";
  const downloadUrl = constructDownloadUrl(file.bucketFileId);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 p-4 md:px-6">
          <Logo size="sm" href="/" />
          <Link
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            What is Nimbus?
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <span className="inline-flex w-fit items-center gap-1.5 self-center rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground sm:self-start">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-primary" />
            Shared via Nimbus
          </span>
          <h1 className="break-all text-2xl font-semibold tracking-tight sm:text-3xl">
            {file.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground/70">
              {convertFileSize(file.size)}
            </span>
            <span className="mx-1.5 text-border">·</span>
            <span className="uppercase">{file.extension}</span>
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="flex min-h-[280px] items-center justify-center bg-muted/30 p-6 sm:min-h-[380px]">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.url}
                alt={file.name}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-sm"
              />
            ) : isVideo ? (
              <video
                controls
                src={file.url}
                className="max-h-[60vh] w-full rounded-lg shadow-sm"
              >
                Your browser does not support video playback.
              </video>
            ) : isAudio ? (
              <audio controls src={file.url} className="w-full max-w-md">
                Your browser does not support audio playback.
              </audio>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <Image
                  src={getFileIcon(file.extension, file.type)}
                  alt={`${file.type} icon`}
                  width={96}
                  height={96}
                  className="size-24 opacity-80"
                />
                <p className="text-sm text-muted-foreground">
                  Preview not available. Use Download to view this file.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-muted-foreground">
              Hosted on{" "}
              <span className="font-medium text-foreground">
                {siteConfig.shortTitle}
              </span>
              .{" "}
              {file.shareExpiresAt && (
                <>
                  This link expires on{" "}
                  <span className="font-medium text-foreground">
                    {formatDateTime(file.shareExpiresAt)}
                  </span>
                  .
                </>
              )}
            </p>
            <Button asChild className="gap-2 sm:w-auto">
              <a href={downloadUrl} download={file.name}>
                <Download aria-hidden="true" className="size-4" />
                Download
              </a>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-background/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 p-4 text-xs text-muted-foreground sm:flex-row md:px-6">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.shortTitle}. Shared
            securely.
          </p>
          <Link
            href="/"
            className="transition-colors hover:text-foreground"
          >
            Get your own Nimbus workspace
          </Link>
        </div>
      </footer>
    </div>
  );
}
