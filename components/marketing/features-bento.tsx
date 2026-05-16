"use client";

import { motion } from "framer-motion";
import {
  Cloud,
  Layers,
  Lock,
  Search,
  Share2,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

const fileTypes = [
  { ext: "PDF", color: "from-red-500/15 to-red-500/5", text: "text-red-500" },
  {
    ext: "DOCX",
    color: "from-blue-500/15 to-blue-500/5",
    text: "text-blue-500",
  },
  {
    ext: "PNG",
    color: "from-violet-500/15 to-violet-500/5",
    text: "text-violet-500",
  },
  {
    ext: "MP4",
    color: "from-amber-500/15 to-amber-500/5",
    text: "text-amber-500",
  },
  {
    ext: "ZIP",
    color: "from-emerald-500/15 to-emerald-500/5",
    text: "text-emerald-500",
  },
  {
    ext: "MP3",
    color: "from-pink-500/15 to-pink-500/5",
    text: "text-pink-500",
  },
];

// Stylized animated storage bar-chart used as a tile background.
function AnimatedBars() {
  const bars = [
    { label: "Mon", h: 28 },
    { label: "Tue", h: 52 },
    { label: "Wed", h: 41 },
    { label: "Thu", h: 70 },
    { label: "Fri", h: 88 },
    { label: "Sat", h: 60 },
    { label: "Sun", h: 76 },
  ];
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-2 p-8 pb-16 [mask-image:linear-gradient(to_top,transparent_15%,black)]">
      {bars.map((b, i) => (
        <motion.div
          key={b.label}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            delay: i * 0.06,
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ height: `${b.h}%`, transformOrigin: "bottom" }}
          className="w-6 rounded-md bg-gradient-to-t from-indigo-500/80 via-violet-500/70 to-sky-400/70"
        />
      ))}
    </div>
  );
}

function ShareLinkPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_25%,black)]">
      <div className="w-72 max-w-[90%] rounded-xl border border-border/60 bg-card p-3 shadow-soft">
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 font-mono text-[11px]">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="truncate text-muted-foreground">
            nimbus.app/s/
            <span className="text-foreground">a91-design-v2.pdf</span>
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {["a@m4rkyu.com", "team@nimbus.app", "you@example.com"].map((e) => (
            <div
              key={e}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px]"
            >
              <span className="size-5 rounded-full bg-gradient-to-br from-violet-400 to-sky-400" />
              <span className="truncate">{e}</span>
              <span className="ml-auto rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    Icon: Upload,
    name: "Drag, drop, done.",
    description:
      "Upload any file with a single drop. We auto-classify it as a document, image, media, or other.",
    href: "/dashboard",
    cta: "Open dashboard",
    className: "col-span-3 md:col-span-2",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:25s] [mask-image:linear-gradient(to_top,transparent_30%,black)]"
      >
        {fileTypes.map((f) => (
          <figure
            key={f.ext}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border border-border/60 p-4",
              "bg-gradient-to-br",
              f.color,
              "transform-gpu transition-all duration-300 hover:scale-105",
            )}
          >
            <p className={cn("text-sm font-bold", f.text)}>{f.ext}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              auto-detected
            </p>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Search,
    name: "Find anything, instantly.",
    description:
      "Debounced full-text search across every file you've uploaded.",
    href: "/dashboard",
    cta: "Try search",
    className: "col-span-3 md:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_15%,black)]">
        <div className="w-full max-w-[260px] translate-y-3 rounded-xl border border-border/60 bg-card p-2 shadow-soft">
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
            <Search className="size-3.5 text-muted-foreground" />
            <span className="text-xs">invoice</span>
            <span className="ml-auto h-3.5 w-px animate-caret-blink bg-muted-foreground/60" />
          </div>
          <div className="mt-2 space-y-1.5">
            {["invoice-2026.pdf", "invoice-template.docx"].map((n) => (
              <div
                key={n}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] hover:bg-accent/40"
              >
                <span className="size-2 rounded-sm bg-primary" />
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    Icon: Share2,
    name: "Share, with control.",
    description:
      "Share any file with anyone — revoke access in a single click.",
    href: "/dashboard",
    cta: "Share something",
    className: "col-span-3 md:col-span-1",
    background: <ShareLinkPreview />,
  },
  {
    Icon: Zap,
    name: "Usage at a glance.",
    description:
      "Beautiful charts show how your storage trends week over week.",
    href: "/dashboard",
    cta: "See dashboard",
    className: "col-span-3 md:col-span-2",
    background: <AnimatedBars />,
  },
  {
    Icon: Lock,
    name: "Passwordless & secure.",
    description:
      "Magic-link OTP via Appwrite. HttpOnly cookies, strict same-site, no passwords to leak.",
    href: "/login",
    cta: "Sign in",
    className: "col-span-3",
    background: (
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]"
      />
    ),
  },
];

const meta = [
  {
    Icon: Zap,
    name: "Server actions",
    desc: "All mutations run as Next.js server actions over Appwrite.",
  },
  {
    Icon: Cloud,
    name: "Free-tier ready",
    desc: "Runs on Vercel + Appwrite Cloud free tier — $0 to host.",
  },
  {
    Icon: Layers,
    name: "Type-safe",
    desc: "End-to-end TypeScript. Zod-validated inputs at boundaries.",
  },
  {
    Icon: Sparkles,
    name: "Designed in 2026",
    desc: "Light + dark, animated gradients, polished empty/loading states.",
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto mb-12 max-w-2xl text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Features
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          A focused, fast, friendly file workspace.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Nimbus keeps the surface area small on purpose. Upload, organize,
          share, find. Done.
        </p>
      </motion.div>

      <BentoGrid>
        {features.map((f, i) => {
          const { className: colClass, ...rest } = f;
          return (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.08,
              }}
              className={cn(colClass, "motion-reduce:!transform-none")}
            >
              <BentoCard {...rest} className="col-span-3 h-full" />
            </motion.div>
          );
        })}
      </BentoGrid>

      <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {meta.map(({ Icon, name, desc }, i) => (
          <motion.li
            key={name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-colors hover:border-border"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <p className="mt-3 text-sm font-semibold">{name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
