/**
 * A client module for OpenAI and OpenAI-compatible LLM API providers.
 *
 * @module
 */

import {recursiveMerge, unreachable} from "@jiminp/tooltool";

import OpenAI, {type ClientOptions} from "openai";
import type {ReasoningEffort} from "openai/resources";
import type {ChatCompletionCreateParamsBase} from "openai/resources/chat/completions.mjs";

import {OpenAIChatCodec} from "llm-msg-io";

import type {SamplingReasoningEffort, StepRequest} from "../step/index.ts";
import {createCodecClient} from "../codec-client.ts";
import type {LLMClient, LLMEndpointParams} from "../type.js";

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

    return createCodecClient(OpenAIChatCodec, {
        createExtraParams: (req) => createOpenAIChatCompletionParams(req),
        call: (api_req) => client.chat.completions.create({...api_req, stream: false}),
        callStream: (api_req) => client.chat.completions.create({...api_req, stream: true}),
    });
}

export function getOpenAIReasoningEffort(effort: SamplingReasoningEffort): ReasoningEffort {
    switch(effort) {
        case 'auto': return 'none';
        case 'minimal': return 'minimal';
        case 'low': return 'low';
        case 'medium': return 'medium';
        case 'high': return 'high';
        case 'xhigh': return 'xhigh';
        default: return unreachable(effort);
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

    if(req.max_tokens != null && req.max_tokens >= 0) {
        params.max_completion_tokens = req.max_tokens;
    } else if(req.reasoning?.effort != null && req.reasoning.effort !== 'auto') {
        params.reasoning_effort = getOpenAIReasoningEffort(req.reasoning.effort);
    }

    return recursiveMerge(params, req.extra_params);
}
