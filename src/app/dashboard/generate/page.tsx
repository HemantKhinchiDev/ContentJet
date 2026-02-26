// src/app/dashboard/generate/page.tsx
import { Metadata } from 'next';
import AIContentGenerator from '@/components/AIContentGenerator';

export const metadata: Metadata = {
    title: 'AI Content Generator | ContentJet',
    description: 'Generate blog posts, social media content, emails, product descriptions, and more with AI — in seconds.',
};

export default function GeneratePage() {
    return <AIContentGenerator />;
}
