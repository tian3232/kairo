<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function image(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|max:5120',
        ]);

        $file = $request->file('file');
        $uuid = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $dir = 'images/' . date('Y/m');
        $file->storeAs($dir, $uuid, 'public');
        $filename = $dir . '/' . $uuid;

        return response()->json([
            'path' => $filename,
            'url' => '/storage/' . $filename,
        ]);
    }

    public function video(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:mp4,webm,mkv|max:204800',
        ]);

        $file = $request->file('file');
        $uuid = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $dir = 'videos/' . date('Y/m');
        $file->storeAs($dir, $uuid, 'public');
        $filename = $dir . '/' . $uuid;

        return response()->json([
            'path' => $filename,
            'url' => '/storage/' . $filename,
        ]);
    }
}
