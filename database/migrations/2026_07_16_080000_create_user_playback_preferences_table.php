<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_playback_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('autoplay')->default(true);
            $table->boolean('auto_skip_intro')->default(true);
            $table->boolean('auto_skip_credits')->default(true);
            $table->unsignedSmallInteger('autoplay_countdown')->default(8);
            $table->string('quality')->default('auto');
            $table->string('audio_language')->default('es');
            $table->string('subtitle_language')->default('none');
            $table->decimal('playback_speed', 3, 2)->default(1.00);
            $table->boolean('remember_volume')->default(true);
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_playback_preferences');
    }
};
