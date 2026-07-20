import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';

interface Stats {
    animes_by_status: Record<string, number>;
    animes_by_type: Record<string, number>;
    total_users: number;
    new_users_month: number;
    total_episodes: number;
    total_views: number;
    views_today: number;
    total_comments: number;
    hidden_comments: number;
    top_animes: Array<{ id: number; title: string; views_count: number }>;
    recent_activity: Array<{
        id: number;
        user: { name: string } | null;
        action: string;
        auditable_type: string;
        auditable_id: number;
        created_at: string;
    }>;
}

export default function StatsIndex({ stats }: { stats: Stats }) {
    const modelShort = (type: string) => type.split('\\').pop() || type;

    const summaryCards = [
        { label: 'Usuarios totales', value: stats.total_users },
        { label: 'Nuevos este mes', value: stats.new_users_month },
        { label: 'Episodios', value: stats.total_episodes },
        { label: 'Vistas completadas', value: stats.total_views },
        { label: 'Vistas hoy', value: stats.views_today },
        { label: 'Comentarios', value: stats.total_comments },
        { label: 'Ocultos', value: stats.hidden_comments },
    ];

    return (
        <AdminLayout>
            <Head title="Estadísticas - Kairo Admin" />

            <h1 className="mb-8 text-2xl font-bold text-foreground">Estadísticas</h1>

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-lg border border-border bg-card p-4">
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">Por estado</h2>
                    <div className="space-y-2">
                        {Object.entries(stats.animes_by_status).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between text-sm">
                                <span className="capitalize text-muted-foreground">{status}</span>
                                <span className="font-medium text-foreground">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">Por tipo</h2>
                    <div className="space-y-2">
                        {Object.entries(stats.animes_by_type).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between text-sm">
                                <span className="uppercase text-muted-foreground">{type}</span>
                                <span className="font-medium text-foreground">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-8 rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Animes más vistos</h2>
                <ul className="space-y-2">
                    {stats.top_animes.map((anime, i) => (
                        <li key={anime.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">
                                <span className="mr-2 font-bold text-muted-foreground">#{i + 1}</span>
                                {anime.title}
                            </span>
                            <span className="text-muted-foreground">{anime.views_count} vistas</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Actividad reciente</h2>
                <ul className="space-y-2">
                    {stats.recent_activity.map((log) => (
                        <li key={log.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">
                                <span className="font-medium">{log.user?.name ?? 'Sistema'}</span>
                                {' '}{log.action}
                                {' '}<span className="text-muted-foreground">{modelShort(log.auditable_type)} #{log.auditable_id}</span>
                            </span>
                            <span className="text-muted-foreground">
                                {new Date(log.created_at).toLocaleString('es-ES')}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </AdminLayout>
    );
}
