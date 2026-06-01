# Claude conversations — how this exercise was built

## API & data layer

- `ff26b1d` **OpenAPI spec + Orval React Query client** — wrote the spec from the existing `backend-mock/` code, set up Orval codegen, consolidated types into one file.
- `57f0843` **`useTenders` hook** — infinite-scroll feed + mark/decision mutations on top of the generated hooks; data layer only, no UI.

## List UI

- `d109f8a` **Tailwind + lucide-react + date-fns** — installed deps and wired the Tailwind CSS entry.
- `8e4d916` **`TenderCard` + format helpers** — generated the pure card from a provided **screenshot**, swapped custom SVGs for lucide icons, moved formatting into `src/technical/format.ts`.
- `054923f` **Virtualized infinite list** — built with `@tanstack/react-virtual`, refactored into a **reusable generic `InfiniteList`** instead of inlining in `App.tsx`.
- `58a43ad` **"Total to process" pill** — pushed back on loaded-count; asked for a clean way to surface the real total from API pagination.

## DX

- `142d8a4` **Absolute `@/` imports** — refactored all `src/` import paths.
- `b25a572` **Makefile** — `up` (mock backend + frontend in parallel), `install`.
