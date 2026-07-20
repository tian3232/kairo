<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $conversations = $this->conversationsFor($user);
        $activeFriend = null;
        $messages = [];

        $friendId = $request->query('with');
        if ($friendId && $user->isFriend($target = User::findOrFail($friendId))) {
            $activeFriend = $this->friendData($target);
            $messages = $this->messagesBetween($user, $target);
        }

        return Inertia::render('messages/index', [
            'conversations' => $conversations,
            'activeFriend' => $activeFriend,
            'messages' => $messages,
        ]);
    }

    public function apiIndex(Request $request)
    {
        $user = Auth::user();
        $friendId = $request->query('with');
        $target = $friendId ? User::findOrFail($friendId) : null;

        if ($target && !$user->isFriend($target)) {
            abort(403);
        }

        $this->markDeliveredForUser($user);

        $data = [
            'conversations' => $this->conversationsFor($user),
            'messages' => $target ? $this->messagesBetween($user, $target) : [],
            'activeFriend' => $target ? $this->friendData($target) : null,
        ];

        if ($request->header('X-Inertia')) {
            $params = $friendId ? ['with' => $friendId] : [];
            return Inertia::location(route('messages.index', $params));
        }

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'body' => 'nullable|string|max:5000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $user = Auth::user();
        $receiver = User::findOrFail($request->receiver_id);

        abort_unless($user->isFriend($receiver), 403, 'Solo puedes enviar mensajes a tus amigos.');

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('messages', 'public');
        }

        if (!$request->filled('body') && !$imagePath) {
            return response()->json(['message' => 'El mensaje no puede estar vacío.'], 422);
        }

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiver->id,
            'body' => $request->filled('body') ? $request->body : null,
            'image_path' => $imagePath,
        ]);

        $message->load('sender', 'receiver');

        return response()->json([
            'id' => $message->id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'body' => $message->body,
            'image' => $message->image_path ? asset('storage/' . $message->image_path) : null,
            'read_at' => $message->read_at,
            'delivered_at' => $message->delivered_at,
            'edited_at' => $message->edited_at,
            'deleted_for_everyone' => $message->deleted_for_everyone,
            'created_at' => $message->created_at->toISOString(),
        ]);
    }

    public function update(Request $request, Message $message)
    {
        $user = Auth::user();

        abort_unless($message->sender_id === $user->id, 403, 'Solo puedes editar tus propios mensajes.');
        abort_if($message->deleted_for_everyone, 403, 'Este mensaje fue eliminado.');

        $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $message->update([
            'body' => $request->body,
            'edited_at' => now(),
        ]);

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'edited_at' => $message->edited_at ? $message->edited_at->toISOString() : null,
        ]);
    }

    public function destroy(Request $request, Message $message)
    {
        $user = Auth::user();

        abort_unless(
            $message->sender_id === $user->id || $message->receiver_id === $user->id,
            403,
            'No tienes permiso para eliminar este mensaje.'
        );

        $scope = $request->input('scope', 'me');

        if ($scope === 'everyone') {
            abort_unless($message->sender_id === $user->id, 403, 'Solo el remitente puede eliminar para todos.');

            if ($message->image_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($message->image_path);
            }

            $message->update([
                'deleted_for_everyone' => true,
                'body' => null,
                'image_path' => null,
                'edited_at' => $message->edited_at,
            ]);
        } else {
            if ($message->sender_id === $user->id) {
                $message->update(['deleted_for_sender' => true]);
            } else {
                $message->update(['deleted_for_receiver' => true]);
            }
        }

        return response()->noContent();
    }

    public function markRead(Request $request)
    {
        $request->validate(['friend_id' => 'required|exists:users,id']);
        $user = Auth::user();
        $friend = User::findOrFail($request->friend_id);

        abort_unless($user->isFriend($friend), 403);

        Message::where('sender_id', $friend->id)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'delivered_at' => now()]);

        return response()->noContent();
    }

    private function conversationsFor(User $user): array
    {
        $friendIds = Friendship::where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'accepted')
            ->pluck('friend_id')
            ->merge(
                Friendship::where('friend_id', $user->id)
                    ->where('status', 'accepted')
                    ->pluck('user_id')
            )->unique()->values();

        $conversations = [];
        foreach ($friendIds as $fid) {
            $friend = User::find($fid);
            if (!$friend) continue;

            $latest = Message::where(function ($q) use ($user, $fid) {
                    $q->where('sender_id', $user->id)->where('receiver_id', $fid);
                })->orWhere(function ($q) use ($user, $fid) {
                    $q->where('sender_id', $fid)->where('receiver_id', $user->id);
                })
                ->where(function ($q) use ($user) {
                    $q->where('deleted_for_everyone', false)
                        ->where(function ($q) use ($user) {
                            $q->where('deleted_for_sender', false)
                                ->orWhere('sender_id', '!=', $user->id);
                        })
                        ->where(function ($q) use ($user) {
                            $q->where('deleted_for_receiver', false)
                                ->orWhere('receiver_id', '!=', $user->id);
                        });
                })
                ->latest()->first();

            $unread = Message::where('sender_id', $fid)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->count();

            $conversations[] = array_merge($this->friendData($friend), [
                'last_message' => $latest ? [
                    'body' => $latest->body,
                    'sender_id' => $latest->sender_id,
                    'created_at' => $latest->created_at->toISOString(),
                ] : null,
                'unread_count' => $unread,
            ]);
        }

        usort($conversations, function ($a, $b) {
            $ta = $a['last_message'] ? $a['last_message']['created_at'] : '1970-01-01';
            $tb = $b['last_message'] ? $b['last_message']['created_at'] : '1970-01-01';
            return $tb <=> $ta;
        });

        return $conversations;
    }

    private function messagesBetween(User $user, User $friend): array
    {
        return Message::where(function ($q) use ($user, $friend) {
                $q->where('sender_id', $user->id)->where('receiver_id', $friend->id);
            })->orWhere(function ($q) use ($user, $friend) {
                $q->where('sender_id', $friend->id)->where('receiver_id', $user->id);
            })
            ->orderBy('created_at')
            ->get()
            ->filter(fn ($m) => !$m->isDeletedFor($user->id))
            ->map(fn ($m) => [
                'id' => $m->id,
                'sender_id' => $m->sender_id,
                'receiver_id' => $m->receiver_id,
                'body' => $m->body,
                'image' => $m->image_path ? asset('storage/' . $m->image_path) : null,
                'read_at' => $m->read_at,
                'delivered_at' => $m->delivered_at,
                'edited_at' => $m->edited_at ? $m->edited_at->toISOString() : null,
                'deleted_for_everyone' => $m->deleted_for_everyone,
                'created_at' => $m->created_at->toISOString(),
            ])
            ->values()
            ->all();
    }

    private function markDeliveredForUser(User $user): void
    {
        $friendIds = $this->getFriendIds($user);
        if ($friendIds->isEmpty()) return;

        Message::whereIn('sender_id', $friendIds)
            ->where('receiver_id', $user->id)
            ->whereNull('delivered_at')
            ->update(['delivered_at' => now()]);
    }

    private function getFriendIds(User $user): \Illuminate\Support\Collection
    {
        return Friendship::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->pluck('friend_id')
            ->merge(
                Friendship::where('friend_id', $user->id)
                    ->where('status', 'accepted')
                    ->pluck('user_id')
            )->unique()->values();
    }

    private function markReadBetween(User $user, User $friend): void
    {
        Message::where('sender_id', $friend->id)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'delivered_at' => now()]);
    }

    private function friendData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->display_name ?? $user->name,
            'username' => $user->username,
            'avatar' => $user->avatar,
        ];
    }
}
