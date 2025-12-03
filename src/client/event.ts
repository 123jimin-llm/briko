import type { MessageContent } from "llm-msg-io";

export interface ContentDeltaEvent {
    type: "content.delta";
    delta: MessageContent;
};

export type LLMStreamEvent = ContentDeltaEvent;

export type LLMStreamEventHandlersRecord = {
    [K in LLMStreamEvent as K["type"]]?: Array<(event: K) => void>;
};

export function invokeLLMStreamEventHandlers<K extends LLMStreamEvent['type']>(record: LLMStreamEventHandlersRecord, event: Extract<LLMStreamEvent, {type: K}>) {
    const handlers = record[event.type];
    if(handlers?.length) {
        for(const handler of handlers) handler(event);
    }
}