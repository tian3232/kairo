<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SessionController extends Controller
{
    public function index()
    {
        $currentId = session()->getId();

        $sessions = DB::table('sessions')
            ->where('user_id', auth()->id())
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($session) use ($currentId) {
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'device' => $this->parseDevice($session->user_agent),
                    'browser' => $this->parseBrowser($session->user_agent),
                    'last_activity' => $session->last_activity,
                    'is_current' => $session->id === $currentId,
                ];
            });

        return Inertia::render('settings/sessions', [
            'sessions' => $sessions,
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $deleted = DB::table('sessions')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->delete();

        if (!$deleted) {
            return back()->withErrors(['session' => 'No se pudo cerrar la sesión.']);
        }

        return back()->with('success', 'Sesión cerrada correctamente.');
    }

    private function parseDevice(?string $ua): string
    {
        if (!$ua) return 'Desconocido';
        if (preg_match('/windows nt/i', $ua)) return 'Windows';
        if (preg_match('/macintosh|mac os x/i', $ua)) return 'macOS';
        if (preg_match('/iphone/i', $ua)) return 'iPhone';
        if (preg_match('/ipad/i', $ua)) return 'iPad';
        if (preg_match('/android/i', $ua)) return 'Android';
        if (preg_match('/linux/i', $ua)) return 'Linux';
        return 'Dispositivo';
    }

    private function parseBrowser(?string $ua): string
    {
        if (!$ua) return 'Navegador desconocido';
        if (preg_match('/edg\//i', $ua)) return 'Edge';
        if (preg_match('/opr\//i', $ua) || preg_match('/opera/i', $ua)) return 'Opera';
        if (preg_match('/firefox\//i', $ua)) return 'Firefox';
        if (preg_match('/chrome\//i', $ua) && !preg_match('/edg\//i', $ua)) return 'Chrome';
        if (preg_match('/safari\//i', $ua) && !preg_match('/chrome\//i', $ua)) return 'Safari';
        return 'Navegador';
    }
}
