import { Head, Link, router, usePage } from '@inertiajs/react';
import { Play, Plus, Heart, Share2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import SiteLayout from '@/layouts/site-layout';
import { SmartImage } from '@/components/smart-image';
import { imageUrl } from '@/lib/image-url';
import { StarRating } from '@/components/star-rating';
import { CommentSection } from '@/components/comment-section';

interface Episode {
    id: number;
    number: number;
    title: string | null;
    thumbnail: string;
    duration_seconds: number;
    release_date: string;
}

interface Season {
    id: number;
    type: string;
    number: number | null;
    title: string | null;
    episodes: Episode[];
}

interface CommentData {
    id: number;
    body: string;
    image: string | null;
    created_at: string;
    updated_at: string;
    user: { id: number; name: string; username?: string; avatar: string | null; role?: string };
    likes_count: number;
    dislikes_count: number;
    user_liked: boolean | null;
}

interface RelatedAnime {
    id: number;
    slug: string;
    title: string;
    cover_image: string;
    average_rating: number;
    relation_type: string;
}

interface AnimeDetail {
    id: number;
    slug: string;
    title: string;
    synopsis: string;
    type: string;
    status: string;
    age_rating: string;
    release_year: number;
    banner_image: string;
    cover_image: string;
    average_rating: number;
    ratings_count: number;
    studio: string | null;
    genres: string[];
    seasons: Season[];
    in_watchlist: boolean;
    in_favorites: boolean;
    user_rating: number | null;
    related_animes: RelatedAnime[];
    comments: CommentData[];
}

function SeasonAccordion({ season, defaultOpen }: { season: Season; defaultOpen?: boolean }) {
    const [expanded, setExpanded] = useState(defaultOpen ?? false);
    const count = season.episodes.length;

    return (
        <section className="rounded-lg bg-muted/30 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        {season.title ?? `Temporada ${season.number}`}
                    </h2>
                    <p className="text-xs text-muted-foreground">{count} episodio{count !== 1 ? 's' : ''}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && (
                <div className="space-y-1 px-2 pb-2">
                    {season.episodes.map((episode) => (
                        <Link
                            key={episode.id}
                            href={route('watch.show', episode.id)}
                            className="group/ep flex gap-4 rounded-md p-2 transition-colors hover:bg-muted/60"
                        >
                            <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded">
                                <SmartImage
                                    src={episode.thumbnail}
                                    alt={episode.title ?? `Episodio ${episode.number}`}
                                    className="h-full w-full object-cover transition-transform group-hover/ep:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/ep:bg-black/30">
                                    <Play className="h-6 w-6 text-white opacity-0 transition-opacity group-hover/ep:opacity-100 fill-current" />
                                </div>
                                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                    {Math.round(episode.duration_seconds / 60)} min
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col justify-center min-w-0">
                                <span className="text-[11px] font-medium text-primary">
                                    E{episode.number}
                                </span>
                                <h3 className="truncate text-sm font-medium text-foreground group-hover/ep:text-primary">
                                    {episode.title ?? `Episodio ${episode.number}`}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {new Date(episode.release_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

const STATUS_LABELS: Record<string, string> = {
    airing: 'En emisión',
    finished: 'Finalizado',
    upcoming: 'Próximamente',
};

const RELATION_LABELS: Record<string, string> = {
    sequel: 'Secuela',
    prequel: 'Precuela',
    spin_off: 'Spin-off',
    adaptation: 'Adaptación',
    related: 'Relacionado',
};

export default function AnimeShow({ anime }: { anime: AnimeDetail }) {
    const { auth } = usePage().props;
    const user = (auth as { user: { id: number } | null }).user;
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [inWatchlist, setInWatchlist] = useState(anime.in_watchlist);
    const [inFavorites, setInFavorites] = useState(anime.in_favorites);
    const [userRating, setUserRating] = useState(anime.user_rating);
    const [averageRating, setAverageRating] = useState(anime.average_rating);
    const [ratingsCount, setRatingsCount] = useState(anime.ratings_count);

    const requireAuth = (e: React.MouseEvent, action?: () => void) => {
        if (!user) {
            e.preventDefault();
            setShowLoginModal(true);
            return false;
        }
        action?.();
        return true;
    };

    const toggleWatchlist = () => {
        router.post(route('anime.watchlist', anime.id), {}, {
            preserveScroll: true,
            onSuccess: () => setInWatchlist((prev) => !prev),
        });
    };

    const toggleFavorite = () => {
        router.post(route('anime.favorite', anime.id), {}, {
            preserveScroll: true,
            onSuccess: () => setInFavorites((prev) => !prev),
        });
    };

    const handleRate = (score: number) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        setUserRating(score);

        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        fetch('/ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ anime_id: anime.id, score }),
        }).then((res) => {
            if (res.ok) return res.json();
            throw new Error();
        }).then((data) => {
            setAverageRating(data.average);
            setRatingsCount(data.count);
        }).catch(() => {
            setUserRating(anime.user_rating);
        });
    };

    const totalEpisodes = anime.seasons.reduce((acc, s) => acc + s.episodes.length, 0);

    return (
        <>
            <Head title={anime.title} />

            <div className="relative h-[40vh] w-full overflow-hidden bg-black sm:h-[50vh] lg:h-[60vh]">
                <SmartImage
                    src={anime.banner_image}
                    fallback={anime.cover_image}
                    alt={anime.title}
                    className="absolute inset-0 h-full w-full object-cover object-center scale-110 blur-sm brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>

            <div className="relative -mt-24 px-4 pb-10 sm:-mt-32 sm:px-6 md:px-8 lg:pb-16">
                <div className="flex gap-6">
                    <SmartImage
                        src={anime.cover_image}
                        alt={anime.title}
                        className="hidden h-64 w-44 flex-shrink-0 rounded-md object-cover shadow-lg sm:block"
                    />

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">{anime.title}</h1>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{anime.release_year}</span>
                            <span>•</span>
                            <span>{anime.age_rating}</span>
                            <span>•</span>
                            <span>{STATUS_LABELS[anime.status] ?? anime.status}</span>
                            <span>•</span>
                            <span>{totalEpisodes} episodios</span>
                            {anime.studio && (
                                <>
                                    <span>•</span>
                                    <span>{anime.studio}</span>
                                </>
                            )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {anime.genres.map((genre) => (
                                <span key={genre} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                    {genre}
                                </span>
                            ))}
                        </div>

                        <p className="mt-4 max-w-3xl text-foreground/90">{anime.synopsis}</p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                onClick={(e) => {
                                    if (!requireAuth(e)) return;
                                    window.location.href = route('watch.show', anime.seasons[0]?.episodes[0]?.id);
                                }}
                                className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90"
                            >
                                <Play className="h-4 w-4" /> Ver ahora
                            </button>
                            <button
                                onClick={(e) => requireAuth(e, toggleWatchlist)}
                                className={`flex items-center gap-2 rounded-md px-5 py-2 font-semibold transition-colors ${
                                    inWatchlist
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-foreground hover:bg-muted/80'
                                }`}
                            >
                                <Plus className="h-4 w-4" /> {inWatchlist ? 'En Mi Lista' : 'Mi Lista'}
                            </button>
                            <button
                                onClick={(e) => requireAuth(e, toggleFavorite)}
                                className={`flex items-center gap-2 rounded-md px-5 py-2 font-semibold transition-colors ${
                                    inFavorites
                                        ? 'bg-red-500 text-white'
                                        : 'bg-muted text-foreground hover:bg-muted/80'
                                }`}
                            >
                                <Heart className={`h-4 w-4 ${inFavorites ? 'fill-current' : ''}`} /> Favorito
                            </button>
                            <button className="flex items-center gap-2 rounded-md bg-muted px-5 py-2 font-semibold text-foreground hover:bg-muted/80">
                                <Share2 className="h-4 w-4" /> Compartir
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 space-y-10">

                    {/* Temporadas y episodios — primero */}
                    {anime.seasons.map((season, idx) => (
                        <SeasonAccordion key={season.id} season={season} defaultOpen={idx === 0} />
                    ))}

                    {/* Animes relacionados (RF-038) */}
                    {anime.related_animes.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-sm font-semibold text-foreground">Animes Relacionados</h2>
                            <div className="flex gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-2">
                                {anime.related_animes.map((related) => (
                                    <Link
                                        key={related.id}
                                        href={route('anime.show', related.slug)}
                                        className="group w-44 flex-shrink-0 sm:w-56"
                                    >
                                        <div className="relative overflow-hidden rounded-md">
                                            <SmartImage
                                                src={related.cover_image}
                                                alt={related.title}
                                                className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <span className="rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                                    {RELATION_LABELS[related.relation_type] ?? related.relation_type}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-1.5 truncate text-sm font-medium text-foreground group-hover:text-primary">{related.title}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Calificación y Comentarios */}
                    <div className="space-y-8">
                        <div className="rounded-lg bg-muted/30 p-6">
                            <h2 className="mb-3 text-xl font-semibold text-foreground">Calificación</h2>
                            <StarRating
                                score={userRating}
                                average={averageRating}
                                count={ratingsCount}
                                onChange={handleRate}
                            />
                        </div>

                        <CommentSection animeId={anime.id} comments={anime.comments} />
                    </div>
                </div>
            </div>

            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Inicia sesión para continuar</DialogTitle>
                        <DialogDescription>
                            Necesitas una cuenta para calificar, comentar y agregar a tu lista.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-col gap-3">
                        <Link
                            href={route('login')}
                            className="flex items-center justify-center rounded-full border border-primary px-4 py-2.5 font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            href={route('register')}
                            className="flex items-center justify-center rounded-full bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:opacity-90 transition-colors"
                        >
                            Crear cuenta
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

AnimeShow.layout = (page: React.ReactNode) => <SiteLayout>{page}</SiteLayout>;
