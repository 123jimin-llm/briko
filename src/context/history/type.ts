import type {MessageArray} from "llm-msg-io";
import type {Context, ContextWindowConstraint} from "../type.js";

export interface History extends Context {
    /** Adds the given message to the history. */
    "push"(...messages: MessageArray): Promise<void>;

    /** Commits the current state. */
    "commit"(constraint?: ContextWindowConstraint): Promise<void>;

    /** Reverts to previously committed state. */
    "revert"(): Promise<void>;

    /** Exports the current history. */
    "export"(): Promise<MessageArray>;
};
