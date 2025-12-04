import { Message } from "llm-msg-io";
import type { LLMRequest } from "../request/index.js";
import { LLMStreamEvent } from "./event.js";

export interface LLMStream {
    on<T extends LLMStreamEvent["type"]>(type: T, listener: (event: Extract<LLMStreamEvent, { type: T }>) => void): LLMStream;
    done(): Promise<Message>;
}

export interface LLMClient<ExtraStepParams extends object = object> {
    step<S extends boolean = false>(request: LLMRequest<ExtraStepParams>, stream?: S): Promise<[S] extends [true] ? LLMStream : Message>;
}

export type APIType = 'openai' | 'gemini';

export interface LLMEndpointParams {
    base_url: string;
    api_key?: string;
    api_type?: APIType;
}