import {createAsyncChannel, pipeToAsyncSink, type JSONValue} from "@jiminp/tooltool";

import type {StepStreamEvent, StepStreamEventType, StepStreamEventGenerator, StepResult, ToolCall} from "llm-msg-io";
import {messageContentToText, stepResultPromiseToEvents} from "llm-msg-io";

import type {StepResponse, StepResponseCore, StructuredStepResponse} from "./type.ts";
import type {StepStreamEventHandler, StepStreamEventHandlersRecord} from "./handler.ts";
import {addStepStreamEventHandler, invokeStepStreamEventHandlers} from "./handler.ts";
import type {Type} from "arktype";

export function createStepResponseCore<DecodedType extends StepResult = StepResult>(
    event_generator: Promise<DecodedType> | StepStreamEventGenerator<DecodedType>,
): StepResponseCore<DecodedType> {
    let is_stream: boolean = true;

    if(event_generator instanceof Promise) {
        is_stream = false;
        event_generator = stepResultPromiseToEvents(event_generator);
    }

    const events = createAsyncChannel<StepStreamEvent, DecodedType>();
    pipeToAsyncSink(event_generator, events);

    return {
        is_stream,
        events,
        async result() {
            return await events.result();
        },
    };
}

export function createStepResponse<DecodedType extends StepResult = StepResult>(
    event_generator: Promise<DecodedType> | StepStreamEventGenerator<DecodedType>,
): StepResponse<DecodedType> {
    const core = createStepResponseCore(event_generator);
    const handlers: StepStreamEventHandlersRecord = {};

    void (async () => {
        for await (const event of core.events) {
            invokeStepStreamEventHandlers(handlers, event);
        }
    })();

    const response: StepResponse<DecodedType> = {
        ...core,

        on<T extends StepStreamEventType>(type: T, handler: StepStreamEventHandler<T>) {
            addStepStreamEventHandler(handlers, type, handler);
            return response;
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

        async toolCalls() {
            const messages = await response.messages();
            return messages.flatMap((message): ToolCall[] => message.tool_calls ?? []);
        },

        async tokenUsage() {
            const result = await response.result();
            return result.token_usage ?? null;
        },

        async done() {
            return await response.result();
        },
    };

    return response;
}

export function createStructuredStepResponse<Schema extends Type, DecodedType extends StepResult = StepResult>(
    base: StepResponse<DecodedType>,
    schema: Schema,
): StructuredStepResponse<Schema, DecodedType> {
    const structured: StructuredStepResponse<Schema, DecodedType> = {
        ...base,

        on<T extends StepStreamEventType>(type: T, handler: StepStreamEventHandler<T>) {
            base.on(type, handler);
            return structured;
        },

        async json() {
            return JSON.parse(await base.text()) as JSONValue;
        },

        async object() {
            const json_text = await base.text();
            const parsed = JSON.parse(json_text);
            return schema.assert(parsed);
        },
    };

    return structured;
}
