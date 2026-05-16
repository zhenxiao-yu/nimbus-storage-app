import { redirect } from "next/navigation";

import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import { CommandPaletteProvider } from "@/components/CommandPaletteProvider";
import RealtimeSync from "@/components/RealtimeSync";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { appwriteConfig } from "@/lib/appwrite/config";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen bg-muted/30">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-elevated focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to content
        </a>
        <Sidebar
          fullName={currentUser.fullName}
          avatar={currentUser.avatar}
          email={currentUser.email}
        />

        <section className="flex min-w-0 min-h-screen flex-1 flex-col">
          <MobileNavigation
            $id={currentUser.$id}
            accountId={currentUser.accountId}
            fullName={currentUser.fullName}
            avatar={currentUser.avatar}
            email={currentUser.email}
          />
          <Header
            userId={currentUser.$id}
            accountId={currentUser.accountId}
            fullName={currentUser.fullName}
            email={currentUser.email}
            avatar={currentUser.avatar}
          />

          <main id="content" className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </section>
      </div>

      <RealtimeSync
        endpoint={appwriteConfig.endpointUrl}
        projectId={appwriteConfig.projectId}
        databaseId={appwriteConfig.databaseId}
        filesCollectionId={appwriteConfig.filesCollectionId}
      />
    </CommandPaletteProvider>
  );
}
