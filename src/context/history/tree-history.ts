import { MessageArray } from "llm-msg-io";
import type { History } from "./type.js";

export class TreeHistory implements History {
    /** A linear history. */
    private history: MessageArray;
}