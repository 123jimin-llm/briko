export * from "./type.ts";

import { asMessageArray, type MessageArrayLike } from "llm-msg-io";
import type { StepRequest } from "./type.ts";
import { applyTransforms } from "@jiminp/tooltool";

export function createStepRequest<ExtraParams extends object = object>(
    base: Partial<StepRequest<ExtraParams>>,
    messages: MessageArrayLike,
    extra_params?: ExtraParams,
): StepRequest<ExtraParams> {
    const req: StepRequest<ExtraParams> = {
        ...base,
        messages: asMessageArray(messages),
        use(...transforms) {
            return applyTransforms(this, transforms);
        },
    };

    if(extra_params != null) {
        req.extra_params = extra_params;
    }

    return req;
}