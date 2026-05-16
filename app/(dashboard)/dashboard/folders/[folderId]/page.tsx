import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Models } from "node-appwrite";

import Breadcrumb from "@/components/Breadcrumb";
import EmptyIllustration from "@/components/EmptyIllustration";
import FileGrid from "@/components/FileGrid";
import FolderCard from "@/components/FolderCard";
import NewFolderButton from "@/components/NewFolderButton";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { getFolderById, getFolders } from "@/lib/actions/folder.actions";
import { convertFileSize } from "@/lib/utils";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: FolderPageProps): Promise<Metadata> {
  const { folderId } = await params;
  const folder = await getFolderById(folderId);
  const label = folder?.name ?? "Folder";
  return {
    title: label,
    description: `${label} — folder in your Nimbus workspace.`,
    alternates: { canonical: `/dashboard/folders/${folderId}` },
    robots: { index: false, follow: false },
  };
}

export default async function FolderPage({
  params,
  searchParams,
}: FolderPageProps) {
  const { folderId } = await params;
  const folder = await getFolderById(folderId);
  if (!folder) notFound();

  const sp = (await searchParams) ?? {};
  const searchText = (sp.query as string) || "";
  const sort = (sp.sort as string) || "$createdAt-desc";

  const [filesRes, childFoldersRes] = await Promise.all([
    getFiles({ types: [], searchText, sort, folderId }),
    getFolders({ parentId: folderId }),
  ]);

  const files = (filesRes?.documents ?? []) as Models.DefaultDocument[];
  const childFolders = ((
    childFoldersRes as { documents?: Models.DefaultDocument[] } | null
  )?.documents ?? []) as Models.DefaultDocument[];

  const totalSize = files.reduce(
    (acc: number, f: Models.DefaultDocument) => acc + (f.size ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: folder.name },
        ]}
      />

      <header className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="h1 break-all">{folder.name}</h1>
          {filesRes?.total ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {filesRes.total} file{filesRes.total === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {totalSize > 0 ? (
              <>
                Total size:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {convertFileSize(totalSize)}
                </span>
              </>
            ) : (
              "Nothing in this folder yet."
            )}
          </p>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <NewFolderButton
              parentId={folder.$id}
              variant="outline"
              label="New subfolder"
            />
            <div className="flex flex-1 items-center gap-3 sm:flex-none">
              <p className="hidden text-sm text-muted-foreground sm:block">
                Sort by:
              </p>
              <Sort />
            </div>
          </div>
        </div>
      </header>

      {childFolders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Subfolders
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {childFolders.map((f) => (
              <FolderCard key={f.$id} folder={f} />
            ))}
          </ul>
        </section>
      )}

      {files.length > 0 ? (
        <section className="space-y-3">
          {childFolders.length > 0 && (
            <h2 className="text-sm font-medium text-muted-foreground">Files</h2>
          )}
          <FileGrid files={files} />
        </section>
      ) : childFolders.length === 0 ? (
        <EmptyFolder name={folder.name} />
      ) : null}
    </div>
  );
}

function EmptyFolder({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <EmptyIllustration className="w-52 opacity-90" />
      <div className="space-y-1">
        <p className="text-base font-medium">{name} is empty</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Upload files from the header, or move existing files in from their
          actions menu.
        </p>
      </div>
    </div>
  );
}
