import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { imageUrl } from '@/lib/image-url';
import { Link } from '@inertiajs/react';

interface ReportUser {
    id: number;
    name: string;
    username?: string;
    avatar: string | null;
}

interface ReportComment {
    id: number;
    body: string;
    user: ReportUser;
    anime: { id: number; title: string } | null;
}

interface Report {
    id: number;
    reason: string;
    description: string | null;
    status: string;
    created_at: string;
    user: ReportUser;
    comment: ReportComment;
}

interface PaginatedReports {
    data: Report[];
    current_page: number;
    last_page: number;
    total: number;
}

interface ReportsProps {
    reports: PaginatedReports;
}

export default function CommentReports({ reports }: ReportsProps) {
    function handleResolve(id: number) {
        if (!confirm('¿Ocultar comentario y resolver reporte?')) return;
        router.post(route('admin.comments.resolve-report', id));
    }

    function handleDismiss(id: number) {
        if (!confirm('¿Descartar este reporte?')) return;
        router.post(route('admin.comments.dismiss-report', id));
    }

    return (
        <AdminLayout>
            <Head title="Reportes de comentarios - Admin" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Reportes de comentarios ({reports.total})</h1>
                    <Link href={route('admin.comments.index')} className="text-sm text-primary hover:underline">
                        Ver todos los comentarios
                    </Link>
                </div>

                {reports.data.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No hay reportes pendientes</p>
                ) : (
                    <div className="space-y-3">
                        {reports.data.map((report) => (
                            <div key={report.id} className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-500">
                                                {report.reason}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Reportado por <strong>{report.user.display_name ?? report.user.name}</strong>
                                            </span>
                                            <span className="text-xs text-muted-foreground/60">
                                                {new Date(report.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {report.description && (
                                            <p className="text-xs text-muted-foreground mb-2 italic">"{report.description}"</p>
                                        )}

                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted">
                                                    {report.comment.user.avatar ? (
                                                        <img src={imageUrl(report.comment.user.avatar)} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-muted-foreground">
                                                            {(report.comment.user.display_name ?? report.comment.user.name).charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-foreground">{report.comment.user.display_name ?? report.comment.user.name}</span>
                                                {report.comment.anime && (
                                                    <span className="text-xs text-muted-foreground">en {report.comment.anime.title}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-foreground/90">{report.comment.body}</p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() => handleResolve(report.id)}
                                            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                                        >
                                            Ocultar y resolver
                                        </button>
                                        <button
                                            onClick={() => handleDismiss(report.id)}
                                            className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                                        >
                                            Descartar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {reports.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: reports.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => router.get(route('admin.comments.reports'), { page }, { preserveState: true })}
                                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                                    page === reports.current_page
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
