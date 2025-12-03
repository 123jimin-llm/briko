import OpenAI from "openai";
import { ResponseCreateParamsBase, ResponseStreamEvent } from "openai/resources/responses/responses";
import { Stream } from "openai/core/streaming";

import { LLMClient, LLMStream } from "../type.js";
import { invokeLLMStreamEventHandlers, LLMStreamEvent, LLMStreamEventHandlersRecord } from "../event.js";
import { createEncoder, Message, OpenAIResponsesInputCodec } from "llm-msg-io";
import { LLMRequest } from "../../request/type.js";

export type OpenAIExtraStepParams = Partial<ResponseCreateParamsBase>;

export function createOpenAIClient(): LLMClient<OpenAIExtraStepParams> {
    const client = new OpenAI();

    return {
        async step<S extends boolean>(request: LLMRequest<OpenAIExtraStepParams>, stream = false): Promise<[S] extends [true] ? LLMStream : Message> {
            const res = await client.responses.create({
                ...createOpenAIResponseCreateParams(request),
                stream,
            });

            if(stream) {
                return createLLMStream(res as Stream<ResponseStreamEvent>) as ([S] extends [true] ? LLMStream : Message);
            } else {
                throw new Error("Not yet implemented!");
            }
        }
    };
}

function createOpenAIResponseCreateParams(request: LLMRequest<OpenAIExtraStepParams>): ResponseCreateParamsBase {
    // TODO
    const api_messages = createEncoder(OpenAIResponsesInputCodec)(request.messages);
    return {
        ...request.extra_params,
    };
}

function createLLMStream(stream: Stream<ResponseStreamEvent>): LLMStream {
    const event_handlers: LLMStreamEventHandlersRecord = {};
    const message: Message = { role: "assistant", content: "" };

    let done = false;
    const done_waits = new Array<{
        resolve(): void;
        reject(reason?: unknown): void;
    }>();

    queueMicrotask(async () => {
        try {
            for await(const event of stream) {
                switch(event.type) {
                    case "response.output_text.delta": {
                        invokeLLMStreamEventHandlers(event_handlers, {
                            type: "content.delta",
                            delta: event.delta,
                        });

                        break;
                    }
                }
            }
            done = true;
            for(const {resolve} of done_waits) {
                resolve();
            }
        } catch(err) {
            done = true;
            for(const {reject} of done_waits) {
                reject(err);
            }
        }
    });

    return {
        on(type, listener) {
            const arr: Array<(event: LLMStreamEvent) => void> = event_handlers[type] ?? [];

            if(!Object.hasOwn(event_handlers, type)) {
                event_handlers[type] = arr;
            }

            arr.push(listener as (event: LLMStreamEvent) => void);

            return this;
        },

        async done(): Promise<Message> {
            if(done) {
                return message;
            } else {
                await new Promise<void>((resolve, reject) => {
                    done_waits.push({resolve, reject});
                });

                return message;
            }
        },
    };
}