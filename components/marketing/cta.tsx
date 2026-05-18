"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Meteors } from "@/components/magicui/meteors";
import { AuroraBackground } from "@/components/magicui/aurora-background";
import { BorderBeam } from "@/components/magicui/border-beam";

export function CTA({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-5 sm:pb-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6 text-center text-white sm:p-10 md:p-20"
      >
        <AuroraBackground className="opacity-60 motion-reduce:opacity-30 motion-reduce:[&>div]:animate-none" />
        <Meteors number={18} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(165,180,252,0.22),transparent_55%)]"
        />
        {/* Subtle grain overlay using an inline SVG noise data-uri */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-5 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        <BorderBeam size={320} duration={16} colorFrom="#a78bfa" colorTo="#22d3ee" />

        <div className="relative mx-auto max-w-3xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-6xl">
            Try it in a{" "}
            <span className="bg-gradient-to-br from-violet-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              browser tab.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-white/70 md:text-lg">
            Sign in with an email code. Upload a file, hit ⌘K, ask the AI a
            question, beam it to another tab. 2 GB free, no card required.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                {isAuthenticated ? "Open dashboard" : "Create free account"}
                <ArrowRight aria-hidden="true" className="ml-2 size-4" />
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
      </motion.div>
    </section>
  );
}
