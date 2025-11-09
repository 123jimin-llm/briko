import OpenAI from "openai";
import { ChatCompletionCreateParamsStreaming, ChatCompletionMessage } from "openai/resources/index.js";

import { createDecoder, createEncoder, OpenAIChatCodec } from "llm-msg-io";
import { EndpointParams, CreateChatCompletionFunction } from "./type.js";

export function createOpenAIClient(params: EndpointParams): OpenAI {
    return new OpenAI({
        baseURL: params.base_url,
        apiKey: params.credential,
        dangerouslyAllowBrowser: true,

        defaultHeaders: {
            "X-Stainless-Timeout": null,
        },
    });
}

export const createOpenAIChatCompletion: CreateChatCompletionFunction = async function*(llm, messages, signal) {
    const client = createOpenAIClient(llm);
    const api_messages = createEncoder(OpenAIChatCodec)(messages);

    const request: ChatCompletionCreateParamsStreaming = {
        stream: true,

        model: llm.model,

        temperature: llm.temperature,
        top_p: llm.top_p,
        seed: llm.seed == null ? (void 0) : Number(llm.seed),

        ... {
            
        },

        max_completion_tokens: llm.max_tokens,
        messages: api_messages,
    };

    const decode = createDecoder(OpenAIChatCodec);

    for await(const chunk of await client.chat.completions.create(request, { signal })) {
        const delta = chunk.choices[0].delta as Partial<ChatCompletionMessage>;

        yield* decode([{
            role: 'assistant',
            content: "",
            refusal: null,
            ...delta,
        } satisfies ChatCompletionMessage]).messages;
    }
};
