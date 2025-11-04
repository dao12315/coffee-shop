<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Dùng như: ->middleware('role:admin,manager')
     */
    public function handle($request, Closure $next, ...$allowed)
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (!$user) {
            // Không đăng nhập
            return $request->expectsJson()
                ? response()->json(['message' => 'Unauthenticated.'], 401)
                : redirect()->route('site.index');
        }

        // Chuẩn hoá tham số: role:admin,manager (gộp vào $allowed)
        if (count($allowed) === 1 && is_string($allowed[0]) && str_contains($allowed[0], ',')) {
            $allowed = array_map('trim', explode(',', $allowed[0]));
        }

        // 1) Nếu có cột 'role' (project của bạn đang dùng)
        if (isset($user->role) && in_array($user->role, $allowed, true)) {
            return $next($request);
        }

        // 2) Nếu model User có method hasRole() (đã đề xuất thêm trong User.php)
        if (method_exists($user, 'hasRole') && $user->hasRole($allowed)) {
            return $next($request);
        }

        // 3) Nếu bạn có quan hệ roles() (trường hợp mở rộng)
        if (method_exists($user, 'roles')) {
            try {
                // dùng roles() thay vì $user->roles để Intelephense đỡ cảnh báo
                $names = $user->roles()->pluck('name')->all();
                if (!empty(array_intersect($allowed, $names))) {
                    return $next($request);
                }
            } catch (\Throwable $e) {
                // bỏ qua nếu quan hệ chưa có
            }
        }

        // Không thoả -> chặn
        return $request->expectsJson()
            ? response()->json(['message' => 'Forbidden.'], 403)
            : abort(403, 'Bạn không có quyền truy cập tài nguyên này.');
    }
}
