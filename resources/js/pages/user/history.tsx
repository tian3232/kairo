import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { History, Play, Trash2, CheckSquare, Square, X } from 'lucide-react';
import { imageUrl } from '@/lib/image-url';
import { useToast } from '@/components/toast';
import { useState } from 'react';

interface HistoryEpisode {
    id: number;
    anime_title: string;
    anime_slug: string;
    episode_number: number;
    season_number: number;
    episode_title: string | null;
    episode_synopsis: string | null;
    release_date: string | null;
    thumbnail: string;
    progress: number;
    duration: number;
    completed: boolean;
    updated_at: string;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function UserHistory({ episodes: initialEpisodes }: { episodes: HistoryEpisode[] }) {
    const { toast } = useToast();
    const [episodes, setEpisodes] = useState(initialEpisodes);
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const toggleSelect = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === episodes.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(episodes.map((e) => e.id)));
        }
    };

    const removeHistory = (episodeId: number) => {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        fetch(`/historial/${episodeId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
        }).then((res) => {
            if (res.ok) {
                setEpisodes((prev) => prev.filter((e) => e.id !== episodeId));
                setSelected((prev) => { const n = new Set(prev); n.delete(episodeId); return n; });
                toast('Episodio eliminado del historial');
            }
        });
    };

    const removeSelected = () => {
        if (selected.size === 0) return;
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        fetch('/historial/bulk-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ episode_ids: Array.from(selected) }),
        }).then((res) => {
            if (res.ok) {
                const ids = new Set(selected);
                setEpisodes((prev) => prev.filter((e) => !ids.has(e.id)));
                setSelected(new Set());
                setSelecting(false);
                toast(`${ids.size} episodio(s) eliminado(s)`);
            }
        });
    };

    return (
        <SiteLayout>
            <Head title="Historial - Kairo" />

            <div className="pt-20 px-4 sm:px-6 lg:px-8 lg:pt-24">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Historial</h1>
                    <div className="mt-2 h-px bg-gradient-to-r from-[hsl(217,91%,60%)]/40 via-[hsl(217,91%,60%)]/10 to-transparent" />
                    {episodes.length > 0 && (
                        <div className="flex items-center gap-2">
                            {selecting ? (
                                <>
                                    <span className="text-sm text-muted-foreground">{selected.size} seleccionado(s)</span>
                                    <button
                                        onClick={removeSelected}
                                        disabled={selected.size === 0}
                                        className="flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                    </button>
                                    <button
                                        onClick={() => { setSelecting(false); setSelected(new Set()); }}
                                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setSelecting(true)}
                                    className="flex items-center gap-1.5 rounded-xl border border-[hsl(217,91%,60%)]/30 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-[hsl(217,91%,60%)]/10"
                                >
                                    <CheckSquare className="h-3.5 w-3.5" /> Seleccionar
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {episodes.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(217,91%,60%)]/10">
                            <History className="h-10 w-10 text-[hsl(217,91%,60%)]/40" />
                        </div>
                        <p className="mt-4 text-white/40">No hay episodios en tu historial</p>
                        <Link href={route('explore')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_hsl(217,91%,60%,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_24px_hsl(217,91%,60%,0.4)]">
                            Explorar animes
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selecting && (
                            <button
                                onClick={toggleAll}
                                className="flex items-center gap-2 text-sm text-[hsl(217,91%,60%)] hover:text-foreground"
                            >
                                {selected.size === episodes.length ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                {selected.size === episodes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </button>
                        )}
                        {episodes.map((ep) => {
                            const progressPct = ep.duration > 0
                                ? Math.min(100, Math.round((ep.progress / ep.duration) * 100))
                                : 0;
                            const isSelected = selected.has(ep.id);

                            return (
                                <div key={ep.id} className={`group relative flex gap-4 rounded-xl p-3 transition-all ${isSelected ? 'bg-[hsl(217,91%,60%)]/10 border border-[hsl(217,91%,60%)]/30' : 'bg-[hsl(217,91%,60%)]/5 border border-[hsl(217,91%,60%)]/10 hover:bg-[hsl(217,91%,60%)]/10 hover:border-[hsl(217,91%,60%)]/20'}`}>
                                    {selecting && (
                                        <button
                                            onClick={() => toggleSelect(ep.id)}
                                            className="flex-shrink-0 self-center text-muted-foreground hover:text-foreground"
                                        >
                                            {isSelected ? <CheckSquare className="h-5 w-5 text-[hsl(217,91%,60%)]" /> : <Square className="h-5 w-5" />}
                                        </button>
                                    )}
                                    <Link href={route('watch.show', ep.id)} className="flex gap-3 flex-1 min-w-0 sm:gap-4">
                                        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-32">
                                            <img
                                                src={imageUrl(ep.thumbnail)}
                                                alt={ep.anime_title}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Play className="h-6 w-6 text-foreground" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{ep.anime_title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                S{ep.season_number}E{ep.episode_number}
                                                {ep.episode_title && ` — ${ep.episode_title}`}
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                {ep.release_date && <span>{formatDate(ep.release_date)}</span>}
                                                {ep.episode_synopsis && (
                                                    <span className="truncate">{ep.episode_synopsis}</span>
                                                )}
                                            </div>
                                            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[hsl(217,91%,60%)]/10">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)]"
                                                    style={{ width: `${progressPct}%` }}
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {ep.completed ? 'Completado' : `${progressPct}%`}
                                            </p>
                                        </div>
                                    </Link>
                                    {!selecting && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); removeHistory(ep.id); }}
                                            className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                                            title="Eliminar del historial"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
