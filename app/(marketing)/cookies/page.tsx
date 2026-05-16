import type { Metadata } from "next";
import Link from "next/link";

import { CookiePreferencesButton } from "@/components/marketing/cookie-preferences-button";

const LAST_UPDATED = "May 15, 2026";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How Nimbus uses cookies and browser storage, and how to manage your preferences.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <div className="mb-8 rounded-lg border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        <strong className="font-semibold text-foreground">Disclaimer:</strong>{" "}
        This is a portfolio/demo project. For real-world use, consult a lawyer.
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </header>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            What are cookies?
          </h2>
          <p>
            Cookies are small files stored on your device by your browser.
            &ldquo;Browser storage&rdquo; (localStorage) is a related mechanism
            we also use. Together they let us remember your session and your
            preferences across visits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Categories</h2>
          <p>
            We group cookies and storage into two categories. You can change
            optional categories at any time using the button below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Necessary (always on)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="px-3 py-2 font-mono">appwrite-session</td>
                  <td className="px-3 py-2">Session cookie (httpOnly)</td>
                  <td className="px-3 py-2">
                    Keeps you signed in. Set after you complete OTP or OAuth
                    sign-in.
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono">nimbus-consent-v1</td>
                  <td className="px-3 py-2">localStorage</td>
                  <td className="px-3 py-2">
                    Remembers your cookie-banner choice so we do not ask again
                    on every visit.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Analytics (optional)
          </h2>
          <p>
            Loaded only if you opt in. Helps us understand which features are
            useful and how the app performs. Data is anonymized and never
            includes file contents.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="px-3 py-2">Vercel Analytics</td>
                  <td className="px-3 py-2">Anonymized cookies</td>
                  <td className="px-3 py-2">
                    Aggregate page views, referrers, and country-level
                    information.
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Vercel Speed Insights</td>
                  <td className="px-3 py-2">Anonymized cookies</td>
                  <td className="px-3 py-2">
                    Real-user performance metrics (Core Web Vitals).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Manage preferences
          </h2>
          <p>
            You can update your choices at any time. Clearing your browser
            storage will also reset your preferences and re-show the banner.
          </p>
          <CookiePreferencesButton />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">More info</h2>
          <p>
            See our{" "}
            <Link
              href="/privacy"
              className="text-foreground underline underline-offset-2"
            >
              Privacy Policy
            </Link>{" "}
            for how data is processed, and our{" "}
            <Link
              href="/terms"
              className="text-foreground underline underline-offset-2"
            >
              Terms of Service
            </Link>
            .
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
