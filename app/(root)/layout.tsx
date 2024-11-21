import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

// Force dynamic rendering to ensure up-to-date user session handling
export const dynamic = "force-dynamic";

/**
 * Layout Component
 * Renders the main application layout, including the sidebar, header, and dynamic content area.
 * Ensures the user is authenticated before rendering the layout.
 *
 * @param {React.ReactNode} children - The content to be rendered within the layout.
 * @returns The layout structure or redirects to log in if no user is authenticated.
 */
const Layout = async ({ children }: { children: React.ReactNode }) => {
  // Fetch the current user; if not authenticated, redirect to log in
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/login");

  return (
    <main className="flex h-screen">
      {/* Sidebar component, passing user details as props */}
      <Sidebar {...currentUser} />

      <section className="flex h-full flex-1 flex-col">
        {/* Mobile navigation for smaller screens */}
        <MobileNavigation {...currentUser} />

        {/* Header containing user-specific actions */}
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />

        {/* Main content area */}
        <div className="main-content">{children}</div>
      </section>

      {/* Toaster for notifications */}
      <Toaster />
    </main>
  );
};

export default Layout;
