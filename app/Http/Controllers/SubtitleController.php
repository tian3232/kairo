<?php

namespace App\Http\Controllers;

use App\Models\Episode;
use App\Models\Subtitle;
use App\Services\Subtitles\SubtitleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SubtitleController extends Controller
{
    public function generate(Request $request, Episode $episode)
    {
        $validated = $request->validate([
            'languages' => 'nullable|array',
            'languages.*' => 'in:es,en,ja',
        ]);

        $languages = $validated['languages'] ?? ['ja', 'en', 'es'];

        $service = new SubtitleService();
        $segments = $service->generator()->generate($episode->video_path, $languages);

        $created = [];
        foreach ($segments as $lang => $langSegments) {
            if (empty($langSegments)) {
                continue;
            }

            $filename = "subtitles/episode_{$episode->id}_{$lang}.vtt";
            Storage::disk('public')->put($filename, SubtitleService::toVtt($langSegments));

            $subtitle = Subtitle::updateOrCreate(
                ['episode_id' => $episode->id, 'language' => $lang],
                [
                    'path' => $filename,
                    'source' => config('services.subtitles.driver', 'local_whisper'),
                    'auto_generated' => true,
                ]
            );

            $created[] = $subtitle;
        }

        if ($request->wantsJson()) {
            return response()->json([
                'subtitles' => $created->map(fn ($s) => [
                    'id' => $s->id,
                    'language' => $s->language,
                    'url' => $s->url(),
                ]),
            ]);
        }

        return back()->with('status', 'Subtítulos generados para: ' . implode(', ', array_keys($segments)));
    }

    public function destroy(Subtitle $subtitle)
    {
        Storage::disk('public')->delete($subtitle->path);
        $subtitle->delete();

        if (request()->wantsJson()) {
            return response()->noContent();
        }

        return back()->with('status', 'Subtítulo eliminado.');
    }

    public function store(Request $request, Episode $episode)
    {
        $validated = $request->validate([
            'language' => 'required|in:es,en,ja',
            'file' => 'required|file|mimes:vtt|max:2048',
        ]);

        $file = $request->file('file');
        $filename = "subtitles/episode_{$episode->id}_{$validated['language']}.vtt";
        Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));

        $subtitle = Subtitle::updateOrCreate(
            ['episode_id' => $episode->id, 'language' => $validated['language']],
            [
                'path' => $filename,
                'source' => 'manual',
                'auto_generated' => false,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'subtitle' => [
                    'id' => $subtitle->id,
                    'language' => $subtitle->language,
                    'url' => $subtitle->url(),
                    'label' => match ($subtitle->language) {
                        'es' => 'Español',
                        'en' => 'English',
                        'ja' => '日本語',
                        default => $subtitle->language,
                    },
                ],
            ]);
        }

        return back()->with('status', 'Subtítulo subido correctamente.');
    }
}
