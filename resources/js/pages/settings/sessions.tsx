import { Head, router, useForm } from '@inertiajs/react';
import SettingsLayout from '@/layouts/settings/layout';
import { MonitorSmartphone, Laptop, Smartphone, ShieldCheck, Trash2 } from 'lucide-react';

interface SessionData {
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    device: string;
    browser: string;
    last_activity: number;
    is_current: boolean;
}

function deviceIcon(device: string) {
    if (device === 'iPhone' || device === 'Android' || device === 'iPad') return Smartphone;
    if (device === 'Windows' || device === 'macOS' || device === 'Linux') return Laptop;
    return MonitorSmartphone;
}

function formatActivity(timestamp: number): string {
    const diff = Math.floor(Date.now() / 1000) - timestamp;
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} d`;
}

export default function Sessions({ sessions }: { sessions: SessionData[] }) {
    const { delete: destroy, processing } = useForm();

    const closeSession = (id: string) => {
        if (processing) return;
        if (!confirm('¿Cerrar esta sesión?')) return;
        router.delete(route('sessions.destroy', id), { preserveScroll: true });
    };

    return (
        <SettingsLayout>
            <Head title="Sesiones activas" />

            <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Sesiones activas</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Estos son los dispositivos donde has iniciado sesión. Puedes cerrar cualquiera de ellos.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {sessions.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">No hay sesiones registradas.</p>
                )}

                {sessions.map((session) => {
                    const Icon = deviceIcon(session.device);
                    return (
                        <div
                            key={session.id}
                            className="flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {session.device} · {session.browser}
                                    </p>
                                    {session.is_current && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                            <ShieldCheck className="h-3 w-3" />
                                            Esta sesión
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {session.ip_address ?? 'IP desconocida'} · {formatActivity(session.last_activity)}
                                </p>
                            </div>

                            {!session.is_current && (
                                <button
                                    onClick={() => closeSession(session.id)}
                                    disabled={processing}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-red-500/50 hover:text-red-500 disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Cerrar
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </SettingsLayout>
    );
}
