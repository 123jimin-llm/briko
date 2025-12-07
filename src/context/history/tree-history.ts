import { MessageArray } from "llm-msg-io";
import type { History } from "./type.js";

/** A half-open interval. */
export interface TreeHistorySpan {
    start: number;
    end: number;
}

export interface TreeHistoryNode {
    span: TreeHistorySpan;
    summary: MessageArray;
    children: TreeHistoryNode[];
}

export class TreeHistory implements History {
    /** A linear history. */
    private history: MessageArray;

    /** Children of the root node. */
    private children: TreeHistoryNode[];

    constructor(history?: MessageArray) {
        this.history = history?.length ? [...history] : [];
        this.children = this.history.map((msg, i): TreeHistoryNode => {
            return {
                span: { start: i, end: i + 1 },
                summary: [msg],
                children: [],
            };
        });
    }
   
    async push(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async commit(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async revert(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async export(): Promise<MessageArray> {
        return [...this.history];
    }

    async toMessageArray(): Promise<MessageArray> {
        throw new Error("Method not implemented.");
    }
}