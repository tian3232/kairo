import { Head, Link, router, usePage } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { imageUrl } from '@/lib/image-url';
import { useState } from 'react';
import axios from 'axios';
import { CommentSection } from '@/components/comment-section';
import { MessageCircle, Heart, List, Users, Clock, UserPlus, UserCheck, UserX, Pencil, Shield, Camera, ChevronDown, ChevronRight } from 'lucide-react';
import { RoleBadge } from '@/components/role-badge';
import { AnimeCard, type AnimeCardData } from '@/components/anime-card';

interface AuthUser {
    id: number;
    name: string;
    avatar: string | null;
}

interface ProfileData {
    id: number;
    name: string;
    username: string;
    display_name: string | null;
    avatar: string | null;
    bio: string | null;
    role: string;
    created_at: string;
}

interface Stats {
    comments: number;
    likes: number;
    lists: number;
    friends: number;
}

interface Friend {
    id: number;
    name: string;
    username?: string;
    avatar: string | null;
    role?: string;
}

interface ProfileComment {
    id: number;
    body: string;
    created_at: string;
    user: { id: number; name: string; username?: string; avatar: string | null; role?: string };
}

interface RecentComment {
    id: number;
    body: string;
    created_at: string;
    anime: { slug: string; title: string; cover_image: string } | null;
}

interface AnimeMini {
    id: number;
    slug: string;
    title: string;
    cover_image: string;
    average_rating?: number;
}

interface Privacy {
    show_watchlist: boolean;
    show_favorites: boolean;
    show_lists: boolean;
    show_activity: boolean;
    show_friends: boolean;
    allow_comments: boolean;
    show_stats: boolean;
}

interface CustomList {
    id: number;
    name: string;
    description: string | null;
    cover_image: string | null;
    animes_count: number;
    animes: AnimeMini[];
}

interface ProfileProps {
    profile: ProfileData;
    stats: Stats | null;
    friends: Friend[];
    friendStatus: string | null;
    friendshipId: number | null;
    incomingRequest: boolean;
    comments: ProfileComment[];
    recentComments: RecentComment[];
    favorites: AnimeMini[];
    watchlist: AnimeMini[];
    customLists: CustomList[];
    isOwn: boolean;
    privacy: Privacy;
}

type Tab = 'activity' | 'saved' | 'lists' | 'friends' | 'comments' | 'privacy';

const TABS: { key: Tab; label: string; icon: typeof Clock }[] = [
    { key: 'activity', label: 'Actividad', icon: Clock },
    { key: 'saved', label: 'Favoritos', icon: Heart },
    { key: 'lists', label: 'Mis Listas', icon: List },
    { key: 'friends', label: 'Amigos', icon: Users },
    { key: 'comments', label: 'Comentarios', icon: MessageCircle },
];

const PRIVACY_FIELDS: { key: keyof Privacy; label: string; description: string }[] = [
    { key: 'show_watchlist', label: 'Mostrar Mis Listas', description: 'Otros usuarios pueden ver tu lista de seguimiento' },
    { key: 'show_favorites', label: 'Mostrar Favoritos', description: 'Otros usuarios pueden ver tus animes favoritos' },
    { key: 'show_lists', label: 'Mostrar Listas', description: 'Otros usuarios pueden ver tus listas' },
    { key: 'show_activity', label: 'Mostrar Actividad', description: 'Otros usuarios pueden ver tu actividad reciente' },
    { key: 'show_friends', label: 'Mostrar Amigos', description: 'Otros usuarios pueden ver tu lista de amigos' },
    { key: 'allow_comments', label: 'Permitir Comentarios', description: 'Otros usuarios pueden escribir en tu perfil' },
    { key: 'show_stats', label: 'Mostrar Estadísticas', description: 'Otros usuarios pueden ver tus estadísticas' },
];

export default function ProfileShow({ profile, stats, friends, friendStatus, friendshipId, incomingRequest, comments, recentComments, favorites, watchlist, customLists, isOwn, privacy }: ProfileProps) {
    const pageProps = usePage().props as { auth: { user: AuthUser | null } };
    const authUser = pageProps.auth?.user;
    const [activeTab, setActiveTab] = useState<Tab>('activity');
    const [editingBio, setEditingBio] = useState(false);
    const [bioValue, setBioValue] = useState(profile.bio ?? '');
    const [localComments, setLocalComments] = useState(comments);
    const [localStatus, setLocalStatus] = useState(friendStatus);
    const [localFriendshipId, setLocalFriendshipId] = useState(friendshipId);
    const [localIncomingRequest, setLocalIncomingRequest] = useState(incomingRequest);
    const [localFriends, setLocalFriends] = useState(friends);
    const [localPrivacy, setLocalPrivacy] = useState(privacy);
    const [expandedListId, setExpandedListId] = useState<number | null>(null);

    function saveBio() {
        axios.put(route('profile.update-bio'), { bio: bioValue })
            .then(() => setEditingBio(false));
    }

    function sendFriendRequest() {
        axios.post(route('profile.friend-request', profile.id))
            .then((res) => {
                setLocalStatus('pending');
                setLocalFriendshipId(res.data.id);
            });
    }

    function acceptFriend() {
        if (!localFriendshipId) return;
        axios.post(route('friendship.accept', localFriendshipId))
            .then(() => {
                setLocalStatus('accepted');
                setLocalIncomingRequest(false);
                if (authUser) setLocalFriends((prev) => [...prev, { id: authUser.id, name: authUser.name, avatar: authUser.avatar }]);
            });
    }

    function rejectFriend() {
        if (!localFriendshipId) return;
        axios.post(route('friendship.reject', localFriendshipId))
            .then(() => {
                setLocalStatus(null);
                setLocalIncomingRequest(false);
            });
    }

    function removeFriend() {
        axios.delete(route('friendship.remove', profile.id))
            .then(() => {
                setLocalStatus(null);
                setLocalFriendshipId(null);
                setLocalFriends((prev) => prev.filter((f) => f.id !== authUser?.id));
            });
    }

    function togglePrivacy(key: keyof Privacy) {
        const updated = { ...localPrivacy, [key]: !localPrivacy[key] };
        setLocalPrivacy(updated);
        axios.put(route('profile.update-privacy'), { [key]: updated[key] });
    }

    return (
        <SiteLayout>
            <Head title={`${profile.name} - Kairo`} />

            <div className="pt-20 px-4 max-w-5xl mx-auto pb-10 sm:px-6 lg:px-8 lg:pt-24 lg:pb-16">
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    <div className="relative group">
                        {isOwn ? (
                            <Link href={route('profile.edit')} className="block h-24 w-24 shrink-0 overflow-hidden rounded-full bg-primary text-3xl font-bold text-primary-foreground items-center justify-center ring-2 ring-[hsl(217,91%,60%)]/30 cursor-pointer hover:ring-[hsl(217,91%,60%)]/60 transition-all flex">
                                {profile.avatar ? (
                                    <img src={imageUrl(profile.avatar)} alt={profile.name} className="h-full w-full object-cover" />
                                ) : (
                                    profile.name.charAt(0).toUpperCase()
                                )}
                            </Link>
                        ) : (
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-primary text-3xl font-bold text-primary-foreground flex items-center justify-center ring-2 ring-[hsl(217,91%,60%)]/30">
                                {profile.avatar ? (
                                    <img src={imageUrl(profile.avatar)} alt={profile.name} className="h-full w-full object-cover" />
                                ) : (
                                    profile.name.charAt(0).toUpperCase()
                                )}
                            </div>
                        )}
                        {isOwn && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                                <Camera className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{profile.display_name || profile.name}</h1>
                            <RoleBadge role={profile.role} />
                        </div>
                        <p className="text-xs text-muted-foreground">@{profile.username}</p>
                        <p className="text-xs text-muted-foreground">Miembro desde {new Date(profile.created_at).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</p>

                        {editingBio ? (
                            <div className="mt-2">
                                <textarea
                                    value={bioValue}
                                    onChange={(e) => setBioValue(e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none resize-none"
                                />
                                <div className="mt-1 flex gap-2">
                                    <button onClick={saveBio} className="rounded-md bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90">Guardar</button>
                                    <button onClick={() => { setEditingBio(false); setBioValue(profile.bio ?? ''); }} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-1 flex items-start gap-2">
                                <p className="text-sm text-muted-foreground">{profile.bio || 'Sin biografía'}</p>
                                {isOwn && (
                                    <button onClick={() => setEditingBio(true)} className="shrink-0 text-muted-foreground hover:text-foreground">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {stats && (
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm sm:gap-6">
                                <div className="rounded-xl bg-[hsl(217,91%,60%)]/5 border border-[hsl(217,91%,60%)]/20 px-4 py-2"><strong className="text-[hsl(217,91%,60%)]">{stats.lists}</strong> <span className="text-muted-foreground">listas</span></div>
                                <div className="rounded-xl bg-[hsl(217,91%,60%)]/5 border border-[hsl(217,91%,60%)]/20 px-4 py-2"><strong className="text-[hsl(217,91%,60%)]">{stats.likes}</strong> <span className="text-muted-foreground">likes</span></div>
                                <div className="rounded-xl bg-[hsl(217,91%,60%)]/5 border border-[hsl(217,91%,60%)]/20 px-4 py-2"><strong className="text-[hsl(217,91%,60%)]">{stats.comments}</strong> <span className="text-muted-foreground">comentarios</span></div>
                                <div className="rounded-xl bg-[hsl(217,91%,60%)]/5 border border-[hsl(217,91%,60%)]/20 px-4 py-2"><strong className="text-[hsl(217,91%,60%)]">{localFriends.length}</strong> <span className="text-muted-foreground">amigos</span></div>
                            </div>
                        )}

                        {!isOwn && authUser && (
                            <div className="mt-3">
                                {localStatus === 'accepted' ? (
                                    <button onClick={removeFriend} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                                        <UserCheck className="h-3.5 w-3.5" /> Amigos
                                    </button>
                                ) : localStatus === 'pending' && localIncomingRequest ? (
                                    <div className="flex gap-2">
                                        <button onClick={acceptFriend} className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_0_12px_hsl(217,91%,60%,0.3)] hover:scale-105 transition-all">
                                            <UserPlus className="h-3.5 w-3.5" /> Aceptar
                                        </button>
                                        <button onClick={rejectFriend} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                                            <UserX className="h-3.5 w-3.5" /> Rechazar
                                        </button>
                                    </div>
                                ) : localStatus === 'pending' ? (
                                    <span className="text-xs text-muted-foreground">Solicitud enviada</span>
                                ) : (
                                    <button onClick={sendFriendRequest} className="flex items-center gap-1.5 rounded-full border border-[hsl(217,91%,60%)]/50 px-3 py-1.5 text-xs font-semibold text-[hsl(217,91%,60%)] hover:bg-[hsl(217,91%,60%)]/10">
                                        <UserPlus className="h-3.5 w-3.5" /> Agregar amigo
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-1 border-b border-border/60 mb-6 overflow-x-auto">
                    {[...TABS, ...(isOwn ? [{ key: 'privacy' as Tab, label: 'Privacidad', icon: Shield }] : [])]
                        .filter(({ key }) => isOwn || key === 'privacy' || key === 'activity' && localPrivacy.show_activity || key === 'saved' && localPrivacy.show_favorites || key === 'lists' && localPrivacy.show_watchlist || key === 'friends' && localPrivacy.show_friends || key === 'comments' && localPrivacy.allow_comments)
                        .map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === key
                                    ? 'border-[hsl(217,91%,60%)] text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon className={`h-4 w-4 ${activeTab === key ? 'text-[hsl(217,91%,60%)]' : ''}`} />
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'activity' && (
                    <div className="space-y-3">
                        {recentComments.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Sin actividad reciente</p>
                        ) : recentComments.map((c) => (
                            <div key={c.id} className="flex gap-3 rounded-xl bg-[hsl(217,91%,60%)]/5 border border-[hsl(217,91%,60%)]/10 p-3">
                                {c.anime && (
                                    <img src={imageUrl(c.anime.cover_image)} alt="" loading="lazy" className="h-12 w-8 shrink-0 rounded object-cover" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground">
                                        Comentó en {c.anime ? (
                                            <Link href={route('anime.show', c.anime.slug)} className="font-medium text-foreground hover:underline">{c.anime.title}</Link>
                                        ) : 'un episodio'}
                                    </p>
                                    <p className="mt-1 text-sm text-foreground line-clamp-2">{c.body}</p>
                                    <p className="mt-1 text-[10px] text-muted-foreground/60">{new Date(c.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                        {favorites.length === 0 ? (
                            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Sin favoritos</p>
                        ) : favorites.map((a: AnimeCardData) => (
                            <AnimeCard key={a.id} anime={a} />
                        ))}
                    </div>
                )}

                {activeTab === 'lists' && (
                    <div>
                        {customLists.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-12">
                                <div className="rounded-2xl bg-[hsl(217,91%,60%)]/10 p-6">
                                    <List className="h-10 w-10 text-[hsl(217,91%,60%)]" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {isOwn ? 'Aún no tienes listas creadas' : 'Este usuario no tiene listas'}
                                </p>
                                {isOwn && (
                                    <Link
                                        href={route('user.lists')}
                                        className="flex items-center gap-2 rounded-full bg-[hsl(217,91%,60%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_hsl(217,91%,60%,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_24px_hsl(217,91%,60%,0.4)] active:scale-95"
                                    >
                                        <List className="h-4 w-4" /> Crear mi primera lista
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {customLists.map((list) => {
                                    const expanded = expandedListId === list.id;
                                    return (
                                        <div key={list.id} className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
                                            <button
                                                onClick={() => setExpandedListId(expanded ? null : list.id)}
                                                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                                            >
                                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    {list.cover_image ? (
                                                        <img src={imageUrl(list.cover_image)} alt="" loading="lazy" className="h-full w-full object-cover" />
                                                    ) : list.animes.length > 0 && list.animes[0].cover_image ? (
                                                        <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                                                            {list.animes.slice(0, 4).map((a, i) => (
                                                                <img key={a.id} src={imageUrl(a.cover_image)} alt="" loading="lazy" className={`h-full w-full object-cover ${i === 0 ? 'col-span-1 row-span-2' : ''}`} />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <List className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-foreground truncate">{list.name}</p>
                                                    {list.description && <p className="text-xs text-muted-foreground truncate">{list.description}</p>}
                                                    <p className="text-xs text-muted-foreground mt-0.5">{list.animes_count} animes</p>
                                                </div>
                                                {expanded ? (
                                                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                )}
                                            </button>
                                            {expanded && (
                                                <div className="border-t border-border/40 p-4">
                                                    {list.animes.length === 0 ? (
                                                        <p className="text-center text-xs text-muted-foreground py-4">Lista vacía</p>
                                                    ) : (
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                                            {list.animes.map((a) => (
                                                                <AnimeCard key={a.id} anime={a} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {isOwn && (
                                    <Link
                                        href={route('user.lists')}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[hsl(217,91%,60%)]/30 py-3 text-sm text-[hsl(217,91%,60%)] transition-colors hover:border-[hsl(217,91%,60%)]/60 hover:bg-[hsl(217,91%,60%)]/5"
                                    >
                                        <List className="h-4 w-4" /> Gestionar listas
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'friends' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {localFriends.length === 0 ? (
                            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Sin amigos aún</p>
                        ) : localFriends.map((f) => (
                            <Link key={f.id} href={route('profile.show', f.id)} className="flex items-center gap-3 rounded-xl bg-[hsl(217,91%,60%)]/5 border border-[hsl(217,91%,60%)]/10 p-3 hover:bg-[hsl(217,91%,60%)]/10 hover:border-[hsl(217,91%,60%)]/30 transition-colors">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground flex items-center justify-center ring-2 ring-[hsl(217,91%,60%)]/20">
                                    {f.avatar ? (
                                        <img src={imageUrl(f.avatar)} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        f.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="block truncate text-sm font-medium text-foreground">{f.name}</span>
                                        <RoleBadge role={f.role ?? ''} />
                                    </div>
                                    {f.username && <span className="block truncate text-xs text-muted-foreground">@{f.username}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div>
                        {(isOwn || localPrivacy.allow_comments) ? (
                            <CommentSection profileUserId={profile.id} comments={localComments} />
                        ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">Este usuario no permite comentarios en su perfil.</p>
                        )}
                    </div>
                )}

                {activeTab === 'privacy' && isOwn && (
                    <div className="max-w-lg space-y-1">
                        <p className="text-sm text-muted-foreground mb-4">Controla qué pueden ver otros usuarios en tu perfil.</p>
                        {PRIVACY_FIELDS.map(({ key, label, description }) => (
                            <button
                                key={key}
                                onClick={() => togglePrivacy(key)}
                                className="w-full flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">{label}</p>
                                    <p className="text-xs text-muted-foreground">{description}</p>
                                </div>
                                <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${localPrivacy[key] ? 'bg-[hsl(217,91%,60%)]' : 'bg-muted'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localPrivacy[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
