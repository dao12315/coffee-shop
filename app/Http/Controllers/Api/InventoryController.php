<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Product;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    // Liệt kê tồn kho kèm thông tin SP
   public function index()
{
    $items = InventoryItem::with(['product:id,name'])
        ->orderBy('last_updated','desc')
        ->get(['id','product_id','current_stock','min_stock','max_stock','last_updated']);

    return $items->map(function ($i) {
        return [
            'id'            => $i->id,
            'product_id'    => $i->product_id,
            'product_name'  => optional($i->product)->name,
            'current_stock' => (int) $i->current_stock,
            'min_stock'     => (int) $i->min_stock,
            'max_stock'     => (int) $i->max_stock,
            'last_updated'  => optional($i->last_updated)?->toDateTimeString(),
        ];
    });
}
    // Cập nhật tồn kho theo product (PUT /api/inventory/{product})
   public function updateStock(Request $request, Product $product)
    {
        $data = $request->validate([
            'current_stock' => ['required','integer','min:0'],
        ]);

        // đảm bảo record tồn kho tồn tại
        $item = $product->inventoryItem()->firstOrCreate([
            'product_id' => $product->id,
        ], [
            'current_stock' => 0,
            'min_stock' => 0,
            'max_stock' => 0,
            'last_updated' => now(),
        ]);

        $item->current_stock = $data['current_stock'];
        $item->last_updated  = now();
        $item->save();

        return response()->json([
            'message' => 'ok',
            'product' => $product->load('inventoryItem'),
        ]);
    }

    
}
