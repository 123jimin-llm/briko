import type {Message, MessageArray, StepResult, StepStreamEvent, StepStreamEventType, ToolCall} from "llm-msg-io";
import type {StepStreamEventHandler} from "./handler.ts";
import type {AsyncChannel} from "@jiminp/tooltool";

export interface StepResponse<DecodedType extends StepResult = StepResult> {
    /** Whether this response is being streamed. */
    readonly is_stream: boolean;

    readonly events: AsyncChannel<StepStreamEvent, DecodedType>;

    /** Register event handlers. */
    on<T extends StepStreamEventType>(type: T, handler: StepStreamEventHandler<T>): this;

    /** Get the last message. */
    message(): Promise<Message>;

    /** Get all messages from this response. */
    messages(): Promise<MessageArray>;

    /** Get the text representation of this response. */
    text(): Promise<string>;

    /** Get all tool calls from this response. */
    toolCalls(): Promise<ToolCall[]>;

    /** Get the result of this response. */
    result(): Promise<DecodedType>;

    /** Wait for the response to complete. This is identical to `result()`. */
    done(): Promise<DecodedType>;
}
