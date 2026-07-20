import { Head, Link, router } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { AnimeCard, type AnimeCardData } from '@/components/anime-card';
import { Plus, MoreVertical, Pencil, Trash2, Upload, Grid, ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SmartImage } from '@/components/smart-image';
import { imageUrl } from '@/lib/image-url';

interface ListData {
    id: number;
    name: string;
    description: string | null;
    cover_image: string | null;
    animes_count: number;
    animes: AnimeCardData[];
}

function ListCover({ list, size = 'lg' }: { list: ListData; size?: 'sm' | 'md' | 'lg' }) {
    const dim = size === 'sm' ? 'h-12 w-12' : size === 'md' ? 'h-16 w-16' : 'h-20 w-20';

    if (list.cover_image) {
        return (
            <SmartImage
                src={imageUrl(list.cover_image)}
                alt={list.name}
                className={`${dim} rounded-xl object-cover ring-2 ring-[hsl(217,91%,60%)]/30`}
            />
        );
    }

    const count = list.animes.length;

    if (count === 0) {
        return (
            <div className={`${dim} rounded-xl bg-gradient-to-br from-[hsl(217,91%,60%)]/20 to-[hsl(217,91%,60%)]/5 flex items-center justify-center ring-2 ring-[hsl(217,91%,60%)]/30`}>
                <Grid className={`${size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-10 w-10'} text-[hsl(217,91%,60%)]/40`} />
            </div>
        );
    }

    if (count === 1) {
        return (
            <SmartImage
                src={list.animes[0].cover_image}
                alt={list.name}
                className={`${dim} rounded-xl object-cover ring-2 ring-[hsl(217,91%,60%)]/30`}
            />
        );
    }

    const covers = list.animes.slice(0, 4);

    if (count === 2) {
        return (
            <div className={`${dim} rounded-xl overflow-hidden ring-2 ring-[hsl(217,91%,60%)]/30 grid grid-cols-2`}>
                {covers.map((a) => (
                    <SmartImage key={a.id} src={a.cover_image} alt="" className="h-full w-full object-cover" />
                ))}
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className={`${dim} rounded-xl overflow-hidden ring-2 ring-[hsl(217,91%,60%)]/30 grid grid-cols-2 grid-rows-2`}>
                <SmartImage src={covers[0].cover_image} alt="" className="col-span-2 h-full w-full object-cover" />
                <SmartImage src={covers[1].cover_image} alt="" className="h-full w-full object-cover" />
                <SmartImage src={covers[2].cover_image} alt="" className="h-full w-full object-cover" />
            </div>
        );
    }

    return (
        <div className={`${dim} rounded-xl overflow-hidden ring-2 ring-[hsl(217,91%,60%)]/30 grid grid-cols-2 grid-rows-2`}>
            {covers.map((a) => (
                <SmartImage key={a.id} src={a.cover_image} alt="" className="h-full w-full object-cover" />
            ))}
        </div>
    );
}

export default function UserLists({ lists }: { lists: ListData[] }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingList, setEditingList] = useState<ListData | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [uploadingCover, setUploadingCover] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const newCoverInputRef = useRef<HTMLInputElement>(null);
    const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
    const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleCreate = () => {
        if (!newName.trim()) return;
        router.post(route('user.lists.create'), {
            name: newName,
            description: newDescription || null,
            cover: newCoverFile || undefined,
        }, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setCreateOpen(false);
                setNewName('');
                setNewDescription('');
                setNewCoverFile(null);
                setNewCoverPreview(null);
            },
        });
    };

    const handleUpdate = () => {
        if (!editingList || !editName.trim()) return;
        router.put(route('user.lists.update', editingList.id), {
            name: editName,
            description: editDescription || null,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingList(null),
        });
    };

    const handleCoverUpload = (listId: number, file: File) => {
        setUploadingCover(true);
        const formData = new FormData();
        formData.append('cover', file);
        router.post(route('user.lists.cover', listId), formData, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                setUploadingCover(false);
                if (coverInputRef.current) coverInputRef.current.value = '';
            },
        });
    };

    const handleDelete = (list: ListData) => {
        setOpenMenuId(null);
        if (!confirm(`¿Eliminar la lista "${list.name}"?`)) return;
        router.delete(route('user.lists.delete', list.id), { preserveScroll: true });
    };

    const handleNewCover = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewCoverFile(file);
        setNewCoverPreview(URL.createObjectURL(file));
    };

    return (
        <SiteLayout>
            <Head title="Mis Listas - Kairo" />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-16">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Mis Listas</h1>
                        <div className="mt-2 h-px bg-gradient-to-r from-[hsl(217,91%,60%)]/40 via-[hsl(217,91%,60%)]/10 to-transparent" />
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_hsl(217,91%,60%,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_24px_hsl(217,91%,60%,0.4)]"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva lista
                    </button>
                </div>

                {lists.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-[hsl(217,91%,60%)]/10">
                            <Grid className="h-12 w-12 text-[hsl(217,91%,60%)]/30" />
                        </div>
                        <p className="mt-6 text-lg font-medium text-foreground">No tienes listas creadas</p>
                        <p className="mt-1 text-sm text-muted-foreground">Crea tu primera lista para organizar tus animes</p>
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_hsl(217,91%,60%,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_24px_hsl(217,91%,60%,0.4)]"
                        >
                            <Plus className="h-4 w-4" />
                            Crear lista
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {lists.map((list) => {
                            const isExpanded = expandedId === list.id;
                            return (
                                <div key={list.id}>
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : list.id)}
                                            className="flex items-center gap-4 min-w-0 flex-1 text-left"
                                        >
                                            <div className="flex-shrink-0">
                                                <ListCover list={list} />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-lg font-semibold text-foreground truncate">{list.name}</h2>
                                                {list.description && (
                                                    <p className="text-sm text-muted-foreground truncate mt-0.5">{list.description}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {list.animes_count} anime{list.animes_count !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </button>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : list.id)}
                                                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-[hsl(217,91%,60%)]/15 hover:text-[hsl(217,91%,60%)]"
                                            >
                                                {isExpanded ? 'Cerrar' : 'Ver'}
                                            </button>
                                            <div className="relative" ref={openMenuId === list.id ? menuRef : undefined}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === list.id ? null : list.id)}
                                                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                                {openMenuId === list.id && (
                                                    <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-white/10 bg-[hsl(217,15%,12%)] shadow-2xl backdrop-blur-xl">
                                                        <button
                                                            onClick={() => { setOpenMenuId(null); setEditingList(list); setEditName(list.name); setEditDescription(list.description || ''); }}
                                                            className="flex w-full items-center gap-2 rounded-t-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-white"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(list)}
                                                            className="flex w-full items-center gap-2 rounded-b-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        list.animes.length === 0 ? (
                                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
                                                <p className="text-sm text-muted-foreground">Esta lista está vacía</p>
                                                <Link href={route('explore')} className="mt-3 inline-flex items-center gap-1.5 text-sm text-[hsl(217,91%,60%)] transition-colors hover:text-[hsl(217,91%,55%)]">
                                                    Explorar animes
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
                                                {list.animes.map((anime) => (
                                                    <AnimeCard key={anime.id} anime={anime} />
                                                ))}
                                            </div>
                                        )
                                    )}

                                    <div className="mt-4 h-px bg-gradient-to-r from-white/5 via-white/5 to-transparent" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setNewCoverFile(null); setNewCoverPreview(null); } }}>
                <DialogContent className="sm:max-w-md rounded-2xl border-[hsl(217,91%,60%)]/20 bg-[hsl(217,15%,8%)] backdrop-blur-xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-white">Nueva lista</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/60">Portada (opcional)</label>
                            <div className="flex items-center gap-3">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5 ring-2 ring-[hsl(217,91%,60%)]/30">
                                    {newCoverPreview ? (
                                        <img src={newCoverPreview} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Upload className="h-6 w-6 text-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <input ref={newCoverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleNewCover} className="hidden" id="new-cover-upload" />
                                    <label htmlFor="new-cover-upload" className="flex w-full items-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 transition-colors hover:border-[hsl(217,91%,60%)]/30 hover:bg-white/[0.07] cursor-pointer">
                                        <Upload className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{newCoverFile ? newCoverFile.name : 'Elegir archivo'}</span>
                                    </label>
                                    {newCoverFile && (
                                        <button onClick={() => { setNewCoverFile(null); setNewCoverPreview(null); if (newCoverInputRef.current) newCoverInputRef.current.value = ''; }} className="mt-1.5 text-xs text-white/30 hover:text-red-400 transition-colors">
                                            Quitar imagen
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/60">Nombre</label>
                            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} placeholder="Ej: Para ver después" autoFocus className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/60">Descripción (opcional)</label>
                            <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Una breve descripción" rows={2} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none transition-colors resize-none" />
                        </div>
                        <button onClick={handleCreate} disabled={!newName.trim()} className="w-full rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/20 transition-all hover:shadow-[hsl(217,91%,60%)]/30 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                            Crear lista
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingList} onOpenChange={(open) => { if (!open) setEditingList(null); }}>
                <DialogContent className="sm:max-w-md rounded-2xl border-[hsl(217,91%,60%)]/20 bg-[hsl(217,15%,8%)] backdrop-blur-xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-white">Editar lista</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/60">Portada</label>
                            <div className="flex items-center gap-4">
                                {editingList && <ListCover list={editingList} size="md" />}
                                <div className="flex-1">
                                    <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file && editingList) handleCoverUpload(editingList.id, file); }} disabled={uploadingCover} className="hidden" id="edit-cover-upload" />
                                    <label htmlFor="edit-cover-upload" className={`flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-white/10 hover:border-[hsl(217,91%,60%)]/30 ${uploadingCover ? 'text-white/40 pointer-events-none' : 'text-white/70'}`}>
                                        <Upload className="h-4 w-4" />
                                        <span>{uploadingCover ? 'Subiendo...' : 'Cambiar portada'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/60">Nombre</label>
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdate()} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/60">Descripción (opcional)</label>
                            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none transition-colors resize-none" />
                        </div>
                        <button onClick={handleUpdate} disabled={!editName.trim()} className="w-full rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/20 transition-all hover:shadow-[hsl(217,91%,60%)]/30 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                            Guardar
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </SiteLayout>
    );
}
