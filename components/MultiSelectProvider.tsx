"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface MultiSelectContextValue {
  selectedIds: Set<string>;
  selectedCount: number;
  isSelected: (id: string) => boolean;
  /** Toggle a single id in/out of the selection. */
  toggle: (id: string) => void;
  /** Replace the selection with the given ids. */
  selectMany: (ids: string[]) => void;
  /** Clear all selection. */
  clear: () => void;
  /**
   * Handle a click on an item in a Finder-like way:
   *   - shift: range-select from the last-clicked anchor to this id
   *   - cmd / ctrl: toggle this id additively
   *   - plain click: toggle this id (only meaningful when something is
   *     already selected; callers gate the "open preview vs toggle" decision)
   *
   * `orderedIds` must be the in-render order of items so shift-range works
   * intuitively.
   */
  handleItemClick: (params: {
    id: string;
    orderedIds: string[];
    shift: boolean;
    meta: boolean;
  }) => void;
}

const MultiSelectContext = createContext<MultiSelectContextValue | null>(null);

/**
 * Provides Finder / Drive style multi-select state for a list of items.
 *
 * Selection lives in memory only; a refresh / route change wipes it. That's
 * intentional — multi-select is a transient interaction, not a persisted
 * setting.
 */
export function MultiSelectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Anchor for shift-range selection. Updated on every plain or cmd click
  // so the user can establish a new anchor before shift-clicking.
  const lastClickedIdRef = useRef<string | null>(null);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    lastClickedIdRef.current = id;
  }, []);

  const selectMany = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
    lastClickedIdRef.current = null;
  }, []);

  const handleItemClick = useCallback<MultiSelectContextValue["handleItemClick"]>(
    ({ id, orderedIds, shift, meta }) => {
      if (shift && lastClickedIdRef.current) {
        // Range-select: from the last anchor to the just-clicked id, in
        // visual order. Existing selection is preserved + extended.
        const anchor = lastClickedIdRef.current;
        const fromIndex = orderedIds.indexOf(anchor);
        const toIndex = orderedIds.indexOf(id);
        if (fromIndex === -1 || toIndex === -1) {
          // Fall back to a simple toggle if either is unknown.
          toggle(id);
          return;
        }
        const [start, end] =
          fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
        const range = orderedIds.slice(start, end + 1);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          range.forEach((rid) => next.add(rid));
          return next;
        });
        // Don't move the anchor — Finder/Drive behavior: keep the anchor
        // pinned so successive shift-clicks always pivot off the same point.
        return;
      }

      // Plain or cmd/ctrl click — both toggle a single id additively and
      // update the anchor for the next potential shift-click.
      if (meta || shift) {
        toggle(id);
        return;
      }
      toggle(id);
    },
    [toggle],
  );

  const value = useMemo<MultiSelectContextValue>(
    () => ({
      selectedIds,
      selectedCount: selectedIds.size,
      isSelected,
      toggle,
      selectMany,
      clear,
      handleItemClick,
    }),
    [selectedIds, isSelected, toggle, selectMany, clear, handleItemClick],
  );

  return (
    <MultiSelectContext.Provider value={value}>
      {children}
    </MultiSelectContext.Provider>
  );
}

/** Returns the multi-select context if mounted, else `null`. */
export function useMultiSelect(): MultiSelectContextValue | null {
  return useContext(MultiSelectContext);
}

/**
 * Stricter variant for code paths that *require* the provider to be present
 * (e.g. BulkActionsBar). Throws clearly during dev if mis-mounted.
 */
export function useMultiSelectStrict(): MultiSelectContextValue {
  const ctx = useContext(MultiSelectContext);
  if (!ctx) {
    throw new Error(
      "useMultiSelectStrict must be used inside <MultiSelectProvider>",
    );
  }
  return ctx;
}
