import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Link2Off } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants";

export const metadata: Metadata = {
  title: "Link unavailable",
  description:
    "This share link has expired or doesn't exist. Create your own Nimbus workspace.",
  robots: { index: false, follow: false },
};

export default function ShareNotFound() {
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

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-4 py-12 text-center md:px-6">
        <div
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-card text-muted-foreground shadow-soft"
        >
          <Link2Off className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="h2">This link has expired or doesn&apos;t exist.</h1>
          <p className="mx-auto max-w-md text-balance text-sm text-muted-foreground">
            The owner may have revoked the share link, set a new expiry, or
            renamed the file. Ask them for a fresh link — or create your own
            workspace on {siteConfig.shortTitle}.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">
              Go to {siteConfig.shortTitle}
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Create an account</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-background/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center p-4 text-xs text-muted-foreground md:px-6">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.shortTitle}.
          </p>
        </div>
      </footer>
    </div>
  );
}
