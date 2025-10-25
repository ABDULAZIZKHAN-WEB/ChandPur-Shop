<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('product_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('size')->nullable();
            $table->string('color')->nullable();
            $table->decimal('additional_price', 8, 2)->default(0);
            $table->integer('quantity')->default(0);
            $table->timestamps();

            $table->index(['product_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_attributes');
    }
};