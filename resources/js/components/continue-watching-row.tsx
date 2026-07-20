import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContinueWatchingCard, type ContinueWatchingData } from '@/components/continue-watching-card';

export function ContinueWatchingRow({ items }: { items: ContinueWatchingData[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.8;
        el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (items.length === 0) return null;

    return (
        <section className="group/row relative py-4">
            <h2 className="mb-3 px-4 text-lg font-semibold text-foreground sm:px-8 sm:text-xl lg:text-2xl">Continuar viendo</h2>

            <button
                onClick={() => scroll('left')}
                className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/90 border border-border shadow-sm p-2 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background hover:shadow-md group-hover/row:opacity-100 sm:block"
            >
                <ChevronLeft />
            </button>

            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scroll-smooth px-4 pb-6 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3 sm:px-8"
            >
                {items.map((item) => (
                    <ContinueWatchingCard key={item.id} item={item} />
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
