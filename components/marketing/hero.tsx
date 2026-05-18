"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";

import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { AuroraBackground } from "@/components/magicui/aurora-background";
import { BorderBeam } from "@/components/magicui/border-beam";
import { siteConfig } from "@/constants";
import { cn } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden"
    >
      <AuroraBackground className="-z-20 opacity-70 motion-reduce:opacity-40 motion-reduce:[&>div]:animate-none" />

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
          "absolute inset-0 -z-10 size-full",
          "[mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]",
        )}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]"
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-14 text-center sm:px-5 sm:py-16 md:py-24 lg:px-8 lg:py-32">
        <motion.div {...fadeUp(0)}>
          <Link
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="group mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-[11px] font-medium shadow-soft backdrop-blur-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4 sm:text-xs"
          >
            <Sparkles aria-hidden="true" className="size-3 shrink-0 text-primary" />
            <AnimatedShinyText as="span" className="!mx-0 truncate">
              v2.2 — AI Workspace and Beam are live
            </AnimatedShinyText>
            <ArrowRight aria-hidden="true" className="size-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.h1
          {...fadeUp(0.05)}
          className="mx-auto max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Your files, plus an{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              AI
            </span>
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-violet-500/0 via-indigo-500/60 to-sky-500/0 blur-[1px]"
            />
          </span>{" "}
          that understands them.
        </motion.h1>

        <motion.p
          {...fadeUp(0.15)}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
        >
          Upload and organize into folders, share via short-lived links, beam files browser-to-browser, and ask AI questions about your workspace.
        </motion.p>

        <motion.div
          {...fadeUp(0.25)}
          className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
        >
          <div className="relative overflow-hidden rounded-md">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                {isAuthenticated ? "Open your dashboard" : "Get started — free"}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <BorderBeam
              size={120}
              duration={8}
              colorFrom="#a78bfa"
              colorTo="#22d3ee"
            />
          </div>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base"
          >
            <Link href={siteConfig.repoUrl} target="_blank" rel="noreferrer">
              <Github aria-hidden="true" className="mr-2 size-4" />
              Star on GitHub
              <span
                aria-hidden="true"
                className="ml-2 inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                <Star className="size-3" />
                1.2k
              </span>
            </Link>
          </Button>
        </motion.div>

        <motion.p
          {...fadeUp(0.4)}
          className="mt-6 text-xs text-muted-foreground"
        >
          No credit card · Passwordless · Self-hostable · 2 GB free
        </motion.p>

        <SocialProof />

        <HeroPreview scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}

function SocialProof() {
  const badges = [
    { label: "Next.js 16", from: "from-zinc-700", to: "to-black" },
    { label: "React 19", from: "from-sky-500", to: "to-indigo-500" },
    { label: "Appwrite", from: "from-pink-500", to: "to-rose-500" },
    { label: "Tailwind", from: "from-cyan-500", to: "to-sky-500" },
    { label: "Groq", from: "from-orange-500", to: "to-amber-500" },
    { label: "WebRTC", from: "from-emerald-500", to: "to-teal-500" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mt-10 flex flex-col items-center gap-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        Built with
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {badges.map((b) => (
          <span
            key={b.label}
            className={cn(
              "inline-flex items-center rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-foreground/80 shadow-soft backdrop-blur-sm",
            )}
          >
            <span
              className={cn(
                "mr-2 inline-block size-1.5 rounded-full bg-gradient-to-br",
                b.from,
                b.to,
              )}
            />
            {b.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function HeroPreview({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const prefersReducedMotion = useReducedMotion();
  // Subtle 3D tilt and lift as the user scrolls past the hero.
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const motionStyle = prefersReducedMotion
    ? undefined
    : { rotateX, scale, y, transformStyle: "preserve-3d" as const };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative mt-10 w-full max-w-5xl [perspective:1800px] motion-reduce:!transform-none sm:mt-16"
    >
      <div
        aria-hidden
        className="absolute inset-x-12 -top-12 -z-10 h-40 bg-gradient-to-br from-violet-500/30 via-indigo-500/30 to-sky-500/30 blur-3xl"
      />

      <motion.div
        style={motionStyle}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated motion-reduce:!transform-none"
      >
        <BorderBeam
          size={260}
          duration={14}
          colorFrom="#a78bfa"
          colorTo="#22d3ee"
        />
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
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 p-5 text-white">
                <div className="text-xs opacity-70">Storage</div>
                <div className="mt-2 text-3xl font-bold">62%</div>
                <div className="mt-1 text-xs opacity-70">1.24 GB / 2 GB</div>
                <div
                  aria-hidden
                  className="absolute -bottom-8 -right-8 size-32 rounded-full bg-white/10 blur-2xl"
                />
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
      </motion.div>
    </motion.div>
  );
}
