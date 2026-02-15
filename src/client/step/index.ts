export * from "./request/index.ts";
export * from "./response/index.ts";

import type {Type} from "arktype";
import type {ResponseType, StepRequest} from "./request/type.ts";
import type {StepResponse, StructuredStepResponse} from "./response/type.ts";

type StepRequestWithResponseType<ExtraStepParams extends object, Schema extends Type> =
    StepRequest<ExtraStepParams> & {response_type: ResponseType<Schema>};

export interface StepClient<ExtraStepParams extends object = object> {
    step<Schema extends Type>(request: StepRequestWithResponseType<ExtraStepParams, Schema>, stream?: boolean): StructuredStepResponse<Schema>;
    step(request: StepRequest<ExtraStepParams>, stream?: boolean): StepResponse;
}
