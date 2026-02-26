// src/lib/ai/providers/together.ts
// Stub — Together AI support coming soon
import type { AIMessage, AIResponse, AIConfig } from '../service';

export async function generateWithTogether(
    _messages: AIMessage[],
    _config?: AIConfig,
): Promise<AIResponse> {
    throw new Error(
        'Together AI provider is not yet implemented. Set AI_PROVIDER=groq in your .env.local to use the Groq provider.',
    );
}
