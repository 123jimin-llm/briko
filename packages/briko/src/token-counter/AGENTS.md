## AGENTS.md for `src/token-counter/`

`TokenCounter` is generic over `ModelSlug` — callers parameterize with their model name union.

`createTextBasedTokenCounter` lifts a text-level counter into a full `MessageArray` counter by iterating content parts. `createHeuristicTokenCounter` wraps it with default character weights (0.25 ASCII, 1 non-ASCII).

No provider-specific counters (e.g. tiktoken) exist yet — all counting is heuristic.
