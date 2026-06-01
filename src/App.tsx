import { InfiniteList } from "./components/InfiniteList";
import { TenderCard } from "./components/TenderCard";
import { useTenders } from "./hooks/useTenders";

function App() {
  const {
    tenders,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markTender,
    isMarking,
  } = useTenders();

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Appels d'offres</h1>
      </div>

      {isError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Une erreur est survenue lors du chargement des appels d'offres.
        </p>
      )}

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}

      {!isLoading && !isError && tenders.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucun appel d'offres à analyser.
        </p>
      )}

      <InfiniteList
        items={tenders}
        getItemKey={(tender) => tender.id}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        className="flex-1"
        renderItem={(tender) => (
          <TenderCard
            tender={tender}
            disabled={isMarking}
            onReject={(t) => markTender(t.id, "REJECTED")}
            onAnalyze={(t) => markTender(t.id, "TO_ANALYZE")}
          />
        )}
      />
    </div>
  );
}

export default App;
