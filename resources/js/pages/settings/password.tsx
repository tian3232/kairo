import InputError from '@/components/input-error';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { Check } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { PasswordStrength } from '@/components/password-strength';

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <SettingsLayout>
            <Head title="Contraseña - Kairo" />

            <form onSubmit={updatePassword} className="space-y-8">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Contraseña</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Asegúrate de usar una contraseña larga y aleatoria para mantener tu cuenta segura
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Contraseña actual</label>
                        <PasswordInput
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            className="w-full"
                            autoComplete="current-password"
                            placeholder="Tu contraseña actual"
                        />
                        <InputError message={errors.current_password} />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
                        <PasswordInput
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full"
                            autoComplete="new-password"
                            placeholder="Nueva contraseña"
                        />
                        <InputError message={errors.password} />
                        <PasswordStrength password={data.password} />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
                        <PasswordInput
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full"
                            autoComplete="new-password"
                            placeholder="Confirmar contraseña"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : 'Guardar contraseña'}
                    </button>

                    {recentlySuccessful && (
                        <span className="flex items-center gap-1.5 text-sm text-green-500">
                            <Check className="h-4 w-4" /> Guardado
                        </span>
                    )}
                </div>
            </form>
        </SettingsLayout>
    );
}
