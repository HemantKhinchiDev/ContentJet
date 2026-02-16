import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
    children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
    const baseStyles = 'px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]'

    const variantStyles = {
        primary: 'bg-landing-accent text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]',
        secondary: 'border-2 border-landing-border text-landing-text hover:border-landing-accent hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]',
    }

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
