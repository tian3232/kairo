<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HeroBanner extends Model
{
    protected $fillable = ['anime_id', 'order', 'is_active', 'duration_seconds'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(Anime::class);
    }
}