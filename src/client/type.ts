import { type } from "arktype";
import type { StepResult, StepStream } from "llm-msg-io";

import { exportType } from "../util/type.ts";
import type { StepRequest } from "../request/index.ts";

export interface LLMClient<ExtraStepParams extends object = object> {
    step<S extends boolean = false>(request: StepRequest<ExtraStepParams>, stream?: S): Promise<[S] extends [true] ? StepStream : StepResult>;
}

export const LLMAPIType = exportType(type("'openai'|'gemini'"));
export type APIType = typeof LLMAPIType.infer;

export const LLMEndpointParams = exportType(type({
    base_url: "string",
    api_key: "string?",
    api_type: LLMAPIType.optional(),
}));
export type LLMEndpointParams = typeof LLMEndpointParams.infer;