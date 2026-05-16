"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Github } from "@/components/icons/brand-icons";

import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/logo";
import { navItems, siteConfig } from "@/constants";
import { cn } from "@/lib/utils";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
}

const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-sm lg:flex">
      <div className="px-6 pb-4 pt-7">
        <Logo size="md" href="/dashboard" />
      </div>

      <nav className="flex-1 px-3">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Workspace
        </p>
        <ul className="space-y-1">
          {navItems.map(({ url, name, icon: Icon }) => {
            const active =
              url === "/dashboard"
                ? pathname === url
                : pathname === url || pathname.startsWith(`${url}/`);
            return (
              <li key={name} className="relative">
                {active && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    aria-hidden
                    className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/15"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Link
                  href={url}
                  className={cn(
                    "ring-focus group relative z-10 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-4 shrink-0 transition-transform motion-reduce:transition-none",
                      "group-hover:scale-110",
                      active && "text-primary",
                    )}
                  />
                  <span>{name}</span>
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-dot"
                      aria-hidden
                      className="ml-auto size-1.5 rounded-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-border/60 p-3">
        <Link
          href={siteConfig.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="ring-focus group flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 text-sm transition-colors hover:bg-accent/40"
        >
          <span className="flex items-center gap-2 text-foreground">
            <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
            <span className="font-medium">Star on GitHub</span>
          </span>
          <Github
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-hover:scale-110 motion-reduce:transition-none"
          />
        </Link>

        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="relative">
            <Avatar
              name={fullName}
              email={email}
              src={avatar}
              size={40}
              className="size-10 border border-border/60 ring-2 ring-primary/20 ring-offset-2 ring-offset-card"
            />
            <span
              aria-hidden
              className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium capitalize">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
