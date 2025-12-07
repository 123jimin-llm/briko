import OpenAI, { ClientOptions } from "openai";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

import { LLMClient, LLMEndpointParams } from "../type.js";
import { OpenAIChatCodec } from "llm-msg-io";

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

    const encoder = createEncoder(OpenAIChatCodec);
    const decoder = createDecoder(OpenAIChatCodec);
    const streamDecoder = createStreamDecoder(OpenAIChatCodec);

    return {
        async step<S extends boolean>(request: LLMRequest<OpenAIExtraStepParams>, stream = false): Promise<[S] extends [true] ? LLMStream : Message> {
            type ReturnType = ([S] extends [true] ? LLMStream : Message);
            const raw_res = await client.chat.completions.create({
                ...createOpenAIChatCompletionParams(request),
                stream,
            });

            if(stream) {
                return streamDecoder(raw_res as OpenAIChatCompletionStream) as ReturnType;
            } else {
                return decoder(raw_res as OpenAI.ChatCompletion).messages as ReturnType;
            }

            const res = raw_res as OpenAI.Responses.Response;
            const {messages} = createDecoder(OpenAIResponseOutputCodec)(res);
            return messages.at(-1) as ReturnType;
        }
    };
}

export function createOpenAIChatCompletionParams(request: LLMRequest<OpenAIExtraStepParams>): ChatCompletionCreateParamsBase {
    return {
        ...request.extra_params,
    };
}