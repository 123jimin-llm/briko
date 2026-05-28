## AGENTS.md for briko monorepo

pnpm workspace monorepo for LLM tooling libraries.

### Packages

- `packages/briko/` -- LLM client library. Has own AGENTS.md.
- `packages/llm-msg-io/` -- Message serialization. Has own AGENTS.md.
- `packages/vscode-stf/` -- VSCode extension for STF syntax highlighting.

### Build & Test

- `pnpm build` then `pnpm test` -- builds and tests all packages in topological order.
- Build order: llm-msg-io first (no workspace deps), then briko (depends on llm-msg-io).
- TypeScript uses `rewriteRelativeImportExtensions` -- source imports use `.ts` extensions.

### Conventions

- Module doc comments use `@module` tag in barrel files.
- ArkType types are wrapped with `exportType()` before export.
- Shared config (tsconfig.base.json, eslint.config.js) lives at workspace root.
