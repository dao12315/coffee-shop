<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $table = 'inventory_items';

    protected $fillable = ['product_id','current_stock','min_stock','max_stock','last_updated'];
    protected $casts = [
        'current_stock' => 'integer',
        'min_stock'     => 'integer',
        'max_stock'     => 'integer',
        'last_updated'  => 'datetime',
    ];

   public function product() { return $this->belongsTo(\App\Models\Product::class); }
}
