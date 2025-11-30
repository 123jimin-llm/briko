import { MessageArray } from "llm-msg-io";
import { TransformFunction, NestedArray } from "@jiminp/tooltool";

export interface LLMRequest<ExtraParams extends object = {}> {
    messages: MessageArray;
    extra_params?: ExtraParams;
    use(...transforms: NestedArray<TransformFunction<LLMRequest<ExtraParams>>>): LLMRequest<ExtraParams>;
}