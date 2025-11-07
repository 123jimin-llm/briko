import { Message, MessageArray } from "llm-msg-io";

export interface ModelInfo {
    id: string;
    name?: string;
    description?: string;
}

export type APIType = 'openai'|'gemini';

/** Parameters for an LLM endpoint. */
export interface EndpointParams {
    base_url: string;

    /** API key for the endpoint. */
    credential?: string;

    /** Whether to use OpenAI or Gemini-based API, defaults to OpenAI. */
    api_type?: APIType;
}

/** Parameters for OpenRouter provider routing. */
export interface ProviderParams {
    order?: string[];
    ignore?: string[];
    quantizations?: Array<'int4'|'int8'|'fp6'|'fp8'|'fp16'|'bf16'|'fp32'|'unknown'|string>;
    allow_fallbacks?: boolean;
    required_parameters?: boolean;
    data_collection?: 'deny';
}

/** Parameters for specifying a specific LLM model. */
export interface ModelParams {
    /** ID for a model. */
    model: string;
}

/** Parameters for reasoning efforts. */
export interface SamplingReasoningParams {
    effort: 'high'|'medium'|'low';
    max_tokens: number;
    exclude: boolean;
}

/** Parameters for sampling. */
export interface SamplingParams {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    min_p?: number;
    seed?: number;
    max_tokens?: number;

    reasoning?: Partial<SamplingReasoningParams>;
}

export type LLMParams = EndpointParams & ModelParams & SamplingParams;

export interface LLMClient {
    createChatCompletion(llm: LLMParams, messages: MessageArray, signal?: AbortSignal): AsyncGenerator<Partial<Message>>;
}