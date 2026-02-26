'use client'

export function TestimonialsSection() {
    const logos = [
        { name: 'Next.js', icon: NextjsIcon },
        { name: 'TypeScript', icon: TypeScriptIcon },
        { name: 'Supabase', icon: SupabaseIcon },
        { name: 'Stripe', icon: StripeIcon },
        { name: 'Prisma', icon: PrismaIcon },
        { name: 'Antigravity', icon: AntigravityIcon },
    ]

    const testimonials = [
        {
            quote: "Contentjet has completely transformed how our engineering team manages sprints. The real-time collaboration and intuitive UI make it effortless to stay aligned.",
            author: "Sarah Kim",
            role: "Head of Engineering",
            company: "TechFlow",
            initials: "SK",
            color: "#5e6ad2"
        },
        {
            quote: "The speed and reliability of Contentjet is unmatched. We've seen a 40% increase in team velocity since switching from our legacy tools.",
            author: "Alex Rivera",
            role: "Product Lead",
            company: "ScaleAI",
            initials: "AR",
            color: "#22d3ee"
        },
        {
            quote: "Moving to Contentjet was the best decision we made for our product team. The automation features alone have saved us countless hours.",
            author: "Maria Jensen",
            role: "CTO",
            company: "CloudBase",
            initials: "MJ",
            color: "#a78bfa"
        }
    ]

    return (
        <section className="max-w-[1436px] mx-auto px-6 py-24">
            {/* Section Label */}
            <div className="text-[13px] text-[#5e6ad2] uppercase tracking-[0.15em] font-medium mb-4 text-center">
                Testimonials
            </div>

            {/* Heading */}
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-[500] tracking-[-0.04em] text-white/95 mb-4 text-center">
                Loved by the best<br />product teams
            </h2>

            {/* Subtitle */}
            <p className="text-[16px] text-white/[0.30] mb-12 text-center">
                Teams of all sizes trust Contentjet to build their products.
            </p>

            {/* Tech Logo Bar */}
            <div className="mb-16">
                <div className="text-[12px] text-white/20 uppercase tracking-[0.15em] text-center mb-8">
                    Built with
                </div>
                <div className="flex items-center justify-center gap-14 flex-wrap opacity-60">
                    {logos.map((logo, idx) => {
                        const Icon = logo.icon
                        return (
                            <div key={idx} className="flex items-center gap-2 hover:opacity-100 transition">
                                <Icon />
                                <span className="text-[14px] text-white font-medium">{logo.name}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {testimonials.map((testimonial, idx) => (
                    <div
                        key={idx}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-7"
                    >
                        {/* Quote */}
                        <p className="text-[14.5px] text-white/[0.40] leading-[1.75] italic mb-6">
                            &quot;{testimonial.quote}&quot;
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-white"
                                style={{ background: testimonial.color }}
                            >
                                {testimonial.initials}
                            </div>
                            <div>
                                <div className="text-[13px] font-medium text-white/80">{testimonial.author}</div>
                                <div className="text-[12px] text-white/30">{testimonial.role} @ {testimonial.company}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

// Tech Logo Components (white SVGs)
function NextjsIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.091a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466- 2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-0.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z" />
        </svg>
    )
}

function TypeScriptIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
        </svg>
    )
}

function SupabaseIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M13.89 18.455c-.631.928-1.969.42-1.969-.75V6.85c0-.334.304-.602.649-.552 1.454.21 3.186 1.075 4.505 2.394 1.653 1.654 2.644 3.71 2.644 5.742 0 2.838-2.301 5.139-5.139 5.139a5.123 5.123 0 0 1-.69-.118zm-3.78-12.91c.631-.928 1.969-.42 1.969.75v10.855c0 .334-.304.602-.649.552-1.454-.21-3.186-1.075-4.505-2.394C5.272 13.653 4.281 11.597 4.281 9.565c0-2.838 2.301-5.139 5.139-5.139.237 0 .469.025.69.118z" />
        </svg>
    )
}

function StripeIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
        </svg>
    )
}

function PrismaIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M21.807 18.285L13.553.757a1.324 1.324 0 0 0-1.129-.754 1.31 1.31 0 0 0-1.206.626l-8.952 14.5a1.356 1.356 0 0 0 .016 1.455l4.376 6.227a1.325 1.325 0 0 0 1.091.589 1.331 1.331 0 0 0 .163-.01l11.896-1.567a1.336 1.336 0 0 0 .999-1.538zm-10.054.418l-4.108-11.49 10.275 11.958-6.167-.468z" />
        </svg>
    )
}

function AntigravityIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.82 3.82L12 11.82 5.18 8 12 4.18zM5 9.5l6.5 3.64v7.36L5 17V9.5zm8.5 11l0-7.36L20 9.5V17l-6.5 3.5z" />
        </svg>
    )
}
