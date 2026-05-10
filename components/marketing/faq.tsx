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
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          FAQ
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Questions you might be having.
        </h2>
      </div>
      <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
        {faqs.map((f) => (
          <li key={f.q}>
            <details className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4">
                <span className="text-base font-medium">{f.q}</span>
                <span className="text-2xl text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
