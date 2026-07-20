import { useState, useCallback, useRef } from 'react';

interface KairoLogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    animate?: boolean;
}

export default function KairoLogo({ className = '', size = 'md', showText = true, animate = true }: KairoLogoProps) {
    const sizes = {
        sm: { icon: 24, text: 'text-lg', gap: 'gap-1.5', strokeWidth: 2.5 },
        md: { icon: 32, text: 'text-xl', gap: 'gap-2', strokeWidth: 2 },
        lg: { icon: 44, text: 'text-3xl', gap: 'gap-2.5', strokeWidth: 1.8 },
    };
    const s = sizes[size];

    const [animKey, setAnimKey] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const handleHover = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setAnimKey((k) => k + 1);
        timeoutRef.current = setTimeout(() => {}, 1500);
    }, []);

    const letters = 'Kairo'.split('');
    const letterDelays = [0.95, 1.05, 1.15, 1.25, 1.35];

    return (
        <span
            className={`kairo-logo-wrapper inline-flex items-center ${s.gap} select-none ${className}`}
            onMouseEnter={animate ? handleHover : undefined}
        >
            <svg
                key={`icon-${animKey}`}
                width={s.icon}
                height={s.icon}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="kairo-icon flex-shrink-0"
                style={animate ? { animation: 'logo-bg-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both' } : undefined}
            >
                <defs>
                    <linearGradient id={`bg-${animKey}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="hsl(217, 91%, 65%)" />
                        <stop offset="100%" stopColor="hsl(217, 91%, 45%)" />
                    </linearGradient>
                    <linearGradient id={`kgrad-${animKey}`} x1="14" y1="12" x2="37" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#b3d4ff" />
                    </linearGradient>
                </defs>

                <rect width="48" height="48" rx="12" fill={`url(#bg-${animKey})`} />

                {animate && (
                    <path
                        d="M14 12h5.5v10.5L30.5 12H37l-9.5 10.8L37.5 36H31l-8-11.2V36H14V12z"
                        fill="none"
                        stroke="hsl(217, 91%, 80%)"
                        strokeWidth={s.strokeWidth}
                        strokeLinejoin="round"
                        className="kairo-k-stroke"
                    />
                )}

                <path
                    d="M14 12h5.5v10.5L30.5 12H37l-9.5 10.8L37.5 36H31l-8-11.2V36H14V12z"
                    fill={`url(#kgrad-${animKey})`}
                    className={animate ? 'kairo-k-fill' : undefined}
                />

                <circle
                    cx="36" cy="14" r="3"
                    fill="hsl(200, 100%, 70%)"
                    className={animate ? 'kairo-dot-flash' : undefined}
                />
            </svg>

            {showText && (
                <span key={`text-${animKey}`} className={`${s.text} font-bold tracking-tight kairo-text-shimmer`}>
                    {letters.map((letter, i) => (
                        <span
                            key={i}
                            className={`kairo-letter ${letter === 'K' ? 'text-primary' : 'text-foreground'}`}
                            style={{ animationDelay: `${letterDelays[i]}s` }}
                        >
                            {letter}
                        </span>
                    ))}
                </span>
            )}
        </span>
    );
}
