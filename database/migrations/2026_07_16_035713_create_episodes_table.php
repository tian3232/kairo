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
    Schema::create('episodes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('season_id')->constrained('seasons')->cascadeOnDelete();
        $table->unsignedSmallInteger('number');
        $table->string('title')->nullable();
        $table->text('synopsis')->nullable();
        $table->string('thumbnail');
        $table->string('video_path');
        $table->unsignedInteger('duration_seconds');
        $table->date('release_date');
        $table->unsignedInteger('intro_start')->nullable();
        $table->unsignedInteger('intro_end')->nullable();
        $table->unsignedInteger('credits_start')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
