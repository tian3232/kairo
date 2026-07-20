import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { Film, Users, Eye, Clapperboard } from 'lucide-react';

interface Stats {
    total_animes: number;
    total_users: number;
    total_episodes: number;
    total_views: number;
    recent_animes: Array<{ id: number; title: string; created_at: string }>;
    recent_users: Array<{ id: number; name: string; email: string; created_at: string }>;
}

const statConfig = [
    { label: 'Animes', key: 'total_animes' as const, icon: Film, color: 'text-blue-400', bg: 'bg-blue-500/10', ring: 'group-hover:ring-blue-500/20' },
    { label: 'Usuarios', key: 'total_users' as const, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'group-hover:ring-emerald-500/20' },
    { label: 'Episodios', key: 'total_episodes' as const, icon: Clapperboard, color: 'text-purple-400', bg: 'bg-purple-500/10', ring: 'group-hover:ring-purple-500/20' },
    { label: 'Vistas completadas', key: 'total_views' as const, icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'group-hover:ring-amber-500/20' },
];

export default function AdminDashboard({ stats }: { stats: Stats }) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard - Kairo" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground animate-in-up">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground animate-in-up delay-75">Vista general del sistema</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statConfig.map((card, index) => (
                    <div
                        key={card.label}
                        className={`group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 ring-0 ${card.ring} ring-2 ring-offset-0 animate-in-up`}
                        style={{ animationDelay: `${index * 100 + 150}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg} transition-transform duration-300 group-hover:scale-110`}>
                                <card.icon className={`h-[18px] w-[18px] ${card.color}`} />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-foreground tabular-nums">{stats[card.key].toLocaleString()}</p>
                        <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/[0.03] transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/[0.06]" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6 animate-in-up delay-75">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                            <Film className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">Animes recientes</h2>
                    </div>
                    <ul className="space-y-3">
                        {stats.recent_animes.map((anime) => (
                            <li key={anime.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50">
                                <span className="text-foreground font-medium">{anime.title}</span>
                                <span className="text-muted-foreground text-xs">{new Date(anime.created_at).toLocaleDateString('es-ES')}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 animate-in-up delay-150">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Users className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">Usuarios recientes</h2>
                    </div>
                    <ul className="space-y-3">
                        {stats.recent_users.map((user) => (
                            <li key={user.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50">
                                <span className="text-foreground font-medium">{user.name}</span>
                                <span className="text-muted-foreground text-xs">{user.email}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}
