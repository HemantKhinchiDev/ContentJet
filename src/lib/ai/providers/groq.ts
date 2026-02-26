// src/lib/ai/providers/groq.ts
import Groq from 'groq-sdk';
import type { AIMessage, AIResponse, AIConfig } from '../service';

const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
] as const;

type GroqModel = (typeof GROQ_MODELS)[number];

const DEFAULT_MODEL: GroqModel = 'llama-3.3-70b-versatile';

export async function generateWithGroq(
    messages: AIMessage[],
    config?: AIConfig,
): Promise<AIResponse> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured');
    }

    const model = (config?.model as GroqModel) ?? DEFAULT_MODEL;
    if (!GROQ_MODELS.includes(model)) {
        throw new Error(
            `Invalid Groq model: "${model}". Valid models: ${GROQ_MODELS.join(', ')}`,
        );
    }

    const client = new Groq({ apiKey });

    const VALID_ROLES = ['user', 'assistant', 'system'] as const;
    type GroqRole = typeof VALID_ROLES[number];

    const groqMessages = messages.map((msg) => ({
        role: (() => {
            if (!VALID_ROLES.includes(msg.role as GroqRole)) {
                throw new Error(`Invalid message role: "${msg.role}". Groq supports: ${VALID_ROLES.join(', ')}`);
            }
            return msg.role as GroqRole;
        })(),
        content: msg.content,
    }));

    const startTime = Date.now();

    try {
        const completion = await client.chat.completions.create({
            model,
            messages: groqMessages,
            max_tokens: config?.maxTokens ?? 2048,
            temperature: config?.temperature ?? 0.7,
        });

        const duration = Date.now() - startTime;
        const choice = completion.choices[0];

        if (!choice?.message?.content) {
            throw new Error('Groq returned an empty response');
        }

        return {
            content: choice.message.content,
            provider: 'groq',
            model,
            promptTokens: completion.usage?.prompt_tokens ?? 0,
            completionTokens: completion.usage?.completion_tokens ?? 0,
            totalTokens: completion.usage?.total_tokens ?? 0,
            durationMs: duration,
        };
    } catch (err: unknown) {
        // Surface specific Groq error codes
        if (err && typeof err === 'object') {
            const groqErr = err as { status?: number; message?: string };
            if (groqErr.status === 429) {
                throw new Error(
                    'Groq rate limit exceeded. Please wait a moment and try again.',
                );
            }
            if (groqErr.status === 401) {
                throw new Error(
                    'Invalid Groq API key. Check your GROQ_API_KEY in .env.local.',
                );
            }
        }
        throw err;
    }
}
