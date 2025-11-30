const history = new HierarchicalHistory(...);
const req = reqTemplate.render([
    history.getMessages(),
], {}).use();

const req = createRequest(...);
// TODO: Applying history and tool calls to request.

const llm = createLLMClient(...);
const stream = await llm.chat(req, true);
stream.on("content.delta", (delta) => {
    ...
});

const res = await stream.done();