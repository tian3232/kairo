<?php

namespace App\Http\Controllers;

use App\Models\Episode;
use App\Models\EpisodeFavorite;
use App\Models\Season;
use App\Models\UserPlaybackPreference;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WatchController extends Controller
{
    public function show(Episode $episode): Response
    {
        $episode->load('season.anime');

        $progress = $episode->watchProgress()
            ->where('user_id', auth()->id())
            ->first();

        $siblingEpisodes = $episode->season->episodes()->orderBy('number')->get();
        $nextEpisode = $siblingEpisodes->firstWhere('number', '>', $episode->number);

        $currentSeasonOrder = $episode->season->order;
        $currentNumber = $episode->number;

        $upcomingSibling = $siblingEpisodes
            ->where('number', '>', $currentNumber)
            ->values();

        if ($upcomingSibling->count() < 5) {
            $nextSeasons = Season::where('anime_id', $episode->season->anime_id)
                ->where('order', '>', $currentSeasonOrder)
                ->orderBy('order')
                ->get();

            foreach ($nextSeasons as $ns) {
                if ($upcomingSibling->count() >= 5) break;
                $upcomingSibling = $upcomingSibling->concat(
                    $ns->episodes()->orderBy('number')->get()->values()
                );
            }
        }

        $moreEpisodes = $upcomingSibling
            ->take(5)
            ->values()
            ->map(fn ($ep) => [
                'id' => $ep->id,
                'number' => $ep->number,
                'title' => $ep->title,
                'thumbnail' => $ep->thumbnail ?? $ep->season->anime->cover_image,
                'duration_seconds' => $ep->duration_seconds,
                'season_number' => $ep->season->number,
                'is_current' => $ep->id === $episode->id,
            ]);

        if (!$nextEpisode) {
            $nextSeason = Season::where('anime_id', $episode->season->anime_id)
                ->where('order', '>', $episode->season->order)
                ->orderBy('order')
                ->first();

            if ($nextSeason) {
                $nextEpisode = $nextSeason->episodes()->orderBy('number')->first();
            }
        }

        $prevEpisode = $siblingEpisodes->where('number', '<', $episode->number)->last();

        if (!$prevEpisode) {
            $prevSeason = Season::where('anime_id', $episode->season->anime_id)
                ->where('order', '<', $episode->season->order)
                ->orderByDesc('order')
                ->first();

            if ($prevSeason) {
                $prevEpisode = $prevSeason->episodes()->orderByDesc('number')->first();
            }
        }

        $user = auth()->user();
        $userId = $user?->id;

        $userLiked = null;
        $likesCount = $dislikesCount = 0;
        if ($userId) {
            $userLiked = EpisodeFavorite::where('user_id', $userId)
                ->where('episode_id', $episode->id)->value('liked');
        }
        $likesCount = EpisodeFavorite::where('episode_id', $episode->id)->where('liked', true)->count();
        $dislikesCount = EpisodeFavorite::where('episode_id', $episode->id)->where('liked', false)->count();

        $comments = $episode->comments()
            ->where('is_visible', true)
            ->whereNull('parent_id')
            ->with('user:id,name,username,avatar,role')
            ->withCount([
                'likes as likes_count' => fn ($q) => $q->where('is_like', true),
                'likes as dislikes_count' => fn ($q) => $q->where('is_like', false),
                'replies as replies_count',
            ])
            ->with($userId ? ['likes as userLike' => fn ($q) => $q->where('user_id', $userId)->select('id', 'comment_id', 'is_like')] : [])
            ->latest()
            ->get()
            ->map(function ($c) {
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
            });

        return Inertia::render('watch/show', [
            'episode' => [
                'id' => $episode->id,
                'number' => $episode->number,
                'title' => $episode->title,
                'synopsis' => $episode->synopsis,
                'video_path' => $episode->video_path,
                'duration_seconds' => $episode->duration_seconds,
                'release_date' => $episode->release_date->format('Y-m-d'),
                'intro_start' => $episode->intro_start,
                'intro_end' => $episode->intro_end,
                'credits_start' => $episode->credits_start,
                'season_number' => $episode->season->number,
            ],
            'anime' => [
                'slug' => $episode->season->anime->slug,
                'title' => $episode->season->anime->title,
                'age_rating' => $episode->season->anime->age_rating,
                'type' => $episode->season->anime->type,
            ],
            'startPosition' => $progress?->position_seconds ?? 0,
            'isFavorited' => $userLiked,
            'likesCount' => $likesCount,
            'dislikesCount' => $dislikesCount,
            'moreEpisodes' => $moreEpisodes,
            'comments' => $comments,
            'nextEpisode' => $nextEpisode ? [
                'id' => $nextEpisode->id,
                'number' => $nextEpisode->number,
                'title' => $nextEpisode->title,
                'thumbnail' => $nextEpisode->thumbnail ?? $nextEpisode->season->anime->cover_image,
                'duration_seconds' => $nextEpisode->duration_seconds,
                'season_number' => $nextEpisode->season->number,
            ] : null,
            'prevEpisode' => $prevEpisode ? [
                'id' => $prevEpisode->id,
                'number' => $prevEpisode->number,
                'title' => $prevEpisode->title,
                'thumbnail' => $prevEpisode->thumbnail ?? $prevEpisode->season->anime->cover_image,
                'duration_seconds' => $prevEpisode->duration_seconds,
                'season_number' => $prevEpisode->season->number,
            ] : null,
            'preferences' => auth()->check()
                ? (auth()->user()->playbackPreferences ?? UserPlaybackPreference::defaults())
                : UserPlaybackPreference::defaults(),
            'subtitles' => $episode->subtitles()
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'language' => $s->language,
                    'url' => $s->url(),
                    'label' => match ($s->language) {
                        'es' => 'Español',
                        'en' => 'English',
                        'ja' => '日本語',
                        default => $s->language,
                    },
                ]),
        ]);
    }

    public function updateProgress(Request $request, Episode $episode)
    {
        $validated = $request->validate([
            'position_seconds' => 'required|integer|min:0',
            'completed' => 'boolean',
        ]);

        if ($validated['completed'] ?? false) {
            $episode->watchProgress()
                ->where('user_id', auth()->id())
                ->delete();

            return response()->noContent();
        }

        $episode->watchProgress()->updateOrCreate(
            ['user_id' => auth()->id()],
            $validated,
        );

        return response()->noContent();
    }

    public function markAsWatched(Episode $episode)
    {
        $episode->watchProgress()
            ->where('user_id', auth()->id())
            ->update(['completed' => true]);

        return back();
    }
}
