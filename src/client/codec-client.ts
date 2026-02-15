import {recursiveMerge} from "@jiminp/tooltool";

import type {APIStepCodecWithStream, ResponseSchema, StepParams} from "llm-msg-io";
import {createStepDecoder, createStepEncoder, createStepStreamDecoder} from "llm-msg-io";

import type {StepResponse, StepRequest, ResponseTypeLike, StructuredStepResponse} from "./step/index.ts";
import {createStepResponse, createStructuredStepResponse} from "./step/index.ts";
import type {LLMClient} from "./type.ts";
import {Type} from "arktype";

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
    function callAPI(req: StepRequest<ExtraStepParams>, stream: boolean): StepResponse {
        const encoder = createStepEncoder(codec);
        const lib_req: StepParams = {
            ...req,
        };

        if(req.response_type) {
            lib_req.response_schema = toResponseSchema(req.response_type);
        }

        let api_req: APIRequestType = encoder(lib_req);
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
    }

    function step(req: StepRequest<ExtraStepParams> & {response_type: ResponseTypeLike}, stream?: boolean): StructuredStepResponse<Type>;
    function step(req: StepRequest<ExtraStepParams>, stream?: boolean): StepResponse;
    function step(req: StepRequest<ExtraStepParams>, stream: boolean = false): StepResponse {
        const response = callAPI(req, stream);
        if(req.response_type) {
            const schema = isArkTypeSchema(req.response_type) ? req.response_type : req.response_type.schema;
            return createStructuredStepResponse(response, schema);
        }
        return response;
    }

    return {step};
}

function isArkTypeSchema(response_type: ResponseTypeLike): response_type is Type {
    return response_type instanceof Type;
}

function toResponseSchema(response_type: ResponseTypeLike): ResponseSchema {
    if(isArkTypeSchema(response_type)) {
        return {
            schema: response_type.in.toJsonSchema(),
            strict: true,
        };
    } else {
        return {
            strict: true,
            ...response_type,
            schema: response_type.schema.in.toJsonSchema(),
        };
    }
}
