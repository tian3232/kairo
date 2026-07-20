import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { MessageSquare, Trash2, Eye, User, Mail, Clock } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface SupportMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    status: 'pending' | 'read' | 'replied';
    created_at: string;
    user: { id: number; name: string; username: string } | null;
}

const STATUS_CONFIG = {
    pending: { label: 'Nuevo', bg: 'bg-[hsl(217,91%,60%)]/10', text: 'text-[hsl(217,91%,60%)]', border: 'border-[hsl(217,91%,60%)]/20' },
    read: { label: 'Leído', bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
    replied: { label: 'Respondido', bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
};

export default function AdminSupport({ messages }: { messages: SupportMessage[] }) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [localMessages, setLocalMessages] = useState(messages);

    const pendingCount = localMessages.filter((m) => m.status === 'pending').length;

    function markRead(id: number) {
        axios.post(route('admin.support.mark-read', id)).then(() => {
            setLocalMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: 'read' as const } : m));
        });
    }

    function handleDelete(id: number) {
        if (!confirm('¿Eliminar este mensaje?')) return;
        axios.delete(route('admin.support.destroy', id)).then(() => {
            setLocalMessages((prev) => prev.filter((m) => m.id !== id));
        });
    }

    return (
        <AdminLayout>
            <Head title="Soporte - Kairo Admin" />

            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-[hsl(217,91%,60%)]" />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Soporte</h1>
                        <p className="text-sm text-muted-foreground">
                            {pendingCount > 0 ? `${pendingCount} mensaje${pendingCount !== 1 ? 's' : ''} nuevo${pendingCount !== 1 ? 's' : ''}` : 'No hay mensajes nuevos'}
                        </p>
                    </div>
                </div>
            </div>

            {localMessages.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
                    <MessageSquare className="mx-auto h-10 w-10 text-white/10" />
                    <p className="mt-4 text-sm text-white/40">No hay mensajes de soporte</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {localMessages.map((msg) => {
                        const config = STATUS_CONFIG[msg.status];
                        const isExpanded = expandedId === msg.id;

                        return (
                            <div
                                key={msg.id}
                                className={`rounded-xl border transition-colors ${
                                    msg.status === 'pending'
                                        ? 'border-[hsl(217,91%,60%)]/20 bg-[hsl(217,91%,60%)]/5'
                                        : 'border-white/5 bg-white/[0.02]'
                                }`}
                            >
                                <button
                                    onClick={() => {
                                        setExpandedId(isExpanded ? null : msg.id);
                                        if (msg.status === 'pending') markRead(msg.id);
                                    }}
                                    className="flex w-full items-center gap-4 p-4 text-left"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-white/50">
                                        {msg.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground">{msg.name}</span>
                                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.text} ${config.border}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-white/40 line-clamp-1">{msg.message}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="hidden text-[11px] text-white/25 sm:block">
                                            {new Date(msg.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <Eye className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''} text-white/20`} />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-white/5 px-4 pb-4 pt-3">
                                        <div className="mb-3 flex flex-wrap gap-3 text-xs text-white/40">
                                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{msg.email}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(msg.created_at).toLocaleString('es-ES')}</span>
                                            {msg.user && (
                                                <span className="flex items-center gap-1"><User className="h-3 w-3" />@{msg.user.username}</span>
                                            )}
                                        </div>
                                        <div className="rounded-lg bg-white/[0.03] p-4 text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                                            {msg.message}
                                        </div>
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </AdminLayout>
    );
}
