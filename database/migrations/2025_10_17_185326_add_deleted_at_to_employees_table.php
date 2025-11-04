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
    Schema::table('employees', function (Blueprint $table) {
        // đặt sau updated_at cho gọn, không bắt buộc
        $table->softDeletes()->after('updated_at'); // tạo cột deleted_at nullable
    });
}

public function down(): void
{
    Schema::table('employees', function (Blueprint $table) {
        $table->dropSoftDeletes();
    });
}


};
