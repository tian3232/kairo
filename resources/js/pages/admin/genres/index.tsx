import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { useState } from 'react';

interface Genre {
    id: number;
    name: string;
    slug: string;
    animes_count: number;
}

interface PaginatedGenres {
    data: Genre[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function GenresIndex({ genres }: { genres: PaginatedGenres }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const createForm = useForm({ name: '' });
    const editForm = useForm({ name: '' });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/genres', {
            onSuccess: () => {
                createForm.reset('name');
                setShowCreate(false);
            },
        });
    };

    const handleEdit = (genre: Genre) => {
        setEditingId(genre.id);
        editForm.setData('name', genre.name);
    };

    const handleUpdate = (e: React.FormEvent, genreId: number) => {
        e.preventDefault();
        editForm.put(`/admin/genres/${genreId}`, {
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (genre: Genre) => {
        if (!confirm(`¿Eliminar "${genre.name}"? Esta acción no se puede deshacer.`)) return;
        router.delete(`/admin/genres/${genre.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Géneros - Kairo Admin" />

            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Géneros</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    {showCreate ? 'Cancelar' : '+ Nuevo género'}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="mb-6 flex flex-col sm:flex-row gap-3 rounded-lg border border-border bg-card p-4">
                    <input
                        type="text"
                        value={createForm.data.name}
                        onChange={(e) => createForm.setData('name', e.target.value)}
                        placeholder="Nombre del género"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={createForm.processing}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        Crear
                    </button>
                </form>
            )}

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Animes</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {genres.data.map((genre) => (
                            <tr key={genre.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                                <td className="px-4 py-3">
                                    {editingId === genre.id ? (
                                        <form onSubmit={(e) => handleUpdate(e, genre.id)} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editForm.data.name}
                                                onChange={(e) => editForm.setData('name', e.target.value)}
                                                className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                autoFocus
                                            />
                                            <button type="submit" className="text-xs text-primary hover:underline" disabled={editForm.processing}>
                                                Guardar
                                            </button>
                                            <button type="button" onClick={() => setEditingId(null)} className="text-xs text-muted-foreground hover:underline">
                                                Cancelar
                                            </button>
                                        </form>
                                    ) : (
                                        <span className="font-medium text-foreground">{genre.name}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{genre.slug}</td>
                                <td className="px-4 py-3 text-muted-foreground">{genre.animes_count}</td>
                                <td className="px-4 py-3 text-right">
                                    {editingId !== genre.id && (
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => handleEdit(genre)} className="text-xs text-primary hover:underline">
                                                Editar
                                            </button>
                                            <button onClick={() => handleDelete(genre)} className="text-xs text-destructive hover:underline">
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {genres.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Página {genres.current_page} de {genres.last_page} ({genres.total} géneros)
                    </span>
                    <div className="flex gap-2">
                        {genres.current_page > 1 && (
                            <a href={`?page=${genres.current_page - 1}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Anterior
                            </a>
                        )}
                        {genres.current_page < genres.last_page && (
                            <a href={`?page=${genres.current_page + 1}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Siguiente
                            </a>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
