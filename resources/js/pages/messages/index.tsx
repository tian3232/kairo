import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Send, MessageCircle, Image as ImageIcon, Smile, X, MoreVertical, ChevronDown } from 'lucide-react';
import SiteLayout from '@/layouts/site-layout';
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

interface MessagesProps {
    conversations: Friend[];
    activeFriend: Friend | null;
    messages: Message[];
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function Avatar({ friend, size = 'h-10 w-10' }: { friend: Friend; size?: string }) {
    return friend.avatar ? (
        <img src={imageUrl(friend.avatar)} alt={friend.name} className={`${size} rounded-full object-cover`} />
    ) : (
        <div className={`${size} flex items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary`}>
            {friend.name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function Messages({ conversations: initialConversations, activeFriend: initialActive, messages: initialMessages }: MessagesProps) {
    const { auth } = usePage().props as { auth: { user: { id: number } } };
    const [conversations, setConversations] = useState<Friend[]>(initialConversations);
    const [activeFriend, setActiveFriend] = useState<Friend | null>(initialActive);
    const [messages, setMessages] = useState<Message[]>(Array.isArray(initialMessages) ? initialMessages : []);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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

    const scrollToLast = (smooth = true) => {
        bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        setAtBottom(true);
    };
    const [menuFor, setMenuFor] = useState<number | null>(null);
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    const EMOJIS = ['😀','😂','😍','😎','🤔','😅','😭','😡','👍','👎','❤️','🔥','🎉','💀','🥰','😴','🤯','🙏','💪','✨','🍿','🎬','👀','💯'];

    const scrollToBottom = () => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setAtBottom(true); };

    useEffect(() => {
        if (!activeFriend) return;
        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        const headers = { 'X-CSRF-TOKEN': csrf, 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

        fetch(route('messages.mark-read'), {
            method: 'POST',
            headers,
            body: JSON.stringify({ friend_id: activeFriend.id }),
        }).catch(() => {});

        const poll = () => {
            fetch(route('messages.api', { with: activeFriend.id }))
                .then((r) => r.json())
                .then((data) => {
                    setMessages(Array.isArray(data.messages) ? data.messages : []);
                    setConversations(data.conversations ?? []);
                })
                .catch(() => {});
        };
        poll();
        pollRef.current = window.setInterval(poll, 4000);
        return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
    }, [activeFriend]);

    useEffect(() => {
        if (activeFriend) return;
        const pollConversations = () => {
            fetch(route('messages.api'))
                .then((r) => r.json())
                .then((data) => setConversations(data.conversations ?? []))
                .catch(() => {});
        };
        pollConversations();
        const interval = window.setInterval(pollConversations, 8000);
        return () => window.clearInterval(interval);
    }, [activeFriend]);

    const openConversation = (friend: Friend) => {
        setActiveFriend(friend);
        setMenuFor(null);
    };

    const send = () => {
        if ((!text.trim() && !imageFile) || !activeFriend || sending) return;
        setSending(true);
        const fd = new FormData();
        fd.append('receiver_id', String(activeFriend.id));
        if (text.trim()) fd.append('body', text.trim());
        if (imageFile) fd.append('image', imageFile);
        setText('');
        setImageFile(null);
        setImagePreview(null);

        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        fetch(route('messages.store'), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf,
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
        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        fetch(route('messages.update', id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ body: editText.trim() }),
        })
            .then((r) => r.json())
            .then((data: { body: string; edited_at: string | null }) => {
                setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, body: data.body, edited_at: data.edited_at } : x)));
            })
            .catch(() => {})
            .finally(() => { setEditingId(null); setEditText(''); });
    };

    const deleteMessage = (id: number, scope: 'me' | 'everyone') => {
        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        fetch(route('messages.destroy', id), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
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

    return (
        <>
            <Head title="Mensajes - Kairo" />
            <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl gap-2 px-2 py-4 pt-16 sm:gap-4 sm:px-4 lg:pt-20">
                <aside className={`${activeFriend ? 'hidden md:flex' : 'flex'} w-full flex-shrink-0 flex-col overflow-y-auto rounded-xl border border-border bg-card p-3 md:w-72`}>
                    <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Amigos
                    </h2>
                    {conversations.length === 0 && (
                        <p className="px-1 text-sm text-muted-foreground">Aún no tienes amigos con quien chatear.</p>
                    )}
                    <div className="space-y-1">
                        {conversations.map((friend) => (
                            <button
                                key={friend.id}
                                onClick={() => openConversation(friend)}
                                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                                    activeFriend?.id === friend.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                                }`}
                            >
                                <Avatar friend={friend} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">{friend.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {friend.last_message
                                            ? `${friend.last_message.sender_id === auth.user.id ? 'Tú: ' : ''}${friend.last_message.body ?? 'Mensaje eliminado'}`
                                            : 'Sin mensajes'}
                                    </p>
                                </div>
                                {friend.unread_count > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                                        {friend.unread_count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className={`${activeFriend ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col rounded-xl border border-border bg-card`}>
                    {activeFriend ? (
                        <>
                            <div className="flex items-center gap-3 border-b border-border p-3">
                                <button
                                    onClick={() => setActiveFriend(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <Avatar friend={activeFriend} size="h-9 w-9" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{activeFriend.name}</p>
                                    <p className="text-xs text-muted-foreground">@{activeFriend.username}</p>
                                </div>
                            </div>

                            <div
                                ref={scrollRef}
                                onScroll={checkAtBottom}
                                className="relative flex-1 space-y-1 overflow-y-auto px-4 py-4"
                                onClick={closeMenu}
                            >
                                {!atBottom && (
                                    <button
                                        type="button"
                                        onClick={() => scrollToLast()}
                                        className="sticky top-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-popover px-3 py-1.5 text-xs font-medium text-foreground shadow-lg transition hover:bg-muted"
                                        title="Ir al último mensaje"
                                    >
                                        <ChevronDown className="h-4 w-4" /> Último mensaje
                                    </button>
                                )}
                                {messages.map((m, i) => {
                                    const mine = m.sender_id === auth.user.id;
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
                                                                className="w-56 resize-none rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none"
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
                                                                <img src={m.image} alt="" loading="lazy" className="mb-1 max-h-56 w-full rounded-lg object-cover" />
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

                            <div className="relative border-t border-border p-3">
                                {showEmoji && (
                                    <div className="absolute bottom-full left-3 mb-2 grid w-60 grid-cols-6 gap-1 rounded-lg border border-border bg-popover p-2 shadow-xl">
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
                                <div className="flex items-center gap-1.5">
                                    <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                        title="Enviar imagen"
                                    >
                                        <ImageIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmoji((s) => !s)}
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-muted hover:text-foreground ${showEmoji ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                                        title="Emojis"
                                    >
                                        <Smile className="h-5 w-5" />
                                    </button>
                                    <input
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                                        placeholder="Escribe un mensaje..."
                                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                    />
                                    <button
                                        onClick={send}
                                        disabled={sending || (!text.trim() && !imageFile)}
                                        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" /> Enviar
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
                            <MessageCircle className="mb-3 h-12 w-12" />
                            <p className="text-sm">Selecciona un amigo para empezar a chatear</p>
                            <p className="mt-1 text-xs">Solo puedes enviar mensajes a tus amigos.</p>
                        </div>
                    )}
                </section>
            </div>

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
                            className="fixed z-[70] w-36 rounded-lg border border-border bg-popover p-1 text-sm shadow-xl"
                            style={{ top, left }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {!m.image && (
                                <button onClick={() => startEdit(m)} className="block w-full rounded px-2 py-1.5 text-left hover:bg-muted">Editar</button>
                            )}
                            <button onClick={() => deleteMessage(m.id, 'me')} className="block w-full rounded px-2 py-1.5 text-left hover:bg-muted">Eliminar para mí</button>
                            <button onClick={() => deleteMessage(m.id, 'everyone')} className="block w-full rounded px-2 py-1.5 text-left text-destructive hover:bg-muted">Eliminar para todos</button>
                        </div>
                    );
                })(),
                document.body
            )}
        </>
    );
}

Messages.layout = (page: React.ReactNode) => <SiteLayout>{page}</SiteLayout>;
