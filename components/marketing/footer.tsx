import Link from "next/link";
import { Globe } from "lucide-react";
import { Github, Twitter } from "@/components/icons/brand-icons";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3 lg:col-span-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Product</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="hover:text-foreground" href="/dashboard">
                Dashboard
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/login">
                Sign in
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/register">
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
                className="inline-flex items-center gap-1.5 hover:text-foreground"
                href={siteConfig.repoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Github className="size-3.5" /> Source
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex items-center gap-1.5 hover:text-foreground"
                href={siteConfig.authorUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Globe className="size-3.5" /> Author
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex items-center gap-1.5 hover:text-foreground"
                href="https://twitter.com/m4rkyu"
                target="_blank"
                rel="noreferrer"
              >
                <Twitter className="size-3.5" /> Twitter
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.author}. Open source under
            the MIT license.
          </p>
          <p>
            Built with Next.js, Appwrite, shadcn/ui &amp; Magic UI patterns.
          </p>
        </div>
      </div>
    </footer>
  );
}
