import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import FileUpload from '@/components/admin/file-upload';

interface Genre { id: number; name: string }
interface Studio { id: number; name: string }
interface Anime {
    id: number;
    title: string;
    synopsis: string;
    type: string;
    status: string;
    age_rating: string;
    release_year: number;
    broadcast_season: string | null;
    broadcast_year: number | null;
    studio_id: number | null;
    cover_image: string;
    banner_image: string;
    logo_image: string;
    trailer_url: string;
    is_active: boolean;
    genres: Array<{ id: number }>;
}

export default function AnimeEdit({ anime, genres, studios }: { anime: Anime; genres: Genre[]; studios: Studio[] }) {
    const form = useForm({
        title: anime.title,
        synopsis: anime.synopsis ?? '',
        type: anime.type,
        status: anime.status,
        age_rating: anime.age_rating ?? '',
        release_year: anime.release_year?.toString() ?? '',
        broadcast_season: anime.broadcast_season ?? '',
        broadcast_year: anime.broadcast_year?.toString() ?? '',
        studio_id: anime.studio_id?.toString() ?? '',
        cover_image: anime.cover_image ?? '',
        banner_image: anime.banner_image ?? '',
        logo_image: anime.logo_image ?? '',
        trailer_url: anime.trailer_url ?? '',
        is_active: anime.is_active,
        genre_ids: anime.genres.map(g => g.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/admin/animes/${anime.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Editar ${anime.title} - Kairo Admin`} />

            <div className="mb-8">
                <Link href="/admin/animes" className="text-sm text-muted-foreground hover:text-foreground">
                    ← Volver a animes
                </Link>
            </div>

            <h1 className="mb-8 text-2xl font-bold text-foreground">Editar: {anime.title}</h1>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Título *</label>
                    <input
                        type="text"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {form.errors.title && <p className="mt-1 text-xs text-destructive">{form.errors.title}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Sinopsis</label>
                    <textarea
                        value={form.data.synopsis}
                        onChange={(e) => form.setData('synopsis', e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Tipo *</label>
                        <select
                            value={form.data.type}
                            onChange={(e) => form.setData('type', e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="tv">TV</option>
                            <option value="ova">OVA</option>
                            <option value="ona">ONA</option>
                            <option value="movie">Película</option>
                            <option value="special">Especial</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Estado *</label>
                        <select
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="upcoming">Próximamente</option>
                            <option value="airing">En emisión</option>
                            <option value="finished">Completado</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Clasificación</label>
                        <input
                            type="text"
                            value={form.data.age_rating}
                            onChange={(e) => form.setData('age_rating', e.target.value)}
                            placeholder="ej: PG-13"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Año de estreno</label>
                    <input
                        type="number"
                        value={form.data.release_year}
                        onChange={(e) => form.setData('release_year', e.target.value)}
                        min="1900"
                        max="2100"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Temporada de emisión</label>
                    <select
                        value={form.data.broadcast_season}
                        onChange={(e) => form.setData('broadcast_season', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Sin asignar</option>
                        <option value="winter">Invierno (Ene-Mar)</option>
                        <option value="spring">Primavera (Abr-Jun)</option>
                        <option value="summer">Verano (Jul-Sep)</option>
                        <option value="fall">Otoño (Oct-Dic)</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Año de temporada</label>
                    <input
                        type="number"
                        value={form.data.broadcast_year}
                        onChange={(e) => form.setData('broadcast_year', e.target.value)}
                        min="2000"
                        max="2100"
                        placeholder="ej: 2026"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Estudio</label>
                    <select
                        value={form.data.studio_id}
                        onChange={(e) => form.setData('studio_id', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Sin estudio</option>
                        {studios.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Géneros</label>
                    <div className="flex flex-wrap gap-2">
                        {genres.map(g => (
                            <label key={g.id} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.data.genre_ids.includes(g.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            form.setData('genre_ids', [...form.data.genre_ids, g.id]);
                                        } else {
                                            form.setData('genre_ids', form.data.genre_ids.filter(id => id !== g.id));
                                        }
                                    }}
                                    className="rounded"
                                />
                                {g.name}
                            </label>
                        ))}
                    </div>
                </div>

                <FileUpload
                    type="image"
                    label="Imagen de portada"
                    value={form.data.cover_image}
                    onChange={(url) => form.setData('cover_image', url)}
                />

                <FileUpload
                    type="image"
                    label="Imagen de banner"
                    value={form.data.banner_image}
                    onChange={(url) => form.setData('banner_image', url)}
                />

                <FileUpload
                    type="image"
                    label="Logo"
                    value={form.data.logo_image}
                    onChange={(url) => form.setData('logo_image', url)}
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">URL tráiler</label>
                    <input
                        type="text"
                        value={form.data.trailer_url}
                        onChange={(e) => form.setData('trailer_url', e.target.value)}
                        placeholder="YouTube o URL del tráiler"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                        className="rounded"
                    />
                    <span className="text-sm font-medium text-foreground">Anime activo (visible en el catálogo)</span>
                </label>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {form.processing ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </form>
        </AdminLayout>
    );
}
