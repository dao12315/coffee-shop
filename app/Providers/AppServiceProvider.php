<?php

namespace App\Providers;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\Router;




use App\Http\Middleware\PermMiddleware; 

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Để trống
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(Router $router): void
    {
        // ép alias middleware 'role'
       $router->aliasMiddleware('role', \App\Http\Middleware\RoleMiddleware::class);
          $router->aliasMiddleware('permission', \App\Http\Middleware\PermissionMiddleware::class);
}
    }

