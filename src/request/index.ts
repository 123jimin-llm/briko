export * from "./type.js";

import { asMessageArray, MessageArrayLike } from "llm-msg-io";
import type { LLMRequest } from "./type.js";

export function createLLMRequest<ExtraParams extends object = {}>(messages: MessageArrayLike, extra_params?: ExtraParams): LLMRequest<ExtraParams> {
    return {
        messages: asMessageArray(messages),
        extra_params,
    };
} 

export type LLMRequestTransformer<ExtraParams extends object = {}> = (req: LLMRequest<ExtraParams>) => void|LLMRequest<ExtraParams>;