import { GoogleGenAI, ThinkingLevel, type GenerateContentConfig, type GenerateContentParameters, type GoogleGenAIOptions, type ThinkingConfig } from "@google/genai";
import type { LLMClient, LLMEndpointParams } from "../type.ts";
import type { SamplingReasoningEffort, StepRequest } from "../../request/type.ts";
import { recursiveMerge } from "@jiminp/tooltool";
import { createStepDecoder, createStepEncoder, createStepStreamDecoder, GeminiGenerateContentCodec, type StepResult, type StepStream } from "llm-msg-io";

export type GeminiExtraStepParams = Partial<GenerateContentParameters>;

export interface CreateGeminiClientParams extends LLMEndpointParams {
    extra?: GoogleGenAIOptions;
}

export function createRawGeminiClient(params: CreateGeminiClientParams): GoogleGenAI {
    return new GoogleGenAI({
        apiKey: params.api_key ?? "",

        ...params.extra,
    });
}

export function createGeminiClient(params: CreateGeminiClientParams): LLMClient<GeminiExtraStepParams> {
    const client = createRawGeminiClient(params);

    return {
        async step<S extends boolean>(req: StepRequest<GeminiExtraStepParams>, stream: S = false as S): Promise<[S] extends [true] ? StepStream : StepResult> {
            type ReturnType = [S] extends [true] ? StepStream : StepResult;
            
            const encoder = createStepEncoder(GeminiGenerateContentCodec);
            let api_req: GenerateContentParameters = encoder(req);
            api_req = recursiveMerge(
                api_req as unknown as Record<string, unknown>,
                createGeminiGenerateContentParams(req),
            ) as unknown as GenerateContentParameters;
            
            if(stream) {
                const decoder = createStepStreamDecoder(GeminiGenerateContentCodec);
                const api_res = await client.models.generateContentStream(api_req);
                return decoder(api_res) as ReturnType;
            } else {
                const decoder = createStepDecoder(GeminiGenerateContentCodec);
                const api_res = await client.models.generateContent(api_req);
                return decoder(api_res) as ReturnType;
            }
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

    let config: GenerateContentConfig|null = null;

    if(req.temperature != null) (config ??= {}).temperature = req.temperature;

    if(req.top_p != null) (config ??= {}).topP = req.top_p;
    if(req.top_k != null) (config ??= {}).topK = req.top_k;

    if(req.seed != null) {
        const parsed = parseInt(req.seed, 10);
        if(!Number.isNaN(parsed)) (config ??= {}).seed = parsed;
    }

    if(req.max_tokens != null) (config ??= {}).maxOutputTokens = req.max_tokens;

    if(req.reasoning != null) {
        const reasoning = req.reasoning;
        const api_reasoning: ThinkingConfig = {
            includeThoughts: reasoning.exclude ? false : true,
        };

        if(reasoning.effort != null) {
            api_reasoning.thinkingLevel = getGeminiThinkingLevel(reasoning.effort);
        }

        if(reasoning.max_tokens != null) {
            api_reasoning.thinkingBudget = reasoning.max_tokens;
        }

        (config ??= {}).thinkingConfig = api_reasoning;
    }

    if(config) {
        params.config = config;
    }

    return recursiveMerge(params, req.extra_params);
}