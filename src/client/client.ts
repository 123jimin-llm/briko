import {unreachable} from "@jiminp/tooltool";
import type {LLMClient, LLMEndpointParams} from "./type.ts";
import {createOpenAIClient} from "./openai/index.ts";
import {createClaudeClient} from "./claude/index.ts";
import {createGeminiClient} from "./gemini/index.ts";

export function createLLMClient(params: LLMEndpointParams): LLMClient {
    const api_type = params.api_type ?? 'openai';

    switch(api_type) {
        case 'openai':
            return createOpenAIClient(params);
        case 'claude':
            return createClaudeClient(params);
        case 'gemini':
            return createGeminiClient(params);
        default:
            return unreachable(api_type);
    }
}
