# Briko

A collection of utilities for managing LLM context and executor.

Each component of this library is designed to be modular; it's possible to use only the parts you need.

## Context

This module provides structures that can be used to build parts of the context window.

### History

Most often, AI agents maintain a *history* of messages; an append-only list of messages. Fitting the history in the context window is a common problem.

#### `LinearHistory`

#### `TreeHistory`

## LLM API

This module provides an abstraction layer over different LLM APIs.

## Executor

## Development

This project uses [pnpm](https://pnpm.io/) for package management.

- `pnpm build` – compile TypeScript from `src/` into `dist/`.
  - `pnpm build:watch` – recompile on every file change.
- `pnpm test` – run unit tests from `src/**/*.spec.ts`.
  - Don't forget to run `pnpm build` before running tests!
- `pnpm lint` – run ESLint on the source code.
- `pnpm clean` – remove the `dist/` directory.

## License

[MIT](./LICENSE)
