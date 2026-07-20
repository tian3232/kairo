import { useEffect, useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { SmartImage } from '@/components/smart-image';
import { imageUrl } from '@/lib/image-url';

export interface HeroBanner {
    id: number;
    duration_seconds: number;
    anime: {
        id: number;
        slug: string;
        title: string;
        synopsis: string;
        banner_image: string;
        cover_image?: string;
        age_rating: string;
        genres: string[];
    };
}

export function HeroCarousel({ banners }: { banners: HeroBanner[] }) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % banners.length);
    }, [banners.length]);

    const prev = () => {
        setCurrent((c) => (c - 1 + banners.length) % banners.length);
    };

    useEffect(() => {
        if (paused || banners.length <= 1) return;
        const duration = (banners[current]?.duration_seconds ?? 8) * 1000;
        const timer = setTimeout(next, duration);
        return () => clearTimeout(timer);
    }, [current, paused, banners, next]);

    if (banners.length === 0) return null;

    const banner = banners[current];

    const preloadImages = useMemo(() => {
        const urls = [banner.anime.banner_image];
        const nextIdx = (current + 1) % banners.length;
        const prevIdx = (current - 1 + banners.length) % banners.length;
        if (nextIdx !== current) urls.push(banners[nextIdx].anime.banner_image);
        if (prevIdx !== current) urls.push(banners[prevIdx].anime.banner_image);
        return urls;
    }, [current, banners]);

    useEffect(() => {
        preloadImages.forEach((url) => {
            const fullUrl = imageUrl(url);
            if (fullUrl) {
                const img = new Image();
                img.src = fullUrl;
            }
        });
    }, [preloadImages]);

    return (
        <div
            className="relative h-[50vh] w-full overflow-hidden bg-black sm:h-[60vh] md:h-[70vh] lg:h-[75vh]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <SmartImage
                key={current}
                src={banner.anime.banner_image}
                fallback={banner.anime.cover_image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center scale-110 blur-sm brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

            <div className="relative z-10 flex h-full items-end px-4 pb-16 sm:px-6 md:px-8 lg:pb-20">
                <div className="flex items-end gap-4 sm:gap-6">
                    <SmartImage
                        src={banner.anime.banner_image}
                        fallback={banner.anime.cover_image}
                        alt={banner.anime.title}
                        className="hidden h-48 w-32 flex-shrink-0 rounded-lg object-cover shadow-2xl sm:block sm:h-56 sm:w-40 md:h-64 md:w-44 lg:h-72 lg:w-52 xl:h-80 xl:w-60"
                    />
                    <div className="max-w-sm text-white sm:max-w-xl lg:max-w-2xl xl:max-w-3xl">
                        <h1 className="text-2xl font-bold drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">{banner.anime.title}</h1>
                        <div className="mt-2 flex gap-2 text-xs text-white/80 sm:text-sm">
                            <span>{banner.anime.age_rating}</span>
                            <span>•</span>
                            <span>{banner.anime.genres.join(', ')}</span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-xs text-white/90 drop-shadow sm:line-clamp-3 sm:text-sm lg:text-base">{banner.anime.synopsis}</p>

                        <div className="mt-4 flex gap-2 sm:mt-5 sm:gap-3">
                            <Link
                                href={route('anime.show', banner.anime.slug)}
                                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-4 py-1.5 text-xs font-bold text-white shadow-[0_0_20px_hsl(217,91%,60%,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_28px_hsl(217,91%,60%,0.5)] active:scale-95 sm:gap-2 sm:px-6 sm:py-2 sm:text-sm"
                            >
                                <Play className="h-3 w-3 sm:h-4 sm:w-4" /> Ver ahora
                            </Link>
                            <Link
                                href={route('anime.show', banner.anime.slug)}
                                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:border-[hsl(217,91%,60%)]/50 hover:bg-[hsl(217,91%,60%)]/10 hover:text-[hsl(217,91%,70%)] sm:gap-2 sm:px-6 sm:py-2 sm:text-sm"
                            >
                                <Info className="h-3 w-3 sm:h-4 sm:w-4" /> Más información
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {banners.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[hsl(217,91%,60%)]/30 bg-black/50 p-1.5 text-white/70 backdrop-blur-md transition-all hover:border-[hsl(217,91%,60%)]/60 hover:bg-[hsl(217,91%,60%)]/20 hover:text-white hover:scale-110 sm:left-4 sm:p-2.5"
                    >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[hsl(217,91%,60%)]/30 bg-black/50 p-1.5 text-white/70 backdrop-blur-md transition-all hover:border-[hsl(217,91%,60%)]/60 hover:bg-[hsl(217,91%,60%)]/20 hover:text-white hover:scale-110 sm:right-4 sm:p-2.5"
                    >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-[hsl(217,91%,60%)] shadow-[0_0_8px_hsl(217,91%,60%,0.5)]' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
