<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Throwable;

class CartController extends Controller
{
    private function responseCart(Request $r)
    {
        $items = $r->session()->get('cart.items', []);
        $total = $r->session()->get('cart.total', 0);
        return response()->json(['items' => array_values($items), 'total' => $total]);
    }

    public function show(Request $r)
    {
        try {
            return $this->responseCart($r);
        } catch (Throwable $e) {
            \Log::error('[CART SHOW] '.$e->getMessage(), ['trace'=>$e->getTraceAsString()]);
            return response()->json(['message'=>'Lỗi hiển thị giỏ'], 500);
        }
    }

    public function add(Request $r)
    {
        try {
            $data = $r->validate([
                'product_id' => 'required|exists:products,id',
                'qty'        => 'nullable|integer|min:1',
            ]);
            $qty = $data['qty'] ?? 1;

            $p = Product::findOrFail($data['product_id']);

            $items = $r->session()->get('cart.items', []);
            $key   = (string)$p->id;

            $row = $items[$key] ?? [
                'product_id' => $p->id,
                'name'       => $p->name,
                'price'      => (int)$p->price,
                'qty'        => 0,
                'image'      => $p->image,
            ];
            $row['qty'] += $qty;
            $items[$key] = $row;

            $total = 0;
            foreach ($items as $it) { $total += ((int)$it['price']) * ((int)$it['qty']); }

            $r->session()->put('cart.items', $items);
            $r->session()->put('cart.total', $total);

            return $this->responseCart($r);
        } catch (Throwable $e) {
            \Log::error('[CART ADD] '.$e->getMessage(), [
                'req'=>$r->all(),'trace'=>$e->getTraceAsString()
            ]);
            // Trả 422 nếu lỗi validate, còn lại 500
            $code = method_exists($e,'status') ? $e->status : 500;
            return response()->json(['message'=>'Không thể thêm vào giỏ','error'=>$e->getMessage()], $code);
        }
    }

    public function update(Request $r)
    {
        try {
            $data = $r->validate([
                'product_id' => 'required|exists:products,id',
                'qty'        => 'required|integer|min:0',
            ]);

            $items = $r->session()->get('cart.items', []);
            $key   = (string)$data['product_id'];

            if (isset($items[$key])) {
                if ($data['qty'] === 0) unset($items[$key]);
                else $items[$key]['qty'] = $data['qty'];
            }

            $total = 0;
            foreach ($items as $it) { $total += ((int)$it['price']) * ((int)$it['qty']); }

            $r->session()->put('cart.items', $items);
            $r->session()->put('cart.total', $total);

            return $this->responseCart($r);
        } catch (Throwable $e) {
            \Log::error('[CART UPDATE] '.$e->getMessage(), ['req'=>$r->all(),'trace'=>$e->getTraceAsString()]);
            $code = method_exists($e,'status') ? $e->status : 500;
            return response()->json(['message'=>'Không thể cập nhật giỏ','error'=>$e->getMessage()], $code);
        }
    }

    public function remove(Request $r)
    {
        try {
            $data = $r->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $items = $r->session()->get('cart.items', []);
            unset($items[(string)$data['product_id']]);

            $total = 0;
            foreach ($items as $it) { $total += ((int)$it['price']) * ((int)$it['qty']); }

            $r->session()->put('cart.items', $items);
            $r->session()->put('cart.total', $total);

            return $this->responseCart($r);
        } catch (Throwable $e) {
            \Log::error('[CART REMOVE] '.$e->getMessage(), ['req'=>$r->all(),'trace'=>$e->getTraceAsString()]);
            $code = method_exists($e,'status') ? $e->status : 500;
            return response()->json(['message'=>'Không thể xóa khỏi giỏ','error'=>$e->getMessage()], $code);
        }
    }
}
