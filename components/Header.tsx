import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";

/**
 * Header Component
 * Renders the header section of the application, including a search bar, file uploader, and sign-out button.
 * @param userId - The ID of the currently logged-in user.
 * @param accountId - The ID of the user's associated account.
 */
const Header = ({
  userId,
  accountId,
}: {
  userId: string; // Unique ID of the user
  accountId: string; // ID of the associated account
}) => {
  return (
    <header className="header">
      {/* Search component for querying or filtering data */}
      <Search />

      <div className="header-wrapper">
        {/* FileUploader component to upload files, passing user and account IDs */}
        <FileUploader ownerId={userId} accountId={accountId} />

        {/* Sign-out button with a server action to log out the user */}
        <form
          action={async () => {
            "use server"; // Indicates a server-side action
            await signOutUser(); // Calls the sign-out logic
          }}
        >
          <Button type="submit" className="sign-out-button">
            {/* Logout icon */}
            <Image
              src="/assets/icons/logout.svg"
              alt="Sign Out"
              width={34}
              height={34}
              className="w-9"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;
