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
    Schema::create('seasons', function (Blueprint $table) {
        $table->id();
        $table->foreignId('anime_id')->constrained('animes')->cascadeOnDelete();
        $table->enum('type', ['season', 'movie', 'ova', 'special']);
        $table->unsignedSmallInteger('number')->nullable();
        $table->string('title')->nullable();
        $table->unsignedInteger('order')->default(0);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seasons');
    }
};
