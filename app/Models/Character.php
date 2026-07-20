<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Character extends Model
{
    protected $fillable = ['anime_id', 'name', 'role', 'image', 'voice_actor', 'order'];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(Anime::class);
    }
}
