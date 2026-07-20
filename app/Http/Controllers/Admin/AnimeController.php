<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Anime;
use App\Models\Genre;
use App\Models\Studio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AnimeController extends Controller
{
    public function index(Request $request)
    {
        $query = Anime::with(['studio', 'genres']);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $animes = $query->latest()->paginate(15);

        return Inertia::render('admin/animes/index', [
            'animes' => $animes,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $genres = Genre::orderBy('name')->get(['id', 'name']);
        $studios = Studio::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/animes/create', [
            'genres' => $genres,
            'studios' => $studios,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'synopsis' => 'nullable|string',
            'type' => 'required|string|in:tv,ova,ona,movie,special',
            'status' => 'required|string|in:airing,finished,upcoming',
            'age_rating' => 'nullable|string|max:10',
            'release_year' => 'nullable|integer|min:1900|max:2100',
            'broadcast_season' => 'nullable|string|in:winter,spring,summer,fall',
            'broadcast_year' => 'nullable|integer|min:2000|max:2100',
            'studio_id' => 'nullable|exists:studios,id',
            'cover_image' => 'nullable|string|max:500',
            'banner_image' => 'nullable|string|max:500',
            'logo_image' => 'nullable|string|max:500',
            'trailer_url' => 'nullable|string|max:500',
            'genre_ids' => 'nullable|array',
            'genre_ids.*' => 'exists:genres,id',
        ]);

        $anime = Anime::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(5),
            'synopsis' => $validated['synopsis'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
            'age_rating' => $validated['age_rating'] ?? null,
            'release_year' => $validated['release_year'] ?? null,
            'broadcast_season' => $validated['broadcast_season'] ?? null,
            'broadcast_year' => $validated['broadcast_year'] ?? null,
            'studio_id' => $validated['studio_id'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
            'banner_image' => $validated['banner_image'] ?? null,
            'logo_image' => $validated['logo_image'] ?? null,
            'trailer_url' => $validated['trailer_url'] ?? null,
            'is_active' => true,
            'created_by' => auth()->id(),
        ]);

        if (!empty($validated['genre_ids'])) {
            $anime->genres()->sync($validated['genre_ids']);
        }

        AuditLog::log('anime.created', $anime, null, $anime->toArray());

        return redirect()->route('admin.animes.index')->with('success', 'Anime creado.');
    }

    public function edit(Anime $anime)
    {
        $anime->load('genres');
        $genres = Genre::orderBy('name')->get(['id', 'name']);
        $studios = Studio::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/animes/edit', [
            'anime' => $anime,
            'genres' => $genres,
            'studios' => $studios,
        ]);
    }

    public function update(Request $request, Anime $anime)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'synopsis' => 'nullable|string',
            'type' => 'required|string|in:tv,ova,ona,movie,special',
            'status' => 'required|string|in:airing,finished,upcoming',
            'age_rating' => 'nullable|string|max:10',
            'release_year' => 'nullable|integer|min:1900|max:2100',
            'broadcast_season' => 'nullable|string|in:winter,spring,summer,fall',
            'broadcast_year' => 'nullable|integer|min:2000|max:2100',
            'studio_id' => 'nullable|exists:studios,id',
            'cover_image' => 'nullable|string|max:500',
            'banner_image' => 'nullable|string|max:500',
            'logo_image' => 'nullable|string|max:500',
            'trailer_url' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'genre_ids' => 'nullable|array',
            'genre_ids.*' => 'exists:genres,id',
        ]);

        $old = $anime->toArray();
        $anime->update([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(5),
            'synopsis' => $validated['synopsis'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
            'age_rating' => $validated['age_rating'] ?? null,
            'release_year' => $validated['release_year'] ?? null,
            'broadcast_season' => $validated['broadcast_season'] ?? null,
            'broadcast_year' => $validated['broadcast_year'] ?? null,
            'studio_id' => $validated['studio_id'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
            'banner_image' => $validated['banner_image'] ?? null,
            'logo_image' => $validated['logo_image'] ?? null,
            'trailer_url' => $validated['trailer_url'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $anime->genres()->sync($validated['genre_ids'] ?? []);

        AuditLog::log('anime.updated', $anime, $old, $anime->fresh()->toArray());

        return redirect()->route('admin.animes.index')->with('success', 'Anime actualizado.');
    }

    public function destroy(Anime $anime)
    {
        $old = $anime->toArray();
        AuditLog::log('anime.deleted', $anime, $old, null);
        $anime->delete();

        return redirect()->route('admin.animes.index')->with('success', 'Anime eliminado.');
    }

    public function toggleActive(Anime $anime)
    {
        $old = ['is_active' => $anime->is_active];
        $anime->update(['is_active' => !$anime->is_active]);

        AuditLog::log('anime.toggled', $anime, $old, ['is_active' => $anime->is_active]);

        return redirect()->back()->with('success', $anime->is_active ? 'Anime activado.' : 'Anime desactivado.');
    }
}
