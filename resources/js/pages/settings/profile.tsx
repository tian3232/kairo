import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { AlertTriangle, Camera, Check, Loader2, Trash2, X } from 'lucide-react';
import SettingsLayout from '@/layouts/settings/layout';
import InputError from '@/components/input-error';
import { imageUrl } from '@/lib/image-url';

const COUNTRIES = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
    'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México', 'Nicaragua',
    'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana',
    'Uruguay', 'Venezuela', 'España', 'Estados Unidos', 'Japón', 'Otro',
];

export default function ProfileSettings() {
    const { auth, status } = usePage().props as {
        auth: { user: { id: number; name: string; username: string; display_name: string | null; email: string; avatar: string | null; bio: string | null; country: string | null } };
        status?: string;
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPath, setAvatarPath] = useState(auth.user.avatar ?? '');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { data: deleteData, setData: setDeleteData, delete: destroyAccount, processing: deleting, errors: deleteErrors, reset: resetDelete } = useForm({ password: '' });

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        display_name: auth.user.display_name ?? auth.user.name,
        username: auth.user.username,
        email: auth.user.email,
        avatar: auth.user.avatar ?? '',
        bio: auth.user.bio ?? '',
        country: auth.user.country ?? '',
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError('');
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

            const response = await fetch('/settings/profile/avatar', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al subir imagen');
            }

            const result = await response.json();
            setAvatarPath(result.avatar);
            setData('avatar', result.avatar);
        } catch (err: any) {
            setUploadError(err.message || 'Error al subir imagen');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const currentAvatar = avatarPath ? imageUrl(avatarPath) : null;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/profile');
    };

    const displayName = data.display_name || data.username;

    return (
        <SettingsLayout>
            <Head title="Perfil - Kairo" />

            <form onSubmit={submit} className="space-y-8">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Tu información visible en la plataforma</p>
                </div>

                {(status || recentlySuccessful) && (
                    <div className="rounded-xl bg-[hsl(217,91%,60%)]/10 border border-[hsl(217,91%,60%)]/20 px-4 py-2 text-sm text-[hsl(217,91%,60%)]">
                        {status || 'Guardado correctamente'}
                    </div>
                )}

                <div className="flex flex-col items-start gap-6 sm:flex-row">
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="relative h-24 w-24 overflow-hidden rounded-full bg-muted border-2 border-[hsl(217,91%,60%)]/30 ring-2 ring-[hsl(217,91%,60%)]/20 transition hover:border-[hsl(217,91%,60%)]/60 focus:outline-none"
                        >
                            {currentAvatar ? (
                                <img key={avatarPath} src={currentAvatar} alt={displayName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                                {uploading ? (
                                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                                ) : (
                                    <Camera className="h-5 w-5 text-white" />
                                )}
                            </div>
                        </button>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">Nombre de usuario</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                                    className="w-full rounded-xl border-border/60 bg-muted/30 pl-7 pr-3 py-2 text-sm text-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Identificador único. Solo minúsculas, números, puntos y guiones bajos</p>
                            <InputError message={errors.username} />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">Nombre para mostrar</label>
                            <input
                                type="text"
                                value={data.display_name}
                                onChange={(e) => setData('display_name', e.target.value)}
                                placeholder={data.username}
                                maxLength={50}
                                className="rounded-xl border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Lo que ven otros en comentarios y perfil</p>
                            <InputError message={errors.display_name} />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">Correo electrónico</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="rounded-xl border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>
                </div>

                {uploadError && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-500">{uploadError}</div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Biografía</label>
                    <textarea
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Cuéntanos sobre ti..."
                        className="rounded-xl border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                    />
                    <div className="flex justify-between">
                        <InputError message={errors.bio} />
                        <span className="text-xs text-muted-foreground">{data.bio.length}/500</span>
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">País</label>
                    <select
                        value={data.country}
                        onChange={(e) => setData('country', e.target.value)}
                        className="rounded-xl border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[hsl(217,91%,60%)]/60 focus:ring-1 focus:ring-[hsl(217,91%,60%)]/20 focus:outline-none"
                    >
                        <option value="">Selecciona tu país</option>
                        {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <InputError message={errors.country} />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_hsl(217,91%,60%,0.3)] transition hover:shadow-[0_0_24px_hsl(217,91%,60%,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : 'Guardar cambios'}
                    </button>

                    {recentlySuccessful && (
                        <span className="flex items-center gap-1.5 text-sm text-green-500">
                            <Check className="h-4 w-4" /> Guardado
                        </span>
                    )}
                </div>
            </form>

            <div className="mt-10 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-foreground">Eliminar cuenta</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Una vez eliminada tu cuenta, se borrará permanentemente toda tu información,
                            incluyendo tu progreso, listas y comentarios. Esta acción es irreversible.
                        </p>
                        <button
                            type="button"
                            onClick={() => { resetDelete('password'); setShowDeleteModal(true); }}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4" /> Eliminar mi cuenta
                        </button>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => !deleting && setShowDeleteModal(false)}>
                    <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/95 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Confirmar eliminación</h3>
                            <button type="button" onClick={() => setShowDeleteModal(false)} disabled={deleting} className="text-muted-foreground transition hover:text-foreground disabled:opacity-50">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Esta acción es <span className="font-semibold text-red-500">permanente e irreversible</span>.
                            Para continuar, ingresa tu contraseña.
                        </p>

                        <div className="mt-4 grid gap-2">
                            <label className="text-sm font-medium text-foreground">Contraseña</label>
                            <input
                                type="password"
                                value={deleteData.password}
                                onChange={(e) => setDeleteData('password', e.target.value)}
                                autoFocus
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-red-500 focus:outline-none"
                                placeholder="Tu contraseña"
                            />
                            <InputError message={deleteErrors.password} />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => destroyAccount(route('profile.destroy'), { preserveScroll: true })}
                                disabled={deleting || !deleteData.password}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-red-500 hover:to-red-400 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" /> {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SettingsLayout>
    );
}
