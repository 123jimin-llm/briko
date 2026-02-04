import type { Message, MessageArray, StepResult, StepStreamEvent, StepStreamEventHandler, StepStreamEventType } from "llm-msg-io";

export interface StepResponse {
    readonly is_stream: boolean;

    on<T extends StepStreamEventType>(type: T, handler: StepStreamEventHandler<T>): this;
    events(): AsyncIterable<StepStreamEvent>;

    message(): Promise<Message>;
    messages(): Promise<MessageArray>;
    text(): Promise<string>;

    result(): Promise<StepResult>;
    done(): Promise<StepResult>;
}
