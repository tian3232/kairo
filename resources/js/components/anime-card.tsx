import { Link, router, usePage } from '@inertiajs/react';
import { Star, Play, Heart, Plus, Check, ListPlus } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import { memo, useState, useCallback } from 'react';
import { AddToListModal } from '@/components/add-to-list-modal';

const STATUS_LABELS: Record<string, string> = {
    airing: 'En emisión',
    finished: 'Finalizado',
    upcoming: 'Próximamente',
};

export interface AnimeCardData {
    id: number;
    slug: string;
    title: string;
    cover_image: string;
    status: string;
    type?: string;
    synopsis?: string;
    average_rating: number;
    episodes_count?: number;
}

interface UserLists {
    watchlist: number[];
    favorites: number[];
}

export const AnimeCard = memo(function AnimeCard({ anime, userLists, compact }: { anime: AnimeCardData; userLists?: UserLists; compact?: boolean }) {
    const { auth } = usePage().props as { auth: { user: { id: number } | null } };
    const user = auth?.user;
    const [hovered, setHovered] = useState(false);
    const [listModalOpen, setListModalOpen] = useState(false);
    const isFavorite = userLists?.favorites?.includes(anime.id) ?? false;
    const isWatchlist = userLists?.watchlist?.includes(anime.id) ?? false;

    const requireAuth = useCallback((action: () => void) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            router.visit('/login');
            return;
        }
        action();
    }, [user]);

    const toggleFavorite = useCallback(requireAuth(() => {
        router.post(route('anime.favorite', anime.id), {}, { preserveScroll: true });
    }), [requireAuth, anime.id]);

    const openListModal = useCallback(requireAuth(() => {
        setListModalOpen(true);
    }), [requireAuth]);

    if (compact) {
        return (
            <>
                <div
                    className="group/card relative w-full transition-all duration-200"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className="relative overflow-hidden rounded-xl bg-muted aspect-[2/3]">
                        <Link href={route('anime.show', anime.slug)} className="block h-full">
                            <SmartImage
                                src={anime.cover_image}
                                alt={anime.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                            />
                        </Link>

                        {userLists && (
                            <div className="absolute right-2 top-2 z-30 flex flex-col gap-1.5 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover/card:opacity-100">
                                <button
                                    onClick={toggleFavorite}
                                    className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                                        isFavorite
                                            ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                                            : 'bg-black/50 text-white hover:bg-red-500 hover:text-white hover:shadow-md hover:shadow-red-500/30'
                                    }`}
                                    title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                >
                                    <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={openListModal}
                                    className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                                        isWatchlist
                                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                            : 'bg-black/50 text-white hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/30'
                                    }`}
                                    title="Agregar a lista"
                                >
                                    {isWatchlist ? <Check className="h-3.5 w-3.5" /> : <ListPlus className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        )}

                        {hovered ? (
                            <div className="absolute inset-0 flex flex-col justify-end gap-1.5 bg-gradient-to-t from-black via-black/80 to-black/30 p-3">
                                <Link
                                    href={route('anime.show', anime.slug)}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:bg-primary/90"
                                >
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                    Ver
                                </Link>
                                {anime.synopsis && (
                                    <p className="line-clamp-3 text-[11px] leading-relaxed text-white/75">
                                        {anime.synopsis}
                                    </p>
                                )}
                                <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                                    {Number(anime.average_rating) > 0 && (
                                        <>
                                            <span className="flex items-center gap-0.5">
                                                <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                                                {Number(anime.average_rating).toFixed(1)}
                                            </span>
                                            <span>•</span>
                                        </>
                                    )}
                                    <span>{STATUS_LABELS[anime.status] ?? anime.status}</span>
                                    {anime.type && (
                                        <>
                                            <span>•</span>
                                            <span className="uppercase">{anime.type}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                {Number(anime.average_rating) > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] text-white/80">
                                        <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                                        {Number(anime.average_rating).toFixed(1)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {!hovered && (
                        <h3 className="mt-1.5 truncate text-xs font-medium text-foreground opacity-100 transition-opacity duration-200">
                            {anime.title}
                        </h3>
                    )}
                </div>
                <AddToListModal open={listModalOpen} onOpenChange={setListModalOpen} animeId={anime.id} />
            </>
        );
    }

    return (
        <>
            <div
                className="group/card relative w-full transition-all duration-200"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <div className="relative overflow-hidden rounded-xl bg-muted aspect-[2/3]">
                    <Link href={route('anime.show', anime.slug)} className="block h-full">
                        <SmartImage
                            src={anime.cover_image}
                            alt={anime.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                        />
                    </Link>

                    {userLists && (
                        <div className="absolute right-2 top-2 z-30 flex flex-col gap-1.5 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover/card:opacity-100">
                            <button
                                onClick={toggleFavorite}
                                className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                                    isFavorite
                                        ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                                        : 'bg-black/50 text-white hover:bg-red-500 hover:text-white hover:shadow-md hover:shadow-red-500/30'
                                }`}
                                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            >
                                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={openListModal}
                                className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                                    isWatchlist
                                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                        : 'bg-black/50 text-white hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/30'
                                }`}
                                title="Agregar a lista"
                            >
                                {isWatchlist ? <Check className="h-4 w-4" /> : <ListPlus className="h-4 w-4" />}
                            </button>
                        </div>
                    )}

                    {hovered && (
                        <div className="absolute inset-0 flex flex-col justify-end gap-1.5 bg-gradient-to-t from-black via-black/80 to-black/30 p-3">
                            <Link
                                href={route('anime.show', anime.slug)}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:bg-primary/90"
                            >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Ver
                            </Link>
                            {anime.synopsis && (
                                <p className="line-clamp-3 text-[11px] leading-relaxed text-white/75">
                                    {anime.synopsis}
                                </p>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                                {Number(anime.average_rating) > 0 && (
                                    <>
                                        <span className="flex items-center gap-0.5">
                                            <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                                            {Number(anime.average_rating).toFixed(1)}
                                        </span>
                                        <span>•</span>
                                    </>
                                )}
                                <span>{STATUS_LABELS[anime.status] ?? anime.status}</span>
                                {anime.type && (
                                    <>
                                        <span>•</span>
                                        <span className="uppercase">{anime.type}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {!hovered && (
                    <div className="mt-2">
                        <h3 className="truncate text-sm font-medium text-foreground group-hover/card:text-primary">
                            {anime.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            {Number(anime.average_rating) > 0 && (
                                <>
                                    <span className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                        {Number(anime.average_rating).toFixed(1)}
                                    </span>
                                    <span>•</span>
                                </>
                            )}
                            <span>{STATUS_LABELS[anime.status] ?? anime.status}</span>
                        </div>
                    </div>
                )}
            </div>
            <AddToListModal open={listModalOpen} onOpenChange={setListModalOpen} animeId={anime.id} />
        </>
    );
});
