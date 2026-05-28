/**
 * A client module for Anthropic Claude API.
 *
 * @module
 */

import Anthropic, {type ClientOptions} from "@anthropic-ai/sdk";
import type {MessageCreateParamsNonStreaming, ThinkingConfigParam} from "@anthropic-ai/sdk/resources/messages";
import {type Nullable, recursiveMerge, unreachable} from "@jiminp/tooltool";
import {ClaudeMessagesCodec} from "llm-msg-io";

import {createCodecClient} from "../codec-client.ts";
import type {SamplingReasoningEffort, StepRequest} from "../step/index.ts";
import type {LLMClient, LLMEndpointParams} from "../type.js";

export type ClaudeExtraStepParams = Partial<MessageCreateParamsNonStreaming>;

export interface CreateClaudeClientParams extends LLMEndpointParams {
    extra?: ClientOptions;
}

export function createRawClaudeClient(params: CreateClaudeClientParams): Anthropic {
    return new Anthropic({
        baseURL: params.base_url,
        apiKey: params.api_key ?? null,
        dangerouslyAllowBrowser: true,
        defaultHeaders: params.default_headers,

        ...params.extra,
    });
}

/** Creates an {@link LLMClient} for the Anthropic Claude API. */
export function createClaudeClient(params: CreateClaudeClientParams): LLMClient<ClaudeExtraStepParams> {
    const client = createRawClaudeClient(params);

    return createCodecClient(ClaudeMessagesCodec, {
        createExtraParams: (req) => createClaudeMessageParams(req),
        call: (api_req, signal) => client.messages.create({...api_req, stream: false}, {signal}),
        callStream: (api_req, signal) => client.messages.create({...api_req, stream: true}, {signal}),
    });
}

export function getClaudeThinkingConfig(req_reasoning: Nullable<StepRequest['reasoning']>): ThinkingConfigParam {
    if(req_reasoning == null) return {type: 'disabled'};

    const {max_tokens, effort} = req_reasoning;

    if(max_tokens != null && max_tokens >= 0) {
        return {type: 'enabled', budget_tokens: max_tokens >= 1024 ? max_tokens : 1024};
    }

    if(effort != null) {
        if(effort === 'auto') {
            return {type: 'adaptive'};
        }

        const budget_tokens = getClaudeDefaultBudgetTokens(effort);
        return {type: 'enabled', budget_tokens};
    }

    return {type: 'disabled'};
}

function getClaudeDefaultBudgetTokens(effort: SamplingReasoningEffort): number {
    // No specific reason behind these values; min. 1024 and quality improvement tapers off above 32k.
    switch(effort) {
        case 'auto': return 0;
        case 'minimal': return 1024;
        case 'low': return 2048;
        case 'medium': return 10240;
        case 'high': return 32768;
        case 'xhigh': return 65536;
        default: return unreachable(effort);
    }
}

export function createClaudeMessageParams(req: StepRequest<ClaudeExtraStepParams>): Omit<MessageCreateParamsNonStreaming, 'messages'> {
    const params: Omit<MessageCreateParamsNonStreaming, 'messages'> = {
        model: req.model ?? "claude-sonnet-4-5-20250929",
        max_tokens: req.max_tokens ?? 8192,
    };

    if(req.temperature != null) params.temperature = req.temperature;
    if(req.top_p != null) params.top_p = req.top_p;
    if(req.top_k != null) params.top_k = req.top_k;

    if(req.reasoning != null) {
        params.thinking = getClaudeThinkingConfig(req.reasoning);

        if(params.thinking?.type === 'enabled' && params.max_tokens <= params.thinking.budget_tokens) {
            params.max_tokens = params.thinking.budget_tokens + 1;
        }
    }

    return recursiveMerge(params, req.extra_params);
}
