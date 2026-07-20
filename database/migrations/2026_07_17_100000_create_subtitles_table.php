<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subtitles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->constrained()->onDelete('cascade');
            $table->string('language', 8); // es, en, ja
            $table->string('path'); // ruta en storage (vtt)
            $table->string('source')->default('stt'); // stt, api, manual
            $table->boolean('auto_generated')->default(true);
            $table->timestamps();

            $table->unique(['episode_id', 'language']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subtitles');
    }
};
