"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  fullName: string; // User's full name to display in the sidebar
  avatar: string; // URL of the user's avatar image
  email: string; // User's email address
}

const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname(); // Current active path

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <Link href="/">
        {/* Full logo for large screens */}
        <Image
          src="/assets/icons/logo-full-brand.svg"
          alt="logo"
          width={360}
          height={120}
          className="hidden h-auto lg:block"
        />

        {/* Compact logo for smaller screens */}
        <Image
          src="/assets/icons/logo-brand.svg"
          alt="logo"
          width={52}
          height={52}
          className="lg:hidden"
        />
      </Link>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-6">
          {navItems.map(({ url, name, icon }) => (
            <Link key={name} href={url} className="lg:w-full">
              {/* Sidebar navigation item */}
              <li
                className={cn(
                  "sidebar-nav-item transition-all duration-300 hover:bg-gray-200 hover:scale-105 hover:shadow-md",
                  pathname === url && "shad-active", // Highlight active route
                )}
              >
                {/* Icon for the navigation item */}
                <Image
                  src={icon}
                  alt={name}
                  width={24}
                  height={24}
                  className={cn(
                    "nav-icon",
                    pathname === url && "nav-icon-active", // Highlight active icon
                  )}
                />
                {/* Label for the navigation item (visible on larger screens) */}
                <p className="hidden lg:block">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
      </nav>

      {/* Image Section */}
      <Image
        src="/assets/images/files-2.png"
        alt="Sidebar image"
        width={506}
        height={418}
        className="w-full"
      />

      {/* User Information Section */}
      <div className="sidebar-user-info">
        {/* User's avatar */}
        <Image
          src={avatar}
          alt="Avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />
        {/* User details for larger screens */}
        <div className="hidden lg:block">
          <p className="subtitle-2 capitalize">{fullName}</p>
          <p className="caption">{email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
