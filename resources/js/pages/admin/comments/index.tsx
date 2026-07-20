import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { ExternalLink } from 'lucide-react';

interface Comment {
    id: number;
    body: string;
    is_visible: boolean;
    created_at: string;
    user: { name: string } | null;
    anime: { title: string; slug: string } | null;
    episode: { number: number; title: string | null; season: { anime: { title: string; slug: string } | null } | null } | null;
    profileUser: { id: number; name: string; username: string } | null;
}

interface PaginatedComments {
    data: Comment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

function resolveAnime(comment: Comment) {
    return comment.anime ?? comment.episode?.season?.anime ?? null;
}

function getCommentUrl(comment: Comment): string | null {
    const anime = resolveAnime(comment);
    if (anime) return `/anime/${anime.slug}`;
    if (comment.profileUser) return `/perfil/${comment.profileUser.id}`;
    return null;
}

function getCommentLocation(comment: Comment): string {
    const anime = resolveAnime(comment);
    if (anime) {
        if (comment.episode) {
            const epLabel = comment.episode.title ?? `Ep. ${comment.episode.number}`;
            return `${anime.title} — ${epLabel}`;
        }
        return anime.title;
    }
    if (comment.profileUser) return `Perfil de ${comment.profileUser.name}`;
    return '—';
}

export default function CommentsIndex({ comments, filters }: { comments: PaginatedComments; filters: { status?: string } }) {
    const handleDelete = (comment: Comment) => {
        if (!confirm('¿Eliminar este comentario? Esta acción no se puede deshacer.')) return;
        router.delete(`/admin/comments/${comment.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Comentarios - Kairo Admin" />

            <h1 className="mb-8 text-2xl font-bold text-foreground">Moderación de Comentarios</h1>

            <form method="get" className="mb-6 flex items-center gap-3">
                <select
                    name="status"
                    defaultValue={filters.status ?? ''}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                    <option value="">Todos</option>
                    <option value="visible">Visibles</option>
                    <option value="hidden">Ocultos</option>
                </select>
                <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
                    Filtrar
                </button>
                {(filters.status) && (
                    <Link href="/admin/comments" className="text-sm text-muted-foreground hover:text-foreground">
                        Limpiar
                    </Link>
                )}
            </form>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comentario</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ubicación</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.data.map((comment) => {
                            const url = getCommentUrl(comment);
                            const location = getCommentLocation(comment);

                            return (
                                <tr key={comment.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-foreground">{comment.user?.name ?? 'Eliminado'}</td>
                                    <td className="px-4 py-3 text-foreground max-w-xs truncate">{comment.body}</td>
                                    <td className="px-4 py-3">
                                        {url ? (
                                            <Link
                                                href={url}
                                                target="_blank"
                                                className="inline-flex items-center gap-1.5 text-primary hover:underline"
                                            >
                                                <span className="max-w-[180px] truncate">{location}</span>
                                                <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(comment.created_at).toLocaleDateString('es-ES')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            comment.is_visible ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {comment.is_visible ? 'Visible' : 'Oculto'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => router.post(`/admin/comments/${comment.id}/toggle-visibility`)}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                {comment.is_visible ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                            <button onClick={() => handleDelete(comment)} className="text-xs text-destructive hover:underline">
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {comments.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Página {comments.current_page} de {comments.last_page} ({comments.total} comentarios)
                    </span>
                    <div className="flex gap-2">
                        {comments.current_page > 1 && (
                            <a href={`?page=${comments.current_page - 1}&status=${filters.status ?? ''}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Anterior
                            </a>
                        )}
                        {comments.current_page < comments.last_page && (
                            <a href={`?page=${comments.current_page + 1}&status=${filters.status ?? ''}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Siguiente
                            </a>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
