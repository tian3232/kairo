<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPlaybackPreference extends Model
{
    protected $fillable = [
        'user_id',
        'autoplay',
        'auto_skip_intro',
        'auto_skip_credits',
        'autoplay_countdown',
        'quality',
        'audio_language',
        'subtitle_language',
        'playback_speed',
        'remember_volume',
    ];

    protected $casts = [
        'autoplay' => 'boolean',
        'auto_skip_intro' => 'boolean',
        'auto_skip_credits' => 'boolean',
        'autoplay_countdown' => 'integer',
        'playback_speed' => 'decimal:2',
        'remember_volume' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function defaults(): array
    {
        return [
            'autoplay' => true,
            'auto_skip_intro' => false,
            'auto_skip_credits' => false,
            'autoplay_countdown' => 8,
            'quality' => 'auto',
            'audio_language' => 'es',
            'subtitle_language' => 'none',
            'playback_speed' => 1.00,
            'remember_volume' => true,
        ];
    }
}
