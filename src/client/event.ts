import type { ContentPart } from "llm-msg-io";

export interface ContentDeltaEvent {
    type: "content.delta";
    delta: ContentPart;
};

export type LLMStreamEvent = ContentDeltaEvent;

export type LLMStreamEventHandlersRecord = {
    [K in LLMStreamEvent as K["type"]]?: Array<(event: K) => void>;
};