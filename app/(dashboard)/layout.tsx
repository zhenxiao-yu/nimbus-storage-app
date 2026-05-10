import { redirect } from "next/navigation";

import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  return (
    <main className="flex min-h-screen bg-muted/30">
      <Sidebar
        fullName={currentUser.fullName}
        avatar={currentUser.avatar}
        email={currentUser.email}
      />

      <section className="flex min-h-screen flex-1 flex-col">
        <MobileNavigation
          $id={currentUser.$id}
          accountId={currentUser.accountId}
          fullName={currentUser.fullName}
          avatar={currentUser.avatar}
          email={currentUser.email}
        />
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />

        <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </section>
    </main>
  );
}
