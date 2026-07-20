import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { ArrowLeft, Shield, Lock, FileText } from 'lucide-react';

interface LegalLayoutProps {
    title: string;
    icon: typeof Shield;
    lastUpdated: string;
    children: React.ReactNode;
}

function LegalLayout({ title, icon: Icon, lastUpdated, children }: LegalLayoutProps) {
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

export default function TermsOfService() {
    return (
        <LegalLayout title="Términos de Servicio" icon={FileText} lastUpdated="19 de julio de 2026">
            <h2 className="text-lg font-semibold text-foreground">1. Aceptación de los Términos</h2>
            <p>
                Al acceder y utilizar Kairo ("el Servicio"), aceptas estar sujeto a estos Términos de Servicio.
                Si no estás de acuerdo con alguno de estos términos, no utilices el Servicio.
            </p>

            <h2 className="text-lg font-semibold text-foreground">2. Descripción del Servicio</h2>
            <p>
                Kairo es una plataforma de streaming de anime que permite a los usuarios explorar, organizar y
                disfrutar de contenido de anime. El Servicio incluye funciones como listas personalizadas, sistema
                de comentarios, calificaciones, chat en tiempo real y seguimiento de actividad.
            </p>

            <h2 className="text-lg font-semibold text-foreground">3. Cuentas de Usuario</h2>
            <p>
                Para acceder a ciertas funcionalidades, debes crear una cuenta. Eres responsable de mantener la
                confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Debes tener al menos 13 años para crear una cuenta.</li>
                <li>Un solo usuario no puede poseer múltiples cuentas.</li>
                <li>No compartas tus credenciales de acceso con terceros.</li>
                <li>Kairo se reserva el derecho de suspender cuentas que violen estos términos.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">4. Contenido del Usuario</h2>
            <p>
                Al publicar comentarios, imágenes o cualquier otro contenido en Kairo, otorgas a la plataforma
                una licencia no exclusiva para mostrar, distribuir y promocionar dicho contenido dentro del Servicio.
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>No publiques contenido ilegal, ofensivo, difamatorio o que infrinja derechos de terceros.</li>
                <li>No publiques spam, publicidad no autorizada o contenido engañoso.</li>
                <li>Kairo se reserva el derecho de eliminar cualquier contenido que viole estas normas.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">5. Propiedad Intelectual</h2>
            <p>
                Todo el contenido de Kairo, incluyendo pero no limitado a logos, diseños, código fuente y
                funcionalidades, está protegido por leyes de propiedad intelectual. No está permitido copiar,
                modificar o distribuir el contenido sin autorización expresa.
            </p>

            <h2 className="text-lg font-semibold text-foreground">6. Uso Aceptable</h2>
            <p>Al utilizar el Servicio, te comprometes a no:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Utilizar bots, scripts o automatizaciones para interactuar con el Servicio.</li>
                <li>Intentar acceder a áreas restringidas sin autorización.</li>
                <li>Realizar ingeniería inversa sobre el código fuente de la plataforma.</li>
                <li>Interferir con el funcionamiento normal del Servicio.</li>
                <li>Usar el Servicio para distribuir malware o contenido malicioso.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">7. Limitación de Responsabilidad</h2>
            <p>
                Kairo se proporciontal cual está, sin garantías de ningún tipo. No garantizamos que el Servicio
                estará disponible de forma ininterrumpida o libre de errores. No seremos responsables por daños
                directos, indirectos o consecuentes derivados del uso del Servicio.
            </p>

            <h2 className="text-lg font-semibold text-foreground">8. Terminación</h2>
            <p>
                Kairo se reserva el derecho de suspender o terminar tu acceso al Servicio en cualquier momento,
                con o sin previo aviso, por conducta que consideremos que viola estos términos o que es perjudicial
                para otros usuarios o para el Servicio.
            </p>

            <h2 className="text-lg font-semibold text-foreground">9. Cambios en los Términos</h2>
            <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán
                publicados en esta página con la fecha de última actualización. El uso continuado del Servicio
                después de los cambios constituye la aceptación de los nuevos términos.
            </p>

            <h2 className="text-lg font-semibold text-foreground">10. Contacto</h2>
            <p>
                Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos a través de
                nuestro sistema de soporte dentro de la plataforma.
            </p>
        </LegalLayout>
    );
}
