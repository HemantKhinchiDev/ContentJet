'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Copy, Download, CheckCheck, Sparkles, ChevronRight, Zap, FileText, MessageSquare, Mail, Newspaper, ShoppingBag, Video, Search, Edit3 } from 'lucide-react';
import { useUsage } from '@/context/UsageContext';
import { HistoryManager, HistoryItem } from '@/lib/history-manager';

// ─── Types (mirroring server types) ──────────────────────────────────────────

interface TemplateVariable {
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
    type?: 'text' | 'textarea';
}

interface Template {
    key: string;
    name: string;
    description: string;
    icon: any;
    variables: TemplateVariable[];
}

interface GenerationMetadata {
    provider: string;
    model: string;
    tokens: { prompt: number; completion: number; total: number };
    durationMs: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TemplatePill({ template, active, onClick }: {
    template: Template;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${active
                ? 'bg-gray-100 dark:bg-[color:lab(10%_0_0)] text-gray-900 dark:text-white font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[color:lab(8%_0_0)] hover:text-gray-900 dark:hover:text-white'
                }`}
        >
            <template.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
                <p className={`text-[14px] truncate ${active ? 'text-gray-900 dark:text-white font-medium' : 'font-medium'}`}>
                    {template.name.replace(/_/g, ' ')}
                </p>
                <p className={`text-xs truncate ${active ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>{template.description}</p>
            </div>
        </button>
    );
}

function MetadataBar({ metadata }: { metadata: GenerationMetadata }) {
    return (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-muted/30 border-t border-border text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-medium">
                <Zap className="h-3 w-3" />
                {metadata.provider.toUpperCase()}
            </span>
            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">{metadata.model}</span>
            <span>·</span>
            <span>{metadata.tokens.total.toLocaleString()} tokens</span>
            <span>·</span>
            <span>{(metadata.durationMs / 1000).toFixed(2)}s</span>
            <span>·</span>
            <span className="text-green-400 font-medium">
                ↑{metadata.tokens.prompt} / ↓{metadata.tokens.completion}
            </span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function AIContentGeneratorInner() {
    const { incrementUsage } = useUsage();
    const searchParams = useSearchParams();

    const [templates] = useState<Template[]>(() => {
        // Templates are hardcoded client-side to avoid an extra fetch.
        // They match what the server returns from listTemplates().
        return STATIC_TEMPLATES;
    });

    const [selectedTemplate, setSelectedTemplate] = useState<Template>(() => {
        const queryTemplate = searchParams?.get('template');
        if (queryTemplate) {
            const found = templates.find((t) => t.key === queryTemplate);
            if (found) return found;
        }
        return templates[0];
    });

    useEffect(() => {
        const queryTemplate = searchParams?.get('template');
        if (queryTemplate) {
            const found = templates.find(t => t.key === queryTemplate);
            if (found && found.key !== selectedTemplate.key) {
                setSelectedTemplate(found);
                setVariables({});
                setOutput(null);
                setError(null);
                setMetadata(null);
            }
        }
    }, [searchParams, templates, selectedTemplate.key]);

    const [variables, setVariables] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<GenerationMetadata | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSelectTemplate = useCallback((tpl: Template) => {
        setSelectedTemplate(tpl);
        setVariables({});
        setOutput(null);
        setError(null);
        setMetadata(null);
    }, []);

    const handleVariableChange = useCallback((key: string, value: string) => {
        setVariables(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setError(null);
        setOutput(null);
        setMetadata(null);

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateName: selectedTemplate.key,
                    variables,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Something went wrong. Please try again.');
                return;
            }

            setOutput(data.content);
            setMetadata(data.metadata);

            // Determine category mapping
            const getCategory = (key: string): HistoryItem['category'] => {
                const map: Record<string, HistoryItem['category']> = {
                    'BLOG_POST': 'blog',
                    'SOCIAL_POST': 'social',
                    'EMAIL_SUBJECT': 'email_subject',
                    'EMAIL_NEWSLETTER': 'newsletter',
                    'PRODUCT_DESCRIPTION': 'product',
                    'VIDEO_SCRIPT': 'video_script',
                    'SEO_META': 'seo_meta',
                    'CONTENT_REWRITE': 'rewrite',
                };
                return map[key] || 'blog'; // Fallback
            };

            // Get title based on template
            const getTitle = () => {
                return variables.topic ||
                    variables.purpose ||
                    variables.product ||
                    variables.page ||
                    'Untitled Generation';
            };

            // Save to history
            try {
                HistoryManager.save(
                    getCategory(selectedTemplate.key),
                    getTitle(),
                    data.content,
                    variables
                );
            } catch (historyError) {
                console.warn('Failed to save to history:', historyError);
            }

            // Update usage counter instantly via context
            incrementUsage();
        } catch {
            setError('Network error — is the dev server running?');
        } finally {
            setLoading(false);
        }
    }, [selectedTemplate, variables, incrementUsage]);

    const handleCopy = useCallback(async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.warn('Clipboard access denied or failed');
        }
    }, [output]);

    const handleDownload = useCallback(() => {
        if (!output) return;
        const filename = `${selectedTemplate.key.toLowerCase()}_${Date.now()}.txt`;
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, [output, selectedTemplate]);

    const requiredFilled = selectedTemplate.variables
        .filter(v => v.required)
        .every(v => (variables[v.key] ?? '').trim().length > 0);

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden">
            {/* ── Left Panel: Template Selector ── */}
            <aside className="w-64 flex-shrink-0 border-r border-border bg-muted/10 flex flex-col">
                <div className="px-4 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                        Templates
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">8 AI-powered formats</p>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
                    {templates.map(tpl => (
                        <TemplatePill
                            key={tpl.key}
                            template={tpl}
                            active={tpl.key === selectedTemplate.key}
                            onClick={() => handleSelectTemplate(tpl)}
                        />
                    ))}
                </nav>
            </aside>

            {/* ── Main Area ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
                    <div className="flex items-start gap-3">
                        <selectedTemplate.icon className="w-6 h-6 flex-shrink-0 text-gray-900 dark:text-white" strokeWidth={1.5} />
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">
                                {selectedTemplate.name.replace(/_/g, ' ')}
                            </h1>
                            <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
                        {/* Variables */}
                        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">Content Details</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {selectedTemplate.variables.map(variable => (
                                    <div
                                        key={variable.key}
                                        className={variable.type === 'textarea' ? 'sm:col-span-2' : ''}
                                    >
                                        <label htmlFor={`var-${variable.key}`} className="block text-xs font-medium text-muted-foreground mb-1.5">
                                            {variable.label}
                                            {variable.required && (
                                                <span className="text-pink-400 ml-1">*</span>
                                            )}
                                        </label>
                                        {variable.type === 'textarea' ? (
                                            <textarea
                                                id={`var-${variable.key}`}
                                                rows={4}
                                                value={variables[variable.key] ?? ''}
                                                onChange={e => handleVariableChange(variable.key, e.target.value)}
                                                placeholder={variable.placeholder}
                                                className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-y transition-colors"
                                            />
                                        ) : (
                                            <input
                                                id={`var-${variable.key}`}
                                                type="text"
                                                value={variables[variable.key] ?? ''}
                                                onChange={e => handleVariableChange(variable.key, e.target.value)}
                                                placeholder={variable.placeholder}
                                                className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            id="generate-btn"
                            onClick={handleGenerate}
                            disabled={loading || !requiredFilled}
                            className="w-full flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white dark:text-gray-900 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                                    Generate Content
                                </>
                            )}
                        </button>

                        {/* Error */}
                        {error && (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Output */}
                        {output && (
                            <div className="rounded-xl border border-border overflow-hidden shadow-sm">
                                {/* Output toolbar */}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
                                    <span className="text-xs font-medium text-muted-foreground">Generated Content</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            id="copy-btn"
                                            onClick={handleCopy}
                                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {copied ? (
                                                <><CheckCheck className="h-3.5 w-3.5 text-green-400" /> Copied!</>
                                            ) : (
                                                <><Copy className="h-3.5 w-3.5" /> Copy</>
                                            )}
                                        </button>
                                        <button
                                            id="download-btn"
                                            onClick={handleDownload}
                                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Download
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="bg-background">
                                    <pre className="p-5 text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                                        {output}
                                    </pre>
                                </div>

                                {/* Metadata bar */}
                                {metadata && <MetadataBar metadata={metadata} />}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AIContentGenerator() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <AIContentGeneratorInner />
        </Suspense>
    );
}

// ─── Static Template Data ─────────────────────────────────────────────────────
// Keeps the component self-contained without a fetch on mount.
// These match the server-side PROMPTS registry.

const STATIC_TEMPLATES: Template[] = [
    {
        key: 'BLOG_POST',
        name: 'BLOG POST',
        description: 'Long-form blog article with SEO-friendly structure',
        icon: FileText,
        variables: [
            { key: 'topic', label: 'Topic', placeholder: 'e.g. How AI is changing content marketing', required: true, type: 'text' },
            { key: 'audience', label: 'Target Audience', placeholder: 'e.g. Marketing managers at B2B SaaS companies', required: true, type: 'text' },
            { key: 'tone', label: 'Tone', placeholder: 'e.g. Professional but conversational', required: false, type: 'text' },
            { key: 'keywords', label: 'SEO Keywords', placeholder: 'e.g. AI content, marketing automation', required: false, type: 'text' },
        ],
    },
    {
        key: 'SOCIAL_POST',
        name: 'SOCIAL POST',
        description: 'Engaging social media posts for any platform',
        icon: MessageSquare,
        variables: [
            { key: 'topic', label: 'Topic / Message', placeholder: 'e.g. Announcing our new product launch', required: true, type: 'text' },
            { key: 'platform', label: 'Platform', placeholder: 'e.g. LinkedIn, Twitter/X, Instagram', required: true, type: 'text' },
            { key: 'tone', label: 'Tone', placeholder: 'e.g. Excited, Professional, Casual', required: false, type: 'text' },
            { key: 'cta', label: 'Call-to-Action', placeholder: 'e.g. Visit our website, Sign up now', required: false, type: 'text' },
        ],
    },
    {
        key: 'EMAIL_SUBJECT',
        name: 'EMAIL SUBJECT',
        description: 'High open-rate email subject lines',
        icon: Mail,
        variables: [
            { key: 'purpose', label: 'Email Purpose', placeholder: "e.g. Weekly newsletter, Product launch", required: true, type: 'text' },
            { key: 'audience', label: 'Audience', placeholder: "e.g. Free trial users who haven't upgraded", required: true, type: 'text' },
            { key: 'offer', label: 'Key Offer or Message', placeholder: 'e.g. 50% off for 24 hours only', required: false, type: 'text' },
        ],
    },
    {
        key: 'EMAIL_NEWSLETTER',
        name: 'EMAIL NEWSLETTER',
        description: 'Full email newsletter with sections and CTAs',
        icon: Newspaper,
        variables: [
            { key: 'topic', label: 'Main Topic', placeholder: 'e.g. This week in AI tools for creators', required: true, type: 'text' },
            { key: 'audience', label: 'Audience', placeholder: 'e.g. Content creators and marketers', required: true, type: 'text' },
            { key: 'sections', label: 'Sections to Include', placeholder: 'e.g. Industry news, Tips, Product spotlight', required: false, type: 'textarea' },
            { key: 'cta', label: 'Primary CTA', placeholder: 'e.g. Try ContentJet free for 14 days', required: false, type: 'text' },
        ],
    },
    {
        key: 'PRODUCT_DESCRIPTION',
        name: 'PRODUCT DESCRIPTION',
        description: 'Conversion-focused product descriptions',
        icon: ShoppingBag,
        variables: [
            { key: 'product', label: 'Product Name', placeholder: 'e.g. ContentJet Pro Subscription', required: true, type: 'text' },
            { key: 'features', label: 'Key Features', placeholder: 'e.g. AI writing, 50 templates, team collaboration', required: true, type: 'textarea' },
            { key: 'audience', label: 'Target Customer', placeholder: 'e.g. Freelance content creators', required: true, type: 'text' },
            { key: 'price', label: 'Price Point', placeholder: 'e.g. $29/month', required: false, type: 'text' },
        ],
    },
    {
        key: 'VIDEO_SCRIPT',
        name: 'VIDEO SCRIPT',
        description: 'YouTube / short-form video scripts with hooks',
        icon: Video,
        variables: [
            { key: 'topic', label: 'Video Topic', placeholder: 'e.g. 5 AI tools that will 10x your content output', required: true, type: 'text' },
            { key: 'platform', label: 'Platform', placeholder: 'e.g. YouTube (10 min), TikTok (60 sec)', required: true, type: 'text' },
            { key: 'style', label: 'Presentation Style', placeholder: 'e.g. Educational, Tutorial, Storytime', required: false, type: 'text' },
            { key: 'cta', label: 'End CTA', placeholder: 'e.g. Subscribe, Check out the link in bio', required: false, type: 'text' },
        ],
    },
    {
        key: 'SEO_META',
        name: 'SEO META',
        description: 'SEO meta titles and descriptions for any page',
        icon: Search,
        variables: [
            { key: 'page', label: 'Page / Content Title', placeholder: 'e.g. ContentJet — AI Content Generator', required: true, type: 'text' },
            { key: 'keywords', label: 'Target Keywords', placeholder: 'e.g. AI content generator, content marketing tool', required: true, type: 'text' },
            { key: 'audience', label: 'Target Audience', placeholder: 'e.g. Marketing professionals', required: false, type: 'text' },
            { key: 'usp', label: 'Unique Selling Point', placeholder: 'e.g. 10x faster, free to start', required: false, type: 'text' },
        ],
    },
    {
        key: 'CONTENT_REWRITE',
        name: 'CONTENT REWRITE',
        description: 'Rewrite and improve existing content',
        icon: Edit3,
        variables: [
            { key: 'content', label: 'Original Content', placeholder: 'Paste your existing content here...', required: true, type: 'textarea' },
            { key: 'goal', label: 'Rewrite Goal', placeholder: 'e.g. Make it more engaging, Simplify for general audience', required: true, type: 'text' },
            { key: 'tone', label: 'Target Tone', placeholder: 'e.g. Conversational, Professional, Bold', required: false, type: 'text' },
            { key: 'length', label: 'Length Instruction', placeholder: 'e.g. Keep same length, Expand by 50%', required: false, type: 'text' },
        ],
    },
];
