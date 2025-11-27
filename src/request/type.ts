import { MessageArray } from "llm-msg-io";

export interface LLMRequest<ExtraParams extends object = {}> {
    messages: MessageArray;
    extra_params?: ExtraParams;
}