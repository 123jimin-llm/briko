import type {Promisable} from "@jiminp/tooltool";
import type {MessageArray} from "llm-msg-io";

/** Cached token count for specific model slugs. */
export type TokenCountData<ModelSlug extends string = string> = {
    [K in ModelSlug]?: {
        count: number;
    };
};

export interface TokenCounter<ModelSlug extends string = string> {
    countTokens(model: ModelSlug, messages: MessageArray): Promisable<number>;
}
