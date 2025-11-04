<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    // Nếu bảng là "order_items" thì không cần $table.
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name', // nếu schema của bạn có cột này
        'quantity',
        'price',        // đơn giá 1 sản phẩm (int VND)
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price'    => 'integer',
    ];

    /** Thuộc về đơn hàng */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** Tham chiếu sản phẩm */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
