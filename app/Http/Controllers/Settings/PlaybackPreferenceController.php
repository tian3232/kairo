<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserPlaybackPreference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlaybackPreferenceController extends Controller
{
    public function edit(Request $request)
    {
        $prefs = $request->user()->playbackPreferences
            ?? UserPlaybackPreference::defaults();

        return Inertia::render('settings/playback', ['preferences' => $prefs]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'autoplay' => 'boolean',
            'auto_skip_intro' => 'boolean',
            'auto_skip_credits' => 'boolean',
            'autoplay_countdown' => 'integer|min:3|max:20',
            'quality' => 'in:auto,1080p,720p,480p',
            'audio_language' => 'in:es,en,ja',
            'subtitle_language' => 'in:none,es,en,ja',
            'playback_speed' => 'in:0.50,0.75,1.00,1.25,1.50,2.00',
            'remember_volume' => 'boolean',
        ]);

        $request->user()->playbackPreferences()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated,
        );

        return back()->with('status', 'Preferencias guardadas.');
    }
}
