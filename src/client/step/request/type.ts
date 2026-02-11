import {type} from "arktype";
import type {MessageArray} from "llm-msg-io";

import type {NestedArray, TransformFunction} from "@jiminp/tooltool";
import {exportType} from "../../../util/type.ts";

/** Parameters for specifying a specific LLM model. */
export const ModelParams = exportType(type({
    model: "string",
}));
export type ModelParams = typeof ModelParams.infer;

export const SamplingReasoningEffort = exportType(type("'minimal'|'low'|'medium'|'high'|'xhigh'"));
export type SamplingReasoningEffort = typeof SamplingReasoningEffort.infer;

/** Parameters for reasoning efforts. */
const InternalSamplingReasoningParams = type({
    effort: SamplingReasoningEffort,
    max_tokens: "number",
    exclude: "boolean",
});
export const SamplingReasoningParams = exportType(InternalSamplingReasoningParams);
export type SamplingReasoningParams = typeof SamplingReasoningParams.infer;

export const SamplingParams = exportType(type({
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

    reasoning: InternalSamplingReasoningParams.partial(),
}));
export type SamplingParams = typeof SamplingParams.infer;

export type StepRequestParams<ExtraParams extends object = object> = Partial<ModelParams> & Partial<SamplingParams> & {
    abort_signal?: AbortSignal;

    /** Messages to send. */
    messages: MessageArray;

    /** Provider and API-specific parameters. */
    extra_params?: ExtraParams;
};

export type StepRequest<ExtraParams extends object = object> = StepRequestParams<ExtraParams> & {
    use(...transforms: NestedArray<TransformFunction<StepRequest<ExtraParams>>>): StepRequest<ExtraParams>;
};
