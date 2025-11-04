<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    // GET /api/orders?q=&status=
    public function index(Request $request)
    {
        $q      = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));

        $orders = Order::query()
            ->withCount('items')
            ->when($status !== '', fn($qq) => $qq->where('status', $status))
            ->when($q !== '', function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('customer_name', 'like', "%{$q}%")
                      ->orWhereHas('items', fn($it) => $it->where('product_name', 'like', "%{$q}%"));
                });
            })
            ->latest('id')
            ->get(['id','customer_id','customer_name','status','total','created_at']);

        return response()->json(['data' => $orders]);
    }

    // GET /api/orders/{order}
    public function show(Order $order)
    {
        $order->load(['items:id,order_id,product_id,product_name,quantity,price']);
        return response()->json(['data' => $order]);
    }

    // DELETE /api/orders/{order}
    public function destroy(Order $order)
    {
        // tuỳ nghiệp vụ: xoá mềm hoặc xoá cứng/ghi log
        $order->items()->delete();
        $order->delete();

        return response()->json(['message' => 'deleted']);
    }
}
