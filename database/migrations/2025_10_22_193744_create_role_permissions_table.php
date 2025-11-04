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
      Schema::create('role_permissions', function (Blueprint $t) {
    $t->unsignedBigInteger('role_id');
    $t->unsignedBigInteger('permission_id');
    $t->primary(['role_id','permission_id']);
    $t->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
    $t->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
