import OpenAI, { ClientOptions } from "openai";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

import { LLMClient, LLMEndpointParams, LLMStream } from "../type.js";
import { createDecoder, Message } from "llm-msg-io";
import { LLMRequest } from "../../request/type.js";


export type OpenAIExtraStepParams = Partial<ChatCompletionCreateParamsBase>;

export interface CreateOpenAIClientParams extends LLMEndpointParams {
    extra?: ClientOptions;
}

export function createOpenAIClient(params: CreateOpenAIClientParams): LLMClient<OpenAIExtraStepParams> {
    const client = new OpenAI({
        baseURL: params.base_url,
        apiKey: params.api_key,
        dangerouslyAllowBrowser: true,

        ...params.extra,
    });

    return {
        async step<S extends boolean>(request: LLMRequest<OpenAIExtraStepParams>, stream = false): Promise<[S] extends [true] ? LLMStream : Message> {
            type ReturnType = ([S] extends [true] ? LLMStream : Message);
            const raw_res = await client.responses.create({
                ...createOpenAIResponseCreateParams(request),
                stream,
            });

            if(stream) {
                return createLLMStream(raw_res as Stream<ResponseStreamEvent>) as ReturnType;
            }

            const res = raw_res as OpenAI.Responses.Response;
            const {messages} = createDecoder(OpenAIResponseOutputCodec)(res);
            return messages.at(-1) as ReturnType;
        }
    };
}