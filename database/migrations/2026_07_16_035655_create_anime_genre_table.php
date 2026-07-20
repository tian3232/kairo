<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('anime_genre', function (Blueprint $table) {
        $table->foreignId('anime_id')->constrained('animes')->cascadeOnDelete();
        $table->foreignId('genre_id')->constrained('genres')->cascadeOnDelete();
        $table->primary(['anime_id', 'genre_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anime_genre');
    }
};
