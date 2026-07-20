import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Check, X } from 'lucide-react';
import { FormEventHandler, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import KairoLogo from '@/components/kairo-logo';
import InputError from '@/components/input-error';

interface GoogleUsernameProps {
    name: string;
    email: string;
    avatar: string | null;
}

interface FieldStatus {
    checking: boolean;
    available: boolean | null;
    message: string;
}

export default function GoogleUsername({ name, email, avatar }: GoogleUsernameProps) {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        display_name: name || '',
    });

    const [usernameStatus, setUsernameStatus] = useState<FieldStatus>({ checking: false, available: null, message: '' });
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, []);

    function checkUsername(value: string) {
        if (timer.current) clearTimeout(timer.current);
        if (value.length < 3) {
            setUsernameStatus({ checking: false, available: null, message: '' });
            return;
        }
        setUsernameStatus({ checking: true, available: null, message: '' });
        timer.current = setTimeout(() => {
            axios.post('/api/check-username', { username: value })
                .then((res) => setUsernameStatus({ checking: false, available: res.data.available, message: res.data.message }))
                .catch(() => setUsernameStatus({ checking: false, available: null, message: '' }));
        }, 500);
    }

    function handleUsernameChange(value: string) {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9._]/g, '');
        setData('username', cleaned);
        checkUsername(cleaned);
    }

    const canSubmit = data.username.length >= 3 && data.display_name.trim() && usernameStatus.available !== false && !processing;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('google.username.store'));
    };

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[hsl(217,15%,6%)] p-6 md:p-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[hsl(217,91%,60%)]/[0.07] blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[hsl(217,91%,60%)]/[0.05] blur-[100px]" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(hsl(217,91%,60%,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(hsl(217,91%,60%,0.03)_1px,transparent_1px))] bg-[size:60px_60px]" />

            <Head title="Elige tu usuario - Kairo" />

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-5">
                        <Link href={route('home')}>
                            <KairoLogo size="lg" showText={true} animate={true} />
                        </Link>
                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-semibold text-white">Elige tu usuario</h1>
                            <p className="text-sm text-white/50">Es el último paso para crear tu cuenta</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
                        <div className="flex flex-col items-center gap-4 mb-6">
                            {avatar ? (
                                <img src={avatar} alt="" className="h-16 w-16 rounded-full ring-2 ring-[hsl(217,91%,60%)]/30 object-cover" />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-[hsl(217,91%,60%)]/20 flex items-center justify-center ring-2 ring-[hsl(217,91%,60%)]/30">
                                    <span className="text-2xl font-bold text-[hsl(217,91%,60%)]">{(name || email)[0]?.toUpperCase()}</span>
                                </div>
                            )}
                            <div className="text-center">
                                <p className="text-sm text-white/70">{email}</p>
                            </div>
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={submit}>
                            <div className="grid gap-2">
                                <label className="text-xs font-medium text-white/60">Nombre para mostrar</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={data.display_name}
                                    onChange={(e) => setData('display_name', e.target.value)}
                                    placeholder="Cómo te llamas"
                                    maxLength={50}
                                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-[hsl(217,91%,60%)] focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none"
                                />
                                <p className="text-[11px] text-white/40">Lo que verán otros en comentarios y perfil</p>
                                <InputError message={errors.display_name} />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-xs font-medium text-white/60">Nombre de usuario</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">@</span>
                                    <input
                                        type="text"
                                        required
                                        value={data.username}
                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                        placeholder="usuario"
                                        className={`h-11 w-full rounded-xl border bg-white/5 pl-7 pr-8 text-sm text-white placeholder:text-white/30 transition-colors focus:ring-1 focus:ring-[hsl(217,91%,60%)]/30 outline-none ${
                                            usernameStatus.available === true ? '!border-green-500' :
                                            usernameStatus.available === false ? '!border-red-500' :
                                            'border-white/10 focus:border-[hsl(217,91%,60%)]'
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

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-sm font-semibold text-white shadow-lg shadow-[hsl(217,91%,60%)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[hsl(217,91%,60%)]/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                                {processing ? 'Creando cuenta...' : 'Crear cuenta'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
