import { useQueryClient } from '@tanstack/react-query'
import {
  useSearchTenders,
  getSearchTendersQueryKey,
} from './api/generated/tenders/tenders'
import { useSetDecisionStatus } from './api/generated/interactions/interactions'
import type { DecisionStatus } from './api/generated/tengoMockAPI.schemas'
import './App.css'

const SEARCH_BODY = { skip: 0, take: 10 }

function App() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useSearchTenders(SEARCH_BODY)

  const { mutate: setDecision, isPending } = useSetDecisionStatus({
    mutation: {
      // Once a decision is recorded the tender drops out of the feed,
      // so refetch the search query to get the updated list.
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getSearchTendersQueryKey(SEARCH_BODY),
        })
      },
    },
  })

  const decide = (tenderId: number, decisionStatus: DecisionStatus) =>
    setDecision({ data: { tenderId, decisionStatus } })

  const tenders = data?.data.results ?? []

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1>Tenders</h1>

      {isLoading && <p>Loading…</p>}
      {isError && <p>Failed to load tenders.</p>}
      {!isLoading && !isError && tenders.length === 0 && (
        <p>No tenders left to review.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {tenders.map((tender) => (
          <li
            key={tender.id}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}
          >
            <h3 style={{ margin: '0 0 8px' }}>{tender.title}</h3>
            <p style={{ margin: '0 0 12px', opacity: 0.7 }}>
              {tender.buyerName} · {tender.category}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={isPending}
                onClick={() => decide(tender.id, 'TO_ANALYZE')}
              >
                Analyze
              </button>
              <button
                disabled={isPending}
                onClick={() => decide(tender.id, 'REJECTED')}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
