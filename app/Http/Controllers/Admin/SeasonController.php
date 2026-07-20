<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Anime;
use App\Models\Season;
use App\Models\Episode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SeasonController extends Controller
{
    public function index(Anime $anime)
    {
        $anime->load(['seasons.episodes.subtitles']);

        return Inertia::render('admin/seasons/index', ['anime' => $anime]);
    }

    public function store(Request $request, Anime $anime)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:season,ova,special',
            'number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:255',
        ]);

        $validated['order'] = $anime->seasons()->max('order') + 1;

        $season = $anime->seasons()->create($validated);

        AuditLog::log('season.created', $season, null, $season->toArray());

        return redirect()->back()->with('success', 'Temporada creada.');
    }

    public function update(Request $request, Season $season)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:season,ova,special',
            'number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:255',
        ]);

        $old = $season->toArray();
        $season->update($validated);

        AuditLog::log('season.updated', $season, $old, $season->fresh()->toArray());

        return redirect()->back()->with('success', 'Temporada actualizada.');
    }

    public function destroy(Season $season)
    {
        $old = $season->toArray();
        AuditLog::log('season.deleted', $season, $old, null);
        $season->delete();

        return redirect()->back()->with('success', 'Temporada eliminada.');
    }

    public function storeEpisode(Request $request, Season $season)
    {
        $validated = $request->validate([
            'number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:255',
            'synopsis' => 'nullable|string',
            'duration_seconds' => 'nullable|integer|min:0',
            'video_path' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|string|max:500',
            'intro_start' => 'nullable|integer|min:0',
            'intro_end' => 'nullable|integer|min:0',
            'credits_start' => 'nullable|integer|min:0',
        ]);

        $episode = $season->episodes()->create($validated);

        AuditLog::log('episode.created', $episode, null, $episode->toArray());

        $season->load('anime');
        $favoriteUserIds = \App\Models\UserAnimeList::where('anime_id', $season->anime_id)
            ->where('type', 'favorite')
            ->pluck('user_id');

        foreach ($favoriteUserIds as $userId) {
            \App\Models\Notification::create([
                'user_id' => $userId,
                'type' => 'new_episode',
                'title' => 'Nuevo episodio: ' . $season->anime->title,
                'body' => 'S' . $season->number . 'E' . $episode->number . ($episode->title ? ' — ' . $episode->title : ''),
                'link' => route('anime.show', $season->anime->slug),
            ]);
        }

        return redirect()->back()->with('success', 'Episodio creado.');
    }

    public function updateEpisode(Request $request, Episode $episode)
    {
        $validated = $request->validate([
            'number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:255',
            'synopsis' => 'nullable|string',
            'duration_seconds' => 'nullable|integer|min:0',
            'video_path' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|string|max:500',
            'intro_start' => 'nullable|integer|min:0',
            'intro_end' => 'nullable|integer|min:0',
            'credits_start' => 'nullable|integer|min:0',
        ]);

        $old = $episode->toArray();
        $episode->update($validated);

        AuditLog::log('episode.updated', $episode, $old, $episode->fresh()->toArray());

        return redirect()->back()->with('success', 'Episodio actualizado.');
    }

    public function destroyEpisode(Episode $episode)
    {
        $old = $episode->toArray();
        AuditLog::log('episode.deleted', $episode, $old, null);
        $episode->delete();

        return redirect()->back()->with('success', 'Episodio eliminado.');
    }
}
