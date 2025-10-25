<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->enum('role', ['customer', 'admin'])->default('customer')->after('phone');
            $table->boolean('is_admin')->default(false)->after('role');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('is_admin');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'is_admin', 'status']);
        });
    }
};