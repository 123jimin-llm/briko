Briko is a collection of utilities for building LLM agents in JavaScript.

Each component of Briko is designed to be modular, so you can use only the parts you need.

## Installation

> [!CAUTION]
> Briko is currently in active development, and no backward compatibility is guaranteed.

```bash
pnpm add briko
```

## Features

### Message Serialization

Briko is based on [llm-msg-io](https://github.com/123jimin-llm/llm-msg-io), so codecs for `llm-msg-io` can be used.

### LLM API Normalization

TODO: Implement new API like this:

```ts
const client = createOpenAIClient();
const request = createStepRequest([{role: 'user', content: "Hello! Who are you?"}]);

const res = client.step(request, true);

res.on('...', );

for await(const event in res.events()) {
  ...
}

await res.message();
await res.messages();
await res.text();

```

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
