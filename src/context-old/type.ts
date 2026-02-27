import type {MessageArray} from "llm-msg-io";

export interface ContextWindowMeasure {
    /** A unique identifier for the measurer being used. */
    id: string;

    /** Get the number of tokens to represent the given messages. */
    getNumTokens(messages: MessageArray): Promise<number>;
}

export interface ContextWindowConstraint {
    measure: ContextWindowMeasure;
    max_tokens: number;
}

export interface Context {
    /**
     * Retrieves the list of messages represented by this context.
     *
     * The constraint is used to determine the maximum number of tokens to include.
     * It is advised to return `messages` such that `constraint.measure(messages) <= constraint.max_tokens`, but it's not mandatory.
     */
    toMessageArray(constraint?: ContextWindowConstraint): Promise<MessageArray>;
}
