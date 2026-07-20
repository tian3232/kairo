import { Head, Link, router } from '@inertiajs/react';
import { MediaPlayer, MediaProvider, Track, type MediaPlayerInstance } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Share2, ListVideo, SkipForward, X, ThumbsUp, ThumbsDown, Repeat1 } from 'lucide-react';
import SiteLayout from '@/layouts/site-layout';
import { SmartImage } from '@/components/smart-image';
import { CommentSection } from '@/components/comment-section';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import '@/captions.css';

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

interface WatchProps {
    episode: {
        id: number;
        number: number;
        title: string | null;
        synopsis: string | null;
        video_path: string;
        duration_seconds: number;
        release_date: string;
        intro_start: number | null;
        intro_end: number | null;
        credits_start: number | null;
        season_number: number;
    };
    anime: {
        slug: string;
        title: string;
        age_rating: string;
        type: string;
    };
    startPosition: number;
    isFavorited: boolean | null;
    likesCount: number;
    dislikesCount: number;
    moreEpisodes: {
        id: number;
        number: number;
        title: string | null;
        thumbnail: string;
        duration_seconds: number;
        season_number: number;
        is_current: boolean;
    }[];
    comments: CommentData[];
    nextEpisode: {
        id: number;
        number: number;
        title: string | null;
        thumbnail: string;
        duration_seconds: number;
        season_number: number;
    } | null;
    prevEpisode: {
        id: number;
        number: number;
        title: string | null;
        thumbnail: string;
        duration_seconds: number;
        season_number: number;
    } | null;
    subtitles: {
        id: number;
        language: string;
        url: string;
        label: string;
    }[];
    preferences: {
        autoplay: boolean;
        auto_skip_intro: boolean;
        auto_skip_credits: boolean;
        autoplay_countdown: number;
        quality: string;
        audio_language: string;
        subtitle_language: string;
        playback_speed: number;
        remember_volume: boolean;
    };
}

export default function Watch({ episode, anime, startPosition, isFavorited: initialLiked, likesCount: initialLikes, dislikesCount: initialDislikes, moreEpisodes, comments: initialComments, nextEpisode, prevEpisode, subtitles, preferences }: WatchProps) {
    const player = useRef<MediaPlayerInstance>(null);
    const lastSaved = useRef(0);
    const [showSkipIntro, setShowSkipIntro] = useState(false);
    const [showNextCountdown, setShowNextCountdown] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [countdown, setCountdown] = useState(preferences.autoplay_countdown);
    const [liked, setLiked] = useState<boolean | null>(initialLiked);
    const [likesCount, setLikesCount] = useState(initialLikes);
    const [dislikesCount, setDislikesCount] = useState(initialDislikes);
    const [activeSubtitle, setActiveSubtitle] = useState<string | null>(preferences.subtitle_language !== 'none' ? preferences.subtitle_language : null);

    const selectSubtitle = (lang: string | null) => {
        setSubtitleTrack(lang);
        setActiveSubtitle(lang);
    };

    const saveProgress = (currentTime: number, completed = false) => {
        if (!completed && currentTime - lastSaved.current < 10) return;
        lastSaved.current = currentTime;

        const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

        fetch(route('watch.progress', episode.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token ?? '',
            },
            body: JSON.stringify({ position_seconds: Math.floor(currentTime), completed }),
        });
    };

    const toggleLike = (value: boolean) => {
        axios.post(`/episodes/${episode.id}/favorite`, { liked: value })
            .then((res) => {
                setLiked(res.data.liked);
                setLikesCount(res.data.likes_count);
                setDislikesCount(res.data.dislikes_count);
            })
            .catch((err) => {
                console.error('Like error:', err);
            });
    };

    const hasSkippedIntro = useRef(false);
    const hasSkippedCredits = useRef(false);

    const handleTimeUpdate = (currentTime: number) => {
        saveProgress(currentTime);

        if (episode.intro_start !== null && episode.intro_end !== null) {
            const inIntro = currentTime >= episode.intro_start && currentTime < episode.intro_end;
            if (inIntro && preferences.auto_skip_intro && !hasSkippedIntro.current) {
                hasSkippedIntro.current = true;
                if (player.current) player.current.currentTime = episode.intro_end;
            } else if (inIntro && !preferences.auto_skip_intro) {
                setShowSkipIntro(true);
            } else {
                setShowSkipIntro(false);
            }
        }

        if (nextEpisode && episode.credits_start !== null) {
            const inCredits = currentTime >= episode.credits_start;
            if (inCredits && preferences.auto_skip_credits && !hasSkippedCredits.current) {
                hasSkippedCredits.current = true;
                const fs = isFullscreen ? '?fullscreen=1' : '';
                router.visit(route('watch.show', nextEpisode.id) + fs);
                return;
            }
            if (inCredits && !showNextCountdown) {
                setCountdown(preferences.autoplay_countdown);
            }
            if (!preferences.auto_skip_credits) {
                setShowNextCountdown(inCredits);
            }
        }
    };

    useEffect(() => {
        const el = player.current?.wrapper;
        if (!el) return;

        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('fullscreen') === '1' && player.current) {
            player.current.requestFullscreen();
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (!player.current || !preferences.remember_volume) return;
        const saved = localStorage.getItem('kairo_volume');
        if (saved !== null) {
            player.current.volume = parseFloat(saved);
        }
        const onVolumeChange = () => {
            if (player.current) {
                localStorage.setItem('kairo_volume', String(player.current.volume));
            }
        };
        player.current.addEventListener('volume-change', onVolumeChange);
        return () => player.current?.removeEventListener('volume-change', onVolumeChange);
    }, [preferences.remember_volume]);

    useEffect(() => {
        if (!showNextCountdown || !isPlaying) return;

        if (countdown <= 0) {
            const url = nextEpisode!.id;
            const fs = isFullscreen ? '?fullscreen=1' : '';
            router.visit(route('watch.show', url) + fs);
            return;
        }

        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [showNextCountdown, isPlaying, countdown]);

    const setSubtitleTrack = (lang: string | null) => {
        const p = player.current;
        if (!p) return;
        [...p.textTracks].forEach((t) => {
            const match = lang !== null && (t.language === lang || t.id === lang);
            t.mode = match ? 'showing' : 'disabled';
        });
    };

    const applyPlaybackPreferences = (tries = 0) => {
        const p = player.current;
        if (!p) return;

        const quality = preferences.quality;
        if (quality && quality !== 'auto') {
            const height = parseInt(quality, 10);
            const q = p.qualities.find((x) => x.height === height);
            if (q && 'selected' in q) {
                q.selected = true;
            }
        }

        const sub = preferences.subtitle_language;
        if (sub && sub !== 'none') {
            setSubtitleTrack(sub);
        } else {
            setSubtitleTrack(null);
        }

        const aud = preferences.audio_language;
        if (aud) {
            const a =
                p.audioTracks.getById(aud) ??
                [...p.audioTracks].find((x) => x.language === aud);
            if (a && 'selected' in a) {
                a.selected = true;
            }
        }

        if (tries < 8 && p.qualities.length === 0) {
            setTimeout(() => applyPlaybackPreferences(tries + 1), 500);
        }
    };

    useEffect(() => {
        const p = player.current;
        if (!p) return;
        const onCanPlay = () => applyPlaybackPreferences();
        p.addEventListener('can-play', onCanPlay, { once: true });
        return () => p.removeEventListener('can-play', onCanPlay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const skipIntro = () => {
        if (player.current && episode.intro_end !== null) {
            player.current.currentTime = episode.intro_end;
        }
        setShowSkipIntro(false);
    };

    const cancelAutoplay = () => {
        setShowNextCountdown(false);
        setCountdown(preferences.autoplay_countdown);
    };

    const resolveSrc = (): any => {
        const path = episode.video_path;
        if (/\.m3u8(\?.*)?$/i.test(path)) {
            return { src: path, type: 'application/x-mpegurl' };
        }
        return path;
    };

    return (
        <>
            <Head title={`${anime.title} - S${episode.season_number}E${episode.number}`} />

            <div className="pt-14 sm:pt-16">
                <div className="flex flex-col gap-3 px-3 pt-2 sm:px-4 md:px-6 lg:flex-row lg:gap-4 lg:px-8 lg:pt-4">
                    <div className="relative aspect-video flex-1 bg-black">
                        <MediaPlayer
                            ref={player}
                            src={resolveSrc()}
                            title={episode.title ?? `Episodio ${episode.number}`}
                            currentTime={startPosition}
                            autoPlay={preferences.autoplay}
                            playbackRate={preferences.playback_speed}
                            onTimeUpdate={({ currentTime }) => handleTimeUpdate(currentTime)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnd={() => {
                                saveProgress(episode.duration_seconds, true);
                                if (nextEpisode && preferences.autoplay) {
                                    setCountdown(preferences.autoplay_countdown);
                                    setShowNextCountdown(true);
                                }
                            }}
                            className="h-full w-full"
                        >
                            <MediaProvider />
                            {subtitles.map((s) => (
                                <Track
                                    key={s.id}
                                    src={s.url}
                                    kind="subtitles"
                                    lang={s.language}
                                    label={s.label}
                                    default={preferences.subtitle_language === s.language}
                                />
                            ))}
                            <DefaultVideoLayout icons={defaultLayoutIcons} />

                            {showSkipIntro && (
                                <button
                                    onClick={skipIntro}
                                    className="absolute bottom-24 right-6 z-50 flex items-center gap-1.5 rounded-xl border border-[hsl(217,91%,60%)]/40 bg-black/70 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-md transition-all hover:border-[hsl(217,91%,60%)]/70 hover:shadow-[0_0_16px_hsl(217,91%,60%,0.25)] hover:scale-105 active:scale-95"
                                >
                                    Saltar intro <SkipForward className="h-3.5 w-3.5" />
                                </button>
                            )}

                            {showNextCountdown && nextEpisode && (
                                <div className="absolute bottom-24 right-6 z-50 flex items-center gap-3 overflow-hidden rounded-xl border border-[hsl(217,91%,60%)]/30 bg-black/70 shadow-[0_0_20px_hsl(217,91%,60%,0.1)] backdrop-blur-md">
                                    <SmartImage
                                        src={nextEpisode.thumbnail}
                                        alt=""
                                        className="h-14 w-24 object-cover"
                                    />
                                    <div className="flex items-center gap-3 pr-3">
                                        <div>
                                            <p className="text-[11px] font-medium text-[hsl(217,91%,60%)]">Siguiente en</p>
                                            <p className="text-[13px] font-semibold text-white">
                                                S{nextEpisode.season_number}E{nextEpisode.number} · {countdown}s
                                            </p>
                                        </div>
                                        <Link
                                            href={route('watch.show', nextEpisode.id)}
                                            className="text-[13px] font-semibold text-[hsl(217,91%,60%)] hover:text-[hsl(217,91%,70%)]"
                                        >
                                            <SkipForward className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={cancelAutoplay}
                                            className="text-white/40 transition-colors hover:text-white/80"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </MediaPlayer>
                    </div>

                    <div className="hidden w-72 flex-shrink-0 lg:block xl:w-80">
                        <div className="rounded-md bg-muted/40 p-4 mb-3">
                            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Reproducción
                            </h2>
                            <button
                                onClick={() => {
                                    if (player.current) {
                                        player.current.currentTime = 0;
                                        player.current.play();
                                    }
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                            >
                                <Repeat1 className="h-4 w-4" /> Repetir episodio
                            </button>
                            <div className="mt-3">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Subtítulos
                                </p>
                                {subtitles.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => selectSubtitle(null)}
                                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                                activeSubtitle === null
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border text-foreground hover:bg-muted/50'
                                            }`}
                                        >
                                            Ninguno
                                        </button>
                                        {subtitles.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => selectSubtitle(s.language)}
                                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                                    activeSubtitle === s.language
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border text-foreground hover:bg-muted/50'
                                                }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No disponibles</p>
                                )}
                            </div>
                        </div>

                        {nextEpisode && (
                            <div className="rounded-md bg-muted/40 p-4 mb-3">
                                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Siguiente episodio
                                </h2>
                                <Link
                                    href={route('watch.show', nextEpisode.id)}
                                    className="flex gap-3 rounded-md p-2 hover:bg-muted/50"
                                >
                                    <div className="relative flex-shrink-0">
                                        <SmartImage
                                            src={nextEpisode.thumbnail}
                                            alt={nextEpisode.title ?? ''}
                                            className="h-20 w-32 rounded object-cover"
                                        />
                                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-xs text-white">
                                            {Math.round(nextEpisode.duration_seconds / 60)}m
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            S{nextEpisode.season_number}E{nextEpisode.number} — {nextEpisode.title ?? `Episodio ${nextEpisode.number}`}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {prevEpisode && (
                            <div className="rounded-md bg-muted/40 p-4 mb-3">
                                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Capítulo anterior
                                </h2>
                                <Link
                                    href={route('watch.show', prevEpisode.id)}
                                    className="flex gap-3 rounded-md p-2 hover:bg-muted/50"
                                >
                                    <div className="relative flex-shrink-0">
                                        <SmartImage
                                            src={prevEpisode.thumbnail}
                                            alt={prevEpisode.title ?? ''}
                                            className="h-20 w-32 rounded object-cover"
                                        />
                                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-xs text-white">
                                            {Math.round(prevEpisode.duration_seconds / 60)}m
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            S{prevEpisode.season_number}E{prevEpisode.number} — {prevEpisode.title ?? `Episodio ${prevEpisode.number}`}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {moreEpisodes.length > 0 && (
                            <div className="rounded-md bg-muted/40 p-4">
                                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Episodios
                                </h2>
                                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                                    {moreEpisodes.map((ep) => (
                                        <Link
                                            key={ep.id}
                                            href={route('watch.show', ep.id)}
                                            className={`flex items-center gap-3 rounded-md p-2 transition-colors ${
                                                ep.is_current
                                                    ? 'bg-primary/10 border border-primary/30'
                                                    : 'hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded">
                                                <SmartImage
                                                    src={ep.thumbnail}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                                {ep.is_current && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-xs font-medium truncate ${ep.is_current ? 'text-primary' : 'text-foreground'}`}>
                                                    S{ep.season_number}E{ep.number}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    {ep.title ?? `Episodio ${ep.number}`}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href={route('anime.show', anime.slug)}
                                    className="mt-3 flex items-center justify-center gap-2 rounded-md border border-muted-foreground/30 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
                                >
                                    <ListVideo className="h-4 w-4" /> Ver todos
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-3 py-4 sm:px-4 md:px-6 lg:px-8 lg:py-6">
                    <Link
                        href={route('anime.show', anime.slug)}
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        {anime.title}
                    </Link>

                    <h1 className="mt-1 text-lg font-bold text-foreground sm:text-xl md:text-2xl xl:text-3xl">
                        S{episode.season_number}E{episode.number} — {episode.title ?? `Episodio ${episode.number}`}
                    </h1>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => toggleLike(true)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                liked === true
                                    ? 'border-green-500/50 bg-green-500/10 text-green-500'
                                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{likesCount}</span>
                        </button>
                        <button
                            onClick={() => toggleLike(false)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                liked === false
                                    ? 'border-red-500/50 bg-red-500/10 text-red-500'
                                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <ThumbsDown className="h-4 w-4" />
                            <span>{dislikesCount}</span>
                        </button>
                        <button className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                            <Share2 className="h-4 w-4" /> Compartir
                        </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="rounded border border-muted-foreground/40 px-1.5 py-0.5 text-xs">
                            {anime.age_rating}
                        </span>
                        <span>Lanzado el {episode.release_date}</span>
                    </div>

                    {subtitles.length > 0 ? (
                        <div className="mt-3">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Subtítulos</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => selectSubtitle(null)}
                                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                        activeSubtitle === null
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border text-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    Ninguno
                                </button>
                                {subtitles.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => selectSubtitle(s.language)}
                                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                            activeSubtitle === s.language
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border text-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {episode.synopsis && (
                        <p className="mt-4 max-w-2xl text-sm text-foreground/90 sm:text-base lg:text-lg">{episode.synopsis}</p>
                    )}
                </div>

                <div className="px-3 pb-10 sm:px-4 md:px-6 lg:px-8 lg:pb-16">
                    <CommentSection episodeId={episode.id} comments={initialComments} />
                </div>
            </div>
        </>
    );
}

Watch.layout = (page: React.ReactNode) => <SiteLayout>{page}</SiteLayout>;
