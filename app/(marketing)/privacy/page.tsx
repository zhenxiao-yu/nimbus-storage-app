import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/constants";

const LAST_UPDATED = "May 15, 2026";
const CONTACT_EMAIL = "privacy@nimbus.example";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Nimbus collects, uses, and protects your data. This is a portfolio/demo project.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <div className="mb-8 rounded-lg border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        <strong className="font-semibold text-foreground">Disclaimer:</strong>{" "}
        This is a portfolio/demo project. For real-world use, consult a lawyer.
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </header>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <p>
            {siteConfig.shortTitle} (&ldquo;we&rdquo;, &ldquo;our&rdquo;) is a
            cloud-storage portfolio project built on Appwrite, Next.js, and
            Vercel. This Privacy Policy explains what we collect when you use
            the service, why we collect it, and the choices you have.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            What we collect
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Account data:</strong> the
              email address and full name you submit when signing up.
            </li>
            <li>
              <strong className="text-foreground">OAuth profile:</strong> if you
              sign in with Google or GitHub, we receive your email, display
              name, and avatar URL from the provider. We do not request access
              to your contacts, repositories, or any other resources.
            </li>
            <li>
              <strong className="text-foreground">Files you upload:</strong>{" "}
              file contents, file names, sizes, MIME types, and the email
              addresses you choose to share files with.
            </li>
            <li>
              <strong className="text-foreground">Session cookie:</strong> an
              httpOnly cookie named{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                appwrite-session
              </code>{" "}
              that keeps you signed in.
            </li>
            <li>
              <strong className="text-foreground">Optional analytics:</strong>{" "}
              if you accept analytics cookies, Vercel Analytics and Speed
              Insights collect anonymized page-view and performance data.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            How we use it
          </h2>
          <p>
            We use your data to operate the service: authenticate you, store
            and serve your files, enable sharing, and improve reliability and
            performance. We do not sell your data, and we do not use it for
            advertising. Analytics data, when consented to, is used in
            aggregate to understand which features are useful.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Who we share with
          </h2>
          <p>
            Your data is processed by two infrastructure providers acting as
            data processors on our behalf:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Appwrite Cloud:</strong>{" "}
              hosts authentication, the database of file metadata, and the
              storage bucket containing your file contents.
            </li>
            <li>
              <strong className="text-foreground">Vercel:</strong> hosts the
              Next.js application and, optionally, provides Analytics and Speed
              Insights.
            </li>
          </ul>
          <p>
            We do not share your data with third-party advertising networks or
            data brokers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Your rights</h2>
          <p>
            You can sign in and at any time: access the files and metadata
            associated with your account, rename or delete individual files,
            revoke sharing, and delete your account. On request we will export
            a machine-readable copy of your data or permanently delete it.
          </p>
          <p>
            Depending on where you live, you may have additional rights under
            GDPR, UK GDPR, or CCPA — including the right to object, the right
            to data portability, and the right to lodge a complaint with a
            supervisory authority.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
          <p>
            For details about each cookie and storage key we use, see our{" "}
            <Link
              href="/cookies"
              className="text-foreground underline underline-offset-2"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>
            Questions or data requests:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            . As this is a portfolio project, replies are best-effort.
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
