Briko is a modular toolkit for building LLM applications in JavaScript/TypeScript.

> [!CAUTION]
> Briko is currently in active development, and no backward compatibility is guaranteed.

## Packages

| Package | Description |
|---|---|
| [briko](./packages/briko/) | LLM client library with unified interface for OpenAI, Claude, Gemini |
| [llm-msg-io](./packages/llm-msg-io/) | Message serialization/deserialization for LLM APIs |
| [vscode-stf](./packages/vscode-stf/) | VSCode syntax highlighting for STF files |

## Development

This project uses [pnpm](https://pnpm.io/) workspaces.

- `pnpm build` -- build all packages (topological order)
- `pnpm test` -- run all tests
- `pnpm lint` -- lint all packages
- `pnpm clean` -- clean all build artifacts
- `pnpm build-docs` -- generate unified API documentation

## License

[MIT](./LICENSE)
