"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { siteConfig } from "@/constants";
import { cn } from "@/lib/utils";

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative isolate overflow-hidden">
      <GridPattern
        width={48}
        height={48}
        x={-1}
        y={-1}
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [12, 3],
          [10, 5],
          [15, 4],
        ]}
        className={cn(
          "absolute inset-0 h-full w-full",
          "[mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]",
        )}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]"
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-5 py-16 text-center md:py-24 lg:px-8 lg:py-32">
        <Link
          href={siteConfig.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium shadow-soft backdrop-blur-sm transition-colors hover:bg-accent/40"
        >
          <Sparkles className="size-3 text-primary" />
          <AnimatedShinyText className="!mx-0">
            <span>v1.0 — open source on GitHub</span>
          </AnimatedShinyText>
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Cloud storage that gets{" "}
          <span className="bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
            out of your way.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
        >
          Nimbus is a modern, end-to-end cloud workspace for your files — built
          on Appwrite, Next.js, and shadcn/ui. Free to deploy, easy to extend,
          yours to own.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              {isAuthenticated ? "Open your dashboard" : "Get started — free"}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base"
          >
            <Link
              href={siteConfig.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Github className="mr-2 size-4" />
              Star on GitHub
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-xs text-muted-foreground"
        >
          No credit card · Passwordless · Self-hostable
        </motion.p>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative mt-16 w-full max-w-5xl"
    >
      <div className="absolute inset-x-12 -top-12 -z-10 h-40 bg-gradient-to-br from-violet-500/30 via-indigo-500/30 to-sky-500/30 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
        <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/30 px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-yellow-400/70" />
          <span className="size-2.5 rounded-full bg-green-400/70" />
          <span className="ml-3 text-xs text-muted-foreground">
            nimbus.app/dashboard
          </span>
        </div>
        <div className="grid grid-cols-12 gap-3 p-3 sm:p-5">
          <div className="col-span-3 hidden flex-col gap-2 rounded-lg bg-muted/30 p-3 sm:flex">
            <div className="h-6 w-24 rounded bg-muted" />
            <div className="mt-3 h-3 w-16 rounded bg-muted/70" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md p-2"
                style={{
                  background:
                    i === 0 ? "hsl(var(--primary) / 0.1)" : "transparent",
                }}
              >
                <div className="size-3.5 rounded bg-muted-foreground/40" />
                <div className="h-2.5 w-16 rounded bg-muted-foreground/30" />
              </div>
            ))}
          </div>
          <div className="col-span-12 sm:col-span-9">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 p-5 text-white">
                <div className="text-xs opacity-70">Storage</div>
                <div className="mt-2 text-3xl font-bold">62%</div>
                <div className="mt-1 text-xs opacity-70">1.24 GB / 2 GB</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Documents", "Images", "Media", "Others"].map((label, i) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border/60 bg-card p-3"
                  >
                    <div
                      className="size-7 rounded-md"
                      style={{
                        background: [
                          "hsl(239 84% 67% / 0.15)",
                          "hsl(262 83% 58% / 0.15)",
                          "hsl(199 89% 48% / 0.15)",
                          "hsl(38 92% 50% / 0.15)",
                        ][i],
                      }}
                    />
                    <div className="mt-3 text-base font-semibold">
                      {[428, 1.2, 320, 86][i]}
                      {[" MB", " GB", " MB", " MB"][i]}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-3 w-12 rounded bg-muted/70" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-1/2 rounded bg-muted" />
                      <div className="h-2 w-1/4 rounded bg-muted/70" />
                    </div>
                    <div className="size-2 rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
