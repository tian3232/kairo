import { Link, router, usePage } from '@inertiajs/react';
import { Search, ChevronDown, X, Tv, Loader2, Bell, Check, UserPlus, UserX, User, ListVideo, Heart, History, CalendarDays, Settings, Shield, LogOut, MessageCircle, Menu, ListPlus } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { imageUrl } from '@/lib/image-url';
import { RoleBadge } from '@/components/role-badge';
import { ChatPanel } from '@/components/chat-panel';
import KairoLogo from '@/components/kairo-logo';

const HISTORY_KEY = 'kairo_search_history';
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
}

function addToHistory(term: string): string[] {
    const history = getSearchHistory().filter(h => h.toLowerCase() !== term.toLowerCase());
    history.unshift(term);
    const updated = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
}

function removeFromHistory(term: string): string[] {
    const updated = getSearchHistory().filter(h => h !== term);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
}

interface SearchAnime {
    id: number;
    slug: string;
    title: string;
    cover_image: string | null;
    type: string;
    status: string;
    average_rating: number;
}

interface Notification {
    id: number;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    friendship_id: number | null;
    created_at: string;
    sender: { id: number; name: string; avatar: string | null } | null;
}

interface AuthUser {
    id: number;
    name: string;
    username: string;
    display_name: string | null;
    email: string;
    role: string;
    avatar: string | null;
}

interface PageProps {
    auth: {
        user: AuthUser | null;
    };
    [key: string]: unknown;
}

export function SiteHeader() {
    const { auth } = usePage<PageProps>().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState<SearchAnime[]>([]);
    const [searching, setSearching] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const notifDropRef = useRef<HTMLDivElement>(null);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifTab, setNotifTab] = useState<'unread' | 'read'>('unread');
    const [chatOpen, setChatOpen] = useState(false);
    const [chatUnread, setChatUnread] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        if (searchOpen) {
            setHistory(getSearchHistory());
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        if (!auth.user) return;
        const poll = () => {
            fetch('/api/unread-counts')
                .then((r) => r.json())
                .then((data) => {
                    setUnreadCount(data.notifications ?? 0);
                    setChatUnread(chatOpen ? 0 : (data.messages ?? 0));
                })
                .catch(() => {});
        };
        poll();
        const interval = setInterval(poll, 10000);
        return () => clearInterval(interval);
    }, [auth.user, chatOpen]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const fetchResults = useCallback((q: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (q.trim().length < 2) {
            setResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        debounceRef.current = setTimeout(() => {
            axios.get('/api/search', { params: { q } })
                .then((res) => {
                    setResults(res.data);
                    setSearching(false);
                })
                .catch(() => {
                    setSearching(false);
                });
        }, 300);
    }, []);

    function handleInputChange(value: string) {
        setSearchValue(value);
        fetchResults(value);
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = searchValue.trim();
        if (!trimmed) return;
        addToHistory(trimmed);
        setSearchOpen(false);
        setSearchValue('');
        setResults([]);
        router.get(route('explore'), { q: trimmed }, { preserveState: true });
    }

    function handleHistoryClick(term: string) {
        setSearchOpen(false);
        setSearchValue('');
        setResults([]);
        router.get(route('explore'), { q: term }, { preserveState: true });
    }

    function handleHistoryDelete(e: React.MouseEvent, term: string) {
        e.stopPropagation();
        setHistory(removeFromHistory(term));
    }

    function handleResultClick() {
        setSearchOpen(false);
        setSearchValue('');
        setResults([]);
    }

    function fetchNotifications() {
        setNotifLoading(true);
        axios.get(route('notifications.index'))
            .then((res) => {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unread_count);
                setNotifLoading(false);
            })
            .catch(() => setNotifLoading(false));
    }

    function toggleNotifDropdown() {
        if (!notifOpen) {
            setNotifTab('unread');
            fetchNotifications();
        }
        setNotifOpen(!notifOpen);
    }

    function markNotifRead(id: number) {
        axios.post(route('notifications.read', id))
            .then((res) => {
                setUnreadCount(res.data.unread_count);
                setNotifications((prev) => {
                    const next = prev.map((n) => n.id === id ? { ...n, is_read: true } : n);
                    if (res.data.unread_count === 0) setNotifTab('read');
                    return next;
                });
            });
    }

    function markAllRead() {
        axios.post(route('notifications.read-all'))
            .then((res) => {
                setUnreadCount(res.data.unread_count);
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                setNotifTab('read');
            });
    }

    const showResults = results.length > 0;
    const showHistory = history.length > 0;
    const showDropdown = searchOpen && (showResults || showHistory || searching);

    return (
        <>
            <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
                <nav className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
                <div className="flex items-center gap-4 lg:gap-8">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <Link href="/" className="flex items-center">
                        <KairoLogo size="md" />
                    </Link>
                    <div className="hidden gap-1 text-sm text-muted-foreground lg:flex">
                        <Link href="/" className="rounded-lg px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground">Inicio</Link>
                        <Link href={route('explore')} className="rounded-lg px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground">Explorar</Link>
                        <Link href={route('simulcast')} className="rounded-lg px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground">Simulcast</Link>
                        <Link href={route('user.calendar')} className="rounded-lg px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground">Calendario</Link>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <div className="relative" ref={searchRef}>
                        {searchOpen ? (
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(217,91%,60%)]" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder="Buscar animes..."
                                    className="h-10 w-full max-w-[260px] rounded-xl border border-[hsl(217,91%,60%)]/30 bg-card/95 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_0_16px_hsl(217,91%,60%,0.1)] backdrop-blur-md focus:border-[hsl(217,91%,60%)]/60 focus:outline-none focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 sm:w-64"
                                />
                            </form>
                        ) : (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-muted-foreground transition-all hover:border-[hsl(217,91%,60%)]/40 hover:bg-[hsl(217,91%,60%)]/10 hover:text-[hsl(217,91%,60%)]"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        )}

                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-xl border border-border/60 bg-card/95 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                                {searching && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin text-[hsl(217,91%,60%)]" />
                                        Buscando...
                                    </div>
                                )}

                                {showResults && (
                                    <>
                                        <div className="px-4 pb-1.5 text-xs font-bold uppercase tracking-wider text-[hsl(217,91%,60%)]">Resultados</div>
                                        {results.map((anime) => (
                                            <Link
                                                key={anime.id}
                                                href={`/anime/${anime.slug}`}
                                                onClick={handleResultClick}
                                                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[hsl(217,91%,60%)]/10"
                                            >
                                                {anime.cover_image ? (
                                                    <img
                                                        src={imageUrl(anime.cover_image)}
                                                        alt={anime.title}
                                                        className="h-10 w-7 shrink-0 rounded-md object-cover ring-1 ring-white/10"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(217,91%,60%)]/10">
                                                        <Tv className="h-4 w-4 text-[hsl(217,91%,60%)]" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-medium">{anime.title}</div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{anime.type}</span>
                                                        {Number(anime.average_rating) > 0 && (
                                                            <span className="text-amber-400">★ {Number(anime.average_rating).toFixed(1)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        <div className="my-1 h-px bg-gradient-to-r from-transparent via-[hsl(217,91%,60%)]/20 to-transparent" />
                                    </>
                                )}

                                {!searching && showHistory && (
                                    <>
                                        <div className="px-4 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Búsquedas recientes</div>
                                        {history.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => handleHistoryClick(term)}
                                                className="group flex w-full items-center justify-between px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                            >
                                                <span className="truncate">{term}</span>
                                                <X
                                                    className="ml-2 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={(e) => handleHistoryDelete(e, term)}
                                                />
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {auth.user && (
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={toggleNotifDropdown}
                                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground"
                            >
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div ref={notifDropRef} className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                                    <div className="px-4 py-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-foreground">Notificaciones</span>
                                            {notifTab === 'unread' && unreadCount > 0 && (
                                                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                                                    Marcar todo leído
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
                                            <button
                                                onClick={() => setNotifTab('unread')}
                                                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    notifTab === 'unread' ? 'bg-[hsl(217,91%,60%)]/15 text-[hsl(217,91%,70%)] shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                Sin leer {unreadCount > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{unreadCount}</span>}
                                            </button>
                                            <button
                                                onClick={() => setNotifTab('read')}
                                                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    notifTab === 'read' ? 'bg-[hsl(217,91%,60%)]/15 text-[hsl(217,91%,70%)] shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                Leídas
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-[hsl(217,91%,60%)]/20 to-transparent" />
                                    <div className="max-h-80 overflow-y-auto p-1.5">
                                        {notifLoading ? (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (() => {
                                            const filtered = notifications.filter((n) => notifTab === 'unread' ? !n.is_read : n.is_read);
                                            if (filtered.length === 0) {
                                                return (
                                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                                        {notifTab === 'unread' ? 'Sin notificaciones nuevas' : 'Sin notificaciones leídas'}
                                                    </div>
                                                );
                                            }
                                            return filtered.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[hsl(217,91%,60%)]/10 ${!n.is_read ? 'bg-[hsl(217,91%,60%)]/5' : ''}`}
                                                >
                                                    {n.sender ? (
                                                        <Link
                                                            href={route('profile.show', n.sender.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[hsl(217,91%,60%)]/15 text-xs font-bold text-[hsl(217,91%,60%)] ring-2 ring-[hsl(217,91%,60%)]/20"
                                                        >
                                                            {n.sender.avatar ? (
                                                                <img src={imageUrl(n.sender.avatar)} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                n.sender.name.charAt(0).toUpperCase()
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(217,91%,60%)]/10 text-xs font-bold text-[hsl(217,91%,60%)]">
                                                            <Bell className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <button
                                                            onClick={() => {
                                                                markNotifRead(n.id);
                                                                if (n.link) router.visit(n.link);
                                                                setNotifOpen(false);
                                                            }}
                                                            className="w-full text-left"
                                                        >
                                                            <p className="text-sm font-medium text-foreground">
                                                                {n.title}
                                                            </p>
                                                            {n.body && (
                                                                <p className="mt-0.5 text-xs text-muted-foreground truncate">{n.body}</p>
                                                            )}
                                                            <p className="mt-1 text-[10px] text-muted-foreground/60">
                                                                {new Date(n.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </button>
                                                        {n.type === 'friend_request' && notifTab === 'unread' && (
                                                            <div className="mt-2 flex gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        axios.post(route('notifications.accept-friend', n.id))
                                                                            .then((res) => {
                                                                                setUnreadCount(res.data.unread_count);
                                                                                setNotifications((prev) => {
                                                                                    const next = prev.map((notif) => notif.id === n.id ? { ...notif, is_read: true } : notif);
                                                                                    if (res.data.unread_count === 0) setNotifTab('read');
                                                                                    return next;
                                                                                });
                                                                            });
                                                                    }}
                                                                    className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-3 py-1 text-xs font-semibold text-white shadow-[0_0_12px_hsl(217,91%,60%,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_18px_hsl(217,91%,60%,0.4)] active:scale-95"
                                                                >
                                                                    <UserPlus className="h-3 w-3" /> Aceptar
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        axios.post(route('notifications.reject-friend', n.id))
                                                                            .then((res) => {
                                                                                setUnreadCount(res.data.unread_count);
                                                                                setNotifications((prev) => {
                                                                                    const next = prev.map((notif) => notif.id === n.id ? { ...notif, is_read: true } : notif);
                                                                                    if (res.data.unread_count === 0) setNotifTab('read');
                                                                                    return next;
                                                                                });
                                                                            });
                                                                    }}
                                                                    className="flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-[hsl(217,91%,60%)]/40 hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                                                >
                                                                    <UserX className="h-3 w-3" /> Rechazar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {auth.user && (
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-muted-foreground transition-all hover:border-[hsl(217,91%,60%)]/40 hover:bg-[hsl(217,91%,60%)]/10 hover:text-[hsl(217,91%,60%)]"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {chatUnread > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(217,91%,60%)] px-1 text-[10px] font-bold text-white shadow-[0_0_8px_hsl(217,91%,60%,0.4)]">
                                    {chatUnread > 99 ? '99+' : chatUnread}
                                </span>
                            )}
                        </button>
                    )}

                    {auth.user ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                    {auth.user.avatar ? (
                                        <img src={imageUrl(auth.user.avatar)} alt={auth.user.display_name || auth.user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        (auth.user.display_name || auth.user.name).charAt(0).toUpperCase()
                                    )}
                                </div>
                                <RoleBadge role={auth.user.role} />
                                <ChevronDown className="h-3 w-3" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground ring-2 ring-[hsl(217,91%,60%)]/30">
                                            {auth.user.avatar ? (
                                                <img src={imageUrl(auth.user.avatar)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                (auth.user.display_name || auth.user.name).charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">{auth.user.display_name || auth.user.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">@{auth.user.username}</p>
                                        </div>
                                        <RoleBadge role={auth.user.role} className="ml-auto shrink-0" />
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-[hsl(217,91%,60%)]/20 to-transparent" />

                                    <div className="p-1.5">
                                        <Link
                                            href={route('profile.show', auth.user.id)}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <User className="h-4 w-4 shrink-0" />
                                            Mi Perfil
                                        </Link>
                                        <Link
                                            href={route('user.lists')}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <ListPlus className="h-4 w-4 shrink-0" />
                                            Mis Listas
                                        </Link>
                                        <Link
                                            href={route('user.favorites')}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <Heart className="h-4 w-4 shrink-0" />
                                            Favoritos
                                        </Link>
                                        <Link
                                            href={route('user.history')}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <History className="h-4 w-4 shrink-0" />
                                            Historial
                                        </Link>
                                        <Link
                                            href={route('user.my-calendar')}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                            Mi Calendario
                                        </Link>
                                        <Link
                                            href={route('messages.index')}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <MessageCircle className="h-4 w-4 shrink-0" />
                                            Mensajes
                                        </Link>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

                                    <div className="p-1.5">
                                        <Link
                                            href="/settings/profile"
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <Settings className="h-4 w-4 shrink-0" />
                                            Configuración
                                        </Link>

                                        {(auth.user.role === 'admin' || auth.user.role === 'owner') && (
                                            <Link
                                                href={route('admin.dashboard')}
                                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[hsl(217,91%,60%)]/10 hover:text-foreground"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <Shield className="h-4 w-4 shrink-0" />
                                                Panel Admin
                                            </Link>
                                        )}
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

                                    <div className="p-1.5">
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <LogOut className="h-4 w-4 shrink-0" />
                                            Cerrar sesión
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link
                                href={route('login')}
                                className="rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href={route('register')}
                                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-colors"
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
            {chatOpen && auth.user && (
                <ChatPanel authId={auth.user.id} onClose={() => setChatOpen(false)} />
            )}

            {mobileMenuOpen && (
                <>
                    <div className="fixed inset-0 z-[55] bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed left-0 top-0 z-[56] flex h-full w-72 flex-col bg-card shadow-xl lg:hidden">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                                <KairoLogo size="sm" />
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                <ListVideo className="h-4 w-4" /> Inicio
                            </Link>
                            <Link href={route('explore')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                <Search className="h-4 w-4" /> Explorar
                            </Link>
                            <Link href={route('simulcast')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                <Tv className="h-4 w-4" /> Simulcast
                            </Link>
                            <Link href={route('user.calendar')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                <CalendarDays className="h-4 w-4" /> Calendario
                            </Link>

                            {auth.user && (
                                <>
                                    <div className="my-2 border-t border-border" />
                                    <Link href={route('profile.show', auth.user.id)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                        <User className="h-4 w-4" /> Mi Perfil
                                    </Link>
                                    <Link href={route('user.lists')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                        <ListPlus className="h-4 w-4" /> Mis Listas
                                    </Link>
                                    <Link href={route('user.favorites')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                        <Heart className="h-4 w-4" /> Favoritos
                                    </Link>
                                    <Link href={route('user.history')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                        <History className="h-4 w-4" /> Historial
                                    </Link>
                                    <Link href={route('messages.index')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                        <MessageCircle className="h-4 w-4" /> Mensajes
                                    </Link>
                                    <Link href="/settings/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                        <Settings className="h-4 w-4" /> Configuración
                                    </Link>
                                    {(auth.user.role === 'admin' || auth.user.role === 'owner') && (
                                        <Link href={route('admin.dashboard')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                                            <Shield className="h-4 w-4" /> Panel Admin
                                        </Link>
                                    )}
                                    <div className="my-2 border-t border-border" />
                                    <Link href={route('logout')} method="post" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10" onClick={() => setMobileMenuOpen(false)}>
                                        <LogOut className="h-4 w-4" /> Cerrar sesión
                                    </Link>
                                </>
                            )}

                            {!auth.user && (
                                <>
                                    <div className="my-2 border-t border-border" />
                                    <Link href={route('login')} className="flex items-center justify-center rounded-full border border-primary px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
                                        <User className="h-4 w-4" /> Iniciar sesión
                                    </Link>
                                    <Link href={route('register')} className="flex items-center justify-center rounded-full bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25" onClick={() => setMobileMenuOpen(false)}>
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
