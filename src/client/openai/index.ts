import OpenAI, { type ClientOptions } from "openai";
import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

import type { StepRequest } from "../../request/type.ts";
import type { LLMClient, LLMEndpointParams } from "../type.js";
import { wrapOpenAIChat, type StepResult, type StepStream } from "llm-msg-io";

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
        async step<S extends boolean>(req: StepRequest<OpenAIExtraStepParams>, stream: S = false as S): Promise<[S] extends [true] ? StepStream : StepResult> {
            const innerStep = wrapOpenAIChat((api_req) => {
                return client.chat.completions.create({
                    ...api_req,
                    ...createOpenAIChatCompletionParams(req),
                    stream,
                });
            });

            return innerStep(req) as Promise<[S] extends [true] ? StepStream : StepResult>;
        }
    };
}

export function createOpenAIChatCompletionParams(req: StepRequest<OpenAIExtraStepParams>): Omit<ChatCompletionCreateParamsBase, 'messages'> {
    return {
        model: req.model ?? "gpt-5.1-mini",
        ...req.extra_params,
    };
}