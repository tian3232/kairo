import { Link, usePage } from '@inertiajs/react';
import { Heart, Tv } from 'lucide-react';
import KairoLogo from '@/components/kairo-logo';

export function SiteFooter() {
    const currentYear = new Date().getFullYear();
    const { auth } = usePage().props as { auth: { user: { id: number } | null } };
    const user = auth?.user;

    return (
        <footer className="relative mt-16 border-t border-border/40 bg-[hsl(217,15%,5%)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(217,91%,60%)]/30 to-transparent" />

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <KairoLogo size="sm" animate={false} />
                        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/40">
                            Tu plataforma de anime favorita. Explora, mira y conecta con una comunidad que vive el anime.
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-xs text-white/25">
                            <Tv className="h-3 w-3" />
                            <span>Hecho con pasión por el anime</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Navegación</h3>
                        <ul className="mt-3 space-y-2">
                            {[
                                { label: 'Inicio', href: '/' },
                                { label: 'Explorar', href: '/explore' },
                                { label: 'Simulcast', href: '/simulcast' },
                                { label: 'Calendario', href: '/calendar' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-white/35 transition-colors hover:text-[hsl(217,91%,65%)]"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Cuenta</h3>
                        <ul className="mt-3 space-y-2">
                            {user ? (
                                <>
                                    {[
                                        { label: 'Favoritos', href: '/favoritos' },
                                        { label: 'Mis Listas', href: '/mis-listas' },
                                        { label: 'Historial', href: '/historial' },
                                        { label: 'Configuración', href: '/settings/profile' },
                                    ].map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="text-sm text-white/35 transition-colors hover:text-[hsl(217,91%,65%)]"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link
                                            href="/login"
                                            className="text-sm text-white/35 transition-colors hover:text-[hsl(217,91%,65%)]"
                                        >
                                            Iniciar sesión
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/register"
                                            className="text-sm text-white/35 transition-colors hover:text-[hsl(217,91%,65%)]"
                                        >
                                            Crear cuenta
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Legal</h3>
                        <ul className="mt-3 space-y-2">
                            {[
                                { label: 'Términos de Servicio', href: '/terminos' },
                                { label: 'Política de Privacidad', href: '/privacidad' },
                                { label: 'DMCA', href: '/dmca' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-white/35 transition-colors hover:text-[hsl(217,91%,65%)]"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/5 pt-6 sm:flex-row sm:justify-between">
                    <p className="text-xs text-white/20">
                        &copy; {currentYear} <span className="text-[hsl(217,91%,65%)]">Kairo</span>. Todos los derechos reservados.
                    </p>
                    <p className="flex items-center gap-1 text-xs text-white/20">
                        Hecho con <Heart className="h-3 w-3 fill-red-500 text-red-500" /> por la comunidad de Kairo
                    </p>
                </div>
            </div>
        </footer>
    );
}
