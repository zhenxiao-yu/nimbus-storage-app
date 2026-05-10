import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutUser } from "@/lib/actions/user.actions";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  return (
    <header className="sticky top-0 z-20 hidden items-center justify-between gap-4 border-b border-border/60 bg-background/70 px-6 py-4 backdrop-blur-md lg:flex">
      <Search />

      <div className="flex items-center gap-2">
        <FileUploader ownerId={userId} accountId={accountId} />
        <ThemeToggle />
        <form
          action={async () => {
            "use server";
            await signOutUser();
          }}
        >
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Sign out"
          >
            <LogOut className="size-5" />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;
