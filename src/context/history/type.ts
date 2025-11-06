import type { MessageArray } from "llm-msg-io";
import type { Context } from "../type.js";

export interface History extends Context {
    /** Adds the given message to the history. */
    push(...messages: MessageArray): Promise<void>;

    /** Commits the current state. */
    commit(): Promise<void>;

    /** Reverts to previously committed state. */
    revert(): Promise<void>;

    /** Exports the current state. */
    export(): Promise<MessageArray>;
};