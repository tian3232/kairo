import { Link, usePage } from '@inertiajs/react';
import { User, Lock, Palette, Play, ArrowLeft, MonitorSmartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import SiteLayout from '@/layouts/site-layout';

const settingsNav = [
    { title: 'Perfil', url: '/settings/profile', icon: User, description: 'Tu información personal' },
    { title: 'Contraseña', url: '/settings/password', icon: Lock, description: 'Cambiar tu contraseña' },
    { title: 'Apariencia', url: '/settings/appearance', icon: Palette, description: 'Tema y colores' },
    { title: 'Reproducción', url: '/settings/playback', icon: Play, description: 'Preferencias del reproductor' },
    { title: 'Sesiones', url: '/settings/sessions', icon: MonitorSmartphone, description: 'Dispositivos con sesión activa' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = usePage().url;

    return (
        <SiteLayout>
            <div className="mx-auto max-w-5xl px-4 py-8 pt-24">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio
                </Link>

                <h1 className="mb-2 text-2xl font-bold text-foreground">Configuración</h1>
                <p className="mb-8 text-sm text-muted-foreground">Administra tu cuenta y preferencias</p>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="w-full flex-shrink-0 lg:w-64">
                        <nav className="flex flex-col gap-1">
                            {settingsNav.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentPath === item.url || currentPath.startsWith(item.url + '?');
                                return (
                                    <Link
                                        key={item.url}
                                        href={item.url}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                            isActive
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="truncate">{item.title}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <div className="rounded-xl border border-border bg-card p-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
