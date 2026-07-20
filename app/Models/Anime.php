<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Anime extends Model
{
    protected $fillable = [
        'title', 'slug', 'synopsis', 'type', 'status', 'age_rating',
        'release_year', 'broadcast_season', 'broadcast_year',
        'studio_id', 'cover_image', 'banner_image', 'logo_image',
        'trailer_url', 'average_rating', 'ratings_count', 'views_count',
        'is_active', 'created_by', 'available_languages', 'available_subtitles',
        'available_resolutions', 'next_episode_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'average_rating' => 'decimal:2',
        'available_languages' => 'array',
        'available_subtitles' => 'array',
        'available_resolutions' => 'array',
        'next_episode_date' => 'date',
    ];

    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    public function seasons(): HasMany
    {
        return $this->hasMany(Season::class)->orderBy('order');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function heroBanners(): HasMany
    {
        return $this->hasMany(HeroBanner::class);
    }

    public function watchlistUsers()
    {
        return $this->hasMany(UserAnimeList::class)->where('type', 'watchlist');
    }

    public function favoriteUsers()
    {
        return $this->hasMany(UserAnimeList::class)->where('type', 'favorite');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function characters(): HasMany
    {
        return $this->hasMany(Character::class)->orderBy('order');
    }

    public function relatedAnimes()
    {
        return $this->belongsToMany(Anime::class, 'anime_relations', 'anime_id', 'related_anime_id')
            ->withPivot('relation_type');
    }

    public function relatedFrom()
    {
        return $this->belongsToMany(Anime::class, 'anime_relations', 'related_anime_id', 'anime_id')
            ->withPivot('relation_type');
    }
}
