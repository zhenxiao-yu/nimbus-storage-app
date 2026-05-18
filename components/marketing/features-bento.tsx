"use client";

import { motion } from "framer-motion";
import {
  Cloud,
  Command,
  Eye,
  FolderTree,
  Layers,
  Radio,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { cn } from "@/lib/utils";

// Bento tile backgrounds ----------------------------------------------------

function AIChatPreview() {
  const turns = [
    { who: "you", text: "Summarize Q4 report" },
    { who: "ai", text: "3 highlights: revenue +18%, churn -2%, new ARR $1.4M." },
    { who: "you", text: "Which files mention onboarding?" },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_20%,black)]">
      <div className="w-72 max-w-[90%] space-y-1.5 rounded-xl border border-border/60 bg-card p-3 shadow-soft">
        {turns.map((t, i) => (
          <div
            key={i}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-[11px]",
              t.who === "ai"
                ? "bg-gradient-to-br from-violet-500/15 to-indigo-500/10 text-foreground"
                : "bg-muted/50 text-muted-foreground",
            )}
          >
            <span className="mr-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t.who}
            </span>
            {t.text}
          </div>
        ))}
        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          Groq · Llama 3.1
        </div>
      </div>
    </div>
  );
}

function BeamPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_20%,black)]">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-xl border border-border/60 bg-card text-[10px] font-medium shadow-soft">
          A
        </div>
        <div className="relative h-px w-24 bg-gradient-to-r from-violet-500/0 via-indigo-500 to-sky-500/0">
          <motion.span
            initial={{ x: 0, opacity: 0 }}
            whileInView={{ x: 96, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1 size-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
          />
        </div>
        <div className="flex size-14 items-center justify-center rounded-xl border border-border/60 bg-card text-[10px] font-medium shadow-soft">
          B
        </div>
      </div>
    </div>
  );
}

function CommandPalettePreview() {
  const items = [
    { label: "Upload file", hint: "U" },
    { label: "New folder", hint: "N" },
    { label: "Open Trash", hint: "T" },
    { label: "Ask AI", hint: "A" },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_20%,black)]">
      <div className="w-72 max-w-[90%] rounded-xl border border-border/60 bg-card shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 text-xs">
          <Command className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Type a command…</span>
          <span className="ml-auto rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </span>
        </div>
        <ul className="p-1">
          {items.map((it) => (
            <li
              key={it.label}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] hover:bg-accent/40"
            >
              <span>{it.label}</span>
              <span className="rounded-sm border border-border/60 bg-muted/40 px-1 py-px font-mono text-[10px] text-muted-foreground">
                {it.hint}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RealtimePreview() {
  const events = [
    { who: "alex", action: "uploaded", file: "design-v3.pdf" },
    { who: "jordan", action: "renamed", file: "Q4-report.docx" },
    { who: "sam", action: "shared", file: "logo.png" },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_20%,black)]">
      <div className="w-72 max-w-[90%] space-y-1.5 rounded-xl border border-border/60 bg-card p-3 shadow-soft">
        {events.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px]"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span className="text-muted-foreground">
              <span className="text-foreground">{e.who}</span> {e.action}{" "}
              <span className="text-foreground">{e.file}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FoldersPreview() {
  const rows = [
    { name: "Invoices", count: 12, active: true },
    { name: "Design", count: 31 },
    { name: "Trash", count: 4, danger: true },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_20%,black)]">
      <div className="w-64 max-w-[90%] space-y-1 rounded-xl border border-border/60 bg-card p-2 shadow-soft">
        {rows.map((r) => (
          <div
            key={r.name}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px]",
              r.active && "bg-primary/10 text-foreground",
            )}
          >
            <FolderTree
              className={cn(
                "size-3.5",
                r.danger ? "text-red-500" : "text-indigo-500",
              )}
            />
            <span>{r.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {r.count}
            </span>
          </div>
        ))}
        <div className="mt-1.5 flex items-center gap-2 rounded-md border border-dashed border-border/60 px-2 py-1.5 text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          share link · expires in 24h
        </div>
      </div>
    </div>
  );
}

function MultiSelectPreview() {
  const files = [
    { name: "screenshot-1.png", checked: true },
    { name: "screenshot-2.png", checked: true },
    { name: "screenshot-3.png", checked: false },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_20%,black)]">
      <div className="w-72 max-w-[90%] rounded-xl border border-border/60 bg-card shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 text-[11px]">
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            2 selected
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            Space to peek
          </span>
        </div>
        <ul className="p-1">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px]"
            >
              <span
                className={cn(
                  "flex size-3.5 items-center justify-center rounded border",
                  f.checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {f.checked && <Eye className="size-2" />}
              </span>
              <span className="size-5 rounded-sm bg-gradient-to-br from-violet-400/40 to-sky-400/40" />
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Tiles ---------------------------------------------------------------------

const features = [
  {
    Icon: Sparkles,
    name: "AI Workspace",
    description:
      "Ask questions about your files in plain English. Streamed answers from Llama 3.1 via Groq.",
    href: "/dashboard/ai",
    cta: "Try Ask AI",
    className: "col-span-3 md:col-span-2",
    background: <AIChatPreview />,
  },
  {
    Icon: Send,
    name: "Beam — peer to peer",
    description:
      "Send a file straight to another browser over WebRTC. No upload, no relay.",
    href: "/dashboard",
    cta: "Open Beam",
    className: "col-span-3 md:col-span-1",
    background: <BeamPreview />,
  },
  {
    Icon: Command,
    name: "Command palette",
    description:
      "Hit ⌘K to jump anywhere, run actions, and search files without leaving the keyboard.",
    href: "/dashboard",
    cta: "See shortcuts",
    className: "col-span-3 md:col-span-1",
    background: <CommandPalettePreview />,
  },
  {
    Icon: Radio,
    name: "Realtime sync",
    description:
      "Uploads, renames, and shares appear instantly across every open tab via Appwrite Realtime.",
    href: "/dashboard",
    cta: "Open dashboard",
    className: "col-span-3 md:col-span-2",
    background: <RealtimePreview />,
  },
  {
    Icon: FolderTree,
    name: "Folders, Trash, and share links",
    description:
      "Organize into folders. Soft-delete with 30-day Trash. Share via tokenized links that expire on schedule.",
    href: "/dashboard",
    cta: "Open dashboard",
    className: "col-span-3 md:col-span-2",
    background: <FoldersPreview />,
  },
  {
    Icon: Eye,
    name: "Multi-select & Quick Look",
    description:
      "Select many files for bulk actions. Press Space to peek without opening — like macOS Quick Look.",
    href: "/dashboard",
    cta: "Try it",
    className: "col-span-3 md:col-span-1",
    background: <MultiSelectPreview />,
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
    name: "Free-tier friendly",
    desc: "Vercel + Appwrite Cloud + Groq free tiers stack — $0 to host.",
  },
  {
    Icon: Layers,
    name: "Type-safe",
    desc: "End-to-end TypeScript. Zod-validated inputs at boundaries.",
  },
  {
    Icon: Sparkles,
    name: "PWA-ready",
    desc: "Installable, offline shell, and a thoughtful onboarding file.",
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
          More than a file dropper.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Folders, realtime, AI, peer-to-peer transfer, and a keyboard-first
          surface — all wired into a single, focused workspace.
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
