import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { LayoutDashboard, Film, Tag, Building2, Users, MessageSquare, BarChart3, ArrowLeft, Flag, Image, Headphones } from 'lucide-react';
import KairoLogo from '@/components/kairo-logo';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Animes', href: '/admin/animes', icon: Film },
    { label: 'Géneros', href: '/admin/genres', icon: Tag },
    { label: 'Estudios', href: '/admin/studios', icon: Building2 },
    { label: 'Banners', href: '/admin/banners', icon: Image },
    { label: 'Usuarios', href: '/admin/users', icon: Users },
    { label: 'Reportes', href: '/admin/comments/reports', icon: Flag },
    { label: 'Comentarios', href: '/admin/comments', icon: MessageSquare },
    { label: 'Estadísticas', href: '/admin/stats', icon: BarChart3 },
    { label: 'Soporte', href: '/admin/support', icon: Headphones },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const currentPath = window.location.pathname;

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-border bg-card">
                <div className="flex items-center gap-3 px-5 py-5">
                    <Link href="/" className="transition-transform hover:scale-105">
                        <KairoLogo size="sm" showText={false} />
                    </Link>
                    <div className="flex flex-col">
                        <Link href="/" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                            Kairo
                        </Link>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                            Panel Admin
                        </span>
                    </div>
                </div>

                <div className="mx-3 mb-4 h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

                <nav className="flex-1 space-y-1 px-3">
                    {navItems.map((item, index) => {
                        const isActive = item.href === '/admin'
                            ? currentPath === '/admin'
                            : item.href === '/admin/comments'
                                ? currentPath === '/admin/comments'
                                : currentPath.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                                    isActive
                                        ? 'bg-primary/10 font-medium text-primary shadow-sm shadow-primary/10'
                                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:translate-x-0.5'
                                }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <item.icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {item.label}
                                {isActive && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mx-3 mb-3 h-px bg-border" />

                <div className="px-3 pb-3">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground hover:translate-x-0.5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al sitio
                    </Link>
                </div>
            </aside>

            <main className="ml-60 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
