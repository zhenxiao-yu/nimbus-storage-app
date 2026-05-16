import { LogOut } from "lucide-react";

import { Avatar } from "@/components/Avatar";

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
              <Avatar
                name={fullName}
                email={email}
                src={avatar}
                size={36}
                className="size-9 border border-border/60 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-shadow hover:shadow-soft"
              />
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
                  <LogOut aria-hidden="true" className="size-4" />
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
