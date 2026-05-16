"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#stack", label: "Stack" },
  { href: "#faq", label: "FAQ" },
];

export function TopNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all",
        scrolled
          ? "border-b border-border/60 bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
            <Link
              href={siteConfig.repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
            >
              <Github className="size-4" />
            </Link>
          </Button>

          <ThemeToggle />

          <Button asChild className="hidden md:inline-flex">
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              {isAuthenticated ? "Open dashboard" : "Sign in"}
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="space-y-1 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur-xl">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Button asChild className="mt-2 w-full">
              <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                {isAuthenticated ? "Open dashboard" : "Sign in"}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
