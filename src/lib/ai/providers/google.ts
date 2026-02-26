// src/lib/ai/providers/google.ts
import { GoogleGenAI } from '@google/genai';
import type { AIMessage, AIResponse, AIConfig } from '../service';
import { estimateTokens } from '../tokens';

const MODEL = 'gemini-pro';

export async function generateWithGoogle(
    messages: AIMessage[],
    config?: AIConfig,
): Promise<AIResponse> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    const genAI = new GoogleGenAI({ apiKey });

    const systemMessages = messages.filter((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    if (conversationMessages.length === 0) {
        throw new Error('At least one user message is required');
    }

    const systemContext = systemMessages.map((m) => m.content).join('\n\n');

    // Merge system context into the first user message, or use systemInstruction if the SDK supports it.
    // To match previous behavior and ensure compatibility, we prepend to the last message.
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    const userText = systemContext
        ? `${systemContext}\n\n${lastMessage?.content ?? ''}`
        : (lastMessage?.content ?? '');

    const geminiHistory = conversationMessages.slice(0, -1).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));

    // Add the final modified message
    geminiHistory.push({
        role: 'user',
        parts: [{ text: userText }],
    });

    const startTime = Date.now();
    const result = await genAI.models.generateContent({
        model: MODEL,
        contents: geminiHistory,
        config: {
            maxOutputTokens: config?.maxTokens ?? 2048,
            temperature: config?.temperature ?? 0.7,
        }
    });
    const duration = Date.now() - startTime;

    const content = result.text ?? '';

    // Gemini doesn't return token usage in the standard SDK — estimate it
    const promptText = messages.map((m) => m.content).join(' ');
    const promptTokens = estimateTokens(promptText);
    const completionTokens = estimateTokens(content);

    return {
        content,
        provider: 'google',
        model: MODEL,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        durationMs: duration,
    };
}
