"use client";

import { useMemo, useState } from "react";
import { Models } from "node-appwrite";
import { Check, Copy, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteConfig } from "@/constants";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import {
  createShareLink,
  revokeShareLink,
} from "@/lib/actions/file.actions";

const ImageThumbnail = ({ file }: { file: Models.DefaultDocument }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-accent/30 p-3">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="line-clamp-1 break-all text-sm font-medium">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0">
    <p className="shrink-0 text-muted-foreground">{label}</p>
    <p className="min-w-0 truncate text-right font-medium">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.DefaultDocument }) => {
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
  file: Models.DefaultDocument;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ShareInput = ({
  file,
  onInputChange,
  onRemove,
}: ShareInputProps) => {
  const [raw, setRaw] = useState("");

  const { parsed, invalid } = useMemo(() => {
    const entries = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const valid: string[] = [];
    const bad: string[] = [];
    for (const e of entries) {
      if (EMAIL_PATTERN.test(e)) valid.push(e);
      else bad.push(e);
    }
    return { parsed: valid, invalid: bad };
  }, [raw]);

  const showInvalidHint = invalid.length > 0;

  return (
    <div className="space-y-3">
      <ImageThumbnail file={file} />

      <div className="space-y-1.5">
        <label htmlFor="share-emails" className="block text-sm font-medium">
          Share with others
        </label>
        <Input
          id="share-emails"
          type="email"
          placeholder="Enter email addresses, comma-separated"
          className="w-full"
          aria-invalid={showInvalidHint ? true : undefined}
          aria-describedby={
            showInvalidHint ? "share-emails-error" : "share-emails-hint"
          }
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            onInputChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            );
          }}
        />
        {showInvalidHint ? (
          <p
            id="share-emails-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {invalid.length === 1
              ? `"${invalid[0]}" doesn't look like an email address.`
              : `${invalid.length} entries don't look like email addresses.`}
          </p>
        ) : (
          <p id="share-emails-hint" className="text-xs text-muted-foreground">
            {parsed.length === 0
              ? "Separate multiple emails with commas."
              : `${parsed.length} ${parsed.length === 1 ? "recipient" : "recipients"} ready to add.`}
          </p>
        )}
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
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={() => onRemove(email)}
                  aria-label={`Remove ${email}`}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const EXPIRY_OPTIONS = [
  { label: "1 day", value: "1" },
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
];

interface ShareLinkPanelProps {
  file: Models.DefaultDocument;
  path: string;
  onLinkChange?: (file: Partial<Models.DefaultDocument> | null) => void;
}

/**
 * Public-link share dialog body. Shows the current link if one exists,
 * lets the owner rotate it with a fresh expiry, or revoke it entirely.
 */
export const ShareLinkPanel = ({
  file,
  path,
  onLinkChange,
}: ShareLinkPanelProps) => {
  const initialUrl = file.shareToken
    ? `${siteConfig.url}/share/${file.shareToken}`
    : "";
  const [url, setUrl] = useState<string>(initialUrl);
  const [expiresAt, setExpiresAt] = useState<string | null>(
    file.shareExpiresAt ?? null,
  );
  const [days, setDays] = useState<string>("7");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
  const hasActiveLink = url && expiresAt && !isExpired;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = (await createShareLink({
        fileId: file.$id,
        daysValid: Number(days),
        path,
      })) as
        | {
            url?: string;
            expiresAt?: string;
            token?: string;
          }
        | undefined;
      if (res?.url) {
        setUrl(res.url);
        if (res.expiresAt) setExpiresAt(res.expiresAt);
        onLinkChange?.({
          shareToken: res.token ?? null,
          shareExpiresAt: res.expiresAt ?? null,
        });
        toast.success("Share link ready.");
      } else {
        toast.error("Couldn't create share link.");
      }
    } catch {
      toast.error("Couldn't create share link.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await revokeShareLink({ fileId: file.$id, path });
      setUrl("");
      setExpiresAt(null);
      onLinkChange?.({ shareToken: null, shareExpiresAt: null });
      toast.success("Share link revoked.");
    } catch {
      toast.error("Couldn't revoke share link.");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy link.");
    }
  };

  return (
    <div className="space-y-4">
      <ImageThumbnail file={file} />

      <div className="rounded-xl border border-border/60 bg-accent/30 px-3 py-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5 font-medium text-foreground">
          <Link2 aria-hidden="true" className="size-3.5" />
          Anyone with the link can view and download.
        </p>
      </div>

      {hasActiveLink && (
        <div className="space-y-1.5">
          <label
            htmlFor="share-link-url"
            className="block text-sm font-medium"
          >
            Public link
          </label>
          <div className="flex gap-2">
            <Input
              id="share-link-url"
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
              aria-label="Copy share link"
              className="shrink-0"
            >
              {copied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
            </Button>
          </div>
          {expiresAt && (
            <p className="text-xs text-muted-foreground">
              Expires {formatDateTime(expiresAt)}.
            </p>
          )}
        </div>
      )}

      {!hasActiveLink && isExpired && (
        <p className="text-xs text-amber-600 dark:text-amber-500">
          The previous link has expired. Generate a fresh one below.
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="share-link-expiry" className="block text-sm font-medium">
          Expires in
        </label>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger id="share-link-expiry" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPIRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        {hasActiveLink && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRevoke}
            disabled={isRevoking || isGenerating}
            className="flex-1"
          >
            {isRevoking && (
              <Loader2
                aria-hidden="true"
                className="mr-2 size-4 animate-spin motion-reduce:animate-none"
              />
            )}
            Revoke
          </Button>
        )}
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || isRevoking}
          className="flex-1"
        >
          {isGenerating && (
            <Loader2
              aria-hidden="true"
              className="mr-2 size-4 animate-spin motion-reduce:animate-none"
            />
          )}
          {hasActiveLink ? "Update link" : "Generate link"}
        </Button>
      </div>
    </div>
  );
};
