// src/lib/ai/service.ts

import { generateWithGroq } from './providers/groq';
import { generateWithGoogle } from './providers/google';
import { generateWithHuggingFace } from './providers/huggingface';
import { generateWithTogether } from './providers/together';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIProvider = 'groq' | 'google' | 'huggingface' | 'together';

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIResponse {
    content: string;
    provider: AIProvider;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    durationMs: number;
}

export interface AIConfig {
    /** Override the default model for the active provider */
    model?: string;
    /** Max tokens to generate (default 2048) */
    maxTokens?: number;
    /** Sampling temperature 0-1 (default 0.7) */
    temperature?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class AIService {
    private getProvider(): AIProvider {
        const raw = process.env.AI_PROVIDER ?? 'groq';
        const valid: AIProvider[] = ['groq', 'google', 'huggingface', 'together'];
        if (valid.includes(raw as AIProvider)) {
            return raw as AIProvider;
        }
        console.warn(`Unknown AI_PROVIDER "${raw}", falling back to "groq"`);
        return 'groq';
    }

    /**
     * Generate a completion from the configured AI provider.
     * Provider is read from the AI_PROVIDER env variable (default: 'groq').
     */
    async generateCompletion(
        messages: AIMessage[],
        config?: AIConfig,
    ): Promise<AIResponse> {
        const provider = this.getProvider();

        switch (provider) {
            case 'groq':
                return generateWithGroq(messages, config);
            case 'google':
                return generateWithGoogle(messages, config);
            case 'huggingface':
                return generateWithHuggingFace(messages, config);
            case 'together':
                return generateWithTogether(messages, config);
            default: {
                // Exhaustive check
                const _: never = provider;
                throw new Error(`Unhandled provider: ${_}`);
            }
        }
    }
}

// Singleton — reuse across the app without re-instantiating
export const aiService = new AIService();
