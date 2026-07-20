<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Anime;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'anime_id' => 'required|exists:animes,id',
            'score' => 'required|integer|min:1|max:10',
        ]);

        Rating::updateOrCreate(
            ['user_id' => $request->user()->id, 'anime_id' => $request->anime_id],
            ['score' => $request->score]
        );

        $this->recalculateAverage($request->anime_id);

        $anime = Anime::find($request->anime_id);

        return response()->json([
            'score' => $request->score,
            'average' => (float) $anime->fresh()->average_rating,
            'count' => $anime->fresh()->ratings_count,
        ]);
    }

    public function destroy(Request $request, Rating $rating)
    {
        if ($rating->user_id !== $request->user()->id) {
            abort(403);
        }

        $animeId = $rating->anime_id;
        $rating->delete();

        $this->recalculateAverage($animeId);

        $anime = Anime::find($animeId);

        return response()->json([
            'score' => null,
            'average' => (float) $anime->fresh()->average_rating,
            'count' => $anime->fresh()->ratings_count,
        ]);
    }

    private function recalculateAverage(int $animeId): void
    {
        $anime = Anime::find($animeId);
        $avg = $anime->ratings()->avg('score');
        $count = $anime->ratings()->count();

        $anime->update([
            'average_rating' => round($avg, 2),
            'ratings_count' => $count,
        ]);
    }
}
