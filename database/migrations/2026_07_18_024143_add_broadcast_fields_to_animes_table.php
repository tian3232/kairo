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
        Schema::table('animes', function (Blueprint $table) {
            $table->string('broadcast_season', 10)->nullable()->after('release_year');
            $table->unsignedSmallInteger('broadcast_year')->nullable()->after('broadcast_season');
        });
    }

    public function down(): void
    {
        Schema::table('animes', function (Blueprint $table) {
            $table->dropColumn(['broadcast_season', 'broadcast_year']);
        });
    }
};
