import type { Metadata } from "next";
import { Models } from "node-appwrite";

import EmptyIllustration from "@/components/EmptyIllustration";
import TrashList from "@/components/TrashList";
import EmptyTrashButton from "@/app/(dashboard)/dashboard/trash/empty-trash-button";
import { getTrashedFiles } from "@/lib/actions/file.actions";
import { convertFileSize } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trash",
  description:
    "Files you've deleted from Nimbus. Restore them or empty the trash.",
  alternates: { canonical: "/dashboard/trash" },
  robots: { index: false, follow: false },
};

export default async function TrashPage() {
  const files = await getTrashedFiles({});
  const docs = (files?.documents ?? []) as Models.DefaultDocument[];

  const totalSize = docs.reduce(
    (acc: number, f: Models.DefaultDocument) => acc + (f.size ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="h1">Trash</h1>
          {docs.length > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {docs.length}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {totalSize > 0 ? (
              <>
                Reclaimable:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {convertFileSize(totalSize)}
                </span>{" "}
                across {docs.length} {docs.length === 1 ? "file" : "files"}
              </>
            ) : (
              "Files you delete will appear here for 30 days."
            )}
          </p>

          {docs.length > 0 && (
            <EmptyTrashButton
              files={docs.map((f) => ({
                fileId: f.$id,
                bucketFileId: f.bucketFileId as string,
                name: f.name as string,
              }))}
            />
          )}
        </div>
      </header>

      {docs.length > 0 ? <TrashList files={docs} /> : <EmptyTrashState />}
    </div>
  );
}

function EmptyTrashState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <EmptyIllustration className="w-52 opacity-90" />
      <div className="space-y-1">
        <p className="text-base font-medium">Trash is empty</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Files you delete will appear here for 30 days. You can restore them
          or remove them permanently.
        </p>
      </div>
    </div>
  );
}
