// src/lib/ai/providers/huggingface.ts
// Stub — HuggingFace Inference API support coming soon
import type { AIMessage, AIResponse, AIConfig } from '../service';

export async function generateWithHuggingFace(
    _messages: AIMessage[],
    _config?: AIConfig,
): Promise<AIResponse> {
    throw new Error(
        'HuggingFace provider is not yet implemented. Set AI_PROVIDER=groq in your .env.local to use the Groq provider.',
    );
}
