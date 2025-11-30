import OpenAI from "openai";
import { ResponseCreateParamsBase, ResponseStreamEvent } from "openai/resources/responses/responses";
import { Stream } from "openai/core/streaming";

import { LLMClient, LLMStream } from "../type.js";
import { LLMStreamEvent, LLMStreamEventHandlersRecord } from "../event.js";
import { Message } from "llm-msg-io";

export function createOpenAIClient(): LLMClient {
    const client = new OpenAI();

    return {
        async step(request, stream = false): Promise<Message|LLMStream> {
            const params: ResponseCreateParamsBase = {};
            const res = await client.responses.create({
                ...params,
                stream,
            });

            if(stream) {
                return createLLMStream(res as Stream<ResponseStreamEvent>);
            } else {
                throw new Error("Not yet implemented!");
            }
        }
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

    return {
        on(type, listener) {
            let arr: Array<(event: LLMStreamEvent) => void> = [];

            if(Object.hasOwn(event_handlers, type)) {
                arr = event_handlers[type]!;
            } else {
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