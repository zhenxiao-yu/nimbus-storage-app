import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Models } from "node-appwrite";

import EmptyIllustration from "@/components/EmptyIllustration";
import FileGrid from "@/components/FileGrid";
import Sort from "@/components/Sort";
import { FILE_TYPE_LABEL } from "@/constants";
import { getFiles } from "@/lib/actions/file.actions";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";

export async function generateMetadata({
  params,
}: SearchParamProps): Promise<Metadata> {
  const type = (await params)?.type ?? "";
  const label = FILE_TYPE_LABEL[type] ?? "Files";
  return {
    title: label,
    description: `${label} stored in your Nimbus workspace.`,
    alternates: { canonical: `/dashboard/${type}` },
    robots: { index: false, follow: false },
  };
}

const VALID_TYPES = ["documents", "images", "media", "others"];

export default async function TypePage({
  searchParams,
  params,
}: SearchParamProps) {
  const type = (await params)?.type ?? "";
  if (!VALID_TYPES.includes(type)) notFound();

  const sp = (await searchParams) ?? {};
  const searchText = (sp.query as string) || "";
  const sort = (sp.sort as string) || "$createdAt-desc";
  const types = getFileTypesParams(type) as FileType[];

  const files = await getFiles({ types, searchText, sort });

  const totalSize = (files?.documents ?? []).reduce(
    (acc: number, f: Models.DefaultDocument) => acc + (f.size ?? 0),
    0,
  );

  const label = FILE_TYPE_LABEL[type] ?? type;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="h1 capitalize">{label}</h1>
          {files?.total ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {files.total}
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
              "Nothing here yet."
            )}
          </p>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <p className="hidden text-sm text-muted-foreground sm:block">
              Sort by:
            </p>
            <Sort />
          </div>
        </div>
      </header>

      {files?.total > 0 ? (
        <FileGrid files={files.documents as Models.DefaultDocument[]} />
      ) : (
        <EmptyState label={label.toLowerCase()} />
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <EmptyIllustration className="w-52 opacity-90" />
      <div className="space-y-1">
        <p className="text-base font-medium">No {label} yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          When you upload {label}, they&apos;ll show up here. Hit{" "}
          <span className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
            Upload
          </span>{" "}
          in the header — or drop a file anywhere on this page.
        </p>
      </div>
    </div>
  );
}
