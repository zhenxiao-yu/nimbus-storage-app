import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/constants";

const LAST_UPDATED = "May 15, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Nimbus. This is a portfolio/demo project.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <div className="mb-8 rounded-lg border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        <strong className="font-semibold text-foreground">Disclaimer:</strong>{" "}
        This is a portfolio/demo project. For real-world use, consult a lawyer.
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </header>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Acceptance of terms
          </h2>
          <p>
            By creating an account or using {siteConfig.shortTitle}, you agree
            to these Terms of Service and our{" "}
            <Link
              href="/privacy"
              className="text-foreground underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            . If you do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Your account</h2>
          <p>
            You are responsible for the activity that occurs under your
            account, including keeping your email and any third-party OAuth
            credentials secure. You must be old enough to enter into a binding
            contract in your jurisdiction. One account per natural person; do
            not impersonate others.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Acceptable use
          </h2>
          <p>You agree not to use the service to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Upload, store, or share content that is illegal where you live
              or where the service is operated, including content that
              infringes intellectual property rights.
            </li>
            <li>
              Distribute malware, phishing pages, or other content that harms
              or attempts to harm users or systems.
            </li>
            <li>
              Attempt to gain unauthorized access to the service, other
              accounts, or underlying infrastructure (Appwrite, Vercel).
            </li>
            <li>
              Use the service to send unsolicited communications or to abuse
              shared-file functionality.
            </li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate these terms
            without prior notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Your content
          </h2>
          <p>
            You retain all rights to the files you upload. We do not claim
            ownership of your content. You grant us a limited, non-exclusive
            license solely to store, transmit, and display your content to you
            and the people you share it with, for the purpose of operating
            the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Service availability
          </h2>
          <p>
            The service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo;, without warranties of any kind, express or
            implied. Because this is a portfolio project, the service may
            change, be temporarily unavailable, or be discontinued at any
            time. We recommend keeping your own backups of important files.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, we are not liable for any
            indirect, incidental, special, consequential, or punitive damages
            arising from your use of the service, including loss of data,
            profits, or goodwill. Your sole remedy for dissatisfaction is to
            stop using the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Indemnification
          </h2>
          <p>
            You agree to indemnify and hold harmless the project author and
            contributors from any claims, damages, or expenses arising out of
            your use of the service or your violation of these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Governing law
          </h2>
          <p>
            These terms are governed by the laws of the jurisdiction in which
            the project author resides (placeholder — update for any
            production deployment). Disputes will be resolved in the courts
            of that jurisdiction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Changes</h2>
          <p>
            We may update these terms from time to time. Material changes will
            be reflected in the &ldquo;Last updated&rdquo; date above.
            Continued use after a change constitutes acceptance.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-border/60 pt-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to home
        </Link>
      </div>
    </article>
  );
}
