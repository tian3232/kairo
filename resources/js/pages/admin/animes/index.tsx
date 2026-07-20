import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';

interface Anime {
    id: number;
    title: string;
    slug: string;
    type: string;
    status: string;
    is_active: boolean;
    studio: { name: string } | null;
    genres: Array<{ id: number; name: string }>;
    created_at: string;
}

interface PaginatedAnimes {
    data: Anime[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function AnimesIndex({ animes, filters }: { animes: PaginatedAnimes; filters: { search?: string } }) {
    const toggleActive = (anime: Anime) => {
        router.post(`/admin/animes/${anime.id}/toggle-active`);
    };

    const handleDelete = (anime: Anime) => {
        if (!confirm(`¿Eliminar "${anime.title}"? Esta acción no se puede deshacer.`)) return;
        router.delete(`/admin/animes/${anime.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Animes - Kairo Admin" />

            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Animes</h1>
                <Link
                    href="/admin/animes/create"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    + Nuevo anime
                </Link>
            </div>

            <form method="get" className="mb-6 flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    name="search"
                    defaultValue={filters.search ?? ''}
                    placeholder="Buscar anime..."
                    className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
                    Buscar
                </button>
            </form>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Título</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estudio</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Géneros</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Activo</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {animes.data.map((anime) => (
                            <tr key={anime.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                                <td className="px-4 py-3 font-medium text-foreground">{anime.title}</td>
                                <td className="px-4 py-3 text-muted-foreground uppercase">{anime.type}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded px-2 py-1 text-xs font-medium ${
                                        anime.status === 'airing' ? 'bg-green-500/10 text-green-600' :
                                        anime.status === 'finished' ? 'bg-blue-500/10 text-blue-600' :
                                        'bg-yellow-500/10 text-yellow-600'
                                    }`}>
                                        {anime.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{anime.studio?.name ?? '—'}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {anime.genres.map(g => g.name).join(', ') || '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => toggleActive(anime)}
                                        className={`h-5 w-9 rounded-full transition-colors ${
                                            anime.is_active ? 'bg-primary' : 'bg-muted'
                                        }`}
                                    >
                                        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                                            anime.is_active ? 'translate-x-4' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-3">
                                        <Link href={`/admin/animes/${anime.id}/seasons`} className="text-xs text-primary hover:underline">
                                            Temporadas
                                        </Link>
                                        <Link href={`/admin/animes/${anime.id}/edit`} className="text-xs text-primary hover:underline">
                                            Editar
                                        </Link>
                                        <button onClick={() => handleDelete(anime)} className="text-xs text-destructive hover:underline">
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {animes.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Página {animes.current_page} de {animes.last_page} ({animes.total} animes)
                    </span>
                    <div className="flex gap-2">
                        {animes.current_page > 1 && (
                            <a href={`?page=${animes.current_page - 1}&search=${filters.search ?? ''}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Anterior
                            </a>
                        )}
                        {animes.current_page < animes.last_page && (
                            <a href={`?page=${animes.current_page + 1}&search=${filters.search ?? ''}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Siguiente
                            </a>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
