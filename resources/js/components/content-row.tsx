import { useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimeCard, type AnimeCardData } from '@/components/anime-card';

export function ContentRow({ title, animes, userLists, compact }: { title: string; animes: AnimeCardData[]; userLists?: { watchlist: number[]; favorites: number[] }; compact?: boolean }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = useCallback((direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.8;
        el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }, []);

    if (animes.length === 0) return null;

    return (
        <section className="group/row relative py-4">
            <h2 className="mb-3 px-4 text-lg font-semibold text-foreground sm:px-8 sm:text-xl lg:text-2xl">{title}</h2>

            <button
                onClick={() => scroll('left')}
                className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/90 border border-border shadow-sm p-2 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background hover:shadow-md group-hover/row:opacity-100 sm:block"
            >
                <ChevronLeft />
            </button>

            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-6 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4 sm:px-8"
            >
                {animes.map((anime) => (
                    <div key={anime.id} className="w-36 flex-shrink-0 sm:w-52 md:w-56 lg:w-60 xl:w-64 2xl:w-72">
                        <AnimeCard anime={anime} userLists={userLists} compact={compact} />
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/90 border border-border shadow-sm p-2 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background hover:shadow-md group-hover/row:opacity-100 sm:block"
            >
                <ChevronRight />
            </button>
        </section>
    );
}
