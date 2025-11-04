<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use App\Models\User; // ✅ THÊM DÒNG NÀY

class PermissionMiddleware
{
    public function handle($request, Closure $next, ...$perms)
    {
        /** @var User $user */ // ✅ THÊM DÒNG NÀY
        $user = Auth::user();

        if (!$user) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Unauthenticated.'], 401)
                : redirect()->route('/* The `login` method is used to redirect the user to the login
                page if they are not authenticated. In the provided code
                snippet, if the user is not authenticated (`` is null),
                the middleware will check if the request expects a JSON
                response. If it does, it will return a JSON response with a
                message indicating that the user is unauthenticated (status
                code 401). If the request does not expect a JSON response, it
                will redirect the user to the login route. */
                login');
        }

        $ok = false;
        foreach ($perms as $p) {
            if ($user->hasPermission($p)) { $ok = true; break; }
        }

        if (!$ok) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Forbidden.'], 403)
                : abort(403, 'Bạn không có quyền thực hiện tác vụ này.');
        }

        return $next($request);
    }
}
