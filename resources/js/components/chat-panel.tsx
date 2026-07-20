import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Send, X, ChevronDown, MessageCircle, Image as ImageIcon, Smile, MoreVertical } from 'lucide-react';
import { imageUrl } from '@/lib/image-url';
import MessageStatus from '@/components/message-status';

interface Friend {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    last_message: { body: string; sender_id: number; created_at: string } | null;
    unread_count: number;
}

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    body: string | null;
    image?: string | null;
    read_at: string | null;
    delivered_at: string | null;
    edited_at: string | null;
    deleted_for_everyone: boolean;
    created_at: string;
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export function ChatPanel({ authId, onClose }: { authId: number; onClose: () => void }) {
    const [conversations, setConversations] = useState<Friend[]>([]);
    const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [mounted, setMounted] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const pollRef = useRef<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [atBottom, setAtBottom] = useState(true);

    const checkAtBottom = () => {
        const el = scrollRef.current;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        setAtBottom(distance < 80);
    };

    const scrollToBottom = (smooth = true) => {
        bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        setAtBottom(true);
    };

    const EMOJIS = ['😀','😂','😍','😎','🤔','😅','😭','😡','👍','👎','❤️','🔥','🎉','💀','🥰','😴','🤯','🙏','💪','✨','🍿','🎬','👀','💯'];

    const sendMessage = () => {
        if ((!text.trim() && !imageFile) || !activeFriend || sending || isUploading) return;
        setSending(true);
        const fd = new FormData();
        fd.append('receiver_id', String(activeFriend.id));
        if (text.trim()) fd.append('body', text.trim());
        if (imageFile) fd.append('image', imageFile);

        const bodyText = text.trim();
        const previewUrl = imagePreview;
        setText('');
        setImageFile(null);
        setImagePreview(null);

        fetch(route('messages.store'), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: fd,
        })
            .then((r) => r.json())
            .then((msg: Message) => {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            })
            .catch(() => {})
            .finally(() => setSending(false));
    };

    const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        if (fileRef.current) fileRef.current.value = '';
    };

    const addEmoji = (emoji: string) => {
        setText((t) => t + emoji);
        setShowEmoji(false);
    };

    const [menuFor, setMenuFor] = useState<number | null>(null);
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    const openMenu = (id: number, target?: HTMLElement | null) => {
        if (menuFor === id) {
            setMenuFor(null);
            setMenuRect(null);
            return;
        }
        const rect = target?.getBoundingClientRect();
        setMenuRect(rect ?? null);
        setMenuFor(id);
    };
    const closeMenu = () => { setMenuFor(null); setMenuRect(null); };

    useEffect(() => {
        if (menuFor === null) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest('[data-msg-menu]')) closeMenu();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuFor]);

    const startEdit = (m: Message) => {
        setEditingId(m.id);
        setEditText(m.body ?? '');
        setMenuFor(null);
    };

    const saveEdit = (id: number) => {
        if (!editText.trim()) return;
        const original = messages.find((x) => x.id === id);
        fetch(route('messages.update', id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ body: editText.trim() }),
        })
            .then((r) => r.json())
            .then((data: { body: string; edited_at: string | null }) => {
                setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, body: data.body, edited_at: data.edited_at, image: original?.image ?? null } : x)));
            })
            .catch(() => {})
            .finally(() => { setEditingId(null); setEditText(''); });
    };

    const deleteMessage = (id: number, scope: 'me' | 'everyone') => {
        fetch(route('messages.destroy', id), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ scope }),
        })
            .then(() => {
                if (scope === 'everyone') {
                    setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, body: null, image: null, deleted_for_everyone: true } : x)));
                } else {
                    setMessages((prev) => prev.filter((x) => x.id !== id));
                }
            })
            .catch(() => {});
        setMenuFor(null);
    };

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    const loadConversations = () => {
        fetch(route('messages.api'))
            .then((r) => r.json())
            .then((data) => setConversations(data.conversations ?? []))
            .catch(() => {});
    };

    useEffect(() => {
        loadConversations();
        const interval = window.setInterval(loadConversations, 8000);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        if (atBottom) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, atBottom]);

    useEffect(() => {
        if (!activeFriend) return;
        const poll = () => {
            fetch(route('messages.api', { with: activeFriend.id }))
                .then((r) => r.json())
                .then((data) => {
                    setMessages(Array.isArray(data.messages) ? data.messages : []);
                    setActiveFriend(data.activeFriend);
                    setConversations(data.conversations ?? []);
                })
                .catch(() => {});
        };
        markRead(activeFriend.id);
        poll();
        pollRef.current = window.setInterval(poll, 4000);
        return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
    }, [activeFriend]);

    const markRead = (friendId: number) => {
        fetch(route('messages.mark-read'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ friend_id: friendId }),
        })
            .then(() => window.dispatchEvent(new Event('chat:read')))
            .catch(() => {});
    };

    const openFriend = (friend: Friend) => {
        setActiveFriend(friend);
        setView('chat');
        setMessages([]);
        markRead(friend.id);
        fetch(route('messages.api', { with: friend.id }))
            .then((r) => r.json())
            .then((data) => {
                setMessages(Array.isArray(data.messages) ? data.messages : []);
                setActiveFriend(data.activeFriend);
                setConversations((prev) => prev.map((c) => c.id === friend.id ? { ...c, unread_count: 0 } : c));
            })
            .catch(() => {});
    };

    const send = () => {
        if (!text.trim() || !activeFriend || sending) return;
        setSending(true);
        const body = text.trim();
        setText('');
        fetch(route('messages.store'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ receiver_id: activeFriend.id, body }),
        })
            .then((r) => r.json())
            .then((msg: Message) => setMessages((prev) => [...prev, msg]))
            .finally(() => setSending(false));
    };

    return (
        <div
            className={`fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-80 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 ease-out ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            } ${minimized ? 'h-12' : 'h-[60vh] max-h-[28rem]'}`}
        >
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
                {view === 'chat' && activeFriend ? (
                    <button onClick={() => { setView('list'); setActiveFriend(null); }} className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="text-[hsl(217,91%,60%)]">←</span> {activeFriend.name}
                    </button>
                ) : (
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <MessageCircle className="h-4 w-4 text-[hsl(217,91%,60%)]" /> Mensajes
                    </span>
                )}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setMinimized((m) => !m)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-[hsl(217,91%,60%)]/10 hover:text-[hsl(217,91%,60%)]"
                        title={minimized ? 'Expandir' : 'Minimizar'}
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform ${minimized ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {!minimized && (view === 'list' ? (
                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 && (
                        <p className="px-1 py-4 text-center text-sm text-muted-foreground">No tienes amigos con quien chatear.</p>
                    )}
                    {conversations.map((friend) => (
                    <button
                        key={friend.id}
                        onClick={() => openFriend(friend)}
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[hsl(217,91%,60%)]/10"
                    >
                        {friend.avatar ? (
                            <img src={imageUrl(friend.avatar)} alt={friend.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-[hsl(217,91%,60%)]/20" />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(217,91%,60%)]/15 text-sm font-bold text-[hsl(217,91%,60%)]">
                                {friend.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{friend.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                {friend.last_message
                                    ? `${friend.last_message.sender_id === authId ? 'Tú: ' : ''}${friend.last_message.body ?? 'Mensaje eliminado'}`
                                    : 'Sin mensajes'}
                            </p>
                        </div>
                        {friend.unread_count > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(217,91%,60%)] px-1.5 text-xs font-semibold text-white shadow-[0_0_8px_hsl(217,91%,60%,0.3)]">
                                {friend.unread_count}
                            </span>
                        )}
                    </button>
                    ))}
                </div>
            ) : (
                <>
                    <div
                        ref={scrollRef}
                        onScroll={checkAtBottom}
                        className="relative flex-1 space-y-1 overflow-y-auto px-3 py-3"
                        onClick={closeMenu}
                    >
                        {!atBottom && (
                            <button
                                type="button"
                                onClick={() => scrollToBottom()}
                                className="sticky top-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition-all hover:border-[hsl(217,91%,60%)]/40 hover:bg-[hsl(217,91%,60%)]/10"
                                title="Ir al último mensaje"
                            >
                                <ChevronDown className="h-4 w-4" /> Último mensaje
                            </button>
                        )}
                        {(Array.isArray(messages) ? messages : []).map((m, i) => {
                            const mine = m.sender_id === authId;
                            const prev = messages[i - 1];
                            const grouped = prev && prev.sender_id === m.sender_id;
                            const deleted = m.deleted_for_everyone;
                            const menuOpen = menuFor === m.id;
                            const editing = editingId === m.id;
                            return (
                                <div
                                    key={m.id}
                                    className={`group flex items-end gap-1 ${mine ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-3'}`}
                                >
                                    {mine && !editing && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); openMenu(m.id, e.currentTarget); }}
                                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center self-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                            title="Opciones"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    )}

                                    <div className="relative max-w-[85%]">
                                        <div
                                            className={`w-fit px-3 py-2 text-sm shadow-sm ${
                                                mine
                                                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                                                    : 'bg-muted text-foreground rounded-2xl rounded-bl-md'
                                            } ${deleted ? 'italic opacity-70' : ''}`}
                                        >
                                            {editing ? (
                                                <div className="flex flex-col gap-1">
                                                    <textarea
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(m.id); } }}
                                                        className="w-48 resize-none rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none"
                                                        rows={2}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => { setEditingId(null); setEditText(''); }} className="rounded-lg px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Cancelar</button>
                                                        <button onClick={() => saveEdit(m.id)} className="rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20">Guardar</button>
                                                    </div>
                                                </div>
                                            ) : deleted ? (
                                                <p className="italic">Mensaje eliminado</p>
                                            ) : (
                                                <>
                                                    {m.image && (
                                                        <img src={m.image} alt="" loading="lazy" className="mb-1 max-h-48 w-full rounded-lg object-cover" />
                                                    )}
                                                    {m.body && (
                                                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                                                            {m.body}
                                                            {m.edited_at && <span className={`ml-1 text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>(editado)</span>}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                            {!editing && (
                                                <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                    <span>{formatTime(m.created_at)}</span>
                                                    {mine && <MessageStatus read_at={m.read_at} delivered_at={m.delivered_at} />}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>
                    <div className="relative border-t border-border p-2">
                        {showEmoji && (
                            <div className="absolute bottom-full left-2 mb-2 grid w-56 grid-cols-6 gap-1 rounded-lg border border-border bg-popover p-2 shadow-xl">
                                {EMOJIS.map((e) => (
                                    <button
                                        key={e}
                                        type="button"
                                        onClick={() => addEmoji(e)}
                                        className="rounded p-1 text-lg hover:bg-muted"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        )}
                        {imagePreview && (
                            <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                                <img src={imagePreview} alt="" className="h-12 w-12 rounded object-cover" />
                                <span className="flex-1 truncate text-xs text-muted-foreground">Imagen lista para enviar</span>
                                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-[hsl(217,91%,60%)]/10 hover:text-[hsl(217,91%,60%)]"
                                title="Enviar imagen"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEmoji((s) => !s)}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-[hsl(217,91%,60%)]/10 hover:text-[hsl(217,91%,60%)] ${showEmoji ? 'bg-[hsl(217,91%,60%)]/10 text-[hsl(217,91%,60%)]' : 'text-muted-foreground'}`}
                                title="Emojis"
                            >
                                <Smile className="h-4 w-4" />
                            </button>
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 rounded-xl border border-border/60 bg-muted/50 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[hsl(217,91%,60%)]/50 focus:outline-none focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={sending || isUploading || (!text.trim() && !imageFile)}
                                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-3 py-1.5 text-sm font-semibold text-white shadow-[0_0_10px_hsl(217,91%,60%,0.2)] transition-all hover:shadow-[0_0_16px_hsl(217,91%,60%,0.35)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            ))}

            {menuFor !== null && menuRect && typeof document !== 'undefined' && createPortal(
                (() => {
                    const m = messages.find((x) => x.id === menuFor);
                    if (!m) return null;
                    const MENU_W = 144;
                    const MENU_H = 116;
                    const vh = window.innerHeight;
                    const openUp = menuRect.bottom + MENU_H > vh && menuRect.top - MENU_H > 0;
                    const top = openUp ? menuRect.top - MENU_H - 4 : menuRect.bottom + 4;
                    let left = menuRect.left - MENU_W - 4;
                    if (left < 8) left = menuRect.right + 4;
                    if (left + MENU_W > window.innerWidth - 8) left = window.innerWidth - MENU_W - 8;
                    return (
                        <div
                            data-msg-menu
                            className="fixed z-[70] w-40 overflow-hidden rounded-xl border border-border/60 bg-card/95 p-1.5 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                            style={{ top, left }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {!m.image && (
                                <button onClick={() => startEdit(m)} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground">Editar</button>
                            )}
                            <button onClick={() => deleteMessage(m.id, 'me')} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground">Eliminar para mí</button>
                            <button onClick={() => deleteMessage(m.id, 'everyone')} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-400">Eliminar para todos</button>
                        </div>
                    );
                })(),
                document.body
            )}
        </div>
    );
}
