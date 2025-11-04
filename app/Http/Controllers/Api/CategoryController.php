<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;


class CategoryController extends Controller
{
    public function index(Request $r)
    {
        // ?all=1 để lấy cả inactive khi quản trị, mặc định chỉ trả active cho site
        $q = Category::query()->orderBy('name');
        if (!$r->boolean('all')) $q->where('is_active', 1);
        return $q->get();
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => ['required','max:191'],
            'is_active' => ['sometimes','boolean'],
        ]);
        $data['slug'] = Str::slug($data['name']);
        $cat = Category::create($data);
        return response()->json($cat, 201);
    }

    public function update(Request $r, Category $category)
    {
        $data = $r->validate([
            'name' => ['required','max:191'],
            'is_active' => ['sometimes','boolean'],
        ]);
        $data['slug'] = Str::slug($data['name']);
        $category->update($data);
        return $category;
    }

    public function destroy(Category $category)
    {
        // Nếu muốn “ẩn” thay vì xoá thật, có thể đổi thành update(['is_active'=>0])
        $category->delete();
        return ['ok'=>true];
    }
}
