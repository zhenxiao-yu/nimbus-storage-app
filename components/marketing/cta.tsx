import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Meteors } from "@/components/magicui/meteors";

export function CTA({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 text-white md:p-16">
        <Meteors number={14} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(165,180,252,0.18),transparent_55%)]"
        />
        <div className="relative">
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Ready to{" "}
            <span className="bg-gradient-to-br from-violet-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              own your files?
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-balance text-base text-white/70 md:text-lg">
            Spin up your free Nimbus workspace in under a minute. No password,
            no credit card.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                {isAuthenticated ? "Open dashboard" : "Create free account"}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">I have an account</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
