import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Check, X, UserPlus } from 'lucide-react';
import { FormEventHandler, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { PasswordInput } from '@/components/password-input';
import { PasswordStrength } from '@/components/password-strength';

interface RegisterForm {
    display_name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    accept_terms: boolean;
}

interface FieldStatus {
    checking: boolean;
    available: boolean | null;
    message: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        display_name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        accept_terms: false,
    });

    const [usernameStatus, setUsernameStatus] = useState<FieldStatus>({ checking: false, available: null, message: '' });
    const [emailStatus, setEmailStatus] = useState<FieldStatus>({ checking: false, available: null, message: '' });
    const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (usernameTimer.current) clearTimeout(usernameTimer.current);
            if (emailTimer.current) clearTimeout(emailTimer.current);
        };
    }, []);

    function checkUsername(value: string) {
        if (usernameTimer.current) clearTimeout(usernameTimer.current);

        if (value.length < 3) {
            setUsernameStatus({ checking: false, available: null, message: '' });
            return;
        }

        setUsernameStatus({ checking: true, available: null, message: '' });
        usernameTimer.current = setTimeout(() => {
            axios.post('/api/check-username', { username: value })
                .then((res) => setUsernameStatus({ checking: false, available: res.data.available, message: res.data.message }))
                .catch(() => setUsernameStatus({ checking: false, available: null, message: '' }));
        }, 500);
    }

    function checkEmail(value: string) {
        if (emailTimer.current) clearTimeout(emailTimer.current);

        if (!value.includes('@')) {
            setEmailStatus({ checking: false, available: null, message: '' });
            return;
        }

        setEmailStatus({ checking: true, available: null, message: '' });
        emailTimer.current = setTimeout(() => {
            axios.post('/api/check-email', { email: value })
                .then((res) => setEmailStatus({ checking: false, available: res.data.available, message: res.data.message }))
                .catch(() => setEmailStatus({ checking: false, available: null, message: '' }));
        }, 500);
    }

    function handleUsernameChange(value: string) {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9._]/g, '');
        setData('username', cleaned);
        checkUsername(cleaned);
    }

    function handleEmailChange(value: string) {
        setData('email', value);
        checkEmail(value);
    }

    const passwordChecks = [
        { label: 'Mínimo 8 caracteres', met: data.password.length >= 8 },
        { label: 'Una mayúscula', met: /[A-Z]/.test(data.password) },
        { label: 'Una minúscula', met: /[a-z]/.test(data.password) },
        { label: 'Un número', met: /[0-9]/.test(data.password) },
    ];

    const canSubmit = data.display_name && data.username && data.email && data.password && data.password_confirmation
        && usernameStatus.available !== false && emailStatus.available !== false
        && !processing;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Crear una cuenta" description="Ingresa tus datos para crear tu cuenta en Kairo">
            <Head title="Registro - Kairo" />

            <div className="flex flex-col gap-5">
                <a
                    href={route('google.redirect')}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuar con Google
                </a>

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
                    <span className="text-xs text-white/30">o crear con email</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
                </div>

                <form className="flex flex-col gap-4" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="display_name" className="text-xs font-medium text-white/60">Nombre para mostrar</Label>
                        <Input
                            id="display_name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            value={data.display_name}
                            onChange={(e) => setData('display_name', e.target.value)}
                            disabled={processing}
                            placeholder="Cómo te llamas"
                            maxLength={50}
                            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%)]/30"
                        />
                        <p className="text-[11px] text-white/40">Lo que verán otros en comentarios y perfil</p>
                        <InputError message={errors.display_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="username" className="text-xs font-medium text-white/60">Nombre de usuario</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">@</span>
                            <Input
                                id="username"
                                type="text"
                                required
                                tabIndex={2}
                                autoComplete="username"
                                value={data.username}
                                onChange={(e) => handleUsernameChange(e.target.value)}
                                disabled={processing}
                                placeholder="usuario"
                                className={`h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-7 pr-8 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%)]/30 ${
                                    usernameStatus.available === true ? '!border-green-500' :
                                    usernameStatus.available === false ? '!border-red-500' : ''
                                }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {usernameStatus.checking && <LoaderCircle className="h-4 w-4 animate-spin text-white/30" />}
                                {!usernameStatus.checking && usernameStatus.available === true && <Check className="h-4 w-4 text-green-500" />}
                                {!usernameStatus.checking && usernameStatus.available === false && <X className="h-4 w-4 text-red-500" />}
                            </div>
                        </div>
                        {usernameStatus.message && !usernameStatus.checking && (
                            <p className={`text-xs ${usernameStatus.available ? 'text-green-500' : 'text-red-500'}`}>
                                {usernameStatus.message}
                            </p>
                        )}
                        <InputError message={errors.username} />
                        <p className="text-[11px] text-white/40">Solo minúsculas, números, puntos (.) y guiones bajos (_)</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-xs font-medium text-white/60">Correo electrónico</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={3}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                disabled={processing}
                                placeholder="correo@ejemplo.com"
                                className={`h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-8 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%)]/30 ${
                                    emailStatus.available === true ? '!border-green-500' :
                                    emailStatus.available === false ? '!border-red-500' : ''
                                }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {emailStatus.checking && <LoaderCircle className="h-4 w-4 animate-spin text-white/30" />}
                                {!emailStatus.checking && emailStatus.available === true && <Check className="h-4 w-4 text-green-500" />}
                                {!emailStatus.checking && emailStatus.available === false && <X className="h-4 w-4 text-red-500" />}
                            </div>
                        </div>
                        {emailStatus.message && !emailStatus.checking && (
                            <p className={`text-xs ${emailStatus.available ? 'text-green-500' : 'text-red-500'}`}>
                                {emailStatus.message}
                            </p>
                        )}
                        {emailStatus.available === false && (
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white/50">
                                <p className="font-medium text-white/70 mb-1">¿Ya tienes una cuenta?</p>
                                <Link href={route('login')} className="text-[hsl(217,91%,60%)] hover:underline">
                                    Iniciar sesión
                                </Link>
                                <span className="mx-1.5 text-white/20">•</span>
                                <Link href={route('password.request')} className="text-[hsl(217,91%,60%)] hover:underline">
                                    Recuperar contraseña
                                </Link>
                            </div>
                        )}
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-xs font-medium text-white/60">Contraseña</Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Contraseña"
                            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%)]/30"
                        />
                        <InputError message={errors.password} />
                        <PasswordStrength password={data.password} />

                        {data.password && (
                            <div className="mt-1 space-y-0.5">
                                {passwordChecks.map(({ label, met }) => (
                                    <div key={label} className="flex items-center gap-1.5 text-xs">
                                        {met ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <X className="h-3 w-3 text-white/20" />
                                        )}
                                        <span className={met ? 'text-green-500' : 'text-white/40'}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-xs font-medium text-white/60">Confirmar contraseña</Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Repite tu contraseña"
                            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%)]/30"
                        />
                        {data.password_confirmation && data.password !== data.password_confirmation && (
                            <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                        )}
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.accept_terms}
                            onChange={(e) => setData('accept_terms', e.target.checked)}
                            disabled={processing}
                            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[hsl(217,91%,60%)] focus:ring-[hsl(217,91%,60%)]/30"
                        />
                        <span className="text-xs text-white/50 leading-relaxed">
                            Acepto los{' '}
                            <Link href="/terminos" className="text-[hsl(217,91%,60%)] hover:underline" target="_blank">Términos de Servicio</Link>
                            {' '}y la{' '}
                            <Link href="/privacidad" className="text-[hsl(217,91%,60%)] hover:underline" target="_blank">Política de Privacidad</Link>
                        </span>
                    </label>

                    <button
                        type="submit"
                        tabIndex={6}
                        disabled={!canSubmit || !data.accept_terms}
                        className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[hsl(217,91%,60%)]/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {processing ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}
                        Crear cuenta
                    </button>
                </form>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <p className="text-center text-sm text-white/40">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href={route('login')} tabIndex={7} className="font-medium text-[hsl(217,91%,60%)] hover:text-[hsl(217,91%,70%)] transition-colors">
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
