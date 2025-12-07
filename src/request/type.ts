import { MessageArray } from "llm-msg-io";
import type { TransformFunction, NestedArray } from "@jiminp/tooltool";

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

export interface SamplingParams {
    /** Sampling temperature. */
    temperature?: number;
    /** Cumulative probability of top tokens to consider. */
    top_p?: number;
    /** \# of top tokens to consider. */
    top_k?: number;
    /** Minimal probability for a token, relative to the most likely token. */
    min_p?: number;
    /** Top P, relative to the most likely token. */
    top_a?: number;

    seed?: string|number;

    /** Max \# of tokens to include in output. */
    max_tokens?: number;

    reasoning?: Partial<SamplingReasoningParams>;
}

export type StepRequestParams<ExtraParams extends object = object> = Partial<ModelParams> & Partial<SamplingParams> & {
    /** Messages to send. */
    messages: MessageArray;

    /** Provider and API-specific parameters. */
    extra_params?: ExtraParams;
};

export type StepRequest<ExtraParams extends object = object> = StepRequestParams<ExtraParams> & {
    use(...transforms: NestedArray<TransformFunction<StepRequest<ExtraParams>>>): StepRequest<ExtraParams>;
};
