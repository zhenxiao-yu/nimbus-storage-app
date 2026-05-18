import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/constants";

export const metadata: Metadata = {
  title: "Receive a file via Beam",
  description:
    "Receive a file peer-to-peer from a Nimbus user. Enter the 4-digit beam code to start the transfer — nothing touches our servers.",
  robots: { index: false, follow: false },
};

export default function BeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/40">
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

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 md:px-6 md:py-14">
        {children}
      </main>

      <footer className="border-t border-border/60 bg-background/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 p-4 text-xs text-muted-foreground sm:flex-row md:px-6">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.shortTitle}. Peer-to-peer
            transfers, end-to-end.
          </p>
          <Link href="/" className="transition-colors hover:text-foreground">
            Get your own Nimbus workspace
          </Link>
        </div>
      </footer>
    </div>
  );
}
