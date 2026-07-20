<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('name');
            $table->string('display_name')->nullable()->after('username');
        });

        DB::table('users')->whereNull('username')->update(['username' => DB::raw('LOWER(name)')]);
        DB::table('users')->whereNull('display_name')->update(['display_name' => DB::raw('name')]);

        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'display_name']);
        });
    }
};
