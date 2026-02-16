import Image from 'next/image'

interface TechLogoProps {
    src: string
    alt: string
    name: string
}

export function TechLogo({ src, alt, name }: TechLogoProps) {
    return (
        <div className="group flex flex-col items-center gap-3 transition-all duration-300">
            <div className="relative h-16 w-16 grayscale transition-all duration-300 group-hover:grayscale-0">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain"
                />
            </div>
            <span className="text-sm text-landing-text-secondary transition-colors duration-300 group-hover:text-landing-text">
                {name}
            </span>
        </div>
    )
}
