import { Link, usePage } from '@inertiajs/react';
import React, { useCallback, useRef, useState } from 'react';
import { MessageSquare, Trash2, Edit3, Send, ImagePlus, ThumbsUp, ThumbsDown, X, Reply, Flag, Bold, AlignLeft, AlignCenter, AlignRight, SmilePlus } from 'lucide-react';
import { imageUrl } from '@/lib/image-url';
import { useToast } from '@/components/toast';
import { RoleBadge } from '@/components/role-badge';

interface CommentUser {
    id: number;
    name: string;
    username?: string;
    avatar: string | null;
    role?: string;
}

interface CommentData {
    id: number;
    body: string;
    text_align: string;
    image: string | null;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
    user: CommentUser;
    likes_count: number;
    dislikes_count: number;
    user_liked: boolean | null;
    replies_count?: number;
}

interface CommentSectionProps {
    animeId?: number;
    episodeId?: number;
    profileUserId?: number;
    comments: CommentData[];
}

const REPORT_REASONS = [
    'Spam',
    'Contenido ofensivo',
    'Acoso',
    'Contenido inapropiado',
    'Spoiler sin advertencia',
    'Otro',
];

const EMOJI_LIST = [
    '😊', '😂', '😍', '🥰', '😎', '🤩', '😭', '🥺',
    '🔥', '💯', '✨', '❤️', '💜', '💙', '💚', '🖤',
    '👏', '🙌', '💪', '🤝', '👍', '👎', '❤️‍🔥', '💀',
    '🎉', '🎊', '🎬', '📺', '🍿', '🎵', '🎶', '⚔️',
    '🗡️', '🛡️', '⚔️', '🗡️', '🌟', '⭐', '🌙', '☀️',
    '👀', '🫣', '🤗', '😈', '🤡', '👻', '🎃', '🦋',
];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return 'ahora mismo';
    if (diffMin < 60) return `hace ${diffMin}m`;
    if (diffH < 24) return `hace ${diffH}h`;
    if (diffD < 7) return `hace ${diffD}d`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

async function parseError(res: Response): Promise<string> {
    try {
        const data = await res.json();
        if (data.message) return data.message;
        if (data.errors) {
            const msgs = Object.values(data.errors).flat();
            return msgs.join(', ');
        }
    } catch {}
    return 'Error del servidor';
}

function renderFormattedText(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    let keyIdx = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(<strong key={`b-${keyIdx++}`}>{match[1]}</strong>);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts.length ? parts : [text];
}

interface FormatToolbarProps {
    value: string;
    onChange: (val: string) => void;
    textAlign: string;
    onAlignChange: (align: string) => void;
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

function FormatToolbar({ value, onChange, textAlign, onAlignChange, textareaRef }: FormatToolbarProps) {
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const applyBold = useCallback(() => {
        const ta = textareaRef?.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        if (start === end) return;
        const selected = value.substring(start, end);
        const before = value.substring(0, start);
        const after = value.substring(end);
        const newText = `${before}**${selected}**${after}`;
        onChange(newText);
        setTimeout(() => {
            ta.focus();
            ta.setSelectionRange(start + 2, end + 2);
        }, 0);
    }, [value, onChange, textareaRef]);

    const insertEmoji = useCallback((emoji: string) => {
        const ta = textareaRef?.current;
        if (!ta) {
            onChange(value + emoji);
            return;
        }
        const start = ta.selectionStart;
        const before = value.substring(0, start);
        const after = value.substring(ta.selectionEnd);
        const newText = `${before}${emoji}${after}`;
        onChange(newText);
        setTimeout(() => {
            ta.focus();
            ta.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
        setShowEmoji(false);
    }, [value, onChange, textareaRef]);

    const alignClass = (align: string) =>
        `rounded p-1 transition-colors ${textAlign === align ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`;

    return (
        <div className="flex items-center gap-1 mb-1.5 relative">
            <button type="button" onClick={applyBold} className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors" title="Negrita">
                <Bold className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <button type="button" onClick={() => onAlignChange('left')} className={alignClass('left')} title="Alinear izquierda">
                <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onAlignChange('center')} className={alignClass('center')} title="Centrar">
                <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onAlignChange('right')} className={alignClass('right')} title="Alinear derecha">
                <AlignRight className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={`rounded p-1 transition-colors ${showEmoji ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Emojis"
                >
                    <SmilePlus className="h-3.5 w-3.5" />
                </button>
                {showEmoji && (
                    <div
                        ref={emojiRef}
                        className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-lg border border-border bg-popover p-2 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="grid grid-cols-8 gap-1">
                            {EMOJI_LIST.map((emoji, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => insertEmoji(emoji)}
                                    className="flex h-7 w-7 items-center justify-center rounded text-base hover:bg-muted transition-colors"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function CommentSection({ animeId, episodeId, profileUserId, comments: initialComments }: CommentSectionProps) {
    const { auth } = usePage().props;
    const user = (auth as { user: { id: number; name: string; avatar: string | null; role: string } | null }).user;
    const { toast } = useToast();
    const [comments, setComments] = useState(initialComments);
    const [body, setBody] = useState('');
    const [textAlign, setTextAlign] = useState('left');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editBody, setEditBody] = useState('');
    const [editTextAlign, setEditTextAlign] = useState('left');
    const [sending, setSending] = useState(false);

    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyBody, setReplyBody] = useState('');
    const [replyTextAlign, setReplyTextAlign] = useState('left');
    const [replyImageFile, setReplyImageFile] = useState<File | null>(null);
    const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
    const [replySending, setReplySending] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState<number[]>([]);
    const [replies, setReplies] = useState<Record<number, CommentData[]>>({});

    const [reportingId, setReportingId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState('');
    const [reportDesc, setReportDesc] = useState('');
    const [reportSending, setReportSending] = useState(false);

    const mainTextareaRef = useRef<HTMLTextAreaElement>(null);
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const editTextareaRef = useRef<HTMLTextAreaElement>(null);
    const replyInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleReplyImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReplyImageFile(file);
            setReplyImagePreview(URL.createObjectURL(file));
        }
    };

    const removeReplyImage = () => {
        setReplyImageFile(null);
        setReplyImagePreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!body.trim() && !imageFile) || sending) return;

        setSending(true);
        const formData = new FormData();
        if (animeId) formData.append('anime_id', String(animeId));
        if (episodeId) formData.append('episode_id', String(episodeId));
        if (profileUserId) formData.append('profile_user_id', String(profileUserId));
        if (body.trim()) formData.append('body', body.trim());
        formData.append('text_align', textAlign);
        if (imageFile) formData.append('image', imageFile);

        fetch('/comments', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            body: formData,
        }).then(async (res) => {
            if (res.ok) return res.json();
            const msg = await parseError(res);
            throw new Error(msg);
        }).then((data) => {
            setBody('');
            setTextAlign('left');
            setImageFile(null);
            setImagePreview(null);
            setComments((prev) => [data, ...prev]);
            toast('Comentario publicado');
        }).catch((err) => { toast(err.message || 'Error al publicar', 'error'); }).finally(() => setSending(false));
    };

    const handleEdit = (comment: CommentData) => {
        setEditingId(comment.id);
        setEditBody(comment.body);
        setEditTextAlign(comment.text_align || 'left');
    };

    const handleSaveEdit = (commentId: number) => {
        if (!editBody.trim()) return;
        fetch(`/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            body: JSON.stringify({ body: editBody.trim(), text_align: editTextAlign }),
        }).then((res) => {
            if (res.ok) {
                setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, body: editBody.trim(), text_align: editTextAlign, updated_at: new Date().toISOString() } : c)));
                setEditingId(null);
                toast('Comentario actualizado');
            }
        });
    };

    const handleDelete = (commentId: number) => {
        if (!confirm('¿Eliminar comentario?')) return;
        fetch(`/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
        }).then((res) => {
            if (res.ok) {
                let parentId: number | null = null;
                setComments((prev) => {
                    const found = prev.find((c) => c.id === commentId);
                    if (found) parentId = found.parent_id;
                    return prev.filter((c) => c.id !== commentId);
                });
                setReplies((prev) => {
                    const next = { ...prev };
                    for (const key of Object.keys(next)) {
                        const keyNum = Number(key);
                        const before = next[keyNum].length;
                        next[keyNum] = next[keyNum].filter((r) => r.id !== commentId);
                        if (next[keyNum].length < before) parentId = keyNum;
                    }
                    return next;
                });
                if (parentId) {
                    setComments((prev) => prev.map((c) => c.id === parentId ? { ...c, replies_count: Math.max(0, (c.replies_count || 1) - 1) } : c));
                }
                toast('Comentario eliminado');
            }
        });
    };

    const handleLike = async (commentId: number, isLike: boolean) => {
        if (!user) return;
        const res = await fetch(`/comments/${commentId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            body: JSON.stringify({ is_like: isLike }),
        });
        if (res.ok) {
            const data = await res.json();
            const updater = (list: CommentData[]) => list.map((c) => {
                if (c.id !== commentId) return c;
                const wasLiked = c.user_liked;
                let likes = c.likes_count;
                let dislikes = c.dislikes_count;
                if (wasLiked === true) likes--;
                if (wasLiked === false) dislikes--;
                if (data.liked === true) likes++;
                if (data.liked === false) dislikes++;
                return { ...c, likes_count: likes, dislikes_count: dislikes, user_liked: data.liked };
            });
            setComments((prev) => updater(prev));
            setReplies((prev) => {
                const next = { ...prev };
                for (const key of Object.keys(next)) {
                    next[Number(key)] = updater(next[Number(key)]);
                }
                return next;
            });
        }
    };

    const handleReply = (parentId: number) => {
        if ((!replyBody.trim() && !replyImageFile) || replySending) return;
        setReplySending(true);

        const formData = new FormData();
        if (animeId) formData.append('anime_id', String(animeId));
        if (episodeId) formData.append('episode_id', String(episodeId));
        if (profileUserId) formData.append('profile_user_id', String(profileUserId));
        if (replyBody.trim()) formData.append('body', replyBody.trim());
        formData.append('text_align', replyTextAlign);
        if (replyImageFile) formData.append('image', replyImageFile);
        formData.append('parent_id', String(parentId));

        fetch('/comments', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            body: formData,
        }).then(async (res) => {
            if (res.ok) return res.json();
            const msg = await parseError(res);
            throw new Error(msg);
        }).then((data) => {
            setReplyBody('');
            setReplyTextAlign('left');
            setReplyImageFile(null);
            setReplyImagePreview(null);
            setReplyingTo(null);
            setReplies((prev) => ({ ...prev, [parentId]: [data, ...(prev[parentId] || [])] }));
            setComments((prev) => prev.map((c) => c.id === parentId ? { ...c, replies_count: (c.replies_count || 0) + 1 } : c));
            setExpandedReplies((prev) => prev.includes(parentId) ? prev : [...prev, parentId]);
            toast('Respuesta publicada');
        }).catch((err) => { toast(err.message || 'Error al responder', 'error'); }).finally(() => setReplySending(false));
    };

    const toggleReplies = (commentId: number) => {
        if (expandedReplies.includes(commentId)) {
            setExpandedReplies((prev) => prev.filter((id) => id !== commentId));
        } else {
            setExpandedReplies((prev) => [...prev, commentId]);
            if (!replies[commentId]) {
                fetch(`/comments/${commentId}/replies`, {
                    headers: { 'Accept': 'application/json' },
                }).then((res) => res.json()).then((data) => {
                    setReplies((prev) => ({ ...prev, [commentId]: data }));
                });
            }
        }
    };

    const handleReport = () => {
        if (!reportingId || !reportReason || reportSending) return;
        setReportSending(true);

        fetch(`/comments/${reportingId}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            body: JSON.stringify({ reason: reportReason, description: reportDesc }),
        }).then(async (res) => {
            if (res.ok) return;
            const msg = await parseError(res);
            throw new Error(msg);
        }).then(() => {
            setReportingId(null);
            setReportReason('');
            setReportDesc('');
            toast('Comentario reportado');
        }).catch((err) => { toast(err.message || 'Error al reportar', 'error'); }).finally(() => setReportSending(false));
    };

    const canEdit = (c: CommentData) => user && user.id === c.user.id;
    const canDelete = (c: CommentData) => user && (user.id === c.user.id || user.role === 'admin' || user.role === 'owner');

    function renderComment(c: CommentData, depth = 0) {
        const indent = depth > 0;
        const alignStyle = { textAlign: (c.text_align || 'left') as React.CSSProperties['textAlign'] };
        return (
            <div key={c.id} className={`rounded-lg bg-muted/40 p-3 ${indent ? 'ml-6 sm:ml-8 border-l-2 border-border' : ''}`}>
                <div className="flex items-center gap-2">
                    <Link href={route('profile.show', c.user.id)} className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted">
                        {c.user.avatar ? (
                            <img src={imageUrl(c.user.avatar)} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-muted-foreground">
                                {c.user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-1">
                            <Link href={route('profile.show', c.user.id)} className="text-sm font-medium text-foreground hover:underline">{c.user.name}</Link>
                            <RoleBadge role={c.user.role ?? ''} />
                        </div>
                        {c.user.username && (
                            <span className="text-xs text-muted-foreground">@{c.user.username}</span>
                        )}
                        <span className="ml-2 text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
                        {c.created_at !== c.updated_at && (
                            <span className="ml-1 text-xs text-muted-foreground/50">(editado)</span>
                        )}
                    </div>
                    {user && canEdit(c) && (
                        <div className="flex items-center gap-1">
                            {editingId !== c.id && (
                                <button onClick={() => handleEdit(c)} className="rounded p-1 text-muted-foreground hover:text-foreground">
                                    <Edit3 className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {canDelete(c) && (
                                <button onClick={() => handleDelete(c.id)} className="rounded p-1 text-muted-foreground hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                    {user && user.id !== c.user.id && (
                        <button onClick={() => { setReportingId(c.id); setReportReason(''); setReportDesc(''); }} className="rounded p-1 text-muted-foreground hover:text-orange-500" title="Reportar">
                            <Flag className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {editingId === c.id ? (
                    <div className="mt-2">
                        <FormatToolbar
                            value={editBody}
                            onChange={setEditBody}
                            textAlign={editTextAlign}
                            onAlignChange={setEditTextAlign}
                            textareaRef={editTextareaRef}
                        />
                        <textarea
                            ref={editTextareaRef}
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            rows={2}
                            maxLength={1000}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                            style={{ textAlign: editTextAlign }}
                        />
                        <div className="mt-1 flex gap-2">
                            <button onClick={() => handleSaveEdit(c.id)} className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Guardar</button>
                            <button onClick={() => setEditingId(null)} className="rounded px-3 py-1 text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {c.body && (
                            <p className="mt-1.5 text-sm text-foreground/90" style={alignStyle}>
                                {renderFormattedText(c.body)}
                            </p>
                        )}
                        {c.image && (
                            <img src={imageUrl(c.image)} alt="Imagen del comentario" loading="lazy" className="mt-2 max-h-64 rounded-md object-cover" />
                        )}
                    </>
                )}

                <div className="mt-2 flex items-center gap-3">
                    {user && (
                        <>
                            <button
                                onClick={() => handleLike(c.id, true)}
                                className={`flex items-center gap-1 text-xs transition ${c.user_liked === true ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                {c.likes_count > 0 && c.likes_count}
                            </button>
                            <button
                                onClick={() => handleLike(c.id, false)}
                                className={`flex items-center gap-1 text-xs transition ${c.user_liked === false ? 'text-red-500 font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <ThumbsDown className="h-3.5 w-3.5" />
                                {c.dislikes_count > 0 && c.dislikes_count}
                            </button>
                        </>
                    )}
                    {user && (
                        <button
                            onClick={() => {
                                setReplyingTo(replyingTo === c.id ? null : c.id);
                                setReplyBody('');
                                setReplyTextAlign('left');
                                setReplyImageFile(null);
                                setReplyImagePreview(null);
                            }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                        >
                            <Reply className="h-3.5 w-3.5" /> Responder
                        </button>
                    )}
                    {(c.replies_count || 0) > 0 && (
                        <button
                            onClick={() => toggleReplies(c.id)}
                            className="text-xs text-primary hover:underline"
                        >
                            {expandedReplies.includes(c.id) ? 'Ocultar respuestas' : `Ver ${c.replies_count} ${(c.replies_count || 0) === 1 ? 'respuesta' : 'respuestas'}`}
                        </button>
                    )}
                </div>

                {replyingTo === c.id && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                        {replyImagePreview && (
                            <div className="relative mb-2 inline-block">
                                <img src={replyImagePreview} alt="Preview" className="h-20 rounded-md object-cover" />
                                <button onClick={removeReplyImage} className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-white">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        <FormatToolbar
                            value={replyBody}
                            onChange={setReplyBody}
                            textAlign={replyTextAlign}
                            onAlignChange={setReplyTextAlign}
                            textareaRef={replyTextareaRef}
                        />
                        <textarea
                            ref={replyTextareaRef}
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            placeholder="Escribe una respuesta..."
                            rows={2}
                            maxLength={1000}
                            autoFocus
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                            style={{ textAlign: replyTextAlign }}
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground">
                                    <ImagePlus className="h-4 w-4" />
                                    <input
                                        ref={replyInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleReplyImageSelect}
                                        className="hidden"
                                    />
                                </label>
                                <span className="text-xs text-muted-foreground">{replyBody.length}/1000</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setReplyingTo(null); setReplyImageFile(null); setReplyImagePreview(null); }}
                                    className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleReply(c.id)}
                                    disabled={(!replyBody.trim() && !replyImageFile) || replySending}
                                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Send className="h-3 w-3" />
                                    {replySending ? 'Enviando...' : 'Responder'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {expandedReplies.includes(c.id) && replies[c.id] && (
                    <div className="mt-3 space-y-2">
                        {replies[c.id].map((r) => renderComment(r, depth + 1))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <MessageSquare className="h-5 w-5" />
                Comentarios ({comments.length})
            </h2>

            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                        {user.avatar ? (
                            <img src={imageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        {imagePreview && (
                            <div className="relative mb-2 inline-block">
                                <img src={imagePreview} alt="Preview" className="h-24 rounded-md object-cover" />
                                <button type="button" onClick={removeImage} className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-white">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        <FormatToolbar
                            value={body}
                            onChange={setBody}
                            textAlign={textAlign}
                            onAlignChange={setTextAlign}
                            textareaRef={mainTextareaRef}
                        />
                        <div className="flex gap-2">
                            <textarea
                                ref={mainTextareaRef}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Escribe un comentario..."
                                rows={2}
                                maxLength={1000}
                                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                                style={{ textAlign }}
                            />
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground">
                                    <ImagePlus className="h-4 w-4" />
                                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                </label>
                                <span className="text-xs text-muted-foreground">{body.length}/1000</span>
                            </div>
                            <button
                                type="submit"
                                disabled={(!body.trim() && !imageFile) || sending}
                                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                <Send className="h-3 w-3" />
                                {sending ? 'Enviando...' : 'Comentar'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    Inicia sesión para dejar un comentario.
                </p>
            )}

            <div className="space-y-3">
                {comments.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">No hay comentarios aún. Sé el primero en comentar.</p>
                )}
                {comments.map((comment) => renderComment(comment, 0))}
            </div>

            {reportingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setReportingId(null)}>
                    <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Reportar comentario</h3>
                            <button onClick={() => setReportingId(null)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-2 mb-4">
                            {REPORT_REASONS.map((r) => (
                                <label key={r} className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2 hover:bg-muted/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="report-reason"
                                        value={r}
                                        checked={reportReason === r}
                                        onChange={() => setReportReason(r)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm text-foreground">{r}</span>
                                </label>
                            ))}
                        </div>

                        <textarea
                            value={reportDesc}
                            onChange={(e) => setReportDesc(e.target.value)}
                            placeholder="Descripción adicional (opcional)"
                            rows={3}
                            maxLength={500}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none mb-4"
                        />

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setReportingId(null)} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                                Cancelar
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!reportReason || reportSending}
                                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                                {reportSending ? 'Enviando...' : 'Reportar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
