<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_anime_list', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('anime_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['watchlist', 'favorite']);
            $table->timestamps();

            $table->unique(['user_id', 'anime_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_anime_list');
    }
};
