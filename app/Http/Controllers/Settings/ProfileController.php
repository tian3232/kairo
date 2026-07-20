<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $minLength = in_array($user->role, ['owner', 'admin']) ? 1 : 3;

        $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', "min:{$minLength}", 'max:30', 'alpha_dash', 'unique:users,username,' . $user->id],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:users,email,' . $request->user()->id,
            ],
            'avatar' => ['nullable', 'string', 'max:500'],
            'bio' => ['nullable', 'string', 'max:500'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $user->display_name = $request->input('display_name');
        $user->name = $request->input('display_name');
        $user->username = strtolower($request->input('username'));
        $user->email = $request->input('email');
        $user->avatar = $request->input('avatar');
        $user->bio = $request->input('bio');
        $user->country = $request->input('country');

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit')->with('status', 'Perfil actualizado.');
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $file = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $file->storeAs('avatars', $filename, 'public');
        $filename = 'avatars/' . $filename;

        return response()->json(['avatar' => $filename]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
