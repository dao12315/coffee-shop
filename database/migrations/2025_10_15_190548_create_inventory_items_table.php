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
        
        if (!Schema::hasTable('inventory_items')) {
            Schema::create('inventory_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')
                      ->constrained('products')
                      ->cascadeOnDelete();

                $table->unsignedInteger('current_stock')->default(0);
                $table->unsignedInteger('min_stock')->default(0);
                $table->unsignedInteger('max_stock')->default(0);

                $table->timestamp('last_updated')->nullable();
                $table->timestamps();

                $table->unique(['product_id']); // mỗi sản phẩm 1 dòng kho
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
