// src/lib/ai/tokens.ts
// Token estimation utilities (no paid tokenizer required)

import type { AIMessage } from './service';

/** Model context window limits */
const MODEL_TOKEN_LIMITS: Record<string, number> = {
    'llama-3.3-70b-versatile': 128000,
    'llama-3.1-8b-instant': 128000,
    'mixtral-8x7b-32768': 32768,
    'gemini-pro': 30720,
    'default': 4096,
};

/**
 * Rough token count estimate: ~1 token per 4 characters.
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Estimate total tokens for a messages array.
 * Adds ~4 tokens per message for role/formatting overhead.
 */
export function estimateMessagesTokens(messages: AIMessage[]): number {
    const overhead = messages.length * 4 + 2; // 2 for reply priming
    const contentTokens = messages.reduce((sum, msg) => {
        const content = msg.content ?? '';
        return sum + estimateTokens(content);
    }, 0);
    return overhead + contentTokens;
}

/**
 * Check whether messages fit within a model's token limit.
 * @param maxTokens - max completion tokens to reserve (default 1024)
 */
export function isWithinTokenLimit(
    messages: AIMessage[],
    model: string,
    maxTokens = 1024,
): boolean {
    const limit = MODEL_TOKEN_LIMITS[model] ?? MODEL_TOKEN_LIMITS['default'];
    const estimated = estimateMessagesTokens(messages);
    return estimated + maxTokens <= limit;
}

/**
 * Return the context window limit for a given model.
 */
export function getModelTokenLimit(model: string): number {
    return MODEL_TOKEN_LIMITS[model] ?? MODEL_TOKEN_LIMITS['default'];
}
