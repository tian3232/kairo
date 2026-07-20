import { Link } from '@inertiajs/react';
import { Star, Play } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import { memo, useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
    airing: 'En emisión',
    finished: 'Finalizado',
    upcoming: 'Próximamente',
};

export interface EpisodeCardData {
    id: number;
    episode_number: number;
    season_number: number;
    episode_title: string | null;
    episode_synopsis: string | null;
    thumbnail: string;
    anime_title: string;
    anime_slug: string;
    status: string;
    type?: string;
    average_rating: number;
    release_date?: string | null;
}

export const EpisodeCard = memo(function EpisodeCard({ episode }: { episode: EpisodeCardData }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="group/card relative w-full transition-all duration-200"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="relative overflow-hidden rounded-xl bg-muted aspect-[2/3]">
                <Link href={route('watch.show', episode.id)} className="block h-full">
                    <SmartImage
                        src={episode.thumbnail}
                        alt={`${episode.anime_title} S${episode.season_number}E${episode.episode_number}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                    />
                </Link>

                <div className="absolute left-2 top-2 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    S{episode.season_number}E{episode.episode_number}
                </div>

                {hovered ? (
                    <div className="absolute inset-0 flex flex-col justify-end gap-1.5 bg-gradient-to-t from-black via-black/80 to-black/30 p-3">
                        <h3 className="text-sm font-bold leading-tight text-white">
                            {episode.episode_title ?? `${episode.anime_title}`}
                        </h3>

                        <span className="text-[10px] text-white/60">{episode.anime_title}</span>

                        {episode.episode_synopsis && (
                            <p className="line-clamp-3 text-xs leading-relaxed text-white/75">
                                {episode.episode_synopsis}
                            </p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-white/50">
                            <span className="flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                                {Number(episode.average_rating).toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{STATUS_LABELS[episode.status] ?? episode.status}</span>
                            {episode.type && (
                                <>
                                    <span>•</span>
                                    <span className="uppercase">{episode.type}</span>
                                </>
                            )}
                        </div>

                        <Link
                            href={route('watch.show', episode.id)}
                            className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:bg-primary/90"
                        >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Ver
                        </Link>
                    </div>
                ) : (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <span className="truncate text-[11px] font-medium text-white/90">
                            {episode.episode_title ?? episode.anime_title}
                        </span>
                    </div>
                )}
            </div>

            {!hovered && (
                <div className="mt-2">
                    <h3 className="truncate text-sm font-medium text-foreground group-hover/card:text-primary">
                        {episode.anime_title}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                        S{episode.season_number}E{episode.episode_number}
                        {episode.episode_title && ` — ${episode.episode_title}`}
                    </p>
                </div>
            )}
        </div>
    );
});
