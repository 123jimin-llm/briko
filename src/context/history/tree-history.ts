import { MessageArray } from "llm-msg-io";
import type { History } from "./type.js";

/** A half-open interval. */
export interface TreeHistorySpan {
    start: number;
    end: number;
}

export interface TreeHistoryNode {
    span: TreeHistorySpan;
    summary: MessageArray[];
    children: TreeHistoryNode[];
}

export class TreeHistory implements History {
    /** A linear history. */
    private history: MessageArray;
}