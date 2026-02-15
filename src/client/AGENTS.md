## AGENTS.md for `src/client/`

Unified LLM client module. Wraps provider SDKs behind a common `StepClient` interface using `llm-msg-io` codecs.

### Structure

- `type.ts` — `LLMClient`, `LLMEndpointParams`, `LLMAPIType` definitions.
- `codec-client.ts` — `createCodecClient`: generic factory that wires a `llm-msg-io` codec + `StepAPICaller` into an `LLMClient`. All provider modules use this.
- `step/` — Request/response types and construction. Has own AGENTS.md.
- `openai/` — OpenAI-compatible provider. Maps sampling/reasoning params to OpenAI API shape.
- `gemini/` — Google Gemini provider. Maps params to `GenerateContentParameters`.
- `claude/` — Anthropic Claude provider. Maps params including thinking/budget config.

### Adding a Provider

1. Create `src/client/<provider>/index.ts`.
2. Define `create<Provider>Client` using `createCodecClient` with the provider's `llm-msg-io` codec.
3. Implement `StepAPICaller` — `createExtraParams`, `call`, `callStream`.
4. Export from `src/client/index.ts` and add the API type to `LLMAPIType` in `type.ts`.
