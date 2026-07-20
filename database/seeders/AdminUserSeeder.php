<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@kairo.dev'],
            [
                'name' => 'Admin',
                'username' => 'tian',
                'display_name' => 'Tian',
                'role' => 'owner',
                'password' => Hash::make('password'),
            ],
        );

        User::updateOrCreate(
            ['email' => 'test@kairo.dev'],
            [
                'name' => 'Sebastian',
                'username' => 'sebas',
                'display_name' => 'Sebas',
                'role' => 'user',
                'password' => Hash::make('password'),
            ],
        );
    }
}
