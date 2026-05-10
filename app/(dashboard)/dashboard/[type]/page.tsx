import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Models } from "node-appwrite";
import { Inbox } from "lucide-react";

import Card from "@/components/Card";
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
    (acc: number, f: Models.Document) => acc + (f.size ?? 0),
    0,
  );

  const label = FILE_TYPE_LABEL[type] ?? type;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="h1 capitalize">{label}</h1>
          {files?.total ? (
            <span className="text-sm text-muted-foreground">
              ({files.total})
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {totalSize > 0 ? (
              <>
                Total size:{" "}
                <span className="font-medium text-foreground">
                  {convertFileSize(totalSize)}
                </span>
              </>
            ) : (
              "Nothing here yet."
            )}
          </p>

          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-muted-foreground sm:block">
              Sort by:
            </p>
            <Sort />
          </div>
        </div>
      </header>

      {files?.total > 0 ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.documents.map((file: Models.Document) => (
            <li key={file.$id}>
              <Card file={file} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState label={label.toLowerCase()} />
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent/40">
        <Inbox className="size-6 text-muted-foreground" />
      </div>
      <p className="text-base font-medium">No {label} yet</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        When you upload {label}, they&apos;ll show up here. Use the Upload
        button in the header to add files.
      </p>
    </div>
  );
}
