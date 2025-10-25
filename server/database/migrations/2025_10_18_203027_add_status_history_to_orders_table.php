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
        // Check if the status_history column already exists
        if (!Schema::hasColumn('orders', 'status_history')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->json('status_history')->nullable()->after('notes');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if the status_history column exists before dropping
        if (Schema::hasColumn('orders', 'status_history')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('status_history');
            });
        }
    }
};