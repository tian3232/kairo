<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HeroBanner;
use App\Models\Anime;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BannerController extends Controller
{
    public function index()
    {
        $banners = HeroBanner::with('anime')->orderBy('order')->get();
        $animes = Anime::orderBy('title')->get(['id', 'title']);

        return Inertia::render('admin/banners/index', ['banners' => $banners, 'animes' => $animes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'anime_id' => 'required|exists:animes,id',
            'duration_seconds' => 'nullable|integer|min:1|max:30',
        ]);

        $validated['order'] = HeroBanner::max('order') + 1;
        $validated['is_active'] = true;

        $banner = HeroBanner::create($validated);

        AuditLog::log('banner.created', $banner, null, $banner->toArray());

        return redirect()->back()->with('success', 'Banner creado.');
    }

    public function toggleActive(HeroBanner $banner)
    {
        $old = ['is_active' => $banner->is_active];
        $banner->update(['is_active' => !$banner->is_active]);

        AuditLog::log('banner.toggled', $banner, $old, ['is_active' => $banner->is_active]);

        return redirect()->back()->with('success', $banner->is_active ? 'Banner activado.' : 'Banner desactivado.');
    }

    public function destroy(HeroBanner $banner)
    {
        $old = $banner->toArray();
        AuditLog::log('banner.deleted', $banner, $old, null);
        $banner->delete();

        return redirect()->back()->with('success', 'Banner eliminado.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:hero_banners,id',
        ]);

        foreach ($validated['ids'] as $index => $id) {
            HeroBanner::where('id', $id)->update(['order' => $index + 1]);
        }

        return redirect()->back()->with('success', 'Orden actualizado.');
    }
}
