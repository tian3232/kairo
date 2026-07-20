<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\Notification;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(User $user)
    {
        $currentUser = auth()->user();

        $friends = $user->friends();

        $friendship = null;
        $friendStatus = null;
        $friendshipId = null;
        $incomingRequest = false;
        if ($currentUser && $currentUser->id !== $user->id) {
            $friendship = $currentUser->friendshipWith($user);
            $friendStatus = $friendship?->status;
            $friendshipId = $friendship?->id;
            if ($friendship && $friendship->status === 'pending' && $friendship->friend_id === $currentUser->id) {
                $incomingRequest = true;
            }
        }

        $comments = Comment::where('profile_user_id', $user->id)
            ->whereNull('parent_id')
            ->where('is_visible', true)
            ->with('user:id,name,username,avatar,role')
            ->withCount([
                'likes as likes_count' => fn ($q) => $q->where('is_like', true),
                'likes as dislikes_count' => fn ($q) => $q->where('is_like', false),
                'replies as replies_count',
            ])
            ->with($currentUser ? ['likes as userLike' => fn ($q) => $q->where('user_id', $currentUser->id)->select('id', 'comment_id', 'is_like')] : [])
            ->latest()
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'body' => $c->body,
                    'text_align' => $c->text_align,
                    'image' => $c->image,
                    'created_at' => $c->created_at->toISOString(),
                    'updated_at' => $c->updated_at->toISOString(),
                    'user' => [
                        'id' => $c->user->id,
                        'name' => $c->user->display_name ?? $c->user->name,
                        'username' => $c->user->username,
                        'avatar' => $c->user->avatar,
                        'role' => $c->user->role,
                    ],
                    'likes_count' => $c->likes_count ?? 0,
                    'dislikes_count' => $c->dislikes_count ?? 0,
                    'user_liked' => $c->userLike->first()?->is_like ?? null,
                    'replies_count' => $c->replies_count ?? 0,
                ];
            });

        $recentComments = $user->comments()
            ->with('anime:id,slug,title,cover_image')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'body' => $c->body,
                'created_at' => $c->created_at->toISOString(),
                'anime' => $c->anime ? [
                    'slug' => $c->anime->slug,
                    'title' => $c->anime->title,
                    'cover_image' => $c->anime->cover_image,
                ] : null,
            ]);

        $favorites = $user->favorites()
            ->with('anime:id,slug,title,cover_image,status,type,synopsis,average_rating')
            ->limit(12)
            ->get()
            ->pluck('anime');

        $watchlist = $user->watchlist()
            ->with('anime:id,slug,title,cover_image,status,type,synopsis,average_rating')
            ->limit(12)
            ->get()
            ->pluck('anime');

        $customLists = $user->userLists()
            ->with(['animes' => fn ($q) => $q->limit(20)])
            ->orderBy('position')
            ->get()
            ->map(fn ($list) => [
                'id' => $list->id,
                'name' => $list->name,
                'description' => $list->description,
                'cover_image' => $list->cover_image,
                'animes_count' => $list->animes()->count(),
                'animes' => $list->animes->map(fn ($a) => [
                    'id' => $a->id,
                    'slug' => $a->slug,
                    'title' => $a->title,
                    'cover_image' => $a->cover_image,
                    'status' => $a->status,
                    'type' => $a->type,
                    'average_rating' => (float) $a->average_rating,
                ]),
            ]);

        $commentsCount = $user->comments()->count();
        $likesCount = $user->episodeFavorites()->where('liked', true)->count()
            + $user->commentLikes()->where('is_like', true)->count();
        $listsCount = $user->watchlist()->count() + $user->favorites()->count();

        $isOwn = $currentUser && $currentUser->id === $user->id;
        $isFriend = $currentUser && $currentUser->isFriend($user);

        $privacy = [
            'show_watchlist' => $user->show_watchlist,
            'show_favorites' => $user->show_favorites,
            'show_lists' => $user->show_lists,
            'show_activity' => $user->show_activity,
            'show_friends' => $user->show_friends,
            'allow_comments' => $user->allow_comments,
            'show_stats' => $user->show_stats,
        ];

        return Inertia::render('profile/show', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'display_name' => $user->display_name,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'role' => $user->role,
                'created_at' => $user->created_at->toISOString(),
            ],
            'stats' => $isOwn || $privacy['show_stats'] ? [
                'comments' => $commentsCount,
                'likes' => $likesCount,
                'lists' => $listsCount,
                'friends' => count($friends),
            ] : null,
            'friends' => ($isOwn || $privacy['show_friends']) ? $friends->map(fn ($f) => [
                'id' => $f->id,
                'name' => $f->display_name ?? $f->name,
                'username' => $f->username,
                'avatar' => $f->avatar,
                'role' => $f->role,
            ]) : [],
            'friendStatus' => $friendStatus,
            'friendshipId' => $friendshipId,
            'incomingRequest' => $incomingRequest,
            'comments' => ($isOwn || $privacy['allow_comments']) ? $comments : [],
            'recentComments' => ($isOwn || $privacy['show_activity']) ? $recentComments : [],
            'favorites' => ($isOwn || $privacy['show_favorites']) ? $favorites : [],
            'watchlist' => ($isOwn || $privacy['show_watchlist']) ? $watchlist : [],
            'customLists' => ($isOwn || $privacy['show_lists']) ? $customLists : [],
            'isOwn' => $isOwn,
            'privacy' => $privacy,
        ]);
    }

    public function updateBio(Request $request)
    {
        $request->validate([
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|string|max:500',
        ]);

        $fields = [];
        if ($request->has('bio')) $fields['bio'] = $request->bio;
        if ($request->has('avatar')) $fields['avatar'] = $request->avatar;

        $request->user()->update($fields);

        return response()->json(['ok' => true]);
    }

    public function comment(Request $request, User $user)
    {
        if ($user->id !== $request->user()->id && !$user->allow_comments) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        Comment::create([
            'user_id' => $request->user()->id,
            'profile_user_id' => $user->id,
            'body' => $request->body,
        ]);

        if ($user->id !== $request->user()->id) {
            Notification::create([
                'user_id' => $user->id,
                'sender_id' => $request->user()->id,
                'type' => 'profile_comment',
                'title' => ($request->user()->display_name ?? $request->user()->name) . ' comentó en tu perfil',
                'body' => $request->body,
                'link' => route('profile.show', $user->id),
            ]);
        }

        return response()->json(['ok' => true]);
    }

    public function deleteComment(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id && $comment->profile_user_id !== $request->user()->id) {
            abort(403);
        }
        $comment->delete();
        return response()->json(['ok' => true]);
    }

    public function sendFriendRequest(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['error' => 'No puedes agregarte a ti mismo'], 400);
        }

        $existing = $request->user()->friendshipWith($user);

        if ($existing) {
            if ($existing->status === 'pending') {
                return response()->json(['error' => 'Solicitud ya enviada'], 400);
            }
            if ($existing->status === 'accepted') {
                return response()->json(['error' => 'Ya son amigos'], 400);
            }
            $existing->update(['status' => 'pending', 'user_id' => $request->user()->id]);
            $friendship = $existing;
        } else {
            $friendship = Friendship::create([
                'user_id' => $request->user()->id,
                'friend_id' => $user->id,
                'status' => 'pending',
            ]);
        }

        Notification::create([
            'user_id' => $user->id,
            'sender_id' => $request->user()->id,
            'friendship_id' => $friendship->id,
            'type' => 'friend_request',
            'title' => ($request->user()->display_name ?? $request->user()->name) . ' te envió una solicitud de amistad',
            'link' => route('profile.show', $request->user()->id),
        ]);

        return response()->json(['status' => 'pending', 'id' => $friendship->id]);
    }

    public function acceptFriend(Request $request, Friendship $friendship)
    {
        if ($friendship->friend_id !== $request->user()->id || $friendship->status !== 'pending') {
            abort(403);
        }

        $friendship->update(['status' => 'accepted']);

        Notification::create([
            'user_id' => $friendship->user_id,
            'sender_id' => $request->user()->id,
            'type' => 'friend_accepted',
            'title' => ($request->user()->display_name ?? $request->user()->name) . ' aceptó tu solicitud de amistad',
            'link' => route('profile.show', $request->user()->id),
        ]);

        return response()->json(['status' => 'accepted']);
    }

    public function rejectFriend(Request $request, Friendship $friendship)
    {
        if ($friendship->friend_id !== $request->user()->id || $friendship->status !== 'pending') {
            abort(403);
        }

        $friendship->update(['status' => 'rejected']);
        return response()->json(['status' => 'rejected']);
    }

    public function removeFriend(Request $request, User $user)
    {
        Friendship::where(function ($q) use ($request, $user) {
            $q->where('user_id', $request->user()->id)->where('friend_id', $user->id);
        })->orWhere(function ($q) use ($request, $user) {
            $q->where('user_id', $user->id)->where('friend_id', $request->user()->id);
        })->delete();

        return response()->json(['ok' => true]);
    }

    public function updatePrivacy(Request $request)
    {
        $request->user()->update($request->only([
            'show_watchlist', 'show_favorites', 'show_lists',
            'show_activity', 'show_friends', 'allow_comments', 'show_stats',
        ]));

        return response()->json(['ok' => true]);
    }
}
