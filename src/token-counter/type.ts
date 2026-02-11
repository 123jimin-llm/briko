/** Cached token count for a specific model slug. */
export interface TokenCountData<ModelSlug extends string> {
    model: ModelSlug;
    count: number;
}

export interface TokenCounter<ModelSlug extends string> {
    countTokens(model: ModelSlug, text: string): Promise<number>;
}
