<?php

namespace App\Http\Controllers;

use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:2000',
        ]);

        SupportMessage::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message' => $validated['message'],
        ]);

        return response()->json(['ok' => true]);
    }

    public function index()
    {
        $messages = SupportMessage::with('user:id,name,username')
            ->latest()
            ->get();

        return Inertia::render('admin/support', ['messages' => $messages]);
    }

    public function markRead(SupportMessage $message)
    {
        $message->update(['status' => 'read']);
        return response()->json(['ok' => true]);
    }

    public function destroy(SupportMessage $message)
    {
        $message->delete();
        return response()->json(['ok' => true]);
    }
}
