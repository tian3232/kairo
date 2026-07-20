<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('episode_favorites', function (Blueprint $table) {
            $table->boolean('liked')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('episode_favorites', function (Blueprint $table) {
            $table->dropColumn('liked');
        });
    }
};
