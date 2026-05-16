import type { Metadata } from "next";

import { Chart } from "@/components/Chart";
import EmptyIllustration from "@/components/EmptyIllustration";
import RecentUploadsList from "@/components/RecentUploadsList";
import SummaryCards from "@/components/SummaryCards";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { getUsageSummary } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your Nimbus dashboard — storage usage, recent files, and quick actions.",
};

export default async function DashboardPage() {
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

  const usageSummary = getUsageSummary(totalSpace);
  const recent = files?.documents ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="h1">Dashboard</h1>
        <p className="text-muted-foreground">
          A quick view of your space, recent uploads, and shortcuts.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <Chart used={totalSpace?.used ?? 0} />
        <SummaryCards items={usageSummary} />
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="h3">Recent uploads</h2>
            <p className="text-xs text-muted-foreground">
              Your latest files across every type.
            </p>
          </div>
          {recent.length > 0 && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {recent.length} file{recent.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {recent.length > 0 ? (
          <RecentUploadsList files={recent} />
        ) : (
          <EmptyRecent />
        )}
      </section>
    </div>
  );
}

function EmptyRecent() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <EmptyIllustration className="w-44 opacity-90" />
      <p className="text-sm font-medium">No uploads yet</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Hit{" "}
        <span className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-medium text-foreground">
          Upload
        </span>{" "}
        in the header — or drop a file anywhere on this page — to see it
        appear here.
      </p>
    </div>
  );
}
