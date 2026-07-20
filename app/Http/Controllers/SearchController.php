<?php

namespace App\Http\Controllers;

use App\Models\Anime;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = trim($request->input('q', ''));

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $animes = Anime::query()
            ->where('is_active', true)
            ->where('title', 'ilike', "%{$q}%")
            ->orderByDesc('views_count')
            ->limit(8)
            ->get(['id', 'slug', 'title', 'cover_image', 'type', 'status', 'average_rating']);

        return response()->json($animes);
    }
}
