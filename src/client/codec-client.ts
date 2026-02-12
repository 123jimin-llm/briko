import {recursiveMerge} from "@jiminp/tooltool";

import type {APIStepCodecWithStream} from "llm-msg-io";
import {createStepDecoder, createStepEncoder, createStepStreamDecoder} from "llm-msg-io";

import type {StepResponse, StepRequest} from "./step/index.ts";
import {createStepResponse} from "./step/index.ts";
import type {LLMClient} from "./type.ts";

/** Provider-specific API call interface, bridging the encoded request to raw API responses. */
export interface StepAPICaller<
    APIRequestType,
    APIResponseType,
    APIStreamType,
    ExtraStepParams extends object = object,
> {
    /** Produce additional request parameters from the step request (e.g. model, temperature). */
    createExtraParams(req: StepRequest<ExtraStepParams>): Partial<APIRequestType>;

    /** Call the API without streaming. */
    call(api_req: APIRequestType): Promise<APIResponseType>;

    /** Call the API with streaming. */
    callStream(api_req: APIRequestType): PromiseLike<APIStreamType>;
}

/** Creates an {@link LLMClient} from a codec and provider-specific API caller. */
export function createCodecClient<
    APIRequestType,
    APIResponseType,
    APIStreamType,
    ExtraStepParams extends object = object,
>(
    codec: APIStepCodecWithStream<APIRequestType, APIResponseType, APIStreamType>,
    caller: StepAPICaller<APIRequestType, APIResponseType, APIStreamType, ExtraStepParams>,
): LLMClient<ExtraStepParams> {
    return {
        step(req: StepRequest<ExtraStepParams>, stream: boolean = false): StepResponse {
            const encoder = createStepEncoder(codec);
            let api_req: APIRequestType = encoder(req);
            api_req = recursiveMerge(
                api_req as unknown as Record<string, unknown>,
                caller.createExtraParams(req),
            ) as unknown as APIRequestType;

            if(stream) {
                const decoder = createStepStreamDecoder(codec);
                return createStepResponse(decoder(caller.callStream(api_req)));
            } else {
                const decoder = createStepDecoder(codec);
                return createStepResponse(caller.call(api_req).then(decoder));
            }
        },
    };
}
