<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UnreadCountsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $user = auth()->user();
        $userId = $user->id;

        $notifications = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        $friendIds = $user->friends()->pluck('users.id');

        $messages = 0;
        if ($friendIds->isNotEmpty()) {
            $messages = \App\Models\Message::where('receiver_id', $userId)
                ->whereNull('read_at')
                ->whereIn('sender_id', $friendIds)
                ->count();
        }

        return response()->json([
            'notifications' => $notifications,
            'messages' => $messages,
        ]);
    }
}
