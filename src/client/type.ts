import { Message } from "llm-msg-io";
import type { LLMRequest } from "../request/index.js";
import { LLMStreamEvent } from "./event.js";

export interface LLMStream {
    on<T extends LLMStreamEvent["type"]>(type: T, listener: (event: Extract<LLMStreamEvent, { type: T }>) => void): LLMStream;
    done(): Promise<Message>;
}

export interface LLMClient {
    step(request: LLMRequest, stream?: false): Promise<Message>;
    step(request: LLMRequest, stream: true): Promise<LLMStream>;
}

