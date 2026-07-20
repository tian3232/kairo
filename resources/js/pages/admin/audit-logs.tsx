import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';

interface AuditLogEntry {
    id: number;
    user: { name: string } | null;
    auditable_type: string;
    auditable_id: number;
    action: string;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    created_at: string;
}

interface PaginatedLogs {
    data: AuditLogEntry[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function AuditLogs({ logs }: { logs: PaginatedLogs }) {
    const modelShortName = (type: string) => type.split('\\').pop() || type;

    return (
        <AdminLayout>
            <Head title="Audit Logs - Kairo Admin" />

            <h1 className="mb-8 text-2xl font-bold text-foreground">Registro de auditoría</h1>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acción</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Modelo</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    No hay registros de auditoría aún.
                                </td>
                            </tr>
                        ) : (
                            logs.data.map((log) => (
                                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                                    <td className="px-4 py-3 text-foreground">
                                        {new Date(log.created_at).toLocaleString('es-ES')}
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        {log.user?.name ?? 'Sistema'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {modelShortName(log.auditable_type)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        #{log.auditable_id}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {log.new_values && (
                                            <pre className="max-w-xs truncate text-xs">
                                                {JSON.stringify(log.new_values, null, 0)}
                                            </pre>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {logs.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Página {logs.current_page} de {logs.last_page} ({logs.total} registros)
                    </span>
                    <div className="flex gap-2">
                        {logs.current_page > 1 && (
                            <a href={`?page=${logs.current_page - 1}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Anterior
                            </a>
                        )}
                        {logs.current_page < logs.last_page && (
                            <a href={`?page=${logs.current_page + 1}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Siguiente
                            </a>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
