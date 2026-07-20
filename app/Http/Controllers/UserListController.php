<?php

namespace App\Http\Controllers;

use App\Models\Anime;
use App\Models\UserAnimeList;
use App\Models\UserList;
use App\Models\UserListItem;
use App\Models\WatchProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserListController extends Controller
{
    public function toggleWatchlist(Anime $anime)
    {
        $user = auth()->user();
        $existing = UserAnimeList::where('user_id', $user->id)
            ->where('anime_id', $anime->id)
            ->where('type', 'watchlist')
            ->first();

        if ($existing) {
            $existing->delete();
            return back()->with('status', 'Eliminado de Mi Lista');
        }

        UserAnimeList::create([
            'user_id' => $user->id,
            'anime_id' => $anime->id,
            'type' => 'watchlist',
        ]);

        return back()->with('status', 'Agregado a Mi Lista');
    }

    public function toggleFavorite(Anime $anime)
    {
        $user = auth()->user();
        $existing = UserAnimeList::where('user_id', $user->id)
            ->where('anime_id', $anime->id)
            ->where('type', 'favorite')
            ->first();

        if ($existing) {
            $existing->delete();
            return back()->with('status', 'Eliminado de Favoritos');
        }

        UserAnimeList::create([
            'user_id' => $user->id,
            'anime_id' => $anime->id,
            'type' => 'favorite',
        ]);

        return back()->with('status', 'Agregado a Favoritos');
    }

    public function watchlist()
    {
        $animes = auth()->user()
            ->watchlist()
            ->with('anime')
            ->get()
            ->pluck('anime')
            ->map(fn ($anime) => [
                'id' => $anime->id,
                'slug' => $anime->slug,
                'title' => $anime->title,
                'cover_image' => $anime->cover_image,
                'status' => $anime->status,
                'type' => $anime->type,
                'synopsis' => $anime->synopsis,
                'average_rating' => (float) $anime->average_rating,
            ]);

        return Inertia::render('user/watchlist', ['animes' => $animes]);
    }

    public function favorites()
    {
        $user = auth()->user();
        $animes = $user->favorites()->with('anime')->get()
            ->pluck('anime')
            ->map(fn ($anime) => [
                'id' => $anime->id,
                'slug' => $anime->slug,
                'title' => $anime->title,
                'cover_image' => $anime->cover_image,
                'status' => $anime->status,
                'type' => $anime->type,
                'synopsis' => $anime->synopsis,
                'average_rating' => (float) $anime->average_rating,
            ]);

        $userLists = [
            'watchlist' => $user->watchlist()->pluck('anime_id')->values()->all(),
            'favorites' => $user->favorites()->pluck('anime_id')->values()->all(),
        ];

        return Inertia::render('user/favorites', ['animes' => $animes, 'userLists' => $userLists]);
    }

    public function history()
    {
        $episodes = WatchProgress::where('user_id', auth()->id())
            ->with('episode.season.anime')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($progress) => [
                'id' => $progress->episode->id,
                'anime_title' => $progress->episode->season->anime->title,
                'anime_slug' => $progress->episode->season->anime->slug,
                'episode_number' => $progress->episode->number,
                'season_number' => $progress->episode->season->number,
                'episode_title' => $progress->episode->title,
                'episode_synopsis' => $progress->episode->synopsis,
                'release_date' => $progress->episode->release_date?->format('Y-m-d'),
                'thumbnail' => $progress->episode->thumbnail,
                'progress' => $progress->position_seconds,
                'duration' => $progress->episode->duration_seconds,
                'completed' => $progress->completed,
                'updated_at' => $progress->updated_at,
            ]);

        return Inertia::render('user/history', ['episodes' => $episodes]);
    }

    public function destroyHistory(Request $request, int $episode)
    {
        WatchProgress::where('user_id', $request->user()->id)
            ->where('episode_id', $episode)
            ->delete();
        return response()->json(['ok' => true]);
    }

    public function destroyHistoryBulk(Request $request)
    {
        $request->validate([
            'episode_ids' => 'required|array',
            'episode_ids.*' => 'integer|exists:episodes,id',
        ]);
        WatchProgress::where('user_id', $request->user()->id)
            ->whereIn('episode_id', $request->episode_ids)
            ->delete();
        return response()->json(['ok' => true]);
    }

    // ── Custom Lists ──────────────────────────────────────────

    public function indexLists()
    {
        $user = auth()->user();
        $lists = $user->userLists()->withCount('animes')->with('animes')->get()
            ->map(fn ($list) => [
                'id' => $list->id,
                'name' => $list->name,
                'description' => $list->description,
                'cover_image' => $list->cover_image,
                'animes_count' => $list->animes_count,
                'animes' => $list->animes->map(fn ($a) => [
                    'id' => $a->id,
                    'slug' => $a->slug,
                    'title' => $a->title,
                    'cover_image' => $a->cover_image,
                    'average_rating' => (float) $a->average_rating,
                ]),
            ]);

        return Inertia::render('user/lists', ['lists' => $lists]);
    }

    public function showList(UserList $list)
    {
        if ($list->user_id !== auth()->id()) abort(403);

        $list->loadCount('animes');
        $animes = $list->animes()->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'slug' => $a->slug,
                'title' => $a->title,
                'cover_image' => $a->cover_image,
                'status' => $a->status,
                'type' => $a->type,
                'synopsis' => $a->synopsis,
                'average_rating' => (float) $a->average_rating,
            ]);

        return Inertia::render('user/list-show', [
            'list' => [
                'id' => $list->id,
                'name' => $list->name,
                'description' => $list->description,
                'cover_image' => $list->cover_image,
                'animes_count' => $list->animes_count,
            ],
            'animes' => $animes,
        ]);
    }

    public function createList(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'cover' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ]);

        $list = UserList::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('lists', 'public');
            $list->update(['cover_image' => $path]);
        }

        return redirect()->route('user.lists');
    }

    public function updateList(Request $request, UserList $list)
    {
        if ($list->user_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $list->update($validated);
        return redirect()->route('user.lists');
    }

    public function updateListCover(Request $request, UserList $list)
    {
        if ($list->user_id !== auth()->id()) abort(403);

        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,webp|max:2048',
        ]);

        if ($list->cover_image) {
            Storage::disk('public')->delete($list->cover_image);
        }

        $path = $request->file('cover')->store('lists', 'public');
        $list->update(['cover_image' => $path]);

        return redirect()->route('user.lists');
    }

    public function deleteList(UserList $list)
    {
        if ($list->user_id !== auth()->id()) abort(403);

        if ($list->cover_image) {
            Storage::disk('public')->delete($list->cover_image);
        }
        $list->delete();
        return redirect()->route('user.lists');
    }

    public function addAnime(Request $request, UserList $list)
    {
        if ($list->user_id !== auth()->id()) abort(403);

        $validated = $request->validate(['anime_id' => 'required|exists:animes,id']);
        $maxPos = $list->items()->max('position') ?? 0;

        UserListItem::updateOrCreate(
            ['user_list_id' => $list->id, 'anime_id' => $validated['anime_id']],
            ['position' => $maxPos + 1]
        );

        return response()->json(['ok' => true]);
    }

    public function removeAnime(UserList $list, Anime $anime)
    {
        if ($list->user_id !== auth()->id()) abort(403);
        $list->items()->where('anime_id', $anime->id)->delete();
        return response()->noContent();
    }

    public function toggleAnime(Request $request)
    {
        $validated = $request->validate([
            'list_id' => 'required|exists:user_lists,id',
            'anime_id' => 'required|exists:animes,id',
        ]);

        $list = UserList::find($validated['list_id']);
        if ($list->user_id !== auth()->id()) abort(403);

        $exists = $list->items()->where('anime_id', $validated['anime_id'])->first();

        if ($exists) {
            $exists->delete();
            return response()->json(['added' => false]);
        }

        $maxPos = $list->items()->max('position') ?? 0;
        UserListItem::create([
            'user_list_id' => $list->id,
            'anime_id' => $validated['anime_id'],
            'position' => $maxPos + 1,
        ]);

        return response()->json(['added' => true]);
    }

    public function listsForAnime(Request $request)
    {
        $validated = $request->validate(['anime_id' => 'required|exists:animes,id']);

        $lists = auth()->user()->userLists()
            ->withCount(['animes as in_list' => function ($q) use ($validated) {
                $q->where('animes.id', $validated['anime_id']);
            }])
            ->get()
            ->map(fn ($list) => [
                'id' => $list->id,
                'name' => $list->name,
                'cover_image' => $list->cover_image,
                'animes_count' => $list->animes_count,
                'contains_anime' => (bool) $list->in_list,
            ]);

        return response()->json(['lists' => $lists]);
    }

    public function reorder(Request $request, UserList $list)
    {
        if ($list->user_id !== auth()->id()) abort(403);

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer',
            'items.*.position' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            $list->items()->where('anime_id', $item['id'])->update(['position' => $item['position']]);
        }

        return response()->json(['ok' => true]);
    }
}
