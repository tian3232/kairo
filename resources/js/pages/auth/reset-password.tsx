import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Lock, CheckCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import AuthLayout from '@/layouts/auth-layout';
import { Check, X } from 'lucide-react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const passwordChecks = [
        { label: 'Mínimo 8 caracteres', met: data.password.length >= 8 },
        { label: 'Una mayúscula', met: /[A-Z]/.test(data.password) },
        { label: 'Una minúscula', met: /[a-z]/.test(data.password) },
        { label: 'Un número', met: /[0-9]/.test(data.password) },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Restablecer contraseña" description="Ingresa tu nueva contraseña a continuación">
            <Head title="Restablecer contraseña - Kairo" />

            <form className="flex flex-col gap-4" onSubmit={submit}>
                <div className="grid gap-2">
                    <label className="text-xs font-medium text-white/60">Correo electrónico</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={data.email}
                        readOnly
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/50 outline-none cursor-not-allowed"
                    />
                    {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                </div>

                <div className="grid gap-2">
                    <label className="text-xs font-medium text-white/60">Nueva contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Tu nueva contraseña"
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 transition-colors focus:border-[hsl(217,91%,60%)] focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                            {showPassword ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}

                    {data.password && (
                        <div className="mt-1 space-y-0.5">
                            {passwordChecks.map(({ label, met }) => (
                                <div key={label} className="flex items-center gap-1.5 text-xs">
                                    {met ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-white/20" />}
                                    <span className={met ? 'text-green-500' : 'text-white/40'}>{label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid gap-2">
                    <label className="text-xs font-medium text-white/60">Confirmar contraseña</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-[hsl(217,91%,60%)] focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none"
                    />
                    {data.password_confirmation && data.password !== data.password_confirmation && (
                        <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                    )}
                    {errors.password_confirmation && <p className="text-sm text-red-400">{errors.password_confirmation}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.password || data.password !== data.password_confirmation}
                    className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[hsl(217,91%,60%)]/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {processing ? 'Restableciendo...' : 'Restablecer contraseña'}
                </button>
            </form>
        </AuthLayout>
    );
}
