<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request): ?string
    {
        // Nếu là request JSON/AJAX thì để Laravel trả 401 (không redirect)
        if ($request->expectsJson()) {
            return null;
        }

        // Không có trang /login, trả về trang chủ (hoặc null)
        return route('site.index'); // hoặc: return null;
    }
}
