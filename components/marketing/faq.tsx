"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How does the AI Workspace work, and which provider does it use?",
    a: "Ask AI sends your prompt and a short summary of your file list to Groq's hosted Llama 3.1. Answers stream back token-by-token. Files are not uploaded to the model — only names, sizes, and types are included as context. The feature is gated on a server-side GROQ_API_KEY; if it's missing, the Ask AI route is hidden from the sidebar.",
  },
  {
    q: "What is Beam?",
    a: "Beam transfers a file directly from one browser to another over WebRTC using PeerJS. The bytes never touch our server or the Appwrite bucket — only the small signaling handshake does. It's useful for moving a large file to another device on your network or to a friend, without using your storage quota.",
  },
  {
    q: "What's stored, and who can see my files?",
    a: "Files live in your Appwrite Storage bucket with per-document permissions scoped to your account. Other signed-in users can't list or read your files. Anyone you grant access to via a share link can read that single file until the link's expiry. There is no admin backdoor in the UI; the server-side API key is only used for OAuth callback lookups and provisioning.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. The full stack is built to run on free tiers: Vercel for hosting, Appwrite Cloud for auth + database + storage, and Groq for the AI. You get 2 GB of file storage on Appwrite's free plan. Groq's free tier has per-minute request and token rate limits — heavy AI use may hit them.",
  },
  {
    q: "How much can I store, and what happens when I delete a file?",
    a: "Each user is capped at 2 GB total, enforced against the Appwrite bucket. Deleting a file is a soft-delete: it moves to Trash with a deletedAt timestamp and is purged after 30 days. You can restore from Trash at any time before then. Individual uploads are capped at 50 MB by default.",
  },
  {
    q: "What happens when a share link expires?",
    a: "Public share links carry a token and an expiry timestamp. After expiry, the /share/<token> route returns a not-found page and the file can no longer be read by that link. You can revoke a link manually at any time, which clears both the token and the expiry from the file record.",
  },
  {
    q: "What are the current limits?",
    a: "Folders are single-level (no nesting yet). There are no team workspaces — each account is solo. Single-file uploads are capped at 50 MB. AI is rate-limited by Groq's free tier. These are tracked on the roadmap.",
  },
  {
    q: "Is this open source, and who built it?",
    a: "Yes — the full source is on GitHub under an MIT-style license. Nimbus is built and maintained by Mark Yu (m4rkyu.com) as a portfolio project. PRs and issues are welcome.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
      <script
        type="application/ld+json"
        // Inline because Next won't hoist server-side JSON-LD from a client component otherwise.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
                id={`faq-trigger-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-6"
              >
                <span className="text-sm font-medium sm:text-base">{f.q}</span>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
                    isOpen && "rotate-45 text-foreground",
                  )}
                  aria-hidden="true"
                >
                  <Plus className="size-3.5" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="overflow-hidden motion-reduce:!animate-none"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
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
