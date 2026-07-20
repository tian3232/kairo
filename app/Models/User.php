<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'google_id',
        'name',
        'username',
        'display_name',
        'role',
        'email',
        'password',
        'avatar',
        'bio',
        'country',
        'show_watchlist',
        'show_favorites',
        'show_lists',
        'show_activity',
        'show_friends',
        'allow_comments',
        'show_stats',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'owner']);
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    public function watchlist()
    {
        return $this->hasMany(UserAnimeList::class)->where('type', 'watchlist');
    }

    public function favorites()
    {
        return $this->hasMany(UserAnimeList::class)->where('type', 'favorite');
    }

    public function userLists()
    {
        return $this->hasMany(UserList::class)->orderBy('position');
    }

    public function playbackPreferences()
    {
        return $this->hasOne(UserPlaybackPreference::class);
    }

    public function watchProgress()
    {
        return $this->hasMany(WatchProgress::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function commentLikes()
    {
        return $this->hasMany(CommentLike::class);
    }

    public function episodeFavorites()
    {
        return $this->hasMany(EpisodeFavorite::class);
    }

    public function sentFriendships()
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    public function receivedFriendships()
    {
        return $this->hasMany(Friendship::class, 'friend_id');
    }

    public function friends()
    {
        $sent = $this->sentFriendships()->where('status', 'accepted')->pluck('friend_id');
        $received = $this->receivedFriendships()->where('status', 'accepted')->pluck('user_id');
        $all = $sent->merge($received);
        return User::whereIn('id', $all)->get();
    }

    public function profileComments()
    {
        return $this->hasMany(ProfileComment::class, 'profile_owner_id');
    }

    public function isFriend(User $user): bool
    {
        if ($this->id === $user->id) return false;
        return Friendship::where(function ($q) use ($user) {
            $q->where('user_id', $this->id)->where('friend_id', $user->id);
        })->orWhere(function ($q) use ($user) {
            $q->where('user_id', $user->id)->where('friend_id', $this->id);
        })->where('status', 'accepted')->exists();
    }

    public function friendshipWith(User $user): ?Friendship
    {
        return Friendship::where(function ($q) use ($user) {
            $q->where('user_id', $this->id)->where('friend_id', $user->id);
        })->orWhere(function ($q) use ($user) {
            $q->where('user_id', $user->id)->where('friend_id', $this->id);
        })->first();
    }

    public function getPublicNameAttribute(): string
    {
        return $this->display_name ?? $this->name;
    }
}
