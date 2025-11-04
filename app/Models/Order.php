<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    // Nếu bảng là "orders" thì không cần $table.
    protected $fillable = [
    'customer_id', 'customer_name', 'status', 'total'
    ];

    protected $casts = [
        'total' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /** Các dòng hàng của đơn */
    public function items()   { return $this->hasMany(OrderItem::class); }

    /** Hoá đơn của đơn hàng */
    public function invoice() { return $this->hasOne(Invoice::class); }
}
