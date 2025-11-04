<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * - Hỗ trợ lọc theo category_id, q (tên), is_active
     * - Có thể paginate bằng ?per_page=..., nếu không truyền sẽ trả về toàn bộ
     */
    public function index(Request $r)
    {
        $q = Product::query()
            ->with(['category', 'inventoryItem'])
            ->orderByDesc('id');

        // Laravel < 10 có thể dùng (int) $r->get('category_id')
        if ($r->filled('category_id')) {
            $q->where('category_id', (int) $r->get('category_id'));
        }

        if ($r->filled('q')) {
            $s = trim((string) $r->get('q'));
            $q->where('name', 'like', "%{$s}%");
        }

        // Lọc theo trạng thái bán (active/inactive) nếu cần
        if ($r->filled('is_active')) {
            // chấp nhận '1'/'0'/'true'/'false'
            $isActive = filter_var($r->get('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isActive !== null) {
                $q->where('is_active', $isActive ? 1 : 0);
            }
        }

        // Paginate nếu có per_page
        if ($r->filled('per_page')) {
            $perPage = max(1, (int) $r->get('per_page', 15));
            return $q->paginate($perPage);
        }

        return $q->get();
    }

    /**
     * GET /api/products/{product}
     */
    public function show(Product $product)
    {
        return $product->load(['category', 'inventoryItem']);
    }

    /**
     * POST /api/products
     * - Nhận FormData hoặc JSON
     * - Upload ảnh -> 'public/products'
     * - Mặc định is_active = 1 nếu không gửi
     * - Tạo record tồn kho mặc định
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:191'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'price'       => ['required', 'numeric', 'min:0'],
            'image'       => ['nullable', 'image', 'max:2048'],
            'is_active'   => ['nullable', 'boolean'],
        ]);

        // Mặc định đang bán nếu không gửi
        if (!array_key_exists('is_active', $validated)) {
            $validated['is_active'] = 1;
        }

        // Ảnh -> đưa vào $validated để create() lưu luôn
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public'); // vd: products/xxx.jpg
        }

        // Dùng transaction để đảm bảo đồng bộ product + tồn kho
        return DB::transaction(function () use ($validated) {
            $product = Product::create($validated);

            // Tạo tồn kho mặc định (nếu quan hệ hasOne inventoryItem đã được khai báo trong Model)
            $product->inventoryItem()->create([
                'current_stock' => 0,
                'min_stock'     => 0,
                'max_stock'     => 0,
                'last_updated'  => now(),
            ]);

            return response()->json($product->load(['category', 'inventoryItem']), 201);
        });
    }

    /**
     * PUT /api/products/{product}
     * - Cập nhật thông tin
     * - Nếu gửi ảnh mới: xóa ảnh cũ (nếu có) + lưu ảnh mới
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'required', 'string', 'max:191'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'price'       => ['sometimes', 'required', 'numeric', 'min:0'],
            'image'       => ['nullable', 'image', 'max:2048'],
            'is_active'   => ['nullable', 'boolean'],
        ]);

        // Nếu có ảnh mới -> xóa ảnh cũ + set ảnh mới
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return $product->load(['category', 'inventoryItem']);
    }

    /**
     * DELETE /api/products/{product}
     * - Xoá ảnh vật lý (nếu có) và xoá product
     */
    public function destroy(Product $product)
    {
        // Xoá ảnh cũ nếu có
        if (!empty($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'deleted']);
    }
}
