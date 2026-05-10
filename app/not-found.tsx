import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/magicui/aurora-background";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <AuroraBackground />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <p className="text-6xl font-bold tracking-tighter text-gradient-brand md:text-8xl">
          404
        </p>
        <h1 className="h2 max-w-xl text-balance">
          We couldn&apos;t find that page.
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          The link may be broken, or the file may have been moved. Let&apos;s
          get you back on track.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 size-4" /> Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Go to dashboard <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
