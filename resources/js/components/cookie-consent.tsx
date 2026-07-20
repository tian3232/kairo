import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { Link } from '@inertiajs/react';

const COOKIE_KEY = 'kairo_cookie_consent';

export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_KEY);
        if (!consent) {
            setVisible(true);
        }
    }, []);

    function accept() {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-6">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[hsl(217,15%,8%)] shadow-[0_8px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(217,91%,60%)]/10">
                        <Cookie className="h-5 w-5 text-[hsl(217,91%,60%)]" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-white/70">
                            Usamos cookies para mejorar tu experiencia, mantener tu sesión activa y analizar el uso de la plataforma.{' '}
                            <Link href="/privacidad" className="text-[hsl(217,91%,60%)] hover:underline" target="_blank">
                                Más información
                            </Link>
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <button
                            onClick={accept}
                            className="whitespace-nowrap rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/20 transition-all hover:shadow-[hsl(217,91%,60%)]/30 hover:scale-[1.02] active:scale-95"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
