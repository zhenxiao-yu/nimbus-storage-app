"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Models } from "node-appwrite";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Input } from "@/components/ui/input";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { getFiles } from "@/lib/actions/file.actions";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Models.DefaultDocument[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    let cancelled = false;
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      const files = await getFiles({ types: [], searchText: debouncedQuery });
      if (cancelled) return;
      setResults(files?.documents ?? []);
      setOpen(true);
      setLoading(false);
    };
    fetchFiles();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    // Sync local input when the URL search param is cleared externally (e.g. nav).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!searchQuery) setQuery("");
  }, [searchQuery]);

  const handleClickItem = (file: Models.DefaultDocument) => {
    setOpen(false);
    setResults([]);
    const segment =
      file.type === "video" || file.type === "audio"
        ? "media"
        : `${file.type}s`;
    router.push(`/dashboard/${segment}?query=${encodeURIComponent(query)}`);
  };

  return (
    <div
      className="group relative w-full max-w-md"
      role="search"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-500/0 via-indigo-500/0 to-sky-500/0 opacity-0 blur-md transition-opacity duration-300 group-focus-within:from-violet-500/40 group-focus-within:via-indigo-500/40 group-focus-within:to-sky-500/40 group-focus-within:opacity-60 motion-reduce:transition-none"
      />
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
        />
        <Input
          value={query}
          placeholder="Search your files…"
          aria-label="Search your files"
          type="search"
          className="h-10 px-9 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {loading && (
          <Loader2
            aria-hidden="true"
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground motion-reduce:animate-none"
          />
        )}
      </div>

      {open && (
        <div className="absolute inset-x-0 top-12 z-50 max-h-[min(20rem,70vh)] overflow-hidden rounded-xl border border-border/60 bg-popover p-2 shadow-elevated">
          {results.length > 0 ? (
            <ul className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
              {results.map((file) => (
                <li key={file.$id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleClickItem(file)}
                    className="flex w-full items-center justify-between gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent/60"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Thumbnail
                        type={file.type}
                        extension={file.extension}
                        url={file.url}
                        className="size-8 min-w-8 shrink-0"
                      />
                      <p className="min-w-0 flex-1 truncate text-sm">{file.name}</p>
                    </div>
                    <FormattedDateTime
                      date={file.$createdAt}
                      className="caption hidden shrink-0 sm:block"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No files match &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
