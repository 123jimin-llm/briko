export type * from "./type.ts";

import { messageContentToText, type StepStream, type StepStreamEvent, type StepStreamEventHandler, type StepStreamEventType } from "llm-msg-io";
import type { StepResponse } from "./type.ts";

export function createStepResponse(is_stream: boolean, stream: StepStream): StepResponse {
    const response: StepResponse = {
        is_stream,

        on<T extends StepStreamEventType>(type: T, handler: StepStreamEventHandler<T>) {
            stream.on(type, handler);
            return response;
        },
        events(): AsyncIterable<StepStreamEvent> {
            // TODO
            throw new Error("Not yet implemented!");
        },

        async message() {
            const {messages} = await stream.done();
            const last_message = messages.at(-1);
            if(last_message == null) throw new Error("No messages.");
            return last_message;
        },
        async messages() {
            const res = await stream.done();
            return res.messages;
        },
        async text() {
            const res = await stream.done();
            return res.messages.map((message) => messageContentToText(message.content)).join('\n');
        },

        async result() {
            return await stream.done();
        },
        async done() {
            return await stream.done();
        },
    };

    return response;
}