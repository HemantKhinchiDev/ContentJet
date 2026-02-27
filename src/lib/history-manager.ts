export interface HistoryItem {
    id: string;
    category: 'blog' | 'social' | 'email_subject' | 'newsletter' | 'product' | 'video_script' | 'seo_meta' | 'rewrite';
    title: string;
    content: string;
    wordCount: number;
    timestamp: string; // ISO 8601
    inputs: Record<string, any>;
}

export const HistoryManager = {
    // Save new item to history
    save(
        category: HistoryItem['category'],
        title: string,
        content: string,
        inputs: Record<string, any>
    ): HistoryItem {
        const newItem: HistoryItem = {
            id: Date.now().toString(),
            category,
            title: title || 'Untitled',
            content,
            // Calculate word count automatically
            wordCount: content.split(/\s+/).filter(Boolean).length,
            timestamp: new Date().toISOString(),
            inputs,
        };

        if (typeof window === 'undefined') return newItem;

        const history = this.getAll();

        history.unshift(newItem);

        // Keep last 100 items (FIFO - oldest removed first)
        const limited = history.slice(0, 100);

        try {
            localStorage.setItem('contentjet_history', JSON.stringify(limited));
        } catch (e) {
            console.warn('HistoryManager: localStorage unavailable or full', e);
            // If quota exceeded, try clearing half of history
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                const reduced = limited.slice(0, 50);
                try {
                    localStorage.setItem('contentjet_history', JSON.stringify(reduced));
                } catch (err) {
                    console.error('HistoryManager: Failed to save even after reducing items');
                }
            }
        }

        return newItem;
    },

    // Get all history items, sorted by timestamp (newest first)
    getAll(): HistoryItem[] {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('contentjet_history');
            if (!saved) return [];

            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return [];

            // Sort newest first
            return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (e) {
            console.error('HistoryManager: Invalid JSON in storage, resetting', e);
            try {
                localStorage.removeItem('contentjet_history');
            } catch {
                // Ignore cleanup errors
            }
            return [];
        }
    },

    // Get items by category
    getByCategory(category: string): HistoryItem[] {
        return this.getAll().filter((item) => item.category === category);
    },

    // Delete specific item
    delete(id: string): void {
        if (typeof window === 'undefined') return;
        try {
            const history = this.getAll().filter((item) => item.id !== id);
            localStorage.setItem('contentjet_history', JSON.stringify(history));
        } catch (e) {
            console.error('HistoryManager: Failed to delete item', e);
        }
    },

    // Clear all history
    clear(): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem('contentjet_history');
        } catch (e) {
            console.error('HistoryManager: Failed to clear history', e);
        }
    },

    // Group items by date
    groupByDate(items: HistoryItem[]): Record<string, HistoryItem[]> {
        const groups: Record<string, HistoryItem[]> = {};
        const now = new Date();

        // Set start times for comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Start of week (assuming Sunday as first day)
        const thisWeek = new Date(today);
        thisWeek.setDate(today.getDate() - today.getDay());

        // Start of month
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        items.forEach((item) => {
            const itemDate = new Date(item.timestamp);
            const isToday = itemDate >= today && itemDate < new Date(today.getTime() + 86400000);
            const isYesterday = itemDate >= yesterday && itemDate < today;
            const isThisWeek = itemDate >= thisWeek && itemDate < yesterday;
            const isThisMonth = itemDate >= thisMonth && itemDate < thisWeek;

            let groupKey = '';

            if (isToday) {
                groupKey = 'Today';
            } else if (isYesterday) {
                groupKey = 'Yesterday';
            } else if (isThisWeek) {
                groupKey = 'This Week';
            } else if (isThisMonth) {
                groupKey = 'This Month';
            } else {
                // [Month Year] format for older items
                groupKey = itemDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        return groups;
    }
};
