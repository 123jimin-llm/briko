import { createGeneratorController } from "@jiminp/tooltool";

import type { StepStreamEvent, StepStreamEventType, StepStreamEventGenerator, StepResult } from "llm-msg-io";
import { messageContentToText, stepResultPromiseToEvents } from "llm-msg-io";

import type { StepResponse } from "./type.ts";
import type { StepStreamEventHandler, StepStreamEventHandlersRecord } from "./handler.ts";
import { addStepStreamEventHandler, invokeStepStreamEventHandlers } from "./handler.ts";

export function createStepResponse<DecodedType extends StepResult = StepResult>(event_generator: Promise<DecodedType>|StepStreamEventGenerator<DecodedType>): StepResponse<DecodedType> {
    let is_stream: boolean = true;
    
    if(event_generator instanceof Promise) {
        is_stream = false;
        event_generator = stepResultPromiseToEvents(event_generator);
    }

    const handlers: StepStreamEventHandlersRecord = {};
    const events = createGeneratorController<StepStreamEvent, DecodedType>();
    
    void (async() => {
        for await(const event of events.entries()) {
            invokeStepStreamEventHandlers(handlers, event);
        }
    })();

    void (async() => {
        let result: DecodedType;

        try {
            while(true) {
                const {done, value} = await event_generator.next();
                if(done) {
                    result = value;
                    break;
                }

                events.yeet(value);
            }
        } catch(err) {
            events.fail(err);
            return;
        }

        events.done(result);
    })();

    const response: StepResponse<DecodedType> = {
        is_stream,

        on<T extends StepStreamEventType>(type: T, handler: StepStreamEventHandler<T>) {
            addStepStreamEventHandler(handlers, type, handler);
            return response;
        },

        events(): AsyncGenerator<StepStreamEvent> {
            return events.entries();
        },

        async message() {
            const messages = await response.messages();
            const last_message = messages.at(-1);
            if(last_message == null) throw new Error("No messages.");
            return last_message;
        },

        async messages() {
            const {messages} = await response.result();
            return messages;
        },

        async text() {
            const messages = await response.messages();
            return messages.map((message) => messageContentToText(message.content)).join('\n');
        },

        async result() {
            return await events.result();
        },

        async done() {
            return await events.result();
        },
    };

    return response;
}