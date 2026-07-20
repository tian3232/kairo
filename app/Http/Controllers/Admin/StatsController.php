<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use App\Models\Comment;
use App\Models\Episode;
use App\Models\User;
use App\Models\WatchProgress;
use Inertia\Inertia;

class StatsController extends Controller
{
    public function index()
    {
        $stats = [
            'animes_by_status' => Anime::selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
            'animes_by_type' => Anime::selectRaw('type, count(*) as count')->groupBy('type')->pluck('count', 'type'),
            'total_users' => User::count(),
            'new_users_month' => User::where('created_at', '>=', now()->subMonth())->count(),
            'total_episodes' => Episode::count(),
            'total_views' => WatchProgress::where('completed', true)->count(),
            'views_today' => WatchProgress::where('updated_at', '>=', today())->count(),
            'total_comments' => Comment::count(),
            'hidden_comments' => Comment::where('is_visible', false)->count(),
            'top_animes' => Anime::select('animes.id', 'animes.title')
                ->selectRaw('(SELECT COUNT(*) FROM watch_progress wp JOIN episodes e ON wp.episode_id = e.id JOIN seasons s ON e.season_id = s.id WHERE s.anime_id = animes.id AND wp.completed = true) as views_count')
                ->orderByDesc('views_count')
                ->take(5)
                ->get(),
            'recent_activity' => \App\Models\AuditLog::with('user')
                ->latest()
                ->take(10)
                ->get(['id', 'user_id', 'action', 'auditable_type', 'auditable_id', 'created_at']),
        ];

        return Inertia::render('admin/stats/index', ['stats' => $stats]);
    }
}
