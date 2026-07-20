import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { SmartImage } from '@/components/smart-image';
import { imageUrl } from '@/lib/image-url';

interface UserList {
    id: number;
    name: string;
    cover_image: string | null;
    animes_count: number;
    contains_anime: boolean;
}

interface AddToListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    animeId: number;
}

function getCollageImages(lists: UserList[]) {
    const covers: string[] = [];
    for (const list of lists) {
        if (list.cover_image && covers.length < 4) {
            covers.push(list.cover_image);
        }
    }
    return covers;
}

function ListCover({ list, size = 'md' }: { list: UserList; size?: 'sm' | 'md' }) {
    const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

    if (list.cover_image) {
        return (
            <SmartImage
                src={imageUrl(list.cover_image)}
                alt={list.name}
                className={`${dim} rounded-lg object-cover`}
            />
        );
    }

    if (list.animes_count === 0) {
        return (
            <div className={`${dim} rounded-lg bg-gradient-to-br from-[hsl(217,91%,60%)]/20 to-[hsl(217,91%,60%)]/5 flex items-center justify-center`}>
                <FolderPlus className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} text-[hsl(217,91%,60%)]/60`} />
            </div>
        );
    }

    return (
        <div className={`${dim} rounded-lg bg-[hsl(217,91%,60%)]/10 flex items-center justify-center`}>
            <FolderPlus className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} text-[hsl(217,91%,60%)]/60`} />
        </div>
    );
}

export function AddToListModal({ open, onOpenChange, animeId }: AddToListModalProps) {
    const [lists, setLists] = useState<UserList[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newListName, setNewListName] = useState('');

    const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const fetchLists = useCallback(async () => {
        if (!open || !animeId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/lists/anime?anime_id=${animeId}`, {
                headers: { 'X-CSRF-TOKEN': csrf() },
            });
            if (res.ok) {
                const data = await res.json();
                setLists(data.lists);
            }
        } catch {} finally {
            setLoading(false);
        }
    }, [open, animeId]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    useEffect(() => {
        if (open) {
            setShowCreate(false);
            setNewListName('');
        }
    }, [open]);

    const toggleList = async (listId: number) => {
        try {
            const res = await fetch('/api/lists/toggle-anime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ list_id: listId, anime_id: animeId }),
            });
            if (res.ok) {
                const data = await res.json();
                setLists((prev) =>
                    prev.map((l) =>
                        l.id === listId
                            ? { ...l, contains_anime: data.added, animes_count: data.added ? l.animes_count + 1 : l.animes_count - 1 }
                            : l
                    )
                );
            }
        } catch {}
    };

    const createAndAdd = async () => {
        if (!newListName.trim()) return;
        setCreating(true);
        try {
            const createRes = await fetch('/mis-listas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ name: newListName }),
            });
            if (createRes.ok) {
                const newList = await createRes.json();
                await fetch('/api/lists/toggle-anime', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ list_id: newList.id, anime_id: animeId }),
                });
                setNewListName('');
                setShowCreate(false);
                fetchLists();
            }
        } catch {} finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm rounded-2xl border-[hsl(217,91%,60%)]/20 bg-[hsl(217,15%,8%)] backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-0">
                    <DialogTitle className="text-base font-semibold text-white">
                        Agregar a lista
                    </DialogTitle>
                </DialogHeader>

                <div className="px-5 pb-5 pt-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-[hsl(217,91%,60%)]" />
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-56 overflow-y-auto">
                            {lists.map((list) => (
                                <button
                                    key={list.id}
                                    onClick={() => toggleList(list.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                                        list.contains_anime
                                            ? 'bg-[hsl(217,91%,60%)]/10'
                                            : 'hover:bg-white/5'
                                    }`}
                                >
                                    <ListCover list={list} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{list.name}</p>
                                        <p className="text-[11px] text-white/40">
                                            {list.animes_count === 0 ? 'Vacía' : `${list.animes_count} anime${list.animes_count !== 1 ? 's' : ''}`}
                                        </p>
                                    </div>
                                    {list.contains_anime ? (
                                        <Check className="h-4 w-4 text-[hsl(217,91%,60%)] shrink-0" />
                                    ) : (
                                        <Plus className="h-4 w-4 text-white/20 shrink-0" />
                                    )}
                                </button>
                            ))}

                            {lists.length === 0 && !showCreate && (
                                <p className="text-center text-sm text-white/30 py-4">No tienes listas aún</p>
                            )}
                        </div>
                    )}

                    {!showCreate ? (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-sm text-white/50 transition-colors hover:border-[hsl(217,91%,60%)]/30 hover:text-[hsl(217,91%,60%)]"
                        >
                            <Plus className="h-4 w-4" />
                            Crear nueva lista
                        </button>
                    ) : (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                placeholder="Nombre de la lista"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
                                autoFocus
                                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] outline-none"
                            />
                            <button
                                onClick={createAndAdd}
                                disabled={!newListName.trim() || creating}
                                className="rounded-xl bg-[hsl(217,91%,60%)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[hsl(217,91%,60%)]/20 hover:bg-[hsl(217,91%,55%)] active:scale-95 disabled:opacity-40 transition-all"
                            >
                                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear'}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
