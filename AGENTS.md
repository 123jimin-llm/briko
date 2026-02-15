## AGENTS.md for briko

Briko is a modular TypeScript library for building LLM agents. It normalizes provider APIs (OpenAI, Gemini, Claude) behind a unified client interface and provides utilities for token counting and context management.

### Architecture

- All source code lives under `src/`. The package exports from `src/index.ts`.
- Provider SDKs are abstracted via `llm-msg-io` codecs — each provider module encodes `StepRequest` into provider-native format and decodes responses back.
- Runtime validation uses `arktype`. Public arktype types are wrapped via `exportType()` from `src/util/type.ts`.

### Build & Test

- Package manager: pnpm (workspace root).
- `pnpm build` compiles `src/` to `dist/` via `tsc`.
- `pnpm test` runs mocha on `dist/**/*.spec.js`. Build before testing.
- `pnpm lint` runs ESLint.
- TypeScript uses `rewriteRelativeImportExtensions` — source imports use `.ts` extensions.

### Conventions

- `strict: true` with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- Imports within source use `.ts` extensions (rewritten at compile time).
- Module doc comments use `@module` tag in barrel files.

### Directory Map

- `src/client/` — LLM client abstraction and provider implementations. Has own AGENTS.md.
- `src/token-counter/` — Token counting utilities. Has own AGENTS.md.
- `src/util/` — Internal utilities (`exportType` for arktype public type wrapper).
- `example/` — Usage examples.
