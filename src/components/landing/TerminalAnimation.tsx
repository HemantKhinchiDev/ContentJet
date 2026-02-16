'use client'

import { useEffect, useState } from 'react'
import { jetbrainsMono } from '@/app/landing/fonts'

const terminalLines = [
    { text: 'git clone https://github.com/yourusername/ai-saas-boilerplate.git', type: 'command' },
    { text: 'pnpm install', type: 'command' },
    { text: '✓ AI endpoints ready', type: 'success' },
    { text: '✓ Stripe integrated', type: 'success' },
    { text: '✓ SEO optimized', type: 'success' },
]

export function TerminalAnimation() {
    const [displayedLines, setDisplayedLines] = useState<Array<{ text: string; type: string }>>([])
    const [currentLineIndex, setCurrentLineIndex] = useState(0)
    const [currentText, setCurrentText] = useState('')
    const [showCursor, setShowCursor] = useState(true)

    useEffect(() => {
        if (currentLineIndex >= terminalLines.length) return

        const currentLine = terminalLines[currentLineIndex]
        const targetText = currentLine.text

        if (currentText.length < targetText.length) {
            const timeout = setTimeout(() => {
                setCurrentText(targetText.slice(0, currentText.length + 1))
            }, 80)
            return () => clearTimeout(timeout)
        } else {
            const timeout = setTimeout(() => {
                setDisplayedLines([...displayedLines, currentLine])
                setCurrentText('')
                setCurrentLineIndex(currentLineIndex + 1)
            }, 500)
            return () => clearTimeout(timeout)
        }
    }, [currentText, currentLineIndex, displayedLines])

    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor((prev) => !prev)
        }, 500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full max-w-2xl rounded-lg border border-landing-border bg-landing-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className={`${jetbrainsMono.className} space-y-2 text-sm`}>
                {displayedLines.map((line, index) => (
                    <div
                        key={index}
                        className={
                            line.type === 'command'
                                ? 'text-blue-400'
                                : 'text-landing-success'
                        }
                    >
                        {line.type === 'command' && <span className="text-landing-text-secondary">$ </span>}
                        {line.text}
                    </div>
                ))}
                {currentLineIndex < terminalLines.length && (
                    <div
                        className={
                            terminalLines[currentLineIndex].type === 'command'
                                ? 'text-blue-400'
                                : 'text-landing-success'
                        }
                    >
                        {terminalLines[currentLineIndex].type === 'command' && (
                            <span className="text-landing-text-secondary">$ </span>
                        )}
                        {currentText}
                        <span
                            className={`inline-block h-4 w-2 bg-landing-accent ${showCursor ? 'opacity-100' : 'opacity-0'
                                }`}
                        ></span>
                    </div>
                )}
            </div>
        </div>
    )
}
