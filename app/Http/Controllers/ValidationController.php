<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ValidationController extends Controller
{
    public function checkUsername(Request $request)
    {
        $username = strtolower(trim($request->input('username', '')));
        $userId = $request->input('user_id');
        $minLength = 3;

        if ($userId) {
            $user = User::find($userId);
            if ($user && in_array($user->role, ['owner', 'admin'])) {
                $minLength = 1;
            }
        }

        if (strlen($username) < $minLength) {
            return response()->json(['available' => false, 'message' => "Mínimo {$minLength} caracteres"]);
        }

        if (!preg_match('/^[a-z0-9._]+$/', $username)) {
            return response()->json(['available' => false, 'message' => 'Solo minúsculas, números, puntos y guiones bajos']);
        }

        $exists = User::where('username', $username);
        if ($userId) {
            $exists = $exists->where('id', '!=', $userId);
        }

        return response()->json([
            'available' => !$exists->exists(),
            'message' => $exists->exists() ? 'Este nombre de usuario ya está en uso' : 'Nombre de usuario disponible',
        ]);
    }

    public function checkEmail(Request $request)
    {
        $email = strtolower(trim($request->input('email', '')));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json(['available' => false, 'message' => 'Correo electrónico inválido']);
        }

        $exists = User::where('email', $email);

        return response()->json([
            'available' => !$exists->exists(),
            'message' => $exists->exists() ? 'Este correo ya está registrado' : 'Correo disponible',
        ]);
    }
}
