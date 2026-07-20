<?php

namespace App\Http\Controllers;

use App\Models\Anime;
use App\Models\CommentLike;
use App\Models\UserAnimeList;
use Inertia\Inertia;
use Inertia\Response;

class AnimeController extends Controller
{
    public function show(Anime $anime): Response
    {
        $userId = auth()->id();

        $anime->load([
            'genres', 'studio', 'seasons.episodes',
            'characters',
            'comments' => fn ($q) => $q->where('is_visible', true)->whereNull('parent_id')
                ->with('user:id,name,username,avatar,role')
                ->withCount([
                    'likes as likes_count' => fn ($q) => $q->where('is_like', true),
                    'likes as dislikes_count' => fn ($q) => $q->where('is_like', false),
                    'replies as replies_count',
                ])
                ->with($userId ? ['likes as userLike' => fn ($q) => $q->where('user_id', $userId)->select('id', 'comment_id', 'is_like')] : [])
                ->latest(),
            'ratings' => fn ($q) => $q->with('user:id,name'),
        ]);

        $anime->load(['relatedAnimes', 'relatedFrom']);

        $relatedAnimes = $anime->relatedAnimes->merge($anime->relatedFrom)->unique('id')->take(6);

        $user = auth()->user();
        $inWatchlist = false;
        $inFavorites = false;
        $userRating = null;

        if ($user) {
            $userLists = UserAnimeList::where('user_id', $user->id)
                ->where('anime_id', $anime->id)
                ->pluck('type');
            $inWatchlist = $userLists->contains('watchlist');
            $inFavorites = $userLists->contains('favorite');
            $userRating = $anime->ratings->firstWhere('user_id', $user->id)?->score;
        }

        return Inertia::render('anime/show', [
            'anime' => [
                'id' => $anime->id,
                'slug' => $anime->slug,
                'title' => $anime->title,
                'synopsis' => $anime->synopsis,
                'type' => $anime->type,
                'status' => $anime->status,
                'age_rating' => $anime->age_rating,
                'release_year' => $anime->release_year,
                'banner_image' => $anime->banner_image,
                'cover_image' => $anime->cover_image,
                'trailer_url' => $anime->trailer_url,
                'average_rating' => (float) $anime->average_rating,
                'ratings_count' => $anime->ratings_count,
                'studio' => $anime->studio?->name,
                'genres' => $anime->genres->pluck('name'),
                'in_watchlist' => $inWatchlist,
                'in_favorites' => $inFavorites,
                'user_rating' => $userRating,
                'available_languages' => $anime->available_languages,
                'available_subtitles' => $anime->available_subtitles,
                'available_resolutions' => $anime->available_resolutions,
                'next_episode_date' => $anime->next_episode_date?->format('Y-m-d'),
                'seasons' => $anime->seasons->map(fn ($season) => [
                    'id' => $season->id,
                    'type' => $season->type,
                    'number' => $season->number,
                    'title' => $season->title,
                    'episodes' => $season->episodes->map(fn ($episode) => [
                        'id' => $episode->id,
                        'number' => $episode->number,
                        'title' => $episode->title,
                        'thumbnail' => $episode->thumbnail ?? $anime->cover_image,
                        'duration_seconds' => $episode->duration_seconds,
                        'release_date' => $episode->release_date->format('Y-m-d'),
                    ]),
                ]),
                'characters' => $anime->characters->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'role' => $c->role,
                    'image' => $c->image,
                    'voice_actor' => $c->voice_actor,
                ]),
                'related_animes' => $relatedAnimes->map(fn ($r) => [
                    'id' => $r->id,
                    'slug' => $r->slug,
                    'title' => $r->title,
                    'cover_image' => $r->cover_image,
                    'average_rating' => (float) $r->average_rating,
                    'relation_type' => $r->pivot->relation_type,
                ]),
                'comments' => $anime->comments->map(function ($c) {
                    return [
                        'id' => $c->id,
                        'body' => $c->body,
                        'text_align' => $c->text_align,
                        'image' => $c->image,
                        'created_at' => $c->created_at->toISOString(),
                        'updated_at' => $c->updated_at->toISOString(),
                        'user' => [
                            'id' => $c->user->id,
                            'name' => $c->user->display_name ?? $c->user->name,
                            'username' => $c->user->username,
                            'avatar' => $c->user->avatar,
                            'role' => $c->user->role,
                        ],
                        'likes_count' => $c->likes_count ?? 0,
                        'dislikes_count' => $c->dislikes_count ?? 0,
                        'user_liked' => $c->userLike->first()?->is_like ?? null,
                        'replies_count' => $c->replies_count ?? 0,
                    ];
                }),
            ],
        ]);
    }
}
