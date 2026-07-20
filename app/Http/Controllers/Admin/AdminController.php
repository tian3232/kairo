<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_animes' => \App\Models\Anime::count(),
            'total_users' => \App\Models\User::count(),
            'total_episodes' => \App\Models\Episode::count(),
            'total_views' => \App\Models\WatchProgress::where('completed', true)->count(),
            'recent_animes' => \App\Models\Anime::latest()->take(5)->get(['id', 'title', 'created_at']),
            'recent_users' => \App\Models\User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']),
        ];

        return Inertia::render('admin/dashboard', ['stats' => $stats]);
    }
}
