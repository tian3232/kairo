<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->with('sender:id,name,avatar')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $unreadCount = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->update(['is_read' => true]);

        $unreadCount = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $unreadCount]);
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['unread_count' => 0]);
    }

    public function acceptFriend(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id || $notification->type !== 'friend_request' || !$notification->friendship_id) {
            return response()->json(['error' => 'Invalid notification'], 422);
        }

        $friendship = Friendship::find($notification->friendship_id);
        if (!$friendship || $friendship->friend_id !== $request->user()->id || $friendship->status !== 'pending') {
            return response()->json(['error' => 'Invalid friendship'], 422);
        }

        $friendship->update(['status' => 'accepted']);
        $notification->update(['is_read' => true]);

        Notification::create([
            'user_id' => $friendship->user_id,
            'sender_id' => $request->user()->id,
            'type' => 'friend_accepted',
            'title' => ($request->user()->display_name ?? $request->user()->name) . ' aceptó tu solicitud de amistad',
            'link' => route('profile.show', $request->user()->id),
        ]);

        $unreadCount = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $unreadCount]);
    }

    public function rejectFriend(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id || $notification->type !== 'friend_request' || !$notification->friendship_id) {
            return response()->json(['error' => 'Invalid notification'], 422);
        }

        $friendship = Friendship::find($notification->friendship_id);
        if (!$friendship || $friendship->friend_id !== $request->user()->id || $friendship->status !== 'pending') {
            return response()->json(['error' => 'Invalid friendship'], 422);
        }

        $friendship->update(['status' => 'rejected']);
        $notification->update(['is_read' => true]);

        $unreadCount = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $unreadCount]);
    }
}
