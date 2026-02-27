## AGENTS.md for `src/client/`

All provider modules are wired through `createCodecClient` (`codec-client.ts`) which combines a `llm-msg-io` codec with a `StepAPICaller`.

- `src/client/step/` — Request/response types and construction. Has own AGENTS.md.

### Adding a Provider

1. Create `src/client/<provider>/index.ts`.
2. Define `create<Provider>Client` using `createCodecClient` with the provider's `llm-msg-io` codec.
3. Implement `StepAPICaller` — `createExtraParams`, `call`, `callStream`.
4. Export from `src/client/index.ts` and add the API type to `LLMAPIType` in `type.ts`.
