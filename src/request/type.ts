import { type } from "arktype";
import type { MessageArray } from "llm-msg-io";

import type { NestedArray, TransformFunction } from "@jiminp/tooltool";

/** Parameters for specifying a specific LLM model. */
export const ModelParams = type({
    model: "string",
});
export type ModelParams = typeof ModelParams.infer;

export const SamplingReasoningEffort = type("'minimal'|'low'|'medium'|'high'|'xhigh'");
export type SamplingReasoningEffort = typeof SamplingReasoningEffort.infer;

/** Parameters for reasoning efforts. */
export const SamplingReasoningParams = type({
    effort: SamplingReasoningEffort,
    max_tokens: "number",
    exclude: "boolean",
});
export type SamplingReasoningParams = typeof SamplingReasoningParams.infer;

export const SamplingParams = type({
    /** Sampling temperature. */
    temperature: "number",

    /** Cumulative probability of top tokens to consider. */
    top_p: "number",

    /** \# of top tokens to consider. */
    top_k: "number",
    
    /** Minimal probability for a token, relative to the most likely token. */
    min_p: "number",
    
    /** Top P, relative to the most likely token. */
    top_a: "number",
    seed: type("string|number").pipe((v) => `${v}`),
    
    /** Max \# of tokens to include in output. */
    max_tokens: "number",
    
    reasoning: SamplingReasoningParams.partial(),
});
export type SamplingParams = typeof SamplingParams.infer;

export type StepRequestParams<ExtraParams extends object = object> = Partial<ModelParams> & Partial<SamplingParams> & {
    /** Messages to send. */
    messages: MessageArray;

    /** Provider and API-specific parameters. */
    extra_params?: ExtraParams;
};

export type StepRequest<ExtraParams extends object = object> = StepRequestParams<ExtraParams> & {
    use(...transforms: NestedArray<TransformFunction<StepRequest<ExtraParams>>>): StepRequest<ExtraParams>;
};