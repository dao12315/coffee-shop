<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',   // <-- THÊM DÒNG NÀY
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(fn(\Illuminate\Foundation\Configuration\Middleware $m) =>
        $m->alias([
            'customer.only' => \App\Http\Middleware\EnsureCustomerRole::class,
        ])
    )
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
