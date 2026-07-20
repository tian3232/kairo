<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount(['watchProgress' => function ($q) {
            $q->where('completed', true);
        }]);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(20);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only('search', 'role'),
        ]);
    }

    public function toggleRole(User $user)
    {
        $old = ['role' => $user->role];
        $newRole = $user->role === 'admin' ? 'user' : 'admin';
        $user->update(['role' => $newRole]);

        AuditLog::log('user.role_changed', $user, $old, ['role' => $newRole]);

        return redirect()->back()->with('success', "Rol de {$user->name} cambiado a {$newRole}.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        $old = $user->toArray();
        AuditLog::log('user.deleted', $user, $old, null);
        $user->delete();

        return redirect()->back()->with('success', 'Usuario eliminado.');
    }
}
