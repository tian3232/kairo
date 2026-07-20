import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout title="¿Olvidaste tu contraseña?" description="Ingresa tu correo y te enviaremos un enlace para reestablecerla">
            <Head title="Recuperar contraseña - Kairo" />

            {status && (
                <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-center text-sm font-medium text-green-400">
                    {status}
                </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={submit}>
                <div className="grid gap-2">
                    <label className="text-xs font-medium text-white/60">Correo electrónico</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="tu@correo.com"
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-[hsl(217,91%,60%)] focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none"
                        />
                    </div>
                    {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[hsl(217,91%,60%)]/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    {processing ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
            </form>

            <div className="h-px my-2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <Link
                href={route('login')}
                className="flex items-center justify-center gap-2 text-sm text-white/40 transition-colors hover:text-white/60"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a iniciar sesión
            </Link>
        </AuthLayout>
    );
}
