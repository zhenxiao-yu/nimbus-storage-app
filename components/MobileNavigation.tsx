"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import FileUploader from "@/components/FileUploader";
import Search from "@/components/Search";
import { ThemeToggle } from "@/components/theme-toggle";
import { navItems, resolveAvatarUrl } from "@/constants";
import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/actions/user.actions";

interface Props {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}

const MobileNavigation = ({
  $id: ownerId,
  accountId,
  fullName,
  avatar,
  email,
}: Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md lg:hidden">
      <div className="shrink-0">
        <Logo size="sm" href="/dashboard" />
      </div>

      <div className="min-w-0 flex-1">
        <Search />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
            >
              <Menu aria-hidden="true" className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(320px,85vw)] p-0 sm:max-w-sm">
            <SheetHeader className="border-b border-border/60 p-5">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex items-center gap-3">
                <Image
                  src={resolveAvatarUrl(avatar, fullName || email)}
                  alt={fullName}
                  width={44}
                  height={44}
                  unoptimized
                  className="size-11 rounded-full border border-border/60 ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize">
                    {fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {email}
                  </p>
                </div>
              </div>
            </SheetHeader>

            <nav className="flex flex-col gap-1 p-3">
              {navItems.map(({ url, name, icon: Icon }) => {
                const active =
                  url === "/dashboard"
                    ? pathname === url
                    : pathname === url || pathname.startsWith(`${url}/`);
                return (
                  <Link
                    key={name}
                    href={url}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {name}
                  </Link>
                );
              })}
            </nav>

            <Separator />

            <div className="flex flex-col gap-3 p-4">
              <FileUploader
                ownerId={ownerId}
                accountId={accountId}
                className="w-full"
              />

              <form action={signOutUser}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  Sign out
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default MobileNavigation;
