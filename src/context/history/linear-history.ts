import { MessageArray } from "llm-msg-io";
import type { History } from "./type.js";
import type { ContextWindowConstraint } from "../type.js";

export class LinearHistory implements History {
    /** The list of messages in the history. */
    private history: MessageArray;

    /** Length of the history at the time of the last commit. */
    private committed_ind: number = 0;

    constructor(history?: MessageArray) {
        this.history = history?.length ? [...history] : [];
    }

    async toMessageArray(constraint?: ContextWindowConstraint): Promise<MessageArray> {
        if(!constraint) return this.history;

        const { measure, max_tokens } = constraint;

        let total_tokens = 0;
        let end_index = this.history.length;

        for(let i = this.history.length - 1; i >= 0; --i) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const message = this.history[i]!;
            const message_tokens = await measure.getNumTokens([message]);
            total_tokens += message_tokens;

            if(max_tokens < total_tokens) {
                break;
            }

            end_index = i;
        }

        return this.history.slice(end_index);
    }

    async push(...messages: MessageArray): Promise<void> {
        this.history.push(...messages);
    }

    async commit(): Promise<void> {
        this.committed_ind = this.history.length;
    }

    async revert(): Promise<void> {
        this.history.length = this.committed_ind;
    }

    async export(): Promise<MessageArray> {
        return [...this.history];
    }
}