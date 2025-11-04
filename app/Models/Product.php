<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'category_id', 'name', 'description', 'price', 'image', 'is_active',
    ];
 protected $appends = ['image_url'];
    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];
public function getImageUrlAttribute(): ?string
    {
          if ($this->image) {
            return asset('storage/'.$this->image);
        }
        // Ảnh mặc định nếu chưa có
         return $this->image ? Storage::url($this->image) : null;
    }
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function inventoryItem() {
         return $this->hasOne(\App\Models\InventoryItem::class, 'product_id');
         }

}
