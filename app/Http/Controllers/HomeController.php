<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function admin() {
        $categories = \App\Models\Category::select('id','name')->orderBy('name')->get();
        return view('admin.index', [
            'categories' => $categories,
        ]);
    }
}
