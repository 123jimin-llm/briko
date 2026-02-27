## AGENTS.md for `src/client/step/`

### Request

`StepRequest` is generic over `ExtraStepParams` for provider-specific pass-through fields. `use()` applies transform chains.

`SamplingParams` are all optional — provider modules map them to native API shapes. `SamplingReasoningEffort` normalizes effort levels across providers.

### Response

`createStepResponse` accepts either `Promise<StepResult>` (non-streaming) or `StepStreamEventGenerator` (streaming), normalizing both into the same `StepResponse` shape backed by an `AsyncChannel`.
