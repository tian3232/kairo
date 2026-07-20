import { useState, useEffect } from 'react';
import { imageUrl } from '@/lib/image-url';

interface SmartImageProps {
    src: string | null | undefined;
    fallback?: string | null | undefined;
    alt?: string;
    className?: string;
    [key: string]: unknown;
}

export function SmartImage({ src, fallback, alt = '', className, ...rest }: SmartImageProps) {
    const primary = imageUrl(src);
    const backup = imageUrl(fallback);
    const [current, setCurrent] = useState(primary || backup || '');
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setCurrent(primary || backup || '');
        setFailed(false);
    }, [primary, backup]);

    if (!current || failed) {
        return (
            <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-1/3 w-1/3 max-h-12 max-w-12">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={current}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => {
                if (backup && current !== backup) {
                    setCurrent(backup);
                } else {
                    setFailed(true);
                }
            }}
            {...rest}
        />
    );
}
