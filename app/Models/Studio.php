<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Studio extends Model
{
    protected $fillable = ['name', 'slug', 'logo'];

    public function animes(): HasMany
    {
        return $this->hasMany(Anime::class);
    }
}