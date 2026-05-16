import type { Metadata } from "next";
import Link from "next/link";
import { Models } from "node-appwrite";
import { ArrowUpRight, FileText, Film, FolderArchive, ImageIcon } from "lucide-react";

import ActionDropdown from "@/components/ActionDropdown";
import { Chart } from "@/components/Chart";
import FormattedDateTime from "@/components/FormattedDateTime";
import Thumbnail from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, getUsageSummary } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your Nimbus dashboard — storage usage, recent files, and quick actions.",
};

const summaryIconMap: Record<string, React.ElementType> = {
  Documents: FileText,
  Images: ImageIcon,
  Media: Film,
  Others: FolderArchive,
};

export default async function DashboardPage() {
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

  const usageSummary = getUsageSummary(totalSpace);

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

        <ul className="grid grid-cols-2 gap-4">
          {usageSummary.map((summary) => {
            const Icon = summaryIconMap[summary.title] ?? FolderArchive;
            return (
              <li key={summary.title}>
                <Link
                  href={summary.url}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-elevated"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-6 space-y-1">
                    <p className="text-2xl font-semibold tracking-tight">
                      {convertFileSize(summary.size) || "0 B"}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {summary.title}
                    </p>
                  </div>
                  <Separator className="my-3" />
                  <FormattedDateTime
                    date={summary.latestDate}
                    className="text-xs"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="h3">Recent uploads</h2>
          {files?.documents?.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {files.documents.length} file{files.documents.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {files?.documents?.length > 0 ? (
          <ul className="divide-y divide-border/60">
            {files.documents.map((file: Models.DefaultDocument) => (
              <li
                key={file.$id}
                className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="shrink-0">
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                  />
                </div>
                <Link
                  href={file.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="ring-focus min-w-0 flex-1 rounded-md"
                >
                  <p className="truncate text-sm font-medium group-hover:text-primary">
                    {file.name}
                  </p>
                  <FormattedDateTime date={file.$createdAt} />
                </Link>
                <div className="shrink-0">
                  <ActionDropdown file={file} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRecent />
        )}
      </section>
    </div>
  );
}

function EmptyRecent() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent/40">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No uploads yet</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Drop a file with the Upload button to see it appear here.
      </p>
    </div>
  );
}
