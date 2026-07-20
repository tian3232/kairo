<?php

namespace App\Http\Controllers;

use App\Models\Episode;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(): Response
    {
        $days = collect();
        $start = Carbon::now()->startOfWeek(Carbon::MONDAY);

        for ($i = 0; $i < 14; $i++) {
            $date = $start->copy()->addDays($i);
            $days->push([
                'date' => $date->format('Y-m-d'),
                'label' => $date->locale('es')->isoFormat('dddd D [de] MMMM'),
                'short' => $date->locale('es')->isoFormat('ddd'),
                'is_today' => $date->isToday(),
            ]);
        }

        $startStr = $start->format('Y-m-d');
        $endStr = $start->copy()->addDays(13)->format('Y-m-d');

        $episodes = Episode::whereBetween('release_date', [$startStr, $endStr])
            ->whereHas('season.anime', fn ($q) => $q->where('is_active', true))
            ->with('season.anime:id,title,slug,cover_image')
            ->orderBy('release_date')
            ->orderBy('number')
            ->get()
            ->map(fn ($ep) => [
                'id' => $ep->id,
                'number' => $ep->number,
                'title' => $ep->title,
                'thumbnail' => $ep->thumbnail,
                'release_date' => $ep->release_date->format('Y-m-d'),
                'season_number' => $ep->season->number,
                'anime' => [
                    'id' => $ep->season->anime->id,
                    'title' => $ep->season->anime->title,
                    'slug' => $ep->season->anime->slug,
                    'cover_image' => $ep->season->anime->cover_image,
                ],
            ]);

        $episodesByDate = $episodes->groupBy('release_date');

        $schedule = $days->map(fn ($day) => [
            ...$day,
            'episodes' => $episodesByDate->get($day['date'], collect()),
        ]);

        return Inertia::render('user/calendar', ['schedule' => $schedule]);
    }

    public function myCalendar(): Response
    {
        $user = auth()->user();
        $favoriteAnimeIds = $user->favorites()->pluck('anime_id');

        $days = collect();
        $start = Carbon::now()->startOfWeek(Carbon::MONDAY);

        for ($i = 0; $i < 14; $i++) {
            $date = $start->copy()->addDays($i);
            $days->push([
                'date' => $date->format('Y-m-d'),
                'label' => $date->locale('es')->isoFormat('dddd D [de] MMMM'),
                'short' => $date->locale('es')->isoFormat('ddd'),
                'is_today' => $date->isToday(),
            ]);
        }

        $startStr = $start->format('Y-m-d');
        $endStr = $start->copy()->addDays(13)->format('Y-m-d');

        $episodes = Episode::whereBetween('release_date', [$startStr, $endStr])
            ->whereHas('season.anime', function ($q) use ($favoriteAnimeIds) {
                $q->where('is_active', true)
                  ->where('status', 'airing')
                  ->whereIn('id', $favoriteAnimeIds);
            })
            ->with('season.anime:id,title,slug,cover_image')
            ->orderBy('release_date')
            ->orderBy('number')
            ->get()
            ->map(fn ($ep) => [
                'id' => $ep->id,
                'number' => $ep->number,
                'title' => $ep->title,
                'thumbnail' => $ep->thumbnail,
                'release_date' => $ep->release_date->format('Y-m-d'),
                'season_number' => $ep->season->number,
                'anime' => [
                    'id' => $ep->season->anime->id,
                    'title' => $ep->season->anime->title,
                    'slug' => $ep->season->anime->slug,
                    'cover_image' => $ep->season->anime->cover_image,
                ],
            ]);

        $episodesByDate = $episodes->groupBy('release_date');

        $schedule = $days->map(fn ($day) => [
            ...$day,
            'episodes' => $episodesByDate->get($day['date'], collect()),
        ]);

        return Inertia::render('user/calendar', ['schedule' => $schedule, 'isMyCalendar' => true]);
    }
}
