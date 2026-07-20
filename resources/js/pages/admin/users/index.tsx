import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';

interface User {
    id: number;
    name: string;
    username: string;
    display_name: string | null;
    email: string;
    role: string;
    avatar: string | null;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function UsersIndex({ users, filters }: { users: PaginatedUsers; filters: { search?: string; role?: string } }) {
    const handleDelete = (user: User) => {
        if (!confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) return;
        router.delete(`/admin/users/${user.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Usuarios - Kairo Admin" />

            <h1 className="mb-8 text-2xl font-bold text-foreground">Usuarios</h1>

            <form method="get" className="mb-6 flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    name="search"
                    defaultValue={filters.search ?? ''}
                    placeholder="Buscar por nombre o email..."
                    className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                    name="role"
                    defaultValue={filters.role ?? ''}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                    <option value="">Todos los roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">Usuario</option>
                </select>
                <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
                    Filtrar
                </button>
            </form>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registro</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vistas</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user) => (
                            <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                                <td className="px-4 py-3 font-medium text-foreground">
                                    {user.name}
                                    <span className="block text-xs text-muted-foreground">@{user.username}</span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded px-2 py-1 text-xs font-medium ${
                                        user.role === 'admin' ? 'bg-primary/10 text-primary' :
                                        user.role === 'owner' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-muted text-muted-foreground'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{user.watch_progress_count}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-3">
                                        {user.role !== 'owner' && (
                                            <button
                                                onClick={() => router.post(`/admin/users/${user.id}/toggle-role`)}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                {user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(user)} className="text-xs text-destructive hover:underline">
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Página {users.current_page} de {users.last_page} ({users.total} usuarios)
                    </span>
                    <div className="flex gap-2">
                        {users.current_page > 1 && (
                            <a href={`?page=${users.current_page - 1}&search=${filters.search ?? ''}&role=${filters.role ?? ''}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Anterior
                            </a>
                        )}
                        {users.current_page < users.last_page && (
                            <a href={`?page=${users.current_page + 1}&search=${filters.search ?? ''}&role=${filters.role ?? ''}`} className="rounded border border-border px-3 py-1 hover:bg-muted">
                                Siguiente
                            </a>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
