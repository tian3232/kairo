<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\CommentReport;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'anime_id' => 'nullable|exists:animes,id',
            'episode_id' => 'nullable|exists:episodes,id',
            'profile_user_id' => 'nullable|exists:users,id',
            'body' => 'required_without:image|string|max:1000',
            'text_align' => 'nullable|string|in:left,center,right',
            'image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $data = [
            'user_id' => $request->user()->id,
            'body' => $request->input('body', ''),
            'text_align' => $request->input('text_align', 'left'),
        ];

        if ($request->has('anime_id') && $request->anime_id) {
            $data['anime_id'] = $request->anime_id;
        }
        if ($request->has('episode_id') && $request->episode_id) {
            $data['episode_id'] = $request->episode_id;
        }
        if ($request->has('profile_user_id') && $request->profile_user_id) {
            $profileUser = \App\Models\User::find($request->profile_user_id);
            if ($profileUser && $profileUser->id !== $request->user()->id && !$profileUser->allow_comments) {
                abort(403);
            }
            $data['profile_user_id'] = $request->profile_user_id;
        }
        if ($request->has('parent_id') && $request->parent_id) {
            $data['parent_id'] = $request->parent_id;
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $uuid = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('comments', $uuid, 'public');
            $data['image'] = 'comments/' . $uuid;
        }

        $comment = Comment::create($data);
        $comment->load('user:id,name,username,avatar,role');

        if ($comment->parent_id && $comment->user_id !== $comment->parent->user_id) {
            $link = $comment->anime_id
                ? route('anime.show', $comment->anime->slug)
                : ($comment->profile_user_id ? route('profile.show', $comment->profile_user_id) : route('watch.show', $comment->episode_id));
            Notification::create([
                'user_id' => $comment->parent->user_id,
                'sender_id' => $request->user()->id,
                'type' => 'comment_reply',
                'title' => ($request->user()->display_name ?? $request->user()->name) . ' respondió a tu comentario',
                'body' => Str::limit($comment->body, 60),
                'link' => $link,
            ]);
        }

        return response()->json([
            'id' => $comment->id,
            'body' => $comment->body,
            'text_align' => $comment->text_align,
            'image' => $comment->image,
            'parent_id' => $comment->parent_id,
            'created_at' => $comment->created_at->toISOString(),
            'updated_at' => $comment->updated_at->toISOString(),
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->display_name ?? $comment->user->name,
                'username' => $comment->user->username,
                'avatar' => $comment->user->avatar,
                'role' => $comment->user->role,
            ],
            'likes_count' => 0,
            'dislikes_count' => 0,
            'user_liked' => null,
            'replies_count' => 0,
        ]);
    }

    public function update(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:1000',
            'text_align' => 'nullable|string|in:left,center,right',
        ]);

        $comment->update([
            'body' => $request->body,
            'text_align' => $request->input('text_align', $comment->text_align),
        ]);

        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request, Comment $comment)
    {
        $user = $request->user();

        if ($comment->user_id !== $user->id && !$user->isAdmin()) {
            abort(403);
        }

        $comment->delete();

        return response()->json(['ok' => true]);
    }

    public function replies(Comment $comment)
    {
        $userId = auth()->id();

        $replies = $comment->replies()
            ->with('user:id,name,username,avatar,role')
            ->withCount([
                'likes as likes_count' => fn ($q) => $q->where('is_like', true),
                'likes as dislikes_count' => fn ($q) => $q->where('is_like', false),
            ])
            ->with($userId ? ['likes as userLike' => fn ($q) => $q->where('user_id', $userId)->select('id', 'comment_id', 'is_like')] : [])
            ->get()
            ->map(function ($reply) {
                return [
                    'id' => $reply->id,
                    'body' => $reply->body,
                    'text_align' => $reply->text_align,
                    'image' => $reply->image,
                    'parent_id' => $reply->parent_id,
                    'created_at' => $reply->created_at->toISOString(),
                    'updated_at' => $reply->updated_at->toISOString(),
                    'user' => [
                        'id' => $reply->user->id,
                        'name' => $reply->user->display_name ?? $reply->user->name,
                        'username' => $reply->user->username,
                        'avatar' => $reply->user->avatar,
                        'role' => $reply->user->role,
                    ],
                    'likes_count' => $reply->likes_count ?? 0,
                    'dislikes_count' => $reply->dislikes_count ?? 0,
                    'user_liked' => $reply->userLike->first()?->is_like ?? null,
                ];
            });

        return response()->json($replies);
    }

    public function report(Request $request, Comment $comment)
    {
        if ($comment->user_id === $request->user()->id) {
            return response()->json(['error' => 'No puedes reportar tu propio comentario'], 422);
        }

        $request->validate([
            'reason' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $existing = CommentReport::where('user_id', $request->user()->id)
            ->where('comment_id', $comment->id)
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Ya reportaste este comentario'], 422);
        }

        CommentReport::create([
            'user_id' => $request->user()->id,
            'comment_id' => $comment->id,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        return response()->json(['ok' => true]);
    }

    public function toggleLike(Request $request, Comment $comment)
    {
        $request->validate([
            'is_like' => 'required|boolean',
        ]);

        $existing = CommentLike::where('user_id', $request->user()->id)
            ->where('comment_id', $comment->id)
            ->first();

        if ($existing) {
            if ($existing->is_like === (bool) $request->is_like) {
                $existing->delete();
                return response()->json(['liked' => null]);
            }
            $existing->update(['is_like' => $request->is_like]);
            return response()->json(['liked' => $request->is_like]);
        }

        CommentLike::create([
            'user_id' => $request->user()->id,
            'comment_id' => $comment->id,
            'is_like' => $request->is_like,
        ]);

        if ($comment->user_id !== $request->user()->id) {
            $link = $comment->anime_id
                ? route('anime.show', $comment->anime->slug)
                : ($comment->profile_user_id ? route('profile.show', $comment->profile_user_id) : route('watch.show', $comment->episode_id));
            Notification::create([
                'user_id' => $comment->user_id,
                'sender_id' => $request->user()->id,
                'type' => 'comment_like',
                'title' => ($request->user()->display_name ?? $request->user()->name) . ' le dio ' . ($request->is_like ? 'me gusta' : 'no me gusta') . ' a tu comentario',
                'body' => Str::limit($comment->body, 60),
                'link' => $link,
            ]);
        }

        return response()->json(['liked' => $request->is_like]);
    }
}
