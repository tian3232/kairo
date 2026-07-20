<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Characters table (RF-037)
        Schema::create('characters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anime_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('role')->default('supporting'); // main, supporting, minor
            $table->string('image')->nullable();
            $table->string('voice_actor')->nullable();
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();
        });

        // Related animes pivot (RF-038)
        Schema::create('anime_relations', function (Blueprint $table) {
            $table->foreignId('anime_id')->constrained()->cascadeOnDelete();
            $table->foreignId('related_anime_id')->constrained('animes')->cascadeOnDelete();
            $table->string('relation_type')->default('related'); // sequel, prequel, spin_off, adaptation, related
            $table->primary(['anime_id', 'related_anime_id']);
            $table->timestamps();
        });

        // Technical info columns on animes (RF-035)
        Schema::table('animes', function (Blueprint $table) {
            $table->json('available_languages')->nullable()->after('trailer_url');
            $table->json('available_subtitles')->nullable()->after('available_languages');
            $table->json('available_resolutions')->nullable()->after('available_subtitles');
            $table->date('next_episode_date')->nullable()->after('available_resolutions');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('characters');
        Schema::dropIfExists('anime_relations');

        Schema::table('animes', function (Blueprint $table) {
            $table->dropColumn([
                'available_languages',
                'available_subtitles',
                'available_resolutions',
                'next_episode_date',
            ]);
        });
    }
};
