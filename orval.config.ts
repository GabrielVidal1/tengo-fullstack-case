import { defineConfig } from 'orval'

export default defineConfig({
  tengo: {
    input: {
      target: './backend-mock/openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      client: 'react-query',
      httpClient: 'fetch',
      baseUrl: 'http://localhost:3000',
      clean: true,
      prettier: false,
      override: {
        query: {
          useQuery: true,
          useMutation: true,
        },
        // searchTenders is a POST, but semantically it's a read/feed,
        // so expose it as a query hook instead of a mutation.
        operations: {
          searchTenders: {
            query: {
              useQuery: true,
            },
          },
        },
      },
    },
  },
})
