import { Models } from "node-appwrite";
import { X } from "lucide-react";

import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { convertFileSize, formatDateTime } from "@/lib/utils";

const ImageThumbnail = ({ file }: { file: Models.Document }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-accent/30 p-3">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="line-clamp-1 text-sm font-medium">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-0">
    <p className="text-muted-foreground">{label}</p>
    <p className="max-w-[60%] truncate font-medium">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => {
  return (
    <div className="space-y-3">
      <ImageThumbnail file={file} />
      <div className="rounded-xl border border-border/60 bg-card px-4">
        <DetailRow label="Format" value={file.extension.toUpperCase()} />
        <DetailRow label="Size" value={convertFileSize(file.size)} />
        <DetailRow
          label="Owner"
          value={file.owner?.fullName ?? "—"}
        />
        <DetailRow
          label="Last edit"
          value={formatDateTime(file.$updatedAt)}
        />
      </div>
    </div>
  );
};

interface ShareInputProps {
  file: Models.Document;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({
  file,
  onInputChange,
  onRemove,
}: ShareInputProps) => {
  return (
    <div className="space-y-3">
      <ImageThumbnail file={file} />

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Share with others
        </label>
        <Input
          type="email"
          placeholder="Enter email addresses, comma-separated"
          onChange={(e) =>
            onInputChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
      </div>

      {file.users?.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Shared with</p>
            <p className="text-xs text-muted-foreground">
              {file.users.length} {file.users.length === 1 ? "person" : "people"}
            </p>
          </div>
          <ul className="space-y-1">
            {file.users.map((email: string) => (
              <li
                key={email}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2"
              >
                <span className="truncate text-sm">{email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => onRemove(email)}
                  aria-label={`Remove ${email}`}
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
