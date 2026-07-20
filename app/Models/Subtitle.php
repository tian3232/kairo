<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subtitle extends Model
{
    use HasFactory;

    protected $fillable = [
        'episode_id',
        'language',
        'path',
        'source',
        'auto_generated',
    ];

    protected $casts = [
        'auto_generated' => 'boolean',
    ];

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    public function url(): string
    {
        return asset('storage/' . $this->path);
    }
}
