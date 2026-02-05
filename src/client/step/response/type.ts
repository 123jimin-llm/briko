import type { Message, MessageArray, StepResult, StepStreamEvent, StepStreamEventType } from "llm-msg-io";
import type { StepStreamEventHandler } from "./handler.ts";

export interface StepResponse<DecodedType extends StepResult = StepResult> {
    readonly is_stream: boolean;

    on<T extends StepStreamEventType>(type: T, handler: StepStreamEventHandler<T>): this;
    events(): AsyncIterable<StepStreamEvent>;

    message(): Promise<Message>;
    messages(): Promise<MessageArray>;
    text(): Promise<string>;

    result(): Promise<DecodedType>;
    done(): Promise<DecodedType>;
}
