<?php

namespace App\Http\Controllers;

use App\Models\EpisodeFavorite;
use App\Models\Notification;
use Illuminate\Http\Request;

class EpisodeFavoriteController extends Controller
{
    public function toggle(Request $request, int $episode)
    {
        $request->validate([
            'liked' => 'required|boolean',
        ]);

        $existing = EpisodeFavorite::where('user_id', $request->user()->id)
            ->where('episode_id', $episode)
            ->first();

        if ($existing) {
            if ($existing->liked === (bool) $request->liked) {
                $existing->delete();
            } else {
                $existing->update(['liked' => $request->liked]);
            }
        } else {
            EpisodeFavorite::create([
                'user_id' => $request->user()->id,
                'episode_id' => $episode,
                'liked' => $request->liked,
            ]);

            $ep = \App\Models\Episode::with('season.anime')->find($episode);
            if ($ep && $ep->season->anime->created_by && $ep->season->anime->created_by !== $request->user()->id) {
                $animeTitle = $ep->season->anime->title;
                $episodeLabel = 'S' . $ep->season->number . 'E' . $ep->number;
                Notification::create([
                    'user_id' => $ep->season->anime->created_by,
                    'sender_id' => $request->user()->id,
                    'type' => 'episode_like',
                    'title' => ($request->user()->display_name ?? $request->user()->name) . ' le dio ' . ($request->liked ? 'me gusta' : 'no me gusta') . ' a ' . $episodeLabel,
                    'body' => $animeTitle,
                    'link' => route('watch.show', $episode),
                ]);
            }
        }

        $userFav = EpisodeFavorite::where('user_id', $request->user()->id)
            ->where('episode_id', $episode)
            ->first();

        return response()->json([
            'liked' => $userFav?->liked,
            'likes_count' => EpisodeFavorite::where('episode_id', $episode)->where('liked', true)->count(),
            'dislikes_count' => EpisodeFavorite::where('episode_id', $episode)->where('liked', false)->count(),
        ]);
    }
}
