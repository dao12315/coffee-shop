<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureCustomerRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // if (!$user) {
        //     return $request->expectsJson()
        //         ? response()->json(['message' => 'Bạn cần đăng nhập.'], 401)
        //         : redirect()->route('login');
        // }

        if (($user->role ?? null) !== 'customer') {
            return $request->expectsJson()
                ? response()->json(['message' => 'Chỉ tài khoản khách hàng mới được mua hàng.'], 403)
                : abort(403, 'Chỉ tài khoản khách hàng mới được mua hàng.');
        }

        return $next($request);
    }
}
