export * from "./type.js";

import { asMessageArray, MessageArrayLike } from "llm-msg-io";
import type { LLMRequest } from "./type.js";
import { applyTransforms } from "@jiminp/tooltool";

export function createLLMRequest<ExtraParams extends object = {}>(messages: MessageArrayLike, extra_params?: ExtraParams): LLMRequest<ExtraParams> {
    return {
        messages: asMessageArray(messages),
        extra_params,
        use(...transforms) {
            return applyTransforms(this, transforms);
        },
    };
}