<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

use Illuminate\Database\QueryException;
use Throwable;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\InventoryItem;

class CheckoutController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || $user->role !== 'customer') {
            return response()->json(['message' => 'Chỉ tài khoản khách hàng mới được mua hàng.'], 403);
        }

        $itemsById = $request->session()->get('cart.items', []);
        if (empty($itemsById) || !is_array($itemsById)) {
            return response()->json(['message' => 'Giỏ hàng trống'], 400);
        }

        $items = collect($itemsById)->map(fn($i) => [
            'product_id' => (int)($i['product_id'] ?? 0),
            'qty'        => (int)($i['qty'] ?? 0),
        ])->filter(fn($i) => $i['product_id'] > 0 && $i['qty'] > 0)->values()->all();

        if (!$items) return response()->json(['message'=>'Giỏ hàng trống hoặc không hợp lệ'], 400);

        try {
            $order = DB::transaction(function () use ($items, $user) {
                $order = Order::create([
                    'customer_id'   => $user->id,
                    'customer_name' => $user->name,
                    'status'        => 'processing',
                    'total'         => 0,
                ]);

                $grand = 0;

                foreach ($items as $line) {
                    $pid = $line['product_id'];
                    $qty = $line['qty'];

                    $product = Product::query()->lockForUpdate()->findOrFail($pid);
                    $inv = InventoryItem::query()->where('product_id', $pid)->lockForUpdate()->first();

                    if (!$inv || $inv->current_stock < $qty) {
                        $remain = $inv?->current_stock ?? 0;
                        throw ValidationException::withMessages([
                            'stock' => "Sản phẩm '{$product->name}' không đủ tồn (còn {$remain})."
                        ]);
                    }

                    // trừ kho (có lock)
                    $inv->update([
                        'current_stock' => $inv->current_stock - $qty,
                        'last_updated'  => now(),
                    ]);

                    $unit = (int) $product->price;

                    OrderItem::create([
                        'order_id'     => $order->id,
                        'product_id'   => $pid,
                        'product_name' => $product->name,
                        'quantity'     => $qty,
                        'price'        => $unit,
                    ]);

                    $grand += $unit * $qty;
                }

                $order->update(['total' => $grand, 'status' => 'completed']);
                return $order->load('items');
            });

            $request->session()->forget(['cart.items','cart.total']);

            return response()->json([
                'message' => 'Đặt hàng thành công',
                'order'   => $order,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['message' => $e->errors()['stock'][0] ?? 'Dữ liệu không hợp lệ'], 422);
        } catch (QueryException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Có lỗi xảy ra, vui lòng thử lại.'], 500);
        }
    }
}
