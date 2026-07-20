import { Link, router } from '@inertiajs/react';
import { Play, MoreVertical, CheckCircle2 } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import { useState, useRef, useEffect } from 'react';

export interface ContinueWatchingData {
    id: number;
    episode_number: number;
    season_number: number;
    episode_title: string | null;
    episode_synopsis: string | null;
    release_date: string | null;
    anime_title: string;
    anime_slug: string;
    cover_image: string;
    position_seconds: number;
    duration_seconds: number;
    progress_percent: number;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ContinueWatchingCard({ item }: { item: ContinueWatchingData }) {
    const [hovered, setHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    const markAsWatched = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpen(false);
        router.post(route('watch.mark-watched', item.id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <div
            className="group/card relative w-36 flex-shrink-0 transition-all duration-200 sm:w-48 md:w-56 lg:w-64 xl:w-72"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
        >
            <div className="relative overflow-hidden rounded-xl bg-muted aspect-video">
                <SmartImage
                    src={item.cover_image}
                    alt={`${item.anime_title} S${item.season_number}E${item.episode_number}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                />

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <div className="h-full bg-primary" style={{ width: `${item.progress_percent}%` }} />
                </div>

                {hovered && (
                    <div className="absolute inset-0 flex flex-col justify-end gap-1.5 bg-gradient-to-t from-black via-black/80 to-black/30 p-3">
                        <div className="absolute right-2 top-2 z-50" ref={menuRef}>
                            <button
                                onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
                                className="rounded p-0.5 text-white/70 hover:text-white"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </div>

                        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                            S{item.season_number}E{item.episode_number}
                        </span>

                        <h3 className="text-sm font-bold leading-tight text-white">
                            {item.episode_title ?? `${item.anime_title}`}
                        </h3>

                        {item.release_date && (
                            <span className="text-[10px] text-white/50">{formatDate(item.release_date)}</span>
                        )}

                        {item.episode_synopsis && (
                            <p className="line-clamp-3 text-[11px] leading-relaxed text-white/75">
                                {item.episode_synopsis}
                            </p>
                        )}

                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress_percent}%` }} />
                        </div>

                        <Link
                            href={route('watch.show', item.id)}
                            className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:bg-primary/90"
                        >
                            <Play className="h-3 w-3 fill-current" />
                            Continuar
                        </Link>
                    </div>
                )}
            </div>

            {menuOpen && (
                <div
                    ref={menuRef}
                    className="absolute right-0 z-[100] mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-xl"
                >
                    <button
                        onClick={markAsWatched}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        Marcar como visto
                    </button>
                </div>
            )}

            <div className="mt-2">
                <h3 className="truncate text-sm font-medium text-foreground group-hover/card:text-primary">
                    {item.anime_title}
                </h3>
                <p className="text-xs text-muted-foreground">
                    S{item.season_number}E{item.episode_number}
                    {item.episode_title && ` — ${item.episode_title}`}
                </p>
                {item.episode_synopsis && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/70 leading-relaxed">
                        {item.episode_synopsis}
                    </p>
                )}
            </div>
        </div>
    );
}
