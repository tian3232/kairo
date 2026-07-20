<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'sender_id', 'receiver_id', 'body', 'image_path', 'read_at', 'delivered_at',
        'edited_at', 'deleted_for_sender', 'deleted_for_receiver', 'deleted_for_everyone',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'delivered_at' => 'datetime',
        'edited_at' => 'datetime',
        'deleted_for_sender' => 'boolean',
        'deleted_for_receiver' => 'boolean',
        'deleted_for_everyone' => 'boolean',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function isDeletedFor(int $viewerId): bool
    {
        if ($this->deleted_for_everyone) {
            return true;
        }

        if ($viewerId === $this->sender_id) {
            return $this->deleted_for_sender;
        }

        if ($viewerId === $this->receiver_id) {
            return $this->deleted_for_receiver;
        }

        return false;
    }
}
