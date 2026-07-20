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
        Schema::create('animes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('synopsis');
            $table->enum('type', ['tv', 'movie', 'ova', 'special']);
            $table->enum('status', ['airing', 'finished', 'upcoming']);
            $table->string('age_rating');
            $table->unsignedSmallInteger('release_year');
            $table->foreignId('studio_id')->nullable()->constrained('studios')->nullOnDelete();
            $table->string('cover_image');
            $table->string('banner_image');
            $table->string('logo_image')->nullable();
            $table->string('trailer_url')->nullable();
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->unsignedInteger('ratings_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animes');
    }
};
