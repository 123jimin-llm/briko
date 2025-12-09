const req = req_template.render({
    history: ...,
});

const client = createOpenAIClient({...});
const stream = await client.step(req, true);
stream.on("content.delta", (delta) => {...});
const res = await stream.done();