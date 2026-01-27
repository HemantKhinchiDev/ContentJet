import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class", ".dark"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Foundation colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Surface colors
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        
        // Muted colors
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        
        // Primary action
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        
        // Secondary action
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        
        // Accent color
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        
        // Destructive/Error
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        
        // Border and input
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      
      // Spacing scale per design system
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
      },
      
      // Typography scale
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      
      // Border radius
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      
      // Animation timings
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
      },
      
      // Keyframe animations
      keyframes: {
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "50%": { transform: "translateX(4px)" },
          "75%": { transform: "translateX(-4px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      
      // Animation utilities
      animation: {
        "shake": "shake 0.3s ease-in-out",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config