import { Head, router } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { AnimeCard, type AnimeCardData } from '@/components/anime-card';
import { X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Genre {
    id: number;
    name: string;
    slug: string;
}

interface PaginatedAnimes {
    data: AnimeCardData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    [key: string]: string | undefined;
    genre?: string;
    type?: string;
    status?: string;
    year?: string;
    sort?: string;
}

interface ExploreProps {
    animes: PaginatedAnimes;
    genres: Genre[];
    years: number[];
    filters: Filters;
    userLists: { watchlist: number[]; favorites: number[] };
}

const TYPE_OPTIONS = [
    { value: 'tv', label: 'TV' },
    { value: 'movie', label: 'Película' },
    { value: 'ova', label: 'OVA' },
    { value: 'special', label: 'Especial' },
];

const STATUS_OPTIONS = [
    { value: 'airing', label: 'En emisión' },
    { value: 'finished', label: 'Finalizado' },
    { value: 'upcoming', label: 'Próximamente' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'rating', label: 'Mejor calificados' },
    { value: 'az', label: 'A-Z' },
    { value: 'views', label: 'Más vistos' },
];

export default function Explore({ animes, genres, years, filters, userLists }: ExploreProps) {
    const [showFilters, setShowFilters] = useState(false);

    function applyFilter(key: string, value: string) {
        const newFilters = { ...filters };
        if (value) {
            newFilters[key] = value;
        } else {
            delete newFilters[key];
        }
        delete newFilters.page;
        router.get(route('explore'), newFilters, { preserveState: true, replace: true });
    }

    function removeFilter(key: string) {
        applyFilter(key, '');
    }

    function clearAll() {
        router.get(route('explore'), {}, { preserveState: true, replace: true });
    }

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <SiteLayout>
            <Head title="Explorar - Kairo" />

            <div className="pt-20 px-4 sm:px-6 lg:px-8 lg:pt-24">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-foreground">Explorar</h1>
                        <div className="mt-2 h-px bg-gradient-to-r from-[hsl(217,91%,60%)]/40 via-[hsl(217,91%,60%)]/10 to-transparent" />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                                showFilters
                                    ? 'border-[hsl(217,91%,60%)] bg-[hsl(217,91%,60%)]/10 text-foreground'
                                    : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filtros
                            {activeFilterCount > 0 && (
                                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{animes.total} resultado{animes.total !== 1 && 's'}</p>
                </div>

                {showFilters && (
                    <div className="mb-6 rounded-xl border-border/60 bg-[hsl(217,91%,60%)]/5 backdrop-blur-md p-4">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Género</label>
                                <select
                                    value={filters.genre ?? ''}
                                    onChange={(e) => applyFilter('genre', e.target.value)}
                                    className="w-full rounded-xl border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                                >
                                    <option value="">Todos</option>
                                    {genres.map((g) => (
                                        <option key={g.id} value={g.slug}>{g.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Tipo</label>
                                <select
                                    value={filters.type ?? ''}
                                    onChange={(e) => applyFilter('type', e.target.value)}
                                    className="w-full rounded-xl border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                                >
                                    <option value="">Todos</option>
                                    {TYPE_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Estado</label>
                                <select
                                    value={filters.status ?? ''}
                                    onChange={(e) => applyFilter('status', e.target.value)}
                                    className="w-full rounded-xl border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                                >
                                    <option value="">Todos</option>
                                    {STATUS_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Año</label>
                                <select
                                    value={filters.year ?? ''}
                                    onChange={(e) => applyFilter('year', e.target.value)}
                                    className="w-full rounded-xl border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                                >
                                    <option value="">Todos</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-medium text-muted-foreground">Ordenar:</label>
                                <select
                                    value={filters.sort ?? 'newest'}
                                    onChange={(e) => applyFilter('sort', e.target.value)}
                                    className="rounded-xl border-border/60 bg-muted/30 px-3 py-1.5 text-sm text-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3 w-3" />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {activeFilterCount > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {filters.genre && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(217,91%,60%)]/10 border border-[hsl(217,91%,60%)]/30 px-3 py-1 text-xs text-[hsl(217,91%,60%)]">
                                {genres.find(g => g.slug === filters.genre)?.name}
                                <button onClick={() => removeFilter('genre')}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {filters.type && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(217,91%,60%)]/10 border border-[hsl(217,91%,60%)]/30 px-3 py-1 text-xs text-[hsl(217,91%,60%)]">
                                {TYPE_OPTIONS.find(o => o.value === filters.type)?.label}
                                <button onClick={() => removeFilter('type')}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {filters.status && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(217,91%,60%)]/10 border border-[hsl(217,91%,60%)]/30 px-3 py-1 text-xs text-[hsl(217,91%,60%)]">
                                {STATUS_OPTIONS.find(o => o.value === filters.status)?.label}
                                <button onClick={() => removeFilter('status')}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {filters.year && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(217,91%,60%)]/10 border border-[hsl(217,91%,60%)]/30 px-3 py-1 text-xs text-[hsl(217,91%,60%)]">
                                {filters.year}
                                <button onClick={() => removeFilter('year')}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                    </div>
                )}

                {animes.data.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-lg text-[hsl(217,91%,60%)]/40 font-medium">No se encontraron animes</p>
                        <p className="mt-1 text-sm text-muted-foreground/60">Prueba ajustando los filtros de búsqueda</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {animes.data.map((anime) => (
                            <AnimeCard key={anime.id} anime={anime} userLists={userLists} />
                        ))}
                    </div>
                )}

                {animes.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {Array.from({ length: animes.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => applyFilter('page', String(page))}
                                className={`h-8 w-8 rounded-xl text-sm transition-colors ${
                                    page === animes.current_page
                                        ? 'bg-[hsl(217,91%,60%)] text-primary-foreground font-semibold shadow-[0_0_12px_hsl(217,91%,60%,0.3)]'
                                        : 'bg-muted text-muted-foreground hover:bg-[hsl(217,91%,60%)]/10'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
