<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserListItem extends Model
{
    protected $fillable = [
        'user_list_id',
        'anime_id',
        'position',
    ];

    public function list(): BelongsTo
    {
        return $this->belongsTo(UserList::class, 'user_list_id');
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(Anime::class);
    }
}
