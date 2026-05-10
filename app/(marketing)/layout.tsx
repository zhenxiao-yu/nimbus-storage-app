import { TopNav } from "@/components/marketing/top-nav";
import { Footer } from "@/components/marketing/footer";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav isAuthenticated={!!user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
