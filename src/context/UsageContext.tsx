'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface UsageContextType {
    count: number;
    tokens: number;
    incrementUsage: () => void;
    refreshUsage: () => void;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export function UsageProvider({ children }: { children: ReactNode }) {
    const [count, setCount] = useState(0);

    // Hydrate from localStorage after mount to avoid SSR mismatch
    useEffect(() => {
        const saved = localStorage.getItem('monthly_usage_count');
        if (saved) {
            const parsed = parseInt(saved, 10);
            if (!Number.isNaN(parsed)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCount(parsed);
            }
        }
    }, []);
    const [tokens, setTokens] = useState(0);

    const refreshUsage = useCallback(async () => {
        try {
            const res = await fetch('/api/usage/monthly');
            if (res.ok) {
                const data = await res.json();
                const newCount = data.count ?? 0;
                setCount((prev) => {
                    const finalCount = process.env.NODE_ENV === 'development'
                        ? Math.max(prev, newCount)
                        : newCount;
                    localStorage.setItem('monthly_usage_count', finalCount.toString());
                    return finalCount;
                });
                setTokens(data.tokens ?? 0);
            }
        } catch {
            // silently fail
        }
    }, []);

    const incrementUsage = useCallback(() => {
        setCount((prev) => {
            const next = prev + 1;
            localStorage.setItem('monthly_usage_count', next.toString());
            return next;
        });
    }, []);

    // Initial fetch + background sync every 30s
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshUsage();
        const interval = setInterval(refreshUsage, 30_000);
        return () => clearInterval(interval);
    }, [refreshUsage]);

    return (
        <UsageContext.Provider value={{ count, tokens, incrementUsage, refreshUsage }}>
            {children}
        </UsageContext.Provider>
    );
}

export function useUsage() {
    const ctx = useContext(UsageContext);
    if (!ctx) {
        throw new Error('useUsage must be used within <UsageProvider>');
    }
    return ctx;
}
