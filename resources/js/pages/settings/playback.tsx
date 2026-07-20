import { Head, useForm, usePage } from '@inertiajs/react';
import SettingsLayout from '@/layouts/settings/layout';
import { Check } from 'lucide-react';

interface Preferences {
    autoplay: boolean;
    auto_skip_intro: boolean;
    auto_skip_credits: boolean;
    autoplay_countdown: number;
    quality: string;
    audio_language: string;
    subtitle_language: string;
    playback_speed: string | number;
    remember_volume: boolean;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="flex cursor-pointer items-center justify-between rounded-lg bg-muted p-4">
            <span className="text-sm text-foreground">{label}</span>
            <div
                onClick={onChange}
                className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
            >
                <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary-foreground transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
            </div>
        </label>
    );
}

export default function PlaybackSettings({ preferences }: { preferences: Preferences }) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const { data, setData, put, processing, recentlySuccessful } = useForm({
        autoplay: preferences.autoplay,
        auto_skip_intro: preferences.auto_skip_intro,
        auto_skip_credits: preferences.auto_skip_credits,
        autoplay_countdown: preferences.autoplay_countdown,
        quality: preferences.quality,
        audio_language: preferences.audio_language,
        subtitle_language: preferences.subtitle_language,
        playback_speed: String(preferences.playback_speed),
        remember_volume: preferences.remember_volume,
    });

    const submit = () => put(route('playback.update'));

    return (
        <SettingsLayout>
            <Head title="Reproducción - Kairo" />

            <div className="space-y-8">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Reproducción</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Personaliza el comportamiento del reproductor
                    </p>
                </div>

                {flash?.status && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-500">
                        <Check className="h-4 w-4" /> {flash.status}
                    </div>
                )}

                <div className="space-y-3">
                    <Toggle
                        label="Reproducción automática del siguiente episodio"
                        checked={data.autoplay}
                        onChange={() => setData('autoplay', !data.autoplay)}
                    />
                    <Toggle
                        label="Saltar introducción automáticamente"
                        checked={data.auto_skip_intro}
                        onChange={() => setData('auto_skip_intro', !data.auto_skip_intro)}
                    />
                    <Toggle
                        label="Saltar créditos finales automáticamente"
                        checked={data.auto_skip_credits}
                        onChange={() => setData('auto_skip_credits', !data.auto_skip_credits)}
                    />
                    <Toggle
                        label="Recordar volumen entre sesiones"
                        checked={data.remember_volume}
                        onChange={() => setData('remember_volume', !data.remember_volume)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Tiempo de espera</label>
                        <select
                            value={data.autoplay_countdown}
                            onChange={(e) => setData('autoplay_countdown', Number(e.target.value))}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                            {[5, 8, 10, 15].map((s) => (
                                <option key={s} value={s}>{s} segundos</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Calidad de vídeo</label>
                        <select
                            value={data.quality}
                            onChange={(e) => setData('quality', e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                            <option value="auto">Automática</option>
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Idioma de audio</label>
                        <select
                            value={data.audio_language}
                            onChange={(e) => setData('audio_language', e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                            <option value="es">Español</option>
                            <option value="en">Inglés</option>
                            <option value="ja">Japonés</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Subtítulos</label>
                        <select
                            value={data.subtitle_language}
                            onChange={(e) => setData('subtitle_language', e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                            <option value="none">Ninguno</option>
                            <option value="es">Español</option>
                            <option value="en">Inglés</option>
                            <option value="ja">Japonés</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Velocidad de reproducción</label>
                        <select
                            value={data.playback_speed}
                            onChange={(e) => setData('playback_speed', e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                            {['0.50', '0.75', '1.00', '1.25', '1.50', '2.00'].map((s) => (
                                <option key={s} value={s}>{s}x</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={submit}
                        disabled={processing}
                        className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : 'Guardar preferencias'}
                    </button>

                    {recentlySuccessful && (
                        <span className="flex items-center gap-1.5 text-sm text-green-500">
                            <Check className="h-4 w-4" /> Guardado
                        </span>
                    )}
                </div>
            </div>
        </SettingsLayout>
    );
}
