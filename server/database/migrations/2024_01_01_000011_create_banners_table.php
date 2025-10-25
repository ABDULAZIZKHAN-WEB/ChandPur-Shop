<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image');
            $table->string('link')->nullable();
            $table->enum('position', ['home_slider', 'sidebar', 'footer'])->default('home_slider');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('sort_order')->default(0);
            $table->integer('clicks')->default(0);
            $table->timestamps();

            $table->index(['position', 'status', 'sort_order']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('banners');
    }
};