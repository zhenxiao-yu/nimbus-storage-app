import Link from "next/link";
import { Models } from "node-appwrite";

import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import { convertFileSize } from "@/lib/utils";

const Card = ({ file }: { file: Models.DefaultDocument }) => {
  return (
    <article className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-elevated">
      <div className="flex items-start justify-between gap-2">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="size-16 min-w-16 shrink-0"
        />
        <div className="shrink-0">
          <ActionDropdown file={file} />
        </div>
      </div>

      <Link
        href={file.url}
        target="_blank"
        rel="noreferrer noopener"
        className="ring-focus flex min-w-0 flex-col gap-1 rounded-md focus:outline-none"
      >
        <p className="line-clamp-2 break-all text-sm font-medium">{file.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {convertFileSize(file.size)} · By {file.owner?.fullName ?? "you"}
        </p>
      </Link>

      <FormattedDateTime
        date={file.$createdAt}
        className="caption mt-auto pt-2"
      />
    </article>
  );
};

export default Card;
