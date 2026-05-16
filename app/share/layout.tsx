import type { Metadata } from "next";

export const metadata: Metadata = {
  // Don't index individual share links.
  robots: { index: false, follow: false, nocache: true },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Theme provider and Toaster are already attached at the root layout.
  // This layout exists mainly to scope metadata and keep share routes out
  // of the (dashboard) / (marketing) groups.
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
      {children}
    </div>
  );
}
