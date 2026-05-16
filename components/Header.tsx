import Image from "next/image";
import { LogOut, User as UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutUser } from "@/lib/actions/user.actions";

const Header = ({
  userId,
  accountId,
  fullName,
  email,
  avatar,
}: {
  userId: string;
  accountId: string;
  fullName?: string;
  email?: string;
  avatar?: string;
}) => {
  return (
    <header className="sticky top-0 z-20 hidden items-center justify-between gap-4 border-b border-border/60 bg-background/70 px-6 py-4 backdrop-blur-md lg:flex">
      <Search />

      <div className="flex items-center gap-2">
        <FileUploader ownerId={userId} accountId={accountId} />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="ring-focus relative rounded-full"
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt={fullName ?? "Account"}
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 rounded-full border border-border/60 object-cover transition-shadow hover:shadow-soft"
                />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-accent/40">
                  <UserIcon className="size-4 text-muted-foreground" />
                </span>
              )}
              <span
                aria-hidden
                className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium capitalize">
                {fullName ?? "Account"}
              </span>
              {email ? (
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOutUser} className="w-full">
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center gap-2 text-left"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
