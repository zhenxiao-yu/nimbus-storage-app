"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is Nimbus free to run?",
    a: "Yes. Nimbus targets the Vercel + Appwrite Cloud free tier. You get 2 GB of file storage and unlimited deploys without paying anything.",
  },
  {
    q: "Why no password authentication?",
    a: "Passwordless OTP via email is more secure for users (no reused passwords) and simpler to maintain. Sessions are HttpOnly cookies signed by Appwrite.",
  },
  {
    q: "Can I self-host this?",
    a: "Absolutely. Bring your own Appwrite instance (cloud or self-hosted) and deploy to any Node-compatible host. The repo includes a one-click Vercel button.",
  },
  {
    q: "What about file size limits?",
    a: "Single-file uploads are capped at 50 MB by default — adjustable via MAX_FILE_SIZE in the constants module and bodySizeLimit in next.config.ts.",
  },
  {
    q: "Is there a roadmap?",
    a: "Folders, tagging, link-with-expiry sharing, PWA offline support, and richer notifications are all on deck. PRs welcome.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10 text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          FAQ
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Questions you might be having.
        </h2>
      </motion.div>

      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={f.q}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-accent/30"
              >
                <span className="text-base font-medium">{f.q}</span>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-45 text-foreground",
                  )}
                  aria-hidden
                >
                  <Plus className="size-3.5" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
