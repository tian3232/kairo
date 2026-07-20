<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('show_watchlist')->default(true)->after('bio');
            $table->boolean('show_favorites')->default(true)->after('show_watchlist');
            $table->boolean('show_lists')->default(true)->after('show_favorites');
            $table->boolean('show_activity')->default(true)->after('show_lists');
            $table->boolean('show_friends')->default(true)->after('show_activity');
            $table->boolean('allow_comments')->default(true)->after('show_friends');
            $table->boolean('show_stats')->default(true)->after('allow_comments');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'show_watchlist', 'show_favorites', 'show_lists',
                'show_activity', 'show_friends', 'allow_comments', 'show_stats',
            ]);
        });
    }
};
