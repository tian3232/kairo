import { Head } from '@inertiajs/react';
import { Moon } from 'lucide-react';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    return (
        <SettingsLayout>
            <Head title="Apariencia - Kairo" />

            <div className="space-y-8">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Apariencia</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Personaliza la apariencia de la plataforma
                    </p>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Moon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Modo oscuro</p>
                        <p className="text-xs text-muted-foreground">Kairo siempre usa el tema oscuro para la mejor experiencia visual.</p>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
