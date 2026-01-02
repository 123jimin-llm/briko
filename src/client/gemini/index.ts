import { GoogleGenAI, ThinkingLevel, type GenerateContentParameters, type GoogleGenAIOptions } from "@google/genai";
import type { LLMClient, LLMEndpointParams } from "../type.ts";
import type { SamplingReasoningEffort, StepRequest } from "../../request/type.ts";
import { recursiveMerge } from "@jiminp/tooltool";

export type GeminiExtraStepParams = Partial<GenerateContentParameters>;

export interface CreateGeminiClientParams extends LLMEndpointParams {
    extra?: GoogleGenAIOptions;
}

export function createGeminiClient(params: CreateGeminiClientParams): LLMClient<GeminiExtraStepParams> {
    const client = new GoogleGenAI({
        apiKey: params.api_key ?? "",

        ...params.extra,
    });

    return {
        async step<S extends boolean>(req: StepRequest<GeminiExtraStepParams>, stream: S = false as S): Promise<[S] extends [true] ? StepStream : StepResult> {
            
        }
    };
}

export function getGeminiThinkingLevel(effort: SamplingReasoningEffort): ThinkingLevel {
    switch(effort) {
        case 'minimal': return ThinkingLevel.MINIMAL;
        case 'low': return ThinkingLevel.LOW;
        case 'medium': return ThinkingLevel.MEDIUM;
        case 'high': return ThinkingLevel.HIGH;
        case 'xhigh': return ThinkingLevel.HIGH;
    }
}

export function createGeminiGenerateContentParams(req: StepRequest<GeminiExtraStepParams>): Omit<GenerateContentParameters, 'contents'> {
    const params: Omit<GenerateContentParameters, 'contents'> = {
        model: req.model ?? "gemini-3-flash-preview",
    };

    return recursiveMerge(params, req.extra_params);
}