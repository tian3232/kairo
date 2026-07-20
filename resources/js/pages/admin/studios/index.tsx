import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import FileUpload from '@/components/admin/file-upload';
import { useState } from 'react';

interface Studio {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    animes_count: number;
}

interface PaginatedStudios {
    data: Studio[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function StudiosIndex({ studios }: { studios: PaginatedStudios }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const createForm = useForm({ name: '', logo: '' });
    const editForm = useForm({ name: '', logo: '' });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/studios', {
            onSuccess: () => { createForm.reset(); setShowCreate(false); },
        });
    };

    const handleEdit = (studio: Studio) => {
        setEditingId(studio.id);
        editForm.setData({ name: studio.name, logo: studio.logo ?? '' });
    };

    const handleUpdate = (e: React.FormEvent, studioId: number) => {
        e.preventDefault();
        editForm.put(`/admin/studios/${studioId}`, {
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (studio: Studio) => {
        if (!confirm(`¿Eliminar "${studio.name}"? Esta acción no se puede deshacer.`)) return;
        router.delete(`/admin/studios/${studio.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Estudios - Kairo Admin" />

            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Estudios</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    {showCreate ? 'Cancelar' : '+ Nuevo estudio'}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="mb-6 space-y-4 rounded-lg border border-border bg-card p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            placeholder="Nombre del estudio"
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            Crear
                        </button>
                    </div>
                    <FileUpload
                        type="image"
                        label="Logo del estudio"
                        value={createForm.data.logo}
                        onChange={(url) => createForm.setData('logo', url)}
                    />
                </form>
            )}

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Logo</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Animes</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studios.data.map((studio) => (
                            <tr key={studio.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                                {editingId === studio.id ? (
                                    <td colSpan={5} className="p-4">
                                        <form onSubmit={(e) => handleUpdate(e, studio.id)} className="space-y-4">
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="text"
                                                    value={editForm.data.name}
                                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                                    className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                    autoFocus
                                                />
                                                <button type="submit" className="rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90" disabled={editForm.processing}>
                                                    Guardar
                                                </button>
                                                <button type="button" onClick={() => setEditingId(null)} className="rounded border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted">
                                                    Cancelar
                                                </button>
                                            </div>
                                            <FileUpload
                                                type="image"
                                                label="Logo del estudio"
                                                value={editForm.data.logo}
                                                onChange={(url) => editForm.setData('logo', url)}
                                            />
                                        </form>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-4 py-3">
                                            {studio.logo ? (
                                                <img src={studio.logo} alt={studio.name} className="h-8 w-auto rounded bg-muted" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Sin logo</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">{studio.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{studio.slug}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{studio.animes_count}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => handleEdit(studio)} className="text-xs text-primary hover:underline">
                                                    Editar
                                                </button>
                                                <button onClick={() => handleDelete(studio)} className="text-xs text-destructive hover:underline">
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {studios.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Página {studios.current_page} de {studios.last_page} ({studios.total} estudios)
                    </span>
                    <div className="flex gap-2">
                        {studios.current_page > 1 && (
                            <a href={`?page=${studios.current_page - 1}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Anterior
                            </a>
                        )}
                        {studios.current_page < studios.last_page && (
                            <a href={`?page=${studios.current_page + 1}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Siguiente
                            </a>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
