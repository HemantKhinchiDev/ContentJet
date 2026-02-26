// src/lib/ai/prompts/index.ts
import type { AIMessage } from '../service';

// ─── Template Definitions ─────────────────────────────────────────────────────

export interface PromptVariable {
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
    /** 'text' for short inputs, 'textarea' for multi-line */
    type?: 'text' | 'textarea';
}

export interface PromptTemplate {
    name: string;
    description: string;
    icon: string;
    variables: PromptVariable[];
    systemPrompt: string;
    userPrompt: string;
}

const BLOG_POST: PromptTemplate = {
    name: 'BLOG_POST',
    description: 'Long-form blog article with SEO-friendly structure',
    icon: '📝',
    variables: [
        { key: 'topic', label: 'Topic', placeholder: 'e.g. How AI is changing content marketing', required: true, type: 'text' },
        { key: 'audience', label: 'Target Audience', placeholder: 'e.g. Marketing managers at B2B SaaS companies', required: true, type: 'text' },
        { key: 'tone', label: 'Tone', placeholder: 'e.g. Professional but conversational', required: false, type: 'text' },
        { key: 'keywords', label: 'SEO Keywords', placeholder: 'e.g. AI content, marketing automation', required: false, type: 'text' },
    ],
    systemPrompt: `You are an expert content writer and SEO specialist. Write engaging, well-structured blog posts that rank on search engines and captivate readers. Use clear headings, compelling introductions, and actionable insights.`,
    userPrompt: `Write a comprehensive blog post about: {{topic}}

Target audience: {{audience}}
Tone: {{tone}}
SEO keywords to naturally include: {{keywords}}

Structure the post with:
1. An attention-grabbing introduction (hook the reader in the first 2 sentences)
2. Clear H2 and H3 headings throughout
3. Practical, actionable content with examples
4. A strong conclusion with a call-to-action
5. Aim for 800-1200 words`,
};

const SOCIAL_POST: PromptTemplate = {
    name: 'SOCIAL_POST',
    description: 'Engaging social media posts for any platform',
    icon: '📱',
    variables: [
        { key: 'topic', label: 'Topic / Message', placeholder: 'e.g. Announcing our new product launch', required: true, type: 'text' },
        { key: 'platform', label: 'Platform', placeholder: 'e.g. LinkedIn, Twitter/X, Instagram', required: true, type: 'text' },
        { key: 'tone', label: 'Tone', placeholder: 'e.g. Excited, Professional, Casual', required: false, type: 'text' },
        { key: 'cta', label: 'Call-to-Action', placeholder: 'e.g. Visit our website, Sign up now', required: false, type: 'text' },
    ],
    systemPrompt: `You are a social media expert who crafts viral, engaging posts. You understand platform nuances — LinkedIn's professional tone, Twitter's brevity, Instagram's visual storytelling. Always optimize for engagement.`,
    userPrompt: `Create a {{platform}} post about: {{topic}}

Tone: {{tone}}
Call-to-action: {{cta}}

Requirements:
- Tailor length and style to the {{platform}} platform
- Include relevant hashtags (3-5 for LinkedIn, 5-10 for Instagram, 1-3 for Twitter)
- Make the opening line impossible to scroll past
- Include emojis where appropriate`,
};

const EMAIL_SUBJECT: PromptTemplate = {
    name: 'EMAIL_SUBJECT',
    description: 'High open-rate email subject lines',
    icon: '✉️',
    variables: [
        { key: 'purpose', label: 'Email Purpose', placeholder: 'e.g. Weekly newsletter, Product launch, Re-engagement campaign', required: true, type: 'text' },
        { key: 'audience', label: 'Audience', placeholder: 'e.g. Free trial users who haven\'t upgraded', required: true, type: 'text' },
        { key: 'offer', label: 'Key Offer or Message', placeholder: 'e.g. 50% off for 24 hours only', required: false, type: 'text' },
    ],
    systemPrompt: `You are an email marketing expert with decades of experience writing subject lines that achieve 40%+ open rates. You blend curiosity, urgency, personalization, and value into short, compelling lines.`,
    userPrompt: `Generate 10 email subject line variations for:

Purpose: {{purpose}}
Audience: {{audience}}
Key offer/message: {{offer}}

Mix these styles:
- Curiosity-driven (e.g. "You won't believe what happened...")
- Benefit-focused (e.g. "Double your traffic in 7 days")
- Question-based (e.g. "Are you making this mistake?")
- Urgency/scarcity (e.g. "Last chance: expires tonight")
- Personalized (e.g. "{{audience}}, this is for you")

Keep each under 55 characters where possible. Rate each 1-10 for predicted open rate.`,
};

const EMAIL_NEWSLETTER: PromptTemplate = {
    name: 'EMAIL_NEWSLETTER',
    description: 'Full email newsletter with sections and CTAs',
    icon: '📰',
    variables: [
        { key: 'topic', label: 'Main Topic', placeholder: 'e.g. This week in AI tools for creators', required: true, type: 'text' },
        { key: 'audience', label: 'Audience', placeholder: 'e.g. Content creators and marketers', required: true, type: 'text' },
        { key: 'sections', label: 'Sections to Include', placeholder: 'e.g. Industry news, Tips, Product spotlight, Quote', required: false, type: 'textarea' },
        { key: 'cta', label: 'Primary CTA', placeholder: 'e.g. Try ContentJet free for 14 days', required: false, type: 'text' },
    ],
    systemPrompt: `You are an expert email copywriter specializing in newsletters that people actually look forward to reading. You balance value, personality, and clear calls-to-action.`,
    userPrompt: `Write a full email newsletter about: {{topic}}

Target audience: {{audience}}
Sections to include: {{sections}}
Primary call-to-action: {{cta}}

Format:
- Warm, personalized greeting
- Brief 2-3 sentence intro that hooks the reader
- Well-structured sections with clear headers
- Conversational tone throughout
- Strong CTA placement (mid-email and end)
- Friendly sign-off`,
};

const PRODUCT_DESCRIPTION: PromptTemplate = {
    name: 'PRODUCT_DESCRIPTION',
    description: 'Conversion-focused product descriptions',
    icon: '🛍️',
    variables: [
        { key: 'product', label: 'Product Name', placeholder: 'e.g. ContentJet Pro Subscription', required: true, type: 'text' },
        { key: 'features', label: 'Key Features', placeholder: 'e.g. AI writing, 50 templates, team collaboration', required: true, type: 'textarea' },
        { key: 'audience', label: 'Target Customer', placeholder: 'e.g. Freelance content creators', required: true, type: 'text' },
        { key: 'price', label: 'Price Point', placeholder: 'e.g. $29/month', required: false, type: 'text' },
    ],
    systemPrompt: `You are a conversion copywriter who writes product descriptions that sell. You lead with benefits, address objections, and use psychology to compel action. Every word earns its place.`,
    userPrompt: `Write a compelling product description for: {{product}}

Key features: {{features}}
Target customer: {{audience}}
Price: {{price}}

Include:
1. A powerful headline that leads with the primary benefit
2. 3-4 sentences painting the transformation/outcome
3. Bullet points for key features (benefit-first format)
4. Social proof placeholder (e.g. "Join 10,000+ creators who...")
5. Clear CTA
6. Keep it under 200 words`,
};

const VIDEO_SCRIPT: PromptTemplate = {
    name: 'VIDEO_SCRIPT',
    description: 'YouTube / short-form video scripts with hooks',
    icon: '🎬',
    variables: [
        { key: 'topic', label: 'Video Topic', placeholder: 'e.g. 5 AI tools that will 10x your content output', required: true, type: 'text' },
        { key: 'platform', label: 'Platform', placeholder: 'e.g. YouTube (10 min), TikTok (60 sec), Instagram Reels (30 sec)', required: true, type: 'text' },
        { key: 'style', label: 'Presentation Style', placeholder: 'e.g. Educational, Entertainment, Tutorial, Storytime', required: false, type: 'text' },
        { key: 'cta', label: 'End CTA', placeholder: 'e.g. Subscribe, Check out the link in bio', required: false, type: 'text' },
    ],
    systemPrompt: `You are a YouTube and social video scriptwriter. You craft scripts that hook viewers in the first 3 seconds, maintain engagement throughout, and drive action. You write in a natural spoken voice.`,
    userPrompt: `Write a {{platform}} video script about: {{topic}}

Style: {{style}}
End CTA: {{cta}}

Include:
- [HOOK] Opening 3 seconds that demand attention  
- [INTRO] Quick promise of what viewers will learn
- [BODY] Core content with clear structure
- [TRANSITION] Natural bridges between sections
- [OUTRO] Strong close with CTA
- Add [B-ROLL] suggestions in brackets
- Write in natural spoken language (contractions, short sentences)`,
};

const SEO_META: PromptTemplate = {
    name: 'SEO_META',
    description: 'SEO meta titles and descriptions for any page',
    icon: '🔍',
    variables: [
        { key: 'page', label: 'Page / Content Title', placeholder: 'e.g. ContentJet — AI Content Generator for Marketers', required: true, type: 'text' },
        { key: 'keywords', label: 'Target Keywords', placeholder: 'e.g. AI content generator, content marketing tool', required: true, type: 'text' },
        { key: 'audience', label: 'Target Audience', placeholder: 'e.g. Marketing professionals', required: false, type: 'text' },
        { key: 'usp', label: 'Unique Selling Point', placeholder: 'e.g. 10x faster than writing manually, free to start', required: false, type: 'text' },
    ],
    systemPrompt: `You are an SEO specialist who writes meta tags that rank and get clicks. You balance keyword optimization with compelling copy that drives CTR in search results.`,
    userPrompt: `Generate SEO meta tags for: {{page}}

Target keywords: {{keywords}}
Audience: {{audience}}
USP: {{usp}}

Provide 3 variations of each:
**Meta Title** (50-60 characters, include primary keyword)
**Meta Description** (150-160 characters, include CTA, include keyword)

Also generate:
- 5 LSI (Latent Semantic Indexing) keyword suggestions
- 3 Open Graph title variants for social sharing`,
};

const CONTENT_REWRITE: PromptTemplate = {
    name: 'CONTENT_REWRITE',
    description: 'Rewrite and improve existing content',
    icon: '✏️',
    variables: [
        { key: 'content', label: 'Original Content', placeholder: 'Paste your existing content here...', required: true, type: 'textarea' },
        { key: 'goal', label: 'Rewrite Goal', placeholder: 'e.g. Make it more engaging, Simplify for general audience, Improve SEO', required: true, type: 'text' },
        { key: 'tone', label: 'Target Tone', placeholder: 'e.g. Conversational, Professional, Bold', required: false, type: 'text' },
        { key: 'length', label: 'Length Instruction', placeholder: 'e.g. Keep same length, Expand by 50%, Condense to 200 words', required: false, type: 'text' },
    ],
    systemPrompt: `You are an expert editor and content strategist. You improve content while preserving the author's core message. You enhance clarity, flow, engagement, and impact without losing the original intent.`,
    userPrompt: `Rewrite and improve the following content:

---
{{content}}
---

Rewrite goal: {{goal}}
Target tone: {{tone}}
Length instruction: {{length}}

Provide:
1. The rewritten content
2. A brief "What changed" summary (3-5 bullet points) explaining key improvements`,
};

// ─── Template Registry ────────────────────────────────────────────────────────

export const PROMPTS: Record<string, PromptTemplate> = {
    BLOG_POST,
    SOCIAL_POST,
    EMAIL_SUBJECT,
    EMAIL_NEWSLETTER,
    PRODUCT_DESCRIPTION,
    VIDEO_SCRIPT,
    SEO_META,
    CONTENT_REWRITE,
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Replace all {{variable}} placeholders in a template string.
 * Unknown variables are left as-is.
 */
export function fillPromptTemplate(
    template: string,
    variables: Record<string, string>,
): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        return variables[key] ?? `{{${key}}}`;
    });
}

/**
 * Build an AIMessage array from a named template + variable values.
 * Returns [system, user] messages ready for the AI service.
 */
export function buildMessagesFromTemplate(
    name: string,
    variables: Record<string, string>,
): AIMessage[] {
    const template = PROMPTS[name];
    if (!template) {
        throw new Error(
            `Unknown template "${name}". Valid templates: ${Object.keys(PROMPTS).join(', ')}`,
        );
    }

    const systemContent = fillPromptTemplate(template.systemPrompt, variables);
    const userContent = fillPromptTemplate(template.userPrompt, variables);

    return [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
    ];
}

/**
 * Return a list of templates suitable for rendering in a UI dropdown / list.
 */
export function listTemplates() {
    return Object.entries(PROMPTS).map(([key, t]) => ({
        key,
        name: t.name,
        description: t.description,
        icon: t.icon,
        variables: t.variables,
    }));
}
