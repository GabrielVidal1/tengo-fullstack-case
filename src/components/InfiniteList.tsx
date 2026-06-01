import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, type ReactNode } from "react";

interface InfiniteListProps<T> {
  /** Items currently loaded. */
  items: T[];
  /** Renders a single item. */
  renderItem: (item: T, index: number) => ReactNode;
  /** Stable key for an item; falls back to the virtual row key. */
  getItemKey?: (item: T, index: number) => string | number;
  /** Whether more pages can be fetched. */
  hasNextPage?: boolean;
  /** Whether the next page is currently loading. */
  isFetchingNextPage?: boolean;
  /** Loads the next page; called when the loader row scrolls into view. */
  fetchNextPage?: () => void;
  /** Estimated row height in px, used before measurement. */
  estimateSize?: number;
  /** Rows rendered outside the visible area. */
  overscan?: number;
  /** Vertical gap between rows in px. */
  gap?: number;
  /** Custom loader row content. */
  renderLoader?: () => ReactNode;
  /** Class for the scroll container (height must be constrained). */
  className?: string;
}

/**
 * Generic virtualized, infinitely-scrolling list built on @tanstack/react-virtual.
 *
 * Owns the virtualizer, dynamic row measurement, and the "fetch next page when
 * the loader row appears" behaviour. The scroll container fills its parent, so
 * the parent must constrain the height (e.g. `flex-1` inside a flex column).
 */
export function InfiniteList<T>({
  items,
  renderItem,
  getItemKey,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  estimateSize = 200,
  overscan = 5,
  gap = 12,
  renderLoader,
  className = "",
}: InfiniteListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // One extra row at the end acts as the loader / fetch trigger.
  const rowCount = hasNextPage ? items.length + 1 : items.length;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  useEffect(() => {
    const lastRow = virtualRows[virtualRows.length - 1];
    if (!lastRow) return;
    if (
      lastRow.index >= items.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage?.();
    }
  }, [
    virtualRows,
    items.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  return (
    <div ref={scrollRef} className={`overflow-auto ${className}`}>
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualRows.map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= items.length;
          const item = items[virtualRow.index];

          return (
            <div
              key={
                isLoaderRow
                  ? "loader"
                  : (getItemKey?.(item, virtualRow.index) ?? virtualRow.key)
              }
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: gap,
              }}
            >
              {isLoaderRow
                ? (renderLoader?.() ?? (
                    <p className="py-4 text-center text-sm text-gray-500">
                      {isFetchingNextPage ? "Chargement…" : ""}
                    </p>
                  ))
                : renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InfiniteList;
