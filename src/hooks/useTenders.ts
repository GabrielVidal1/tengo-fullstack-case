import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useSetDecisionStatus } from "../api/generated/interactions/interactions";
import { searchTenders } from "../api/generated/tenders/tenders";
import type {
  DecisionStatus,
  Tender,
} from "../api/generated/tengoMockAPI.schemas";

/** Tenders fetched per page when scrolling the feed. */
const PAGE_SIZE = 10;

/** Stable query key for the tender feed, namespaced so we can invalidate it. */
const TENDERS_FEED_KEY = ["tenders", "feed"] as const;

type SearchResponse = Awaited<ReturnType<typeof searchTenders>>;

/**
 * Tender feed + decision hook for the infinite-scroll list.
 *
 * - Wraps the generated `searchTenders` fetcher in a React Query
 *   `useInfiniteQuery`, paginating with the API's `skip`/`take`.
 * - Exposes a flat `tenders` array plus the cursor controls the list needs
 *   (`fetchNextPage`, `hasNextPage`, `isFetchingNextPage`).
 * - `markTender` records a decision via the generated mutation and refetches
 *   the feed, since decided tenders drop out of search results.
 */
export function useTenders() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<
    SearchResponse,
    Error,
    InfiniteData<SearchResponse>,
    typeof TENDERS_FEED_KEY,
    number
  >({
    queryKey: TENDERS_FEED_KEY,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      searchTenders({ skip: pageParam, take: PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      const { skip, take } = lastPage.data.pagination;
      // A short page means we've reached the end of the feed.
      return lastPage.data.results.length < take ? undefined : skip + take;
    },
  });

  const tenders = useMemo<Tender[]>(
    () => query.data?.pages.flatMap((page) => page.data.results) ?? [],
    [query.data],
  );

  // Total tenders still to process, reported by the API across all pages.
  // Read from the latest page so it stays fresh as decisions shrink the feed.
  const total =
    query.data?.pages[query.data?.pages.length - 1]?.data.pagination.total ?? 0;

  const decisionMutation = useSetDecisionStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: TENDERS_FEED_KEY });
      },
    },
  });

  const markTender = useCallback(
    (tenderId: number, decisionStatus: DecisionStatus) =>
      decisionMutation.mutateAsync({ data: { tenderId, decisionStatus } }),
    [decisionMutation],
  );

  return {
    // feed data
    tenders,
    total,
    // feed status
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // infinite-scroll cursor controls
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    // decisions
    markTender,
    isMarking: decisionMutation.isPending,
  };
}
