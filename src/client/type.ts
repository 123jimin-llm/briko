import { StepResult, StepStream } from "llm-msg-io";
import type { LLMRequest } from "../request/index.js";

export interface LLMClient<ExtraStepParams extends object = object> {
    step<S extends boolean = false>(request: LLMRequest<ExtraStepParams>, stream?: S): Promise<[S] extends [true] ? StepStream : StepResult>;
}

export type APIType = 'openai' | 'gemini';

export interface LLMEndpointParams {
    base_url: string;
    api_key?: string;
    api_type?: APIType;
}