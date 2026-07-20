<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GoogleUsernameController extends Controller
{
    public function show()
    {
        $googleUser = session('google_user');
        if (!$googleUser) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/google-username', [
            'name' => $googleUser['name'],
            'email' => $googleUser['email'],
            'avatar' => $googleUser['avatar'],
        ]);
    }

    public function store(Request $request)
    {
        $googleUser = session('google_user');
        if (!$googleUser) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'username' => 'required|string|min:3|max:30|regex:/^[a-z0-9._]+$/|unique:users,username',
            'display_name' => 'required|string|max:50',
        ]);

        $user = User::create([
            'name' => $validated['display_name'],
            'username' => $validated['username'],
            'display_name' => $validated['display_name'],
            'email' => $googleUser['email'],
            'email_verified_at' => now(),
            'google_id' => $googleUser['google_id'],
            'avatar' => $googleUser['avatar'],
            'password' => null,
        ]);

        session()->forget('google_user');
        auth()->login($user, true);

        return redirect()->intended(route('home'));
    }
}
