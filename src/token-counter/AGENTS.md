## AGENTS.md for `src/token-counter/`

Token counting module. Estimates token counts for `MessageArray` inputs.

### Structure

- `type.ts` — `TokenCounter` interface and `TokenCountData` cache type.
- `heuristic.ts` — Heuristic implementations: character-weight-based text counter, text-based message counter, and combined heuristic counter.

### Design

`TokenCounter` is generic over `ModelSlug` — callers parameterize with their model name union.

`createTextBasedTokenCounter` lifts a text-level counter into a full `MessageArray` counter by iterating message content parts. `createHeuristicTokenCounter` combines both layers with default character weights (0.25 per ASCII, 1 per non-ASCII).

The module currently has no provider-specific counters (e.g. tiktoken). All counting is heuristic.
