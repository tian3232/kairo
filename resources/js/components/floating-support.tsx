import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export function FloatingSupport() {
    const { auth } = usePage().props as { auth: { user: { id: number; name: string; email: string } | null } };
    const user = auth?.user;
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ name, email, message }),
            });
            if (res.ok) {
                setSent(true);
                setTimeout(() => {
                    setOpen(false);
                    setSent(false);
                    setMessage('');
                }, 2500);
            }
        } catch {} finally {
            setSending(false);
        }
    }

    return (
        <>
            {open && (
                <div className="fixed bottom-20 right-4 z-[55] sm:right-6">
                    <div className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[hsl(217,15%,8%)] shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                        <div className="flex items-center justify-between bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-5 py-3.5">
                            <div>
                                <h3 className="text-sm font-semibold text-white">Soporte Kairo</h3>
                                <p className="text-[11px] text-white/70">Te responderemos lo antes posible</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/70 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {sent ? (
                            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                                    <Send className="h-5 w-5 text-green-500" />
                                </div>
                                <p className="text-sm font-medium text-white">Mensaje enviado</p>
                                <p className="text-xs text-white/40">Te responderemos pronto</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] outline-none"
                                />
                                <input
                                    type="email"
                                    placeholder="Tu correo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] outline-none"
                                />
                                <textarea
                                    placeholder="¿En qué podemos ayudarte?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    rows={3}
                                    className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] outline-none resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || sending}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/20 transition-all hover:shadow-[hsl(217,91%,60%)]/30 hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                                >
                                    {sending ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    Enviar
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 z-[55] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-white shadow-[0_0_20px_hsl(217,91%,60%,0.4)] transition-all hover:scale-110 hover:shadow-[0_0_30px_hsl(217,91%,60%,0.5)] active:scale-95 sm:right-6"
            >
                {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            </button>
        </>
    );
}
