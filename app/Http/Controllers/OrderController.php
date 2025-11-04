<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // GET /api/orders?q=&status=
    public function index(Request $request)
    {
        $q      = trim((string) $request->get('q', ''));
        $status = trim((string) $request->get('status', ''));

        $orders = Order::query()
            ->withCount('items')                          // ->items_count
            ->with(['items' => fn($q) => $q->select('id','order_id','product_id','quantity','price')])
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where(function ($sub) use ($q) {
                    $sub->where('customer_name', 'like', "%{$q}%")
                        ->orWhere('id', $q);
                });
            })
            ->when($status !== '', fn($qr) => $qr->where('status', $status))
            ->orderByDesc('created_at')
            ->get([
                'id', 'customer_id', 'customer_name', 'status', 'total', 'created_at'
            ]);

        // Chuẩn hoá về đúng format bảng admin cần
        $data = $orders->map(function ($o) {
            return [
                'id'            => $o->id,
                'customer'      => $o->customer_name,
                'product_count' => $o->items_count,
                'total'         => (int) $o->total,
                'status'        => $o->status,
                'created_at'    => $o->created_at->format('H:i:s d/m/Y'),
            ];
        });

        return response()->json(['orders' => $data]);
    }
}
