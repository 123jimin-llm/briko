export * from "./request/index.ts";
export * from "./response/index.ts";

import type {StepRequest} from "./request/type.ts";
import type {StepResponse} from "./response/type.ts";

export interface StepClient<ExtraStepParams extends object = object> {
    step(request: StepRequest<ExtraStepParams>, stream?: boolean): StepResponse;
}
