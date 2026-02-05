/**
 * A client module for OpenAI and OpenAI-compatible LLM API providers.
 * 
 * @module
 */

import { recursiveMerge } from "@jiminp/tooltool";

import OpenAI, { type ClientOptions } from "openai";
import type { ReasoningEffort } from "openai/resources";
import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

import {createStepEncoder, createStepStreamDecoder, createStepDecoder, OpenAIChatCodec} from "llm-msg-io";

import type { StepResponse, SamplingReasoningEffort, StepRequest } from "../step/index.ts";
import { createStepResponse } from "../step/index.ts";
import type { LLMClient, LLMEndpointParams } from "../type.js";

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
        step(req: StepRequest<OpenAIExtraStepParams>, stream: boolean = false): StepResponse {
            const encoder = createStepEncoder(OpenAIChatCodec);
            let api_req = encoder(req);
            api_req = recursiveMerge(
                api_req as unknown as Record<string, unknown>,
                createOpenAIChatCompletionParams(req),
            ) as unknown as typeof api_req;

            if(stream) {
                const decoder = createStepStreamDecoder(OpenAIChatCodec);
                return createStepResponse(decoder(client.chat.completions.create({...api_req, stream: true})));
            } else {
                const decoder = createStepDecoder(OpenAIChatCodec);
                return createStepResponse(client.chat.completions.create({...api_req, stream: false}).then(decoder));
            }
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