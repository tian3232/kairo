import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { ArrowLeft, Shield } from 'lucide-react';

function LegalLayout({ title, icon: Icon, lastUpdated, children }: { title: string; icon: typeof Shield; lastUpdated: string; children: React.ReactNode }) {
    return (
        <SiteLayout>
            <Head title={`${title} - Kairo`} />

            <div className="pt-24 px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/"
                        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>

                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(217,91%,60%)]/10">
                            <Icon className="h-5 w-5 text-[hsl(217,91%,60%)]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
                            <p className="text-xs text-muted-foreground">Última actualización: {lastUpdated}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
                        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/70">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}

export default function DMCA() {
    return (
        <LegalLayout title="Política DMCA" icon={Shield} lastUpdated="19 de julio de 2026">
            <h2 className="text-lg font-semibold text-foreground">Acerca de DMCA</h2>
            <p>
                Kairo respeta los derechos de propiedad intelectual de terceros y cumple con las disposiciones
                de la Digital Millennium Copyright Act (DMCA). Esta política describe cómo proceder si
                consideras que tu contenido ha sido utilizado sin autorización en nuestra plataforma.
            </p>

            <h2 className="text-lg font-semibold text-foreground">Reporte de Infracción</h2>
            <p>
                Si eres propietario de los derechos de autor o estás autorizado para actuar en nombre de
                un propietario de derechos de autor, y consideras que un contenido disponible en Kairo
                infringe tus derechos, puedes enviarnos un reporte con la siguiente información:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Identificación del contenido protegido por derechos de autor que presuntamente ha sido infringido.</li>
                <li>Identificación del material que se considera infractor, con información suficiente para localizarlo en la plataforma.</li>
                <li>Tus datos de contacto: nombre, dirección, número de teléfono y correo electrónico.</li>
                <li>Una declaración de buena fe de que el uso del contenido no está autorizado por el propietario de los derechos, su agente o la ley.</li>
                <li>Una declaración, bajo juramento, de que la información del reporte es exacta y que eres el propietario de los derechos o que estás autorizado para actuar en su nombre.</li>
                <li>Firma física o electrónica del propietario de los derechos o de la persona autorizada para actuar en su nombre.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">Proceso de Revisión</h2>
            <p>Una vez recibido un reporte válido:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Revisaremos el reporte dentro de los 3 días hábiles siguientes.</li>
                <li>Podemos contactarte para solicitar información adicional.</li>
                <li>Si el reporte es válido, procederemos a retirar o deshabilitar el acceso al contenido infractor.</li>
                <li>Notificaremos al usuario afectado sobre la acción tomada y le proporcionaremos información sobre cómo presentar una contra-notificación.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">Contra-Notificación</h2>
            <p>
                Si crees que tu contenido fue retirado por error o por identificación errónea, puedes
                enviarnos una contra-notificación que incluya:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Tu nombre, dirección y firma física o electrónica.</li>
                <li>Identificación del contenido que fue removido y la ubicación donde aparecía antes de ser removido.</li>
                <li>Una declaración, bajo juramento, de que el retiro fue por error o identificación errónea.</li>
                <li>Tus datos de contacto y consentimiento para someterte a la jurisdicción del tribunal correspondiente.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">Usuarios Reincidentes</h2>
            <p>
                Kairo se reserva el derecho de suspender permanentemente las cuentas de usuarios que
                sean infractores reincidentes de derechos de autor.
            </p>

            <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
            <p>
                Los reportes DMCA deben enviarse a través de nuestro sistema de soporte dentro de la plataforma,
                indicando "DMCA" en el asunto del reporte.
            </p>
        </LegalLayout>
    );
}
