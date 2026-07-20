<?php

namespace App\Http\Controllers;

use App\Models\Anime;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SimulcastController extends Controller
{
    private const SEASON_ORDER = ['winter', 'spring', 'summer', 'fall'];

    public function index(Request $request)
    {
        $now = now();
        $month = $now->month;

        if ($month >= 1 && $month <= 3) {
            $currentSeason = 'winter';
        } elseif ($month >= 4 && $month <= 6) {
            $currentSeason = 'spring';
        } elseif ($month >= 7 && $month <= 9) {
            $currentSeason = 'summer';
        } else {
            $currentSeason = 'fall';
        }
        $currentYear = (int) $now->format('Y');

        $selectedYear = $request->integer('year', $currentYear);

        $animes = Anime::where('is_active', true)
            ->where('broadcast_season', '!=', null)
            ->where('broadcast_year', $selectedYear)
            ->with('genres:id,name')
            ->orderBy('title')
            ->get();

        $grouped = $animes->groupBy('broadcast_season');

        // Sort seasons: current season first, then chronological
        $currentIndex = array_search($currentSeason, self::SEASON_ORDER);
        $sortedKeys = collect();
        for ($i = 0; $i < 4; $i++) {
            $sortedKeys->push(self::SEASON_ORDER[($currentIndex + $i) % 4]);
        }

        $allYears = [$currentYear - 1, $currentYear, $currentYear + 1];

        $user = $request->user();

        return Inertia::render('simulcast/index', [
            'animes' => $sortedKeys->filter(fn ($s) => $grouped->has($s))
                ->mapWithKeys(fn ($s) => [
                    $s => $grouped[$s]->map(fn ($a) => [
                        'id' => $a->id,
                        'title' => $a->title,
                        'slug' => $a->slug,
                        'synopsis' => $a->synopsis,
                        'type' => $a->type,
                        'status' => $a->status,
                        'cover_image' => $a->cover_image,
                        'average_rating' => (float) $a->average_rating,
                        'genres' => $a->genres->pluck('name'),
                    ]),
                ]),
            'selectedYear' => $selectedYear,
            'allYears' => $allYears,
            'currentSeason' => $currentSeason,
            'currentYear' => $currentYear,
            'userLists' => $user ? [
                'watchlist' => $user->watchlist()->pluck('anime_id'),
                'favorites' => $user->favorites()->pluck('anime_id'),
            ] : ['watchlist' => [], 'favorites' => []],
        ]);
    }
}
