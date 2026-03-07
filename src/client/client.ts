import {unreachable} from "@jiminp/tooltool";
import type {LLMClient, LLMEndpointParams} from "./type.ts";
import {createOpenAIClient} from "./openai/index.ts";
import {createClaudeClient} from "./claude/index.ts";
import {createGeminiClient} from "./gemini/index.ts";

/** Creates an {@link LLMClient} by dispatching on {@link LLMEndpointParams.api_type} (defaults to `'openai'`). */
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
