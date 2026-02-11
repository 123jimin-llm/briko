import {type} from "arktype";

import {exportType} from "../util/type.ts";
import type {StepClient} from "./step/index.ts";

export const LLMAPIType = exportType(type("'openai'|'gemini'"));
export type LLMAPIType = typeof LLMAPIType.infer;

export const LLMEndpointParams = exportType(type({
    base_url: "string",
    api_key: "string?",
    api_type: LLMAPIType.optional(),
}));
export type LLMEndpointParams = typeof LLMEndpointParams.infer;

export type LLMClient<ExtraStepParams extends object = object> = StepClient<ExtraStepParams>;
