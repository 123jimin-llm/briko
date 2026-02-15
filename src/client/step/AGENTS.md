## AGENTS.md for `src/client/step/`

Core request/response types for a single LLM completion step.

### Structure

- `index.ts` — Re-exports and defines `StepClient` interface.
- `request/` — `StepRequest`, `StepRequestParams`, sampling/model param types (arktype-validated). `createStepRequest` factory with overloads for messages-only and base+messages forms.
- `response/` — `StepResponse` interface with streaming and non-streaming support.

### Request

`StepRequest` extends `StepRequestParams` with a `use()` method for applying transform chains. It is generic over `ExtraStepParams` for provider-specific pass-through fields.

Sampling params (`SamplingParams`) are all optional and provider modules map them to native API shapes. `SamplingReasoningEffort` is a normalized effort enum across providers.

### Response

`StepResponse` wraps an `AsyncChannel` of `StepStreamEvent`s. Consumers can:

- Register event handlers via `on()`.
- Iterate events via `events` (the async channel).
- Await terminal values: `message()`, `messages()`, `text()`, `toolCalls()`, `result()`.

`createStepResponse` accepts either a `Promise<StepResult>` (non-streaming) or a `StepStreamEventGenerator` (streaming), normalizing both into the same `StepResponse` shape. Event handlers in `handler.ts` are stored in a typed record keyed by `StepStreamEventType`.
