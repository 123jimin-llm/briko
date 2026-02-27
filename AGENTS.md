## AGENTS.md for briko

TypeScript library for building LLM agents. Normalizes provider APIs (OpenAI, Gemini, Claude) behind a unified client interface.

### Architecture

- Provider SDKs abstracted via `llm-msg-io` codecs — each provider module encodes `StepRequest` into provider-native format and decodes responses back.
- Runtime validation uses `arktype`. Public arktype types are wrapped via `exportType()` from `src/util/type.ts`.

### Stability

- `src/client/` — **Stable.** Has own AGENTS.md.
- `src/token-counter/` — **Needs real-world testing.** Has own AGENTS.md.
- `src/context-old/` — **Deprecated.** Previous iteration of context management; kept for reference only.
- PLANNED: Context management API (scope, design TBD — pre-planning).

### Build & Test

- `pnpm build` then `pnpm test` — mocha runs on compiled `dist/**/*.spec.js`. Build before testing.
- TypeScript uses `rewriteRelativeImportExtensions` — source imports use `.ts` extensions.

### Conventions

- Module doc comments use `@module` tag in barrel files.
