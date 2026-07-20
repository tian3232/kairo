import { Head, Link, router, useForm } from '@inertiajs/react';
import { LoaderCircle, MailCheck, LogOut } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/api/check-verification', { credentials: 'same-origin' })
                .then((res) => res.json())
                .then((data) => {
                    if (data.verified) {
                        clearInterval(interval);
                        router.visit(route('home'), { replace: true });
                    }
                })
                .catch(() => {});
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verifica tu correo" description="Te enviamos un enlace de verificación. Revisa tu bandeja de entrada.">
            <Head title="Verificar email - Kairo" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-center text-sm font-medium text-green-400">
                    Se envió un nuevo enlace de verificación a tu correo.
                </div>
            )}

            <div className="flex flex-col items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(217,91%,60%)]/10">
                    <MailCheck className="h-8 w-8 text-[hsl(217,91%,60%)]" />
                </div>

                <div className="flex items-center gap-2 text-sm text-white/40">
                    <LoaderCircle className="h-4 w-4 animate-spin text-[hsl(217,91%,60%)]" />
                    Esperando verificación...
                </div>

                <form onSubmit={submit} className="flex w-full flex-col items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[hsl(217,91%,60%)]/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reenviar correo de verificación
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/60"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </Link>
                </form>
            </div>
        </AuthLayout>
    );
}
