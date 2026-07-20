<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GenreController extends Controller
{
    public function index()
    {
        $genres = Genre::withCount('animes')->latest()->paginate(15);

        return Inertia::render('admin/genres/index', ['genres' => $genres]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:genres,name',
        ]);

        $genre = Genre::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        AuditLog::log('genre.created', $genre, null, $genre->toArray());

        return redirect()->back()->with('success', 'Género creado.');
    }

    public function update(Request $request, Genre $genre)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:genres,name,' . $genre->id,
        ]);

        $old = $genre->toArray();
        $genre->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        AuditLog::log('genre.updated', $genre, $old, $genre->fresh()->toArray());

        return redirect()->back()->with('success', 'Género actualizado.');
    }

    public function destroy(Genre $genre)
    {
        $old = $genre->toArray();
        AuditLog::log('genre.deleted', $genre, $old, null);
        $genre->delete();

        return redirect()->back()->with('success', 'Género eliminado.');
    }
}
