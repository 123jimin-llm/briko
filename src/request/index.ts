export * from "./type.js";

import { asMessageArray, MessageArrayLike } from "llm-msg-io";
import type { LLMRequest } from "./type.js";
import { applyTransforms } from "@jiminp/tooltool";

export function createLLMRequest<ExtraParams extends object = object>(
    base: Partial<LLMRequest<ExtraParams>>,
    messages: MessageArrayLike,
    extra_params?: ExtraParams,
): LLMRequest<ExtraParams> {
    return {
        ...base,
        messages: asMessageArray(messages),
        extra_params,
        use(...transforms) {
            return applyTransforms(this, transforms);
        },
    };
}