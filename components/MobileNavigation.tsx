"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";
import { navItems } from "@/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";

interface Props {
  $id: string; // Unique ID of the user
  accountId: string; // Associated account ID
  fullName: string; // Full name of the user
  avatar: string; // URL of the user's avatar image
  email: string; // Email address of the user
}

const MobileNavigation = ({
  $id: ownerId,
  accountId,
  fullName,
  avatar,
  email,
}: Props) => {
  const [open, setOpen] = useState(false); // State to manage the menu's visibility
  const pathname = usePathname(); // Current active path

  return (
    <header className="mobile-header">
      {/* Logo Section */}
      <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="logo"
        width={120}
        height={52}
        className="h-auto"
      />

      {/* Mobile Navigation Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Menu Trigger */}
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="Menu"
            width={30}
            height={30}
          />
        </SheetTrigger>

        {/* Drawer Content */}
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            {/* User Info Section */}
            <div className="header-user">
              <Image
                src={avatar}
                alt="avatar"
                width={44}
                height={44}
                className="header-user-avatar"
              />
              <div className="sm:hidden lg:block">
                <p className="subtitle-2 capitalize">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/20" />
          </SheetTitle>

          {/* Navigation Links */}
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => (
                <Link key={name} href={url} className="lg:w-full">
                  <li
                    className={cn(
                      "mobile-nav-item transition-all duration-300 ease-in-out hover:bg-gray-200 hover:scale-105 hover:shadow-md",
                      pathname === url && "shad-active", // Highlight active link
                    )}
                  >
                    {/* Navigation Icon */}
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon transition-transform duration-300 ease-in-out hover:scale-110",
                        pathname === url && "nav-icon-active",
                      )}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </nav>

          <Separator className="my-5 bg-light-200/20" />

          {/* File Uploader and Sign-Out Button */}
          <div className="flex flex-col justify-between gap-5 pb-5">
            {/* File Uploader Component */}
            <FileUploader ownerId={ownerId} accountId={accountId} />

            {/* Logout Button */}
            <Button
              type="submit"
              className="mobile-sign-out-button hover:bg-red-600 flex items-center gap-2 transition-all duration-300 hover:scale-105"
              onClick={async () => await signOutUser()}
            >
              <Image
                src="/assets/icons/logout.svg"
                alt="Logout"
                width={30}
                height={30}
              />
              <p>Logout</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
