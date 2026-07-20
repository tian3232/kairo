<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE animes DROP CONSTRAINT animes_type_check");
        DB::statement("ALTER TABLE animes ADD CONSTRAINT animes_type_check CHECK (type IN ('tv', 'movie', 'ova', 'special', 'ona'))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE animes DROP CONSTRAINT animes_type_check");
        DB::statement("ALTER TABLE animes ADD CONSTRAINT animes_type_check CHECK (type IN ('tv', 'movie', 'ova', 'special'))");
    }
};
