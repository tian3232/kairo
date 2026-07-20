<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class UserList extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'cover_image',
        'position',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function animes(): BelongsToMany
    {
        return $this->belongsToMany(Anime::class, 'user_list_items')
            ->withPivot('position')
            ->orderByPivot('position');
    }

    public function items()
    {
        return $this->hasMany(UserListItem::class);
    }
}
