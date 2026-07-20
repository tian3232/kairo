<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Studio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StudioController extends Controller
{
    public function index()
    {
        $studios = Studio::withCount('animes')->latest()->paginate(15);

        return Inertia::render('admin/studios/index', ['studios' => $studios]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:studios,name',
            'logo' => 'nullable|string|max:255',
        ]);

        $studio = Studio::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'logo' => $validated['logo'] ?? null,
        ]);

        AuditLog::log('studio.created', $studio, null, $studio->toArray());

        return redirect()->back()->with('success', 'Estudio creado.');
    }

    public function update(Request $request, Studio $studio)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:studios,name,' . $studio->id,
            'logo' => 'nullable|string|max:255',
        ]);

        $old = $studio->toArray();
        $studio->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'logo' => $validated['logo'] ?? null,
        ]);

        AuditLog::log('studio.updated', $studio, $old, $studio->fresh()->toArray());

        return redirect()->back()->with('success', 'Estudio actualizado.');
    }

    public function destroy(Studio $studio)
    {
        $old = $studio->toArray();
        AuditLog::log('studio.deleted', $studio, $old, null);
        $studio->delete();

        return redirect()->back()->with('success', 'Estudio eliminado.');
    }
}
