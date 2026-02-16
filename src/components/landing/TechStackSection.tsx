import { TechLogo } from './TechLogo'

const techStack = [
    { name: 'Next.js', src: '/logos/nextjs.svg', alt: 'Next.js logo' },
    { name: 'TypeScript', src: '/logos/typescript.svg', alt: 'TypeScript logo' },
    { name: 'Tailwind CSS', src: '/logos/tailwind.svg', alt: 'Tailwind CSS logo' },
    { name: 'Stripe', src: '/logos/stripe.svg', alt: 'Stripe logo' },
    { name: 'OpenAI', src: '/logos/openai.svg', alt: 'OpenAI logo' },
    { name: 'Vercel', src: '/logos/vercel.svg', alt: 'Vercel logo' },
    { name: 'Prisma', src: '/logos/prisma.svg', alt: 'Prisma logo' },
]

export function TechStackSection() {
    return (
        <section className="container mx-auto px-6 py-20">
            <div className="mb-16 text-center">
                <h2 className="text-4xl font-bold text-landing-text lg:text-5xl">
                    Built with industry-leading tools
                </h2>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-3 gap-12 md:grid-cols-4 lg:grid-cols-7">
                {techStack.map((tech, index) => (
                    <TechLogo key={index} src={tech.src} alt={tech.alt} name={tech.name} />
                ))}
            </div>
        </section>
    )
}
