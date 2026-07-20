<?php

namespace App\Http\Controllers;

use App\Models\Anime;
use App\Models\Genre;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExploreController extends Controller
{
    public function index(Request $request)
    {
        $query = Anime::query()
            ->with(['genres', 'studio'])
            ->where('is_active', true);

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where('title', 'ilike', "%{$search}%");
        }

        if ($request->filled('genre')) {
            $query->whereHas('genres', fn ($q) => $q->where('slug', $request->input('genre')));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('year')) {
            $query->where('release_year', $request->input('year'));
        }

        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'rating' => $query->orderByDesc('average_rating'),
            'az' => $query->orderBy('title'),
            'views' => $query->orderByDesc('views_count'),
            default => $query->orderByDesc('release_year')->orderByDesc('created_at'),
        };

        $animes = $query->paginate(24)->withQueryString();

        $animes->getCollection()->transform(fn ($anime) => [
            'id' => $anime->id,
            'slug' => $anime->slug,
            'title' => $anime->title,
            'cover_image' => $anime->cover_image,
            'status' => $anime->status,
            'type' => $anime->type,
            'synopsis' => $anime->synopsis,
            'average_rating' => (float) $anime->average_rating,
        ]);

        $genres = Genre::orderBy('name')->get();

        $years = Anime::select('release_year')
            ->distinct()
            ->orderByDesc('release_year')
            ->pluck('release_year');

        $userLists = [];
        if ($request->user()) {
            $userLists = [
                'watchlist' => $request->user()->watchlist()->pluck('anime_id')->values()->all(),
                'favorites' => $request->user()->favorites()->pluck('anime_id')->values()->all(),
            ];
        }

        return Inertia::render('explore/index', [
            'animes' => $animes,
            'genres' => $genres,
            'years' => $years,
            'filters' => (object) $request->only(['q', 'genre', 'type', 'status', 'year', 'sort']),
            'userLists' => $userLists,
        ]);
    }
}
