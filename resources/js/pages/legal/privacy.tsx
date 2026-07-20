import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { ArrowLeft, Lock } from 'lucide-react';

function LegalLayout({ title, icon: Icon, lastUpdated, children }: { title: string; icon: typeof Lock; lastUpdated: string; children: React.ReactNode }) {
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

export default function PrivacyPolicy() {
    return (
        <LegalLayout title="Política de Privacidad" icon={Lock} lastUpdated="19 de julio de 2026">
            <h2 className="text-lg font-semibold text-foreground">1. Información que Recopilamos</h2>
            <p>Cuando utilizas Kairo, podemos recopilar los siguientes tipos de información:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Información de cuenta:</strong> nombre de usuario, correo electrónico, contraseña (encriptada), avatar y biografía.</li>
                <li><strong className="text-foreground">Información de perfil:</strong> país, preferencias de visualización y configuración de privacidad.</li>
                <li><strong className="text-foreground">Actividad en la plataforma:</strong> animes favoritos, listas, historial de visualización, comentarios y calificaciones.</li>
                <li><strong className="text-foreground">Datos de sesión:</strong> direcciones IP, tipo de navegador y sistema operativo.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">2. Uso de la Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Proporcionar y mejorar el Servicio.</li>
                <li>Personalizar tu experiencia de usuario.</li>
                <li>Enviarte notificaciones relevantes sobre actividad en tu cuenta.</li>
                <li>Garantizar la seguridad de la plataforma y prevenir abusos.</li>
                <li>Cumplir con obligaciones legales cuando sea necesario.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">3. Compartir Información</h2>
            <p>
                No vendemos ni compartimos tu información personal con terceros para fines de marketing.
                Podemos compartir información limitada en los siguientes casos:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Con tu consentimiento explícito.</li>
                <li>Cuando sea requerido por ley o por orden judicial.</li>
                <li>Con proveedores de servicios que nos ayudan a operar la plataforma (hosting, análisis), bajo acuerdos de confidencialidad.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">4. Información Visible a Otros Usuarios</h2>
            <p>Cierta información de tu perfil es visible por defecto a otros usuarios:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Nombre de usuario y nombre para mostrar.</li>
                <li>Avatar y biografía.</li>
                <li>Comentarios públicos.</li>
            </ul>
            <p>
                Puedes controlar la visibilidad de tu actividad, favoritos, listas y amigos desde la
                pestaña de <strong className="text-foreground">Privacidad</strong> en tu perfil.
            </p>

            <h2 className="text-lg font-semibold text-foreground">5. Seguridad de los Datos</h2>
            <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información
                contra acceso no autorizado, alteración, divulgación o destrucción. Estas incluyen:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Encriptación de contraseñas con bcrypt.</li>
                <li>Comunicación cifrada mediante HTTPS.</li>
                <li>Sesiones seguras con regeneración de tokens CSRF.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">6. Cookies y Tecnologías Similares</h2>
            <p>
                Kairo utiliza cookies de sesión para mantener tu autenticación y preferencias. No utilizamos
                cookies de rastreo de terceros con fines publicitarios.
            </p>

            <h2 className="text-lg font-semibold text-foreground">7. Retención de Datos</h2>
            <p>
                Conservamos tu información mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos
                personales serán eliminados de forma permanente dentro de un plazo razonable, excepto cuando
                la ley requiera conservar cierta información.
            </p>

            <h2 className="text-lg font-semibold text-foreground">8. Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Acceder a la información personal que tenemos sobre ti.</li>
                <li>Solicitar la corrección de datos inexactos.</li>
                <li>Solicitar la eliminación de tu cuenta y datos personales.</li>
                <li>Exportar tus datos en un formato legible.</li>
                <li>Oponerte al procesamiento de tu información para ciertos fines.</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">9. Menores de Edad</h2>
            <p>
                Kairo no está dirigido a menores de 13 años. No recopilamos intencionadamente información
                de menores. Si descubrimos que un menor ha proporcionado datos personales, los eliminaremos
                de inmediato.
            </p>

            <h2 className="text-lg font-semibold text-foreground">10. Cambios en esta Política</h2>
            <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Los cambios serán publicados
                en esta página con la fecha de última actualización. Te notificaremos de cambios significativos
                a través de la plataforma.
            </p>

            <h2 className="text-lg font-semibold text-foreground">11. Contacto</h2>
            <p>
                Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos a través de
                nuestro sistema de soporte dentro de la plataforma.
            </p>
        </LegalLayout>
    );
}
