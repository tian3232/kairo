import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
    score: number | null;
    average: number;
    count: number;
    onChange?: (score: number) => void;
    readonly?: boolean;
}

export function StarRating({ score, average, count, onChange, readonly = false }: StarRatingProps) {
    const [hoverScore, setHoverScore] = useState<number | null>(null);
    const displayScore = hoverScore ?? score;
    const maxStars = 10;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: maxStars }, (_, i) => {
                    const starIndex = i + 1;
                    const filled = displayScore !== null && starIndex <= displayScore;

                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={readonly}
                            className={`transition ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                            onMouseEnter={() => !readonly && setHoverScore(starIndex)}
                            onMouseLeave={() => !readonly && setHoverScore(null)}
                            onClick={() => !readonly && onChange?.(starIndex)}
                        >
                            <Star
                                className={`h-5 w-5 transition-colors ${
                                    filled
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-muted-foreground/30'
                                }`}
                            />
                        </button>
                    );
                })}
            </div>
            {score !== null && (
                <span className="text-sm font-semibold text-foreground">{score}/10</span>
            )}
            <span className="text-sm text-muted-foreground">
                {average > 0 ? `${average.toFixed(1)} promedio` : 'Sin calificaciones'}
                {count > 0 && ` · ${count} ${count === 1 ? 'calificación' : 'calificaciones'}`}
            </span>
        </div>
    );
}
