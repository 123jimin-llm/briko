import OpenAI, { type ClientOptions } from "openai";
import type { ReasoningEffort } from "openai/resources";
import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

import type { SamplingReasoningEffort, StepRequest } from "../../request/type.ts";
import type { LLMClient, LLMEndpointParams } from "../type.js";
import { wrapOpenAIChat, type StepResult, type StepStream } from "llm-msg-io";
import { recursiveMerge } from "@jiminp/tooltool";

export type OpenAIExtraStepParams = Partial<ChatCompletionCreateParamsBase>;

export interface CreateOpenAIClientParams extends LLMEndpointParams {
    extra?: ClientOptions;
}

export function createRawOpenAIClient(params: CreateOpenAIClientParams): OpenAI {
    return new OpenAI({
        baseURL: params.base_url,
        apiKey: params.api_key,
        dangerouslyAllowBrowser: true,

        ...params.extra,
    });
}

export function createOpenAIClient(params: CreateOpenAIClientParams): LLMClient<OpenAIExtraStepParams> {
    const client = createRawOpenAIClient(params);

    return {
        async step<S extends boolean>(req: StepRequest<OpenAIExtraStepParams>, stream: S = false as S): Promise<[S] extends [true] ? StepStream : StepResult> {
            type ReturnType = [S] extends [true] ? StepStream : StepResult;
            
            const innerStep = wrapOpenAIChat((api_req) => {
                return client.chat.completions.create({
                    ...api_req,
                    ...createOpenAIChatCompletionParams(req),
                    stream,
                }, {
                    signal: req.abort_signal,
                });
            });

            return innerStep({...req, stream}) as Promise<ReturnType>;
        }
    };
}

export function getOpenAIReasoningEffort(effort: SamplingReasoningEffort): ReasoningEffort {
    switch(effort) {
        case 'minimal': return 'minimal';
        case 'low': return 'low';
        case 'medium': return 'medium';
        case 'high': return 'high';
        case 'xhigh': return 'xhigh';
    }
}

export function createOpenAIChatCompletionParams(req: StepRequest<OpenAIExtraStepParams>): Omit<ChatCompletionCreateParamsBase, 'messages'> {
    const params: Omit<ChatCompletionCreateParamsBase, 'messages'> = {
        model: req.model ?? "gpt-5.1-mini",
    };

    if(req.temperature != null) params.temperature = req.temperature;
    if(req.top_p != null) params.top_p = req.top_p;
    if(req.seed != null) {
        const parsed = parseInt(req.seed, 10);
        if(!Number.isNaN(parsed)) params.seed = parsed;
    }
    if(req.max_tokens != null) params.max_completion_tokens = req.max_tokens;
    if(req.reasoning?.effort != null) {
        params.reasoning_effort = getOpenAIReasoningEffort(req.reasoning.effort);
    }

    return recursiveMerge(params, req.extra_params);
}