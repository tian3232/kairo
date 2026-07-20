<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfileComment extends Model
{
    protected $fillable = ['user_id', 'profile_owner_id', 'body'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function profileOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'profile_owner_id');
    }
}
