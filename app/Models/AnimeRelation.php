<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimeRelation extends Model
{
    protected $fillable = ['anime_id', 'related_anime_id', 'relation_type'];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(Anime::class, 'anime_id');
    }

    public function relatedAnime(): BelongsTo
    {
        return $this->belongsTo(Anime::class, 'related_anime_id');
    }
}
