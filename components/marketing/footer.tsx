import Link from "next/link";
import { Globe, Heart } from "lucide-react";
import { Github, Twitter } from "@/components/icons/brand-icons";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/constants";
import { CookiePreferencesButton } from "@/components/marketing/cookie-preferences-button";

const socials = [
  {
    href: siteConfig.repoUrl,
    label: "GitHub",
    Icon: Github,
  },
  {
    href: "https://twitter.com/m4rkyu",
    label: "Twitter",
    Icon: Twitter,
  },
  {
    href: siteConfig.authorUrl,
    label: "Website",
    Icon: Globe,
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 bg-card/30">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-5 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Icon aria-hidden="true" className="size-3.5" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Product</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href="/dashboard">
                Dashboard
              </Link>
            </li>
            <li>
              <Link className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href="/login">
                Sign in
              </Link>
            </li>
            <li>
              <Link className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href="/register">
                Create account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Project</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                className="inline-flex items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                href={siteConfig.repoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Github aria-hidden="true" className="size-3.5" /> Source
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                href={siteConfig.authorUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Globe aria-hidden="true" className="size-3.5" /> Author
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                href="https://twitter.com/m4rkyu"
                target="_blank"
                rel="noreferrer"
              >
                <Twitter aria-hidden="true" className="size-3.5" /> Twitter
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Legal</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href="/privacy">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href="/terms">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href="/cookies">
                Cookie Policy
              </Link>
            </li>
            <li>
              <CookiePreferencesButton
                variant="link"
                className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
              >
                Cookie preferences
              </CookiePreferencesButton>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 p-5 text-xs text-muted-foreground sm:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.author}. Open source under
            the MIT license.
          </p>
          <p className="inline-flex items-center gap-1.5">
            Built with{" "}
            <Heart aria-hidden="true" className="size-3 text-rose-500" />{" "}
            <span className="sr-only">love</span> using Next.js, Appwrite &amp;
            shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  );
}
