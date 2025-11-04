<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Các route KHÔNG kiểm tra CSRF.
     */
    protected $except = [
        'api/*',    // <-- BỎ QUA CSRF cho tất cả API
    ];
}
