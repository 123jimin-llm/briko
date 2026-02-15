import type {MessageArray, MessageContent} from "llm-msg-io";
import type {TokenCounter} from "./type.ts";
import type {Nullable, Promisable} from "@jiminp/tooltool";

export interface CreateTextBasedTokenCounterParams<ModelSlug extends string = string> {
    countTokens?: Nullable<(model: ModelSlug, text: string) => Promisable<number>>;
    additional_tokens_per_message?: Nullable<number>;
}

export interface CreateHeuristicTextTokenCounterParams {
    tokens_per_ascii?: Nullable<number>;
    tokens_per_non_ascii?: Nullable<number>;
}

export type CreateHeuristicTokenCounterParams<ModelSlug extends string = string> =
    CreateTextBasedTokenCounterParams<ModelSlug> & CreateHeuristicTextTokenCounterParams;

/** Wraps a text-level counter into a full message-array token counter. */
export function createTextBasedTokenCounter<ModelSlug extends string = string>(params: CreateTextBasedTokenCounterParams<ModelSlug> = {}): TokenCounter<ModelSlug> {
    const counter = params.countTokens ?? createHeuristicTextTokenCounter();
    const additional = params.additional_tokens_per_message ?? 3;

    async function countContent(model: ModelSlug, content: Nullable<MessageContent>): Promise<number> {
        if(content == null) return 0;
        if(typeof content === 'string') return counter(model, content);

        let total = 0;
        for(const part of content) {
            if(part.type === 'text') total += await counter(model, part.text);
        }
        return total;
    }

    return {
        async countTokens(model, messages: MessageArray) {
            return Promise.all(
                messages.map(async ({role, content}) => (await counter(model, role)) + (await countContent(model, content)) + additional),
            ).then((counts) => counts.reduce((a, b) => a + b, 0));
        },
    };
}

/** Creates a sync heuristic text token counter from per-character weights. */
export function createHeuristicTextTokenCounter(params: CreateHeuristicTextTokenCounterParams = {}): (text: string) => number {
    const per_ascii = params.tokens_per_ascii ?? 0.25;
    const per_non_ascii = params.tokens_per_non_ascii ?? 1;

    return (text) => {
        if(text.length === 0) return 0;

        let weight = 0;
        for(let i = 0; i < text.length; i++) {
            weight += text.charCodeAt(i) > 0x7F ? per_non_ascii : per_ascii;
        }
        return Math.ceil(weight);
    };
}

/** Combines a heuristic text counter with the text-based message counter. */
export function createHeuristicTokenCounter(params: CreateHeuristicTokenCounterParams = {}): TokenCounter {
    const countTokens = params.countTokens ?? ((estimateText) => (_model, text) => estimateText(text))(createHeuristicTextTokenCounter(params));

    return createTextBasedTokenCounter({
        countTokens,
        additional_tokens_per_message: params.additional_tokens_per_message,
    });
}
