<?php

namespace App\Http\Controllers;

use App\Models\HeroBanner;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\WatchProgress;
use App\Models\UserAnimeList;

class HomeController extends Controller
{
    public function index(): Response
    {
        $banners = HeroBanner::with('anime.genres')
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(fn ($banner) => [
                'id' => $banner->id,
                'duration_seconds' => $banner->duration_seconds,
                'anime' => [
                    'id' => $banner->anime->id,
                    'slug' => $banner->anime->slug,
                    'title' => $banner->anime->title,
                    'synopsis' => $banner->anime->synopsis,
                    'banner_image' => $banner->anime->banner_image,
                    'age_rating' => $banner->anime->age_rating,
                    'genres' => $banner->anime->genres->pluck('name'),
                ],
            ]);

        $continueWatching = [];
        if (auth()->check()) {
            $continueWatching = WatchProgress::where('user_id', auth()->id())
                ->where('completed', false)
                ->with(['episode.season.anime'])
                ->latest('updated_at')
                ->limit(20)
                ->get()
                ->map(fn ($progress) => [
                    'id' => $progress->episode->id,
                    'episode_number' => $progress->episode->number,
                    'season_number' => $progress->episode->season->number,
                    'episode_title' => $progress->episode->title,
                    'episode_synopsis' => $progress->episode->synopsis,
                    'release_date' => $progress->episode->release_date?->format('Y-m-d'),
                    'anime_title' => $progress->episode->season->anime->title,
                    'anime_slug' => $progress->episode->season->anime->slug,
                    'cover_image' => $progress->episode->thumbnail ?? $progress->episode->season->anime->cover_image,
                    'position_seconds' => $progress->position_seconds,
                    'duration_seconds' => $progress->episode->duration_seconds,
                    'progress_percent' => $progress->episode->duration_seconds > 0
                        ? round(($progress->position_seconds / $progress->episode->duration_seconds) * 100)
                        : 0,
                ]);
        }

        $newEpisodes = Episode::with('season.anime')
            ->whereHas('season.anime', fn ($q) => $q->where('is_active', true))
            ->latest('release_date')
            ->limit(20)
            ->get()
            ->map(fn ($episode) => [
                'id' => $episode->id,
                'episode_number' => $episode->number,
                'season_number' => $episode->season->number,
                'episode_title' => $episode->title,
                'episode_synopsis' => $episode->synopsis,
                'thumbnail' => $episode->thumbnail ?? $episode->season->anime->cover_image,
                'anime_title' => $episode->season->anime->title,
                'anime_slug' => $episode->season->anime->slug,
                'status' => $episode->season->anime->status,
                'type' => $episode->season->anime->type,
                'average_rating' => (float) $episode->season->anime->average_rating,
                'release_date' => $episode->release_date?->format('Y-m-d'),
            ]);

        $genreRows = Genre::has('animes')
            ->with(['animes' => fn ($q) => $q->where('is_active', true)
                ->select('id', 'slug', 'title', 'cover_image', 'status', 'type', 'average_rating')
                ->limit(20)])
            ->limit(8)
            ->get()
            ->map(fn ($genre) => [
                'title' => $genre->name,
                'animes' => $genre->animes->map(fn ($anime) => [
                    'id' => $anime->id,
                    'slug' => $anime->slug,
                    'title' => $anime->title,
                    'cover_image' => $anime->cover_image,
                    'status' => $anime->status,
                    'type' => $anime->type,
                    'synopsis' => null,
                    'average_rating' => (float) $anime->average_rating,
                ]),
            ]);

        $trending = Anime::where('is_active', true)
            ->select('id', 'slug', 'title', 'cover_image', 'status', 'type', 'average_rating', 'views_count')
            ->orderByDesc('views_count')
            ->limit(20)
            ->get()
            ->map(fn ($anime) => [
                'id' => $anime->id,
                'slug' => $anime->slug,
                'title' => $anime->title,
                'cover_image' => $anime->cover_image,
                'status' => $anime->status,
                'type' => $anime->type,
                'synopsis' => null,
                'average_rating' => (float) $anime->average_rating,
            ]);

        $userLists = [];
        $recommendations = [];
        if (auth()->check()) {
            $userId = auth()->id();
            $lists = UserAnimeList::where('user_id', $userId)->get();
            $userLists = [
                'watchlist' => $lists->where('type', 'watchlist')->pluck('anime_id')->values()->all(),
                'favorites' => $lists->where('type', 'favorite')->pluck('anime_id')->values()->all(),
            ];

            // RF-022: Personalized recommendations
            $interactedAnimeIds = UserAnimeList::where('user_id', $userId)->pluck('anime_id');
            $watchedAnimeIds = WatchProgress::where('user_id', $userId)
                ->join('episodes', 'watch_progress.episode_id', '=', 'episodes.id')
                ->join('seasons', 'episodes.season_id', '=', 'seasons.id')
                ->pluck('seasons.anime_id')
                ->unique();

            $allInteractedIds = $interactedAnimeIds->merge($watchedAnimeIds)->unique()->values();

            // Find preferred genres from favorites
            $preferredGenreIds = [];
            if ($lists->where('type', 'favorite')->isNotEmpty()) {
                $preferredGenreIds = \DB::table('anime_genre')
                    ->whereIn('anime_id', $lists->where('type', 'favorite')->pluck('anime_id'))
                    ->pluck('genre_id')
                    ->countBy()
                    ->sortDesc()
                    ->keys()
                    ->take(5)
                    ->all();
            }

            if (!empty($preferredGenreIds)) {
                $recommendations = Anime::where('is_active', true)
                    ->select('id', 'slug', 'title', 'cover_image', 'status', 'type', 'average_rating')
                    ->whereNotIn('id', $allInteractedIds)
                    ->whereHas('genres', fn ($q) => $q->whereIn('genres.id', $preferredGenreIds))
                    ->orderByDesc('average_rating')
                    ->limit(20)
                    ->get()
                    ->map(fn ($anime) => [
                        'id' => $anime->id,
                        'slug' => $anime->slug,
                        'title' => $anime->title,
                        'cover_image' => $anime->cover_image,
                        'status' => $anime->status,
                        'type' => $anime->type,
                        'synopsis' => null,
                        'average_rating' => (float) $anime->average_rating,
                    ]);
            } else {
                $recommendations = Anime::where('is_active', true)
                    ->select('id', 'slug', 'title', 'cover_image', 'status', 'type', 'average_rating')
                    ->whereNotIn('id', $allInteractedIds)
                    ->orderByDesc('average_rating')
                    ->limit(20)
                    ->get()
                    ->map(fn ($anime) => [
                        'id' => $anime->id,
                        'slug' => $anime->slug,
                        'title' => $anime->title,
                        'cover_image' => $anime->cover_image,
                        'status' => $anime->status,
                        'type' => $anime->type,
                        'synopsis' => null,
                        'average_rating' => (float) $anime->average_rating,
                    ]);
            }
        }

        return Inertia::render('home', [
            'heroBanners' => $banners,
            'trending' => $trending,
            'newEpisodes' => $newEpisodes,
            'genreRows' => $genreRows,
            'continueWatching' => $continueWatching,
            'recommendations' => $recommendations,
            'userLists' => $userLists,
        ]);
    }
}
