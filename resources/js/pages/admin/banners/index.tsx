import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { imageUrl } from '@/lib/image-url';

interface Banner {
    id: number;
    order: number;
    is_active: boolean;
    duration_seconds: number;
    anime: { id: number; title: string; banner_image: string | null } | null;
}

interface Anime { id: number; title: string }

export default function BannersIndex({ banners, animes }: { banners: Banner[]; animes: Anime[] }) {
    const createForm = useForm({ anime_id: '', duration_seconds: '5' });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/banners', {
            onSuccess: () => createForm.reset(),
        });
    };

    const handleDelete = (banner: Banner) => {
        if (!confirm('¿Eliminar este banner?')) return;
        router.delete(`/admin/banners/${banner.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Banners - Kairo Admin" />

            <h1 className="mb-8 text-2xl font-bold text-foreground">Banners del Hero</h1>

            <form onSubmit={handleCreate} className="mb-6 flex flex-col sm:flex-row gap-3 rounded-lg border border-border bg-card p-4">
                <select
                    value={createForm.data.anime_id}
                    onChange={(e) => createForm.setData('anime_id', e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                    <option value="">Seleccionar anime</option>
                    {animes.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                </select>
                <input
                    type="number"
                    value={createForm.data.duration_seconds}
                    onChange={(e) => createForm.setData('duration_seconds', e.target.value)}
                    min="1"
                    max="30"
                    placeholder="Segundos"
                    className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <button type="submit" disabled={createForm.processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    Agregar banner
                </button>
            </form>

            <div className="space-y-3">
                {banners.map((banner) => (
                    <div key={banner.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm font-bold text-muted-foreground">
                            {banner.order}
                        </span>

                        {banner.anime?.banner_image && (
                            <img
                                src={imageUrl(banner.anime.banner_image)}
                                alt={banner.anime?.title}
                                className="h-12 w-32 rounded object-cover"
                            />
                        )}

                        <div className="flex-1">
                            <p className="font-medium text-foreground">{banner.anime?.title ?? 'Anime eliminado'}</p>
                            <p className="text-xs text-muted-foreground">{banner.duration_seconds}s</p>
                        </div>

                        <button
                            onClick={() => router.post(`/admin/banners/${banner.id}/toggle-active`)}
                            className={`h-5 w-9 rounded-full transition-colors ${banner.is_active ? 'bg-primary' : 'bg-muted'}`}
                        >
                            <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${banner.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>

                        <button onClick={() => handleDelete(banner)} className="text-xs text-destructive hover:underline">
                            Eliminar
                        </button>
                    </div>
                ))}

                {banners.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay banners configurados.</p>
                )}
            </div>
        </AdminLayout>
    );
}
