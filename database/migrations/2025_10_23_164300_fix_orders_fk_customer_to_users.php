<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // public function up(): void
    // {
    //     Schema::table('orders', function (Blueprint $table) {
    //         // Cho phép null nếu dùng ON DELETE SET NULL
    //         $table->unsignedBigInteger('customer_id')->nullable()->change();

    //         // Bỏ FK cũ (trỏ customers). Thử theo cột cho an toàn.
    //         try { $table->dropForeign(['customer_id']); } catch (\Throwable $e) {}

    //         // Tạo FK mới: customer_id -> users.id
    //         $table->foreign('customer_id')
    //               ->references('id')->on('users')
    //               ->nullOnDelete()
    //               ->cascadeOnUpdate();
    //     });
    // }

    
    public function up(): void
    {
        if (\Illuminate\Support\Facades\Schema::hasTable('users')) {
            // ĐÃ có bảng users => bỏ qua tạo mới
            return;
        }

        \Illuminate\Support\Facades\Schema::create('users', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            try { $table->dropForeign(['customer_id']); } catch (\Throwable $e) {}
            $table->foreign('customer_id')
                  ->references('id')->on('customers')
                  ->nullOnDelete()
                  ->cascadeOnUpdate();
        });
    }
};
