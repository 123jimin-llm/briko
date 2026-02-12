export * from "./type.ts";

import {asMessageArray, MessageArray, type MessageArrayLike} from "llm-msg-io";
import type {StepRequest, StepRequestParams} from "./type.ts";
import {applyTransforms} from "@jiminp/tooltool";

/** Creates a `StepRequest` based on messages. */
export function createStepRequest<ExtraParams extends object = object>(
    messages: MessageArray,
    extra_params?: ExtraParams,
): StepRequest<ExtraParams>;

/** Create a `StepRequest` based on a base request and messages. */
export function createStepRequest<ExtraParams extends object = object>(
    base: Partial<StepRequestParams<ExtraParams>>,
    messages: MessageArrayLike,
    extra_params?: ExtraParams,
): StepRequest<ExtraParams>;

export function createStepRequest<ExtraParams extends object = object>(
    param0: Partial<StepRequestParams<ExtraParams>>|MessageArray,
    param1: MessageArrayLike|ExtraParams|undefined,
    param2?: ExtraParams,
): StepRequest<ExtraParams> {
    let extra_params: ExtraParams|null;
    let req: StepRequest<ExtraParams>;

    if(Array.isArray(param0)) {
        req = {
            messages: param0,
            use(...transforms) {
                return applyTransforms(this, transforms);
            },
        };
        extra_params = (param1 as ExtraParams|undefined) ?? null;
    } else {
        req = {
            ...param0,
            messages: asMessageArray(param1 as MessageArrayLike),
            use(...transforms) {
                return applyTransforms(this, transforms);
            },
        };
        extra_params = param2 ?? null;
    }

    if(extra_params != null) {
        req.extra_params = extra_params;
    }

    return req;
}
