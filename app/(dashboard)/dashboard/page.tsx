import type { Metadata } from "next";
import { Models } from "node-appwrite";
import { FolderOpen } from "lucide-react";

import { Chart } from "@/components/Chart";
import EmptyIllustration from "@/components/EmptyIllustration";
import FolderCard from "@/components/FolderCard";
import NewFolderButton from "@/components/NewFolderButton";
import RecentUploadsList from "@/components/RecentUploadsList";
import SummaryCards from "@/components/SummaryCards";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { getFolders } from "@/lib/actions/folder.actions";
import { appwriteConfig } from "@/lib/appwrite/config";
import { getUsageSummary } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your Nimbus dashboard — storage usage, recent files, and quick actions.",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false },
};

const FOLDERS_PREVIEW_LIMIT = 8;

export default async function DashboardPage() {
  // Folders need an env var; if it isn't set yet, gracefully skip them
  // instead of crashing the whole dashboard.
  const foldersEnabled = Boolean(appwriteConfig.foldersCollectionId);

  const [files, totalSpace, foldersRes] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
    foldersEnabled
      ? getFolders({ parentId: null }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const usageSummary = getUsageSummary(totalSpace);
  const recent = files?.documents ?? [];
  const allFolders =
    ((foldersRes as { documents?: Models.DefaultDocument[] } | null)
      ?.documents ?? []) as Models.DefaultDocument[];
  const folders = allFolders.slice(0, FOLDERS_PREVIEW_LIMIT);

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="h3">Folders</h2>
            <p className="text-xs text-muted-foreground">
              Organize files into folders for quick access.
            </p>
          </div>
          {foldersEnabled && <NewFolderButton />}
        </div>

        {!foldersEnabled ? (
          <FoldersNotConfigured />
        ) : folders.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {folders.map((folder) => (
              <FolderCard key={folder.$id} folder={folder} />
            ))}
          </ul>
        ) : (
          <EmptyFolders />
        )}
      </section>

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

function EmptyFolders() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FolderOpen aria-hidden="true" className="size-6" />
      </div>
      <p className="text-sm font-medium">No folders yet</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Group related files with a folder. You can move files in or out from
        the file&apos;s actions menu at any time.
      </p>
      <NewFolderButton variant="outline" />
    </div>
  );
}

function FoldersNotConfigured() {
  return (
    <div className="rounded-xl border border-dashed border-amber-400/60 bg-amber-50/40 px-4 py-3 text-xs text-amber-900 dark:bg-amber-900/10 dark:text-amber-200">
      Folders aren&apos;t configured yet. Run{" "}
      <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono dark:bg-amber-900/40">
        node --env-file=.env.local scripts/setup-v2-schema.mjs
      </code>{" "}
      and add{" "}
      <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono dark:bg-amber-900/40">
        NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION
      </code>{" "}
      to your env to enable them.
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
