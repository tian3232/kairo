import { Head, useForm, router, Link } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/layouts/admin/layout';
import FileUpload from '@/components/admin/file-upload';
import TimeInput from '@/components/admin/time-input';
import { useState } from 'react';

interface Subtitle {
    id: number;
    language: string;
    url: string;
    label: string;
}

interface Episode {
    id: number;
    number: number;
    title: string | null;
    synopsis: string | null;
    duration_seconds: number | null;
    video_path: string | null;
    thumbnail: string | null;
    intro_start: number | null;
    intro_end: number | null;
    credits_start: number | null;
    subtitles?: Subtitle[];
}

interface Season {
    id: number;
    type: string;
    number: number;
    title: string | null;
    episodes: Episode[];
}

interface Anime {
    id: number;
    title: string;
    seasons: Season[];
}

export default function SeasonsIndex({ anime }: { anime: Anime }) {
    const [expandedSeason, setExpandedSeason] = useState<number | null>(anime.seasons[0]?.id ?? null);
    const [showCreateSeason, setShowCreateSeason] = useState(false);
    const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null);
    const [showAddEpisode, setShowAddEpisode] = useState<number | null>(null);

    const seasonForm = useForm({ type: 'season', number: 1, title: '' });
    const episodeForm = useForm({
        number: 1, title: '', synopsis: '', duration_seconds: '',
        video_path: '', thumbnail: '', intro_start: '', intro_end: '', credits_start: '',
    });
    const editEpisodeForm = useForm({
        number: 1, title: '', synopsis: '', duration_seconds: '',
        video_path: '', thumbnail: '', intro_start: '', intro_end: '', credits_start: '',
    });

    const handleCreateSeason = (e: React.FormEvent) => {
        e.preventDefault();
        seasonForm.post(`/admin/animes/${anime.id}/seasons`, {
            onSuccess: () => { seasonForm.reset(); setShowCreateSeason(false); },
        });
    };

    const handleDeleteSeason = (season: Season) => {
        if (!confirm(`¿Eliminar temporada ${season.number}? Se eliminarán todos sus episodios.`)) return;
        router.delete(`/admin/seasons/${season.id}`);
    };

    const handleCreateEpisode = (e: React.FormEvent, seasonId: number) => {
        e.preventDefault();
        episodeForm.post(`/admin/seasons/${seasonId}/episodes`, {
            onSuccess: () => {
                episodeForm.reset();
                setShowAddEpisode(null);
            },
        });
    };

    const handleDeleteEpisode = (episode: Episode) => {
        if (!confirm(`¿Eliminar episodio ${episode.number}?`)) return;
        router.delete(`/admin/episodes/${episode.id}`);
    };

    const startEditEpisode = (ep: Episode) => {
        setEditingEpisodeId(ep.id);
        editEpisodeForm.setData({
            number: ep.number,
            title: ep.title ?? '',
            synopsis: ep.synopsis ?? '',
            duration_seconds: ep.duration_seconds?.toString() ?? '',
            video_path: ep.video_path ?? '',
            thumbnail: ep.thumbnail ?? '',
            intro_start: ep.intro_start?.toString() ?? '',
            intro_end: ep.intro_end?.toString() ?? '',
            credits_start: ep.credits_start?.toString() ?? '',
        });
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '—';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <AdminLayout>
            <Head title={`Temporadas - ${anime.title} - Kairo Admin`} />

            <div className="mb-8">
                <Link href="/admin/animes" className="text-sm text-muted-foreground hover:text-foreground">
                    ← Volver a animes
                </Link>
            </div>

            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Temporadas: {anime.title}</h1>
                <button
                    onClick={() => setShowCreateSeason(!showCreateSeason)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    {showCreateSeason ? 'Cancelar' : '+ Nueva temporada'}
                </button>
            </div>

            {showCreateSeason && (
                <form onSubmit={handleCreateSeason} className="mb-6 flex flex-col sm:flex-row gap-3 rounded-lg border border-border bg-card p-4">
                    <select
                        value={seasonForm.data.type}
                        onChange={(e) => seasonForm.setData('type', e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                        <option value="season">Temporada</option>
                        <option value="ova">OVA</option>
                        <option value="special">Especial</option>
                    </select>
                    <input
                        type="number"
                        value={seasonForm.data.number}
                        onChange={(e) => seasonForm.setData('number', parseInt(e.target.value))}
                        min="1"
                        className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    <input
                        type="text"
                        value={seasonForm.data.title}
                        onChange={(e) => seasonForm.setData('title', e.target.value)}
                        placeholder="Título (opcional)"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <button type="submit" disabled={seasonForm.processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                        Crear
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {anime.seasons.map((season) => (
                    <div key={season.id} className="rounded-lg border border-border bg-card">
                        <button
                            onClick={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
                            className="flex w-full items-center justify-between p-4 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                                    {season.type}
                                </span>
                                <span className="font-medium text-foreground">
                                    Temporada {season.number}
                                    {season.title && ` — ${season.title}`}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    ({season.episodes.length} episodios)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteSeason(season); }} className="text-xs text-destructive hover:underline">
                                    Eliminar
                                </button>
                            </div>
                        </button>

                        {expandedSeason === season.id && (
                            <div className="border-t border-border p-4">
                                {season.episodes.length > 0 && (
                                    <div className="mb-4 space-y-3">
                                        {season.episodes.map((ep) => (
                                            <div key={ep.id} className="rounded-lg border border-border bg-background p-4">
                                                {editingEpisodeId === ep.id ? (
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            editEpisodeForm.put(`/admin/episodes/${ep.id}`, {
                                                                onSuccess: () => setEditingEpisodeId(null),
                                                            });
                                                        }}
                                                        className="space-y-4"
                                                    >
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="mb-1 block text-xs font-medium text-muted-foreground"># Episodio</label>
                                                                <input
                                                                    type="number"
                                                                    value={editEpisodeForm.data.number}
                                                                    onChange={(e) => editEpisodeForm.setData('number', parseInt(e.target.value))}
                                                                    min="1"
                                                                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Título</label>
                                                                <input
                                                                    type="text"
                                                                    value={editEpisodeForm.data.title}
                                                                    onChange={(e) => editEpisodeForm.setData('title', e.target.value)}
                                                                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sinopsis del episodio</label>
                                                            <textarea
                                                                value={editEpisodeForm.data.synopsis}
                                                                onChange={(e) => editEpisodeForm.setData('synopsis', e.target.value)}
                                                                rows={2}
                                                                placeholder="Breve descripción del episodio..."
                                                                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="mb-2 text-xs font-medium text-muted-foreground">Puntos de salto</p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                <TimeInput
                                                                    label="Intro inicio"
                                                                    valueSeconds={editEpisodeForm.data.intro_start ? parseInt(editEpisodeForm.data.intro_start) : null}
                                                                    onChange={(v) => editEpisodeForm.setData('intro_start', v?.toString() ?? '')}
                                                                />
                                                                <TimeInput
                                                                    label="Intro fin"
                                                                    valueSeconds={editEpisodeForm.data.intro_end ? parseInt(editEpisodeForm.data.intro_end) : null}
                                                                    onChange={(v) => editEpisodeForm.setData('intro_end', v?.toString() ?? '')}
                                                                />
                                                                <TimeInput
                                                                    label="Inicio créditos"
                                                                    valueSeconds={editEpisodeForm.data.credits_start ? parseInt(editEpisodeForm.data.credits_start) : null}
                                                                    onChange={(v) => editEpisodeForm.setData('credits_start', v?.toString() ?? '')}
                                                                />
                                                            </div>
                                                        </div>
                                                        <FileUpload
                                                            type="video"
                                                            label="Video del episodio"
                                                            value={editEpisodeForm.data.video_path}
                                                            onChange={(url) => editEpisodeForm.setData('video_path', url)}
                                                        />
                                                        <FileUpload
                                                            type="image"
                                                            label="Thumbnail"
                                                            value={editEpisodeForm.data.thumbnail}
                                                            onChange={(url) => editEpisodeForm.setData('thumbnail', url)}
                                                        />
                                                        <div className="rounded-lg border border-border p-3">
                                                            <p className="mb-2 text-xs font-medium text-muted-foreground">Subtítulos</p>
                                                            {(ep.subtitles ?? []).length > 0 && (
                                                                <div className="mb-3 space-y-1">
                                                                    {(ep.subtitles ?? []).map((s) => (
                                                                        <div key={s.id} className="flex items-center justify-between rounded bg-muted px-2 py-1 text-xs">
                                                                            <span className="text-foreground">{s.label}</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (confirm(`¿Eliminar subtítulo ${s.label}?`)) {
                                                                                        router.delete(`/admin/subtitles/${s.id}`, {
                                                                                            preserveScroll: true,
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="text-destructive hover:underline"
                                                                            >
                                                                                Eliminar
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {['es', 'en', 'ja'].map((lang) => (
                                                                <div key={lang} className="mb-2 flex items-center gap-2">
                                                                    <span className="w-16 text-xs text-muted-foreground">
                                                                        {lang === 'es' ? 'Español' : lang === 'en' ? 'English' : '日本語'}
                                                                    </span>
                                                                    <input
                                                                        type="file"
                                                                        accept=".vtt"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;
                                                                            const fd = new FormData();
                                                                            fd.append('language', lang);
                                                                            fd.append('file', file);
                                                                            axios
                                                                                .post(`/admin/episodes/${ep.id}/subtitles/upload`, fd)
                                                                                .then(() => router.reload({ preserveScroll: true }))
                                                                                .catch((err) => console.error('Subtitle upload error:', err));
                                                                            e.target.value = '';
                                                                        }}
                                                                        className="flex-1 text-xs text-foreground file:mr-2 file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-primary"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button type="submit" className="rounded bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90" disabled={editEpisodeForm.processing}>
                                                                Guardar
                                                            </button>
                                                            <button type="button" onClick={() => setEditingEpisodeId(null)} className="rounded border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted">
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm font-bold text-muted-foreground">
                                                                {ep.number}
                                                            </span>
                                                            <div>
                                                                <p className="font-medium text-foreground">{ep.title ?? 'Sin título'}</p>
                                                                <div className="flex gap-3 text-xs text-muted-foreground">
                                                                    <span>{formatDuration(ep.duration_seconds)}</span>
                                                                    {ep.intro_start != null && ep.intro_end != null && (
                                                                        <span>Intro: {formatDuration(ep.intro_start)} – {formatDuration(ep.intro_end)}</span>
                                                                    )}
                                                                    {ep.credits_start != null && (
                                                                        <span>Créditos: {formatDuration(ep.credits_start)}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button onClick={() => startEditEpisode(ep)} className="text-xs text-primary hover:underline">
                                                                Editar
                                                            </button>
                                                            <button onClick={() => handleDeleteEpisode(ep)} className="text-xs text-destructive hover:underline">
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {showAddEpisode === season.id ? (
                                    <form onSubmit={(e) => handleCreateEpisode(e, season.id)} className="space-y-4 rounded-lg border border-dashed border-border p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground"># Episodio</label>
                                                <input
                                                    type="number"
                                                    value={episodeForm.data.number}
                                                    onChange={(e) => episodeForm.setData('number', parseInt(e.target.value))}
                                                    min="1"
                                                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Título</label>
                                                <input
                                                    type="text"
                                                    value={episodeForm.data.title}
                                                    onChange={(e) => episodeForm.setData('title', e.target.value)}
                                                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sinopsis del episodio</label>
                                            <textarea
                                                value={episodeForm.data.synopsis}
                                                onChange={(e) => episodeForm.setData('synopsis', e.target.value)}
                                                rows={2}
                                                placeholder="Breve descripción del episodio..."
                                                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <FileUpload
                                            type="video"
                                            label="Video del episodio"
                                            value={episodeForm.data.video_path}
                                            onChange={(url) => episodeForm.setData('video_path', url)}
                                        />
                                        <FileUpload
                                            type="image"
                                            label="Thumbnail del episodio"
                                            value={episodeForm.data.thumbnail}
                                            onChange={(url) => episodeForm.setData('thumbnail', url)}
                                        />
                                        <div>
                                            <p className="mb-2 text-xs font-medium text-muted-foreground">Puntos de salto (opcional)</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                <TimeInput
                                                    label="Intro inicio"
                                                    valueSeconds={episodeForm.data.intro_start ? parseInt(episodeForm.data.intro_start) : null}
                                                    onChange={(v) => episodeForm.setData('intro_start', v?.toString() ?? '')}
                                                />
                                                <TimeInput
                                                    label="Intro fin"
                                                    valueSeconds={episodeForm.data.intro_end ? parseInt(episodeForm.data.intro_end) : null}
                                                    onChange={(v) => episodeForm.setData('intro_end', v?.toString() ?? '')}
                                                />
                                                <TimeInput
                                                    label="Inicio créditos"
                                                    valueSeconds={episodeForm.data.credits_start ? parseInt(episodeForm.data.credits_start) : null}
                                                    onChange={(v) => episodeForm.setData('credits_start', v?.toString() ?? '')}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" disabled={episodeForm.processing} className="rounded bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                                Crear episodio
                                            </button>
                                            <button type="button" onClick={() => { setShowAddEpisode(null); episodeForm.reset(); }} className="rounded border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted">
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setShowAddEpisode(season.id)}
                                        className="rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary"
                                    >
                                        + Agregar episodio
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
