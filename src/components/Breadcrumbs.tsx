import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
    label: string
    href: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": `https://contentjet.vercel.app${item.href}`
        }))
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
            />

            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
                {items.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                        {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-white/30" />}
                        {index === items.length - 1 ? (
                            <span className="text-white/50">{item.label}</span>
                        ) : (
                            <Link href={item.href} className="text-[#5e6ad2] hover:text-[#818cf8] transition-colors">
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
        </>
    )
}
